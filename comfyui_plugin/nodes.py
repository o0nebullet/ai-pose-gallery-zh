# -*- coding: utf-8 -*-
"""Node tùy chỉnh ComfyUI: Thư viện tham chiếu 3-trong-1 nhân vật AI (tư thế + trang phục + chân dung + công thức tổng hợp 3-trong-1)."""

from __future__ import annotations

from typing import TYPE_CHECKING

from.routes import find_item, open_reference_image, select_costume_view

if TYPE_CHECKING:
    from PIL import Image

RESIZE_MODES = [
    "Kích thước gốc",
    "Kích thước chỉ định (cắt giữa)",
    "Kích thước chỉ định (chèn lề trắng)",
]

STYLE_PRESETS = {
    "Anime Nhật nét cao": (
        "日系二次元动漫插画风格，精致五官，赛璐璐与厚涂结合，光影通透，高画质杰作",
        "anime illustration, cel shading and soft lighting, clean lineart, masterpiece, best quality",
    ),
    "Chân dung chụp ảnh thực tế": (
        "电影级写实人像摄影，85mm定焦镜头，真实皮肤质感，自然景深与柔美布光，8K超清",
        "photorealistic portrait photography, 85mm lens, realistic skin texture, cinematic lighting, 8k",
    ),
    "Minh họa bán dày kiểu Hàn": (
        "韩系唯美半厚涂角色立绘，细腻丝滑高光，柔美体积感，高级色彩搭配",
        "semi-realistic anime character art, smooth rendering, luminous highlights, refined color palette",
    ),
    "Ảnh thiết lập nhân vật sạch": (
        "游戏角色立绘设定图，干净浅灰/纯白背景，轮廓清晰，服装材质与褶皱细节丰富",
        "character design reference sheet, clean light background, crisp silhouette, detailed fabric folds",
    ),
}


def _pil_to_comfy_tensor(img: Image.Image):
    import numpy as np
    import torch

    rgb = img.convert("RGB")
    arr = np.asarray(rgb, dtype=np.float32) / 255.0
    return torch.from_numpy(arr).unsqueeze(0)


def _load_pil_image(
    rel_path: str,
    resize_mode: str = "Kích thước gốc",
    width: int = 1024,
    height: int = 1280,
    flip_horizontal: bool = False,
) -> Image.Image:
    from PIL import Image, ImageOps

    img = open_reference_image(rel_path)
    img = ImageOps.exif_transpose(img).convert("RGB")

    if flip_horizontal:
        img = ImageOps.mirror(img)

    target_w = max(64, int(width))
    target_h = max(64, int(height))

    if resize_mode == "Kích thước chỉ định (cắt giữa)":
        img = ImageOps.fit(img, (target_w, target_h), method=Image.Resampling.LANCZOS)
    elif resize_mode == "Kích thước chỉ định (chèn lề trắng)":
        img = ImageOps.pad(
            img,
            (target_w, target_h),
            method=Image.Resampling.LANCZOS,
            color=(245, 245, 247),
        )

    return img


def _build_pose_prompts(item: dict) -> tuple[str, str]:
    title = item.get("姿势名称") or item.get("标题") or "标准姿势"
    system = item.get("体系", "")
    cat = item.get("分类", "")
    angle = item.get("角度", "正面")
    zh = f"{angle}视角，动作：{title}（{system}·{cat}）"
    en = f"{angle} view, pose: {title} ({cat})"
    return zh, en


def _build_costume_prompts(item: dict) -> tuple[str, str]:
    title = item.get("服装名称") or item.get("标题") or ""
    cat = item.get("分类", "")
    tags = "、".join(item.get("标签", [])[:8])
    desc_en = item.get("关键词", "") or title
    zh = f"身穿{cat}：{title}" + (f"（细节：{tags}）" if tags else "")
    return zh, desc_en


