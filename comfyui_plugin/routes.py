# -*- coding: utf-8 -*-
"""Route phía server của ComfyUI: cung cấp JSON 3 thư viện local và dịch vụ file ảnh cho bộ chọn ảnh ở frontend ComfyUI."""

from __future__ import annotations

import json
import io
import logging
import urllib.request
from pathlib import Path

logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
THUMBS_DIR = (ROOT_DIR / "thumbs").resolve()
IMG_DIR = (ROOT_DIR / "img").resolve()

LIBRARY_FILES = {
    "pose": DATA_DIR / "pose-zh.json",
    "costume": DATA_DIR / "costume-zh.json",
    "portrait": DATA_DIR / "portrait-zh.json",
}

_CACHE: dict[str, list[dict]] = {}


def load_library(lib: str) -> list[dict]:
    if lib not in LIBRARY_FILES:
        raise ValueError(f"Loại thư viện không xác định: {lib}")
    if lib not in _CACHE:
        fp = LIBRARY_FILES[lib]
        if not fp.exists():
            raise FileNotFoundError(f"Không tìm thấy file dữ liệu: {fp}")
        with open(fp, encoding="utf-8") as f:
            _CACHE[lib] = json.load(f)
        if lib == "costume":
            for name in ("costume-anime-zh.json", "costume-gia-anime-zh.json", "costume-shisei-zh.json"):
                with open(DATA_DIR / name, encoding="utf-8") as f:
                    _CACHE[lib] += json.load(f)
    return _CACHE[lib]


def find_item(lib: str, item_id: str) -> dict:
    items = load_library(lib)
    clean_id = (item_id or "").strip()
    for it in items:
        if it.get("id") == clean_id:
            return it
    if clean_id.startswith(("charadb-", "gia-anime-", "shisei-")):
        raise ValueError("ID trang phục từ nguồn ngoài không xác định")
    return items[0]


def select_costume_view(item: dict, view: str = "front") -> dict:
    views = item.get("views", [])
    if not views:
        return item
    selected = next((v for v in views if v["id"] == view), None)
    if selected is None:
        if view != "front":
            raise ValueError(f"Trang phục không có góc nhìn này: {view}")
        selected = views[0]
    return dict(item, selectedView=selected["id"], **{k: selected[k] for k in ("缩略图", "预览图", "原图")})


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("Địa chỉ ảnh từ xa không được phép chuyển hướng")


def open_reference_image(rel_path: str):
    """Ảnh local giữ nguyên hành vi cũ; ảnh từ xa chỉ cho phép ảnh gốc đã thu thập của CharaDB / ギア anime, đọc qua bộ nhớ."""
    from PIL import Image

    if not rel_path.startswith("https://"):
        return Image.open(resolve_safe_image_path(rel_path))
    allowed = {row["原图"]: ({"JPEG"} if row.get("source") == "charadb" else {"PNG", "WEBP"})
               for row in load_library("costume") if row.get("source") in ("charadb", "gia-anime")}
    if rel_path not in allowed:
        raise ValueError("Ảnh từ xa không nằm trong danh mục trang phục đã thu thập")
    opener = urllib.request.build_opener(_NoRedirect())
    request = urllib.request.Request(rel_path, headers={"User-Agent": "ai-pose-gallery/2.0", "Accept": "image/jpeg,image/png,image/webp"})
    with opener.open(request, timeout=20) as response:
        content_types = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}
        if response.status != 200 or response.headers.get_content_type() not in {content_types[f] for f in allowed[rel_path]}:
            raise ValueError("Loại ảnh từ xa không khớp")
        limit = 10 * 1024 * 1024
        if int(response.headers.get("Content-Length", 0)) > limit:
            raise ValueError("Ảnh từ xa vượt quá 10MB")
        raw = response.read(limit + 1)
    if len(raw) > limit:
        raise ValueError("Ảnh từ xa vượt quá 10MB")
    image = Image.open(io.BytesIO(raw))
    if image.format not in allowed[rel_path] or image.width * image.height > 20_000_000:
        raise ValueError("Định dạng hoặc kích thước ảnh từ xa không khớp")
    image.load()
    return image


def resolve_safe_image_path(rel_path: str) -> Path:
    clean = (rel_path or "").strip().replace("\\", "/").lstrip("/")
    candidate = (ROOT_DIR / clean).resolve()
    try:
        is_safe = candidate.is_relative_to(THUMBS_DIR) or candidate.is_relative_to(IMG_DIR)
    except AttributeError:
        cand_posix = candidate.as_posix()
        thumbs_prefix = THUMBS_DIR.as_posix().rstrip("/") + "/"
        img_prefix = IMG_DIR.as_posix().rstrip("/") + "/"
        is_safe = cand_posix.startswith(thumbs_prefix) or cand_posix.startswith(img_prefix)
    if not is_safe:
        raise ValueError("Đường dẫn ảnh không hợp lệ")
    if not candidate.is_file():
        raise FileNotFoundError(f"File ảnh không tồn tại: {clean}")
    return candidate


def register_routes() -> None:
    try:
        from aiohttp import web
        from server import PromptServer
    except ImportError:
        # Không phải môi trường chạy ComfyUI (vd kiểm tra bằng script độc lập) thì bỏ qua luôn
        return

    if getattr(PromptServer, "instance", None) is None:
        return

    routes = PromptServer.instance.routes

    @routes.get("/pose_character_atlas/catalogue")
    async def get_catalogue(request):
        lib = request.query.get("library", "pose")
        try:
            items = load_library(lib)
            return web.json_response(
                {"library": lib, "count": len(items), "items": items},
                headers={"Cache-Control": "public, max-age=300"},
            )
        except Exception as exc:
            return web.json_response({"error": str(exc)}, status=400)

    @routes.get("/pose_character_atlas/image")
    async def get_image(request):
        rel = request.query.get("path", "")
        lib = request.query.get("library", "")
        item_id = request.query.get("id", "")
        kind = request.query.get("kind", "thumb")
        depth = request.query.get("depth", "") in ("1", "true")
        try:
            if not rel and lib and item_id:
                item = find_item(lib, item_id)
                if lib == "costume":
                    item = select_costume_view(item, request.query.get("view", "front"))
                rel = item.get("缩略图" if kind == "thumb" else "原图", "")
            if depth:
                clean_rel = (rel or "").lstrip("/")
                if clean_rel.startswith("thumbs/") and not clean_rel.startswith("thumbs/depth/"):
                    stem = clean_rel[len("thumbs/") :].rsplit(".", 1)[0]
                    rel = f"thumbs/depth/{stem}.webp"
                elif clean_rel.startswith("img/") and not clean_rel.startswith("img/depth/"):
                    stem = clean_rel[len("img/") :].rsplit(".", 1)[0]
                    rel = f"img/depth/{stem}.webp"
            if rel.startswith("https://"):
                # Browser reads only catalogue URLs; no arbitrary remote proxy.
                allowed = {r[k] for r in load_library("costume") if r.get("source") in ("charadb", "gia-anime") for k in ("缩略图", "原图")}
                if rel not in allowed:
                    raise ValueError("Ảnh từ xa không xác định")
                raise web.HTTPFound(rel)
            path = resolve_safe_image_path(rel)
            return web.FileResponse(
                path,
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "X-Content-Type-Options": "nosniff",
                },
            )
        except web.HTTPRedirection:
            raise
        except Exception as exc:
            return web.json_response({"error": str(exc)}, status=404)