def _build_portrait_prompts(item: dict) -> tuple[str, str]:
    title = item.get("标题", "")
    section = item.get("分区", "")
    hair_len = item.get("发长", "")
    hair_style = item.get("发型名称") or item.get("发型") or ""
    zh = f"人物面部与发型：{hair_len}、{hair_style}（{section}，{title}）"
    en = f"character hairstyle and face reference: {hair_len}, {hair_style}"
    return zh, en


def _pose_image_rel_path(item: dict, use_depth: bool = False) -> str:
    raw = str(item.get("原图", "")).lstrip("/")
    if use_depth and raw.startswith("img/") and not raw.startswith("img/depth/"):
        stem = raw[len("img/"):].rsplit(".", 1)[0]
        return f"img/depth/{stem}.webp"
    return raw


class PoseGalleryNode:
    """Chọn ảnh tham chiếu tư thế từ thư viện 1.439 tư thế mẫu 3D và xuất IMAGE cùng prompt."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image_id": (
                    "STRING",
                    {"default": "full_single_P001_front", "multiline": False},
                ),
                "resize_mode": (RESIZE_MODES, {"default": "Kích thước gốc"}),
                "width": ("INT", {"default": 1024, "min": 64, "max": 4096, "step": 8}),
                "height": ("INT", {"default": 1280, "min": 64, "max": 4096, "step": 8}),
                "flip_horizontal": ("BOOLEAN", {"default": False}),
            },
            "optional": {
                "use_depth": ("BOOLEAN", {"default": False}),
            },
        }

    RETURN_TYPES = ("IMAGE", "STRING", "STRING")
    RETURN_NAMES = ("Ảnh tư thế", "ID ảnh", "Prompt tư thế")
    FUNCTION = "load_pose"
    CATEGORY = "Thư viện tham chiếu 3-trong-1 nhân vật AI"

    def load_pose(
        self,
        image_id: str = "full_single_P001_front",
        resize_mode: str = "Kích thước gốc",
        width: int = 1024,
        height: int = 1280,
        flip_horizontal: bool = False,
        use_depth: bool = False,
    ):
        item = find_item("pose", image_id)
        pil_img = _load_pil_image(
            _pose_image_rel_path(item, use_depth=use_depth),
            resize_mode=resize_mode,
            width=width,
            height=height,
            flip_horizontal=flip_horizontal,
        )
        zh_prompt, _ = _build_pose_prompts(item)
        return (_pil_to_comfy_tensor(pil_img), item["id"], zh_prompt)


class CostumeGalleryNode:
    """Chọn trang phục và góc nhìn hợp lệ từ thư viện trang phục, xuất IMAGE cùng Prompt trang phục tiếng Trung và tiếng Anh."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image_id": ("STRING", {"default": "SPR-0001", "multiline": False}),
                "resize_mode": (RESIZE_MODES, {"default": "Kích thước gốc"}),
                "width": ("INT", {"default": 1024, "min": 64, "max": 4096, "step": 8}),
                "height": ("INT", {"default": 1280, "min": 64, "max": 4096, "step": 8}),
                "flip_horizontal": ("BOOLEAN", {"default": False}),
            },
            "optional": {"costume_view": (["front", "diag", "side", "back"], {"default": "front"})},
        }

    RETURN_TYPES = ("IMAGE", "STRING", "STRING", "STRING")
    RETURN_NAMES = ("Ảnh trang phục", "ID ảnh", "Mô tả trang phục tiếng Trung", "Prompt trang phục tiếng Anh")
    FUNCTION = "load_costume"
    CATEGORY = "Thư viện tham chiếu 3-trong-1 nhân vật AI"

    def load_costume(
        self,
        image_id: str = "SPR-0001",
        resize_mode: str = "Kích thước gốc",
        width: int = 1024,
        height: int = 1280,
        flip_horizontal: bool = False,
        costume_view: str = "front",
    ):
        item = select_costume_view(find_item("costume", image_id), costume_view)
        pil_img = _load_pil_image(
            item["原图"],
            resize_mode=resize_mode,
            width=width,
            height=height,
            flip_horizontal=flip_horizontal,
        )
        zh_prompt, en_prompt = _build_costume_prompts(item)
        return (_pil_to_comfy_tensor(pil_img), item["id"], zh_prompt, en_prompt)


class PortraitGalleryNode:
    """Chọn ảnh tham chiếu chân dung từ thư viện 1.499 chân dung và kiểu tóc tinh xảo, xuất IMAGE cùng mô tả kiểu tóc."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image_id": ("STRING", {"default": "f71f980dde3", "multiline": False}),
                "resize_mode": (RESIZE_MODES, {"default": "Kích thước gốc"}),
                "width": ("INT", {"default": 1024, "min": 64, "max": 4096, "step": 8}),
                "height": ("INT", {"default": 1280, "min": 64, "max": 4096, "step": 8}),
                "flip_horizontal": ("BOOLEAN", {"default": False}),
            }
        }

    RETURN_TYPES = ("IMAGE", "STRING", "STRING")
    RETURN_NAMES = ("Ảnh chân dung", "ID ảnh", "Mô tả kiểu tóc chân dung")
    FUNCTION = "load_portrait"
    CATEGORY = "Thư viện tham chiếu 3-trong-1 nhân vật AI"

    def load_portrait(
        self,
        image_id: str = "f71f980dde3",
        resize_mode: str = "Kích thước gốc",
        width: int = 1024,
        height: int = 1280,
        flip_horizontal: bool = False,
    ):
        item = find_item("portrait", image_id)
        pil_img = _load_pil_image(
            item["原图"],
            resize_mode=resize_mode,
            width=width,
            height=height,
            flip_horizontal=flip_horizontal,
        )
        zh_prompt, _ = _build_portrait_prompts(item)
        return (_pil_to_comfy_tensor(pil_img), item["id"], zh_prompt)


class CharacterRecipeNode:
    """Node công thức tổng hợp 3-trong-1 nhân vật: đồng thời xuất ảnh chân dung, ảnh trang phục, ảnh tư thế, ảnh ghép 3-trong-1 ngang, cùng Prompt tổng hợp tiếng Trung và tiếng Anh được ghép tự động."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "portrait_id": (
                    "STRING",
                    {"default": "f71f980dde3", "multiline": False},
                ),
                "costume_id": ("STRING", {"default": "SPR-0001", "multiline": False}),
                "pose_id": (
                    "STRING",
                    {"default": "full_single_P001_front", "multiline": False},
                ),
                "style_preset": (
                    list(STYLE_PRESETS.keys()),
                    {"default": "Anime Nhật nét cao"},
                ),
                "extra_prompt": (
                    "STRING",
                    {
                        "default": "",
                        "multiline": True,
                        "placeholder": "Prompt bổ sung tùy chọn (ví dụ: mắt bạc, ngược sáng bên cửa sổ lớp học, gió nhẹ thổi tóc)",
                    },
                ),
                "resize_mode": (RESIZE_MODES, {"default": "Kích thước chỉ định (cắt giữa)"}),
                "width": ("INT", {"default": 1024, "min": 64, "max": 4096, "step": 8}),
                "height": ("INT", {"default": 1280, "min": 64, "max": 4096, "step": 8}),
                "flip_pose_horizontal": ("BOOLEAN", {"default": False}),
            },
            "optional": {
                "use_depth": ("BOOLEAN", {"default": False}),
                "costume_view": (["front", "diag", "side", "back"], {"default": "front"}),
            },
        }

    RETURN_TYPES = ("IMAGE", "IMAGE", "IMAGE", "IMAGE", "STRING", "STRING")
    RETURN_NAMES = (
        "Ảnh chân dung",
        "Ảnh trang phục",
        "Ảnh tư thế",
        "Ảnh ghép 3-trong-1",
        "Prompt tổng hợp tiếng Trung",
        "Prompt tổng hợp tiếng Anh",
    )
    FUNCTION = "build_recipe"
    CATEGORY = "Thư viện tham chiếu 3-trong-1 nhân vật AI"

    def build_recipe(
        self,
        portrait_id: str = "f71f980dde3",
        costume_id: str = "SPR-0001",
        pose_id: str = "full_single_P001_front",
        style_preset: str = "Anime Nhật nét cao",
        extra_prompt: str = "",
        resize_mode: str = "Kích thước chỉ định (cắt giữa)",
        width: int = 1024,
        height: int = 1280,
        flip_pose_horizontal: bool = False,
        use_depth: bool = False,
        costume_view: str = "front",
    ):
        portrait_item = find_item("portrait", portrait_id)
        costume_item = select_costume_view(find_item("costume", costume_id), costume_view)
        pose_item = find_item("pose", pose_id)

        portrait_pil = _load_pil_image(
            portrait_item["原图"], resize_mode=resize_mode, width=width, height=height
        )
        costume_pil = _load_pil_image(
            costume_item["原图"], resize_mode=resize_mode, width=width, height=height
        )
        pose_pil = _load_pil_image(
            _pose_image_rel_path(pose_item, use_depth=use_depth),
            resize_mode=resize_mode,
            width=width,
            height=height,
            flip_horizontal=flip_pose_horizontal,
        )

        # Tạo ảnh ghép tham chiếu 3-trong-1 ngang (chân dung | trang phục | tư thế)
        from PIL import Image, ImageOps

        panel_h = max(256, int(height))
        panel_w = max(256, int(width))
        p1 = ImageOps.fit(
            portrait_pil, (panel_w, panel_h), method=Image.Resampling.LANCZOS
        )
        p2 = ImageOps.fit(
            costume_pil, (panel_w, panel_h), method=Image.Resampling.LANCZOS
        )
        p3 = ImageOps.fit(pose_pil, (panel_w, panel_h), method=Image.Resampling.LANCZOS)
        gap = 12
        composite = Image.new("RGB", (panel_w * 3 + gap * 2, panel_h), (24, 24, 29))
        composite.paste(p1, (0, 0))
        composite.paste(p2, (panel_w + gap, 0))
        composite.paste(p3, ((panel_w + gap) * 2, 0))

        portrait_zh, portrait_en = _build_portrait_prompts(portrait_item)
        costume_zh, costume_en = _build_costume_prompts(costume_item)
        pose_zh, pose_en = _build_pose_prompts(pose_item)
        style_zh, style_en = STYLE_PRESETS.get(
            style_preset, STYLE_PRESETS["Anime Nhật nét cao"]
        )

        extra_clean = (extra_prompt or "").strip()
        zh_parts = [
            f"请融合参考图生成一张完整的角色立绘：{style_zh}。",
            f"{portrait_zh}；",
            f"{costume_zh}；",
            f"{pose_zh}。",
        ]
        if extra_clean:
            zh_parts.append(f"{extra_clean}。")
        zh_parts.append(
            "要求人物面部自然生动，服装穿戴贴合身体动态，肢体透视与手部结构准确，光影和谐统一。"
        )

        en_parts = [
            style_en,
            portrait_en,
            f"wearing {costume_en}",
            pose_en,
        ]
        if extra_clean:
            en_parts.append(extra_clean)

        return (
            _pil_to_comfy_tensor(portrait_pil),
            _pil_to_comfy_tensor(costume_pil),
            _pil_to_comfy_tensor(pose_pil),
            _pil_to_comfy_tensor(composite),
            "".join(zh_parts),
            ", ".join(en_parts),
        )


NODE_CLASS_MAPPINGS = {
    "PoseGalleryNode": PoseGalleryNode,
    "CostumeGalleryNode": CostumeGalleryNode,
    "PortraitGalleryNode": PortraitGalleryNode,
    "CharacterRecipeNode": CharacterRecipeNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PoseGalleryNode": "Ảnh tham chiếu tư thế AI (Pose Gallery)",
    "CostumeGalleryNode": "Ảnh tham chiếu trang phục AI (Costume Gallery)",
    "PortraitGalleryNode": "Ảnh tham chiếu chân dung AI (Portrait Gallery)",
    "CharacterRecipeNode": "Công thức tổng hợp 3-trong-1 nhân vật AI (3-in-1 Recipe)",
}
