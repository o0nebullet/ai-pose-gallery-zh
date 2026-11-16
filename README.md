# Bàn làm việc tham chiếu & tổng hợp nhân vật AI · Bản tiếng Việt (3-trong-1)

> **Thư viện tư thế (1.439 ảnh mẫu trắng + 1.439 ảnh độ sâu Depth) + Thư viện trang phục (3.224 bộ: ギア thực tế 1.407 + Shisei các triều đại Trung Quốc 57 bộ/227 góc nhìn + ギア anime 1.320 + CharaDB 2D 440) + Thư viện chân dung (1.499 người) = 6.162 mục dữ liệu tham chiếu toàn tiếng Trung / 12.022 ảnh chất lượng cao local, thêm 1.760 ảnh tham chiếu từ trang nguồn**, tích hợp **5 giao thức ảnh AI kết nối trực tiếp tới bàn làm việc** và **plugin node tùy chỉnh ComfyUI gốc (`custom_nodes`)**.

![Xem trước tổng quan thư viện](docs/preview.jpg)

![Xem trước bàn tổng hợp nhân vật AI](docs/studio.jpg)

<details><summary>Xem trước trên điện thoại</summary>

![Xem trước trên điện thoại](docs/mobile.jpg)

</details>

**Trang demo trực tuyến:** <https://ai-pose-gallery.anhao.app/>
**Các trang gốc:**
- Thư viện tư thế (mẫu trắng): <https://ai-pose-gallery.pages.dev/>
- Thư viện ảnh độ sâu tư thế (Depth): <https://ai-pose-depth-gallery.pages.dev/>
- Thư viện trang phục: <https://ai-costume-gallery.pages.dev/>
- Thư viện chân dung: <https://ai-portrait-gallery.pages.dev/>

**Tác giả thư viện gốc:** ギア (@giaaibusi); tác giả trang phục 2D: たき AI ([@taki_auto](https://x.com/taki_auto) · [CharaDB](https://charadb-2fi.pages.dev/)).
**Người duy trì bản tiếng Trung:** Anhao · [X @anhao_ai](https://x.com/anhao_ai)
**GitHub:** <https://github.com/anhao/ai-pose-gallery-zh>

> ⚠️ **Tuyên bố miễn trừ trách nhiệm (bắt buộc đọc)**:
> 1. **Giới hạn học tập & sáng tạo**: Dự án này và plugin/workflow đi kèm **chỉ dùng cho học tập cá nhân, nghiên cứu động tác cơ thể, sáng tạo nghệ thuật hợp pháp và trao đổi kỹ thuật**, nghiêm cấm dùng cho bất kỳ mục đích vi phạm pháp luật nào, tạo nội dung vi phạm pháp luật/quy định/khiêu dâm hoặc xâm phạm quyền lợi hợp pháp của người khác (như đổi mặt chân dung người thật khi chưa được phép).
> 2. **Lưu ý nội dung nhạy cảm NSFW**: Thư viện chứa một phần tư thế mẫu cơ thể người lớn 18+ và trang phục nội y/gợi cảm, hệ thống mặc định bật "Chế độ an toàn (SFW)" để ẩn, **người chưa thành niên tuyệt đối không được mở khóa hoặc truy cập**.
> 3. **Tuyên bố nguồn & bản quyền**: Ảnh tham chiếu tư thế, trang phục thực tế, chân dung gốc lấy từ trang công khai của tác giả gốc **ギア (@giaaibusi)**; 440 bộ trang phục 2D lấy từ **たき AI (@taki_auto)** [CharaDB](https://charadb-2fi.pages.dev/) (xem [LICENSE](https://github.com/taki-ttt/charadb/blob/main/LICENSE) của họ), bản quyền thuộc về từng tác giả gốc; kho này chỉ là bản dịch, sắp xếp lại sang tiếng Trung và lưu trữ phục vụ học tập kỹ thuật, cấm đóng gói bán lại ảnh trong thư viện. Mọi trách nhiệm pháp lý phát sinh do sử dụng sai quy định do chính người dùng tự chịu.

---

## Đây là gì

Trang gốc là 3 thư viện tham chiếu vẽ bằng AI của ギア (@giaaibusi) (tư thế, trang phục, chân dung), metadata toàn tiếng Nhật, phân tán ở 3 trang độc lập. Kho này (v2.0) đã hoàn thành **gộp 3 trang làm 1, bản địa hóa toàn bộ sang tiếng Trung, nâng cấp bàn tổng hợp nhân vật AI và plugin ComfyUI gốc**:

1. **Ảnh mirror local toàn bộ 3 thư viện, 4 trang (11.568 ảnh)** — thu thập đầy đủ thư viện tư thế (mẫu trắng 2.878 ảnh + ảnh độ sâu Depth 2.878 ảnh WebP), thư viện trang phục (2.814 ảnh WebP), thư viện chân dung (2.998 ảnh, ảnh gốc WebP `1600×2000` chất lượng cao), gồm toàn bộ ảnh thu nhỏ và ảnh gốc chất lượng cao, hỗ trợ duyệt hoàn toàn offline và lưu trữ tĩnh.
2. **Metadata tiếng Trung toàn bộ cho thư viện gốc** — hệ thống động tác, phân loại tư thế, kiểu trang phục, nhãn phối đồ, khu vực chân dung, độ dài tóc và 51 kiểu tóc chi tiết đều được dịch sang tiếng Trung tự nhiên, prompt tạo ảnh được ghép tự động hoàn toàn sạch, không lẫn tiếng Nhật.
3. **Bàn tổng hợp nhân vật AI 3-trong-1 (Web Studio)** — ứng dụng đa trang responsive xây dựng trên **React 19 + Tailwind CSS 4 + TypeScript 7 + shadcn/ui + TanStack Router** (tương thích PC / máy tính bảng / điện thoại):
   - Chọn tùy ý **chân dung + trang phục + tư thế (hỗ trợ chuyển đổi 1 chạm mẫu trắng / ảnh độ sâu)** từ 3 thư viện để ghép công thức, hoặc tạo nhân vật ngẫu nhiên bằng 1 chạm;
   - Hỗ trợ kéo-thả, dán từ clipboard (`Cmd+V` / `Ctrl+V`) hoặc thêm nhiều ảnh tham chiếu tùy chỉnh qua URL;
   - Tích hợp **5 giao thức ảnh AI kết nối trực tiếp** (Google Gemini, OpenAI GPT Image, Alibaba Cloud Bailian Qwen, Volcengine Ark Doubao của ByteDance, **ComfyUI local**), lịch sử tạo được lưu bền vững local qua **IndexedDB**.
4. **Plugin node tùy chỉnh ComfyUI gốc (`custom_nodes`)** — Kho này đồng thời là 1 plugin ComfyUI cắm là chạy! Chỉ cần `git clone` vào `ComfyUI/custom_nodes/` là dùng được ngay trong canvas ComfyUI **4 node tùy chỉnh tư thế / trang phục / chân dung / công thức nhân vật 3-trong-1** (node tư thế và node công thức tích hợp công tắc `use_depth` chuyển ảnh độ sâu, cắm thẳng vào ControlNet Depth) cùng **bộ chọn ảnh dạng popup trực quan với 6.162 mục tiếng Trung**.

---

## Tính năng chính

### 1. Ba thư viện tham chiếu (tư thế / trang phục / chân dung)
- **Thư viện tham chiếu tư thế (`/poses`)**: 4 hệ thống lớn (toàn thân đơn · hệ chuẩn / toàn thân đơn · hệ gợi cảm / nửa thân trên đơn / đôi quấn quýt), 26 loại động tác, 288 nhóm tư thế, 5 góc nhìn (chính diện / chéo trước / bên hông / sau lưng / nhìn từ trên xuống), hỗ trợ 2 chế độ **duyệt theo nhóm tư thế / duyệt từng ảnh**, chuyển nhiều góc trong thẻ, và **`[ Mẫu trắng | Ảnh độ sâu (Depth) ]` chuyển đổi 1 chạm để xem trước và tải xuống**.
- **Thư viện tham chiếu trang phục (`/costumes`)**: 8 loại phối đồ lớn (xuân / hạ / thu / đông / đồ lót · đồ ngủ / phối đồ gợi cảm / đồ bơi · nghỉ dưỡng / tiệc · lễ phục), 86 nhãn chi tiết tiếng Trung và từ khóa Prompt tiếng Anh.
- **Thư viện tham chiếu chân dung (`/portraits`)**: 2 khu vực lớn (tham chiếu chính diện 893 / tạo hình & không khí 606), 4 độ dài tóc (tóc ngắn / tóc vừa / tóc vừa dài / tóc dài), 51 kiểu tóc chi tiết, hỗ trợ lọc 1 chạm **bộ sưu tập tuyển chọn** và **bảng xếp hạng phổ biến**.
- **Trải nghiệm tương tác thống nhất**: tìm kiếm thời gian thực bằng từ khóa tiếng Trung, xem trước ảnh gốc chất lượng cao bằng lightbox và tải xuống, thêm vào công thức tổng hợp bằng 1 chạm.

### 2. Bàn tổng hợp nhân vật AI (`/studio`)
- **Kết hợp tham chiếu 3+N**: 3 ô chính (chân dung / trang phục / tư thế, ô tư thế tích hợp chuyển đổi thời gian thực `[ Mẫu trắng | Độ sâu ]`) + số lượng tùy ý ảnh tham chiếu bổ sung tùy chỉnh (bấm để tải lên, kéo-thả file, dán clipboard, nhập URL ảnh).
- **Xem trước & xuất ảnh ghép tham chiếu**: xem ảnh ghép tham chiếu 3-trong-1 chất lượng cao trong popup (ghép thời gian thực bằng Canvas `1800×1200`), hỗ trợ tải ảnh ghép PNG bằng 1 chạm.
- **12 preset phong cách vẽ & prompt có cấu trúc hoàn toàn tiếng Trung**: tích hợp "Không preset (theo ảnh tham chiếu)", ảnh chân dung thực tế, ảnh báo tạp chí Nhật–Hàn, ảnh phim retro, tranh gốc game 2.5D, minh họa anime Nhật, phim hoạt hình phong cách Shinkai Makoto, truyện tranh đen trắng Nhật chấm lưới, render nhân vật 3D thế hệ mới, chất lượng figure đồ chơi 3D trendy, neon cyberpunk, tranh thiết lập nhân vật (nền trắng tinh) — tổng 12 phong cách, tự động ghép prompt theo tư liệu đã chọn.
- **5 giao thức ảnh AI & tham số nâng cao**:
  - **Google Gemini**: `gemini-3.1-flash-image-preview`, `gemini-3-pro-image-preview`, `gemini-2.5-flash-image` (hỗ trợ tỉ lệ khung hình `aspectRatio`, độ phân giải `1K/2K/4K`)
  - **OpenAI GPT Image**: `gpt-image-2.5`, `gpt-image-2`, `gpt-image-1.5`, `gpt-image-1` (hỗ trợ `/v1/images/edits` truyền thẳng URL JSON / tải lên Multipart, kích thước, chất lượng, độ trong suốt nền)
  - **Alibaba Cloud Bailian Qwen**: `qwen-image-3.0-pro`, `qwen-image-2.1-pro`, `qwen-image-2.0-pro`, `qwen-image-edit-plus` (hỗ trợ `multimodal-generation` nhập nhiều ảnh tham chiếu, viết lại thông minh `prompt_extend`, công tắc watermark)
  - **Volcengine Ark Doubao của ByteDance**: `doubao-seedream-5-0`, `doubao-seedream-4-5-251128`, `doubao-seedream-4-0-250828`, `doubao-seededit-3-0-i2i-250628` (hỗ trợ hợp nhất nhiều ảnh `image: [...]`, độ phân giải 2K/4K)
  - **Engine workflow ComfyUI local**: hỗ trợ tự động tải ảnh ghép 3-trong-1 và từng ảnh chân dung/trang phục/tư thế lên ComfyUI local (`/upload/image`), chèn placeholder workflow API tùy chỉnh hoặc tự nhận diện node để gửi hàng đợi `/prompt` rồi luân phiên lấy ảnh thành phẩm; hỗ trợ import/export mẫu workflow `.api.json` chung.
- **Tạo ảnh nền xuyên trang & lịch sử IndexedDB**: chuyển trang không làm gián đoạn yêu cầu tạo ảnh đang chạy; kết quả tạo tự động lưu vào IndexedDB của trình duyệt (tránh giới hạn dung lượng `localStorage`), hỗ trợ dùng lại prompt và tải ảnh gốc.

> Danh sách model, hướng dẫn workflow và cách chạy local cho tổng hợp 3 ảnh bằng ComfyUI local (Qwen Image Edit 2509) xem [docs/comfyui-local.md](docs/comfyui-local.md).

> Tham số nâng cao động sau khi import API, tải lên ảnh tham chiếu bộ thiết lập và khai báo hiển thị tùy chọn xem [Tham số nâng cao workflow ComfyUI](docs/comfyui-workflow-parameters.md).

> Tiến độ thời gian thực qua WebSocket, dự phòng HTTP và khôi phục sau khi làm mới xem [Kết nối & khôi phục task ComfyUI](docs/comfyui-task-tracking.md).

### 3. Plugin node tùy chỉnh ComfyUI gốc (`comfyui_plugin/`)
Clone kho này vào `ComfyUI/custom_nodes/ai-pose-gallery-zh`, menu chuột phải trên canvas ComfyUI **"Thư viện tham chiếu 3-trong-1 nhân vật AI"** sẽ tự cung cấp 4 node:
- **Ảnh tham chiếu tư thế AI (`PoseGalleryNode`)**: xuất `Ảnh tư thế (IMAGE)`, `ID ảnh`, `Prompt tư thế` (hỗ trợ công tắc `use_depth` chuyển 1 chạm giữa mẫu trắng và ảnh độ sâu)
- **Ảnh tham chiếu trang phục AI (`CostumeGalleryNode`)**: xuất `Ảnh trang phục (IMAGE)`, `ID ảnh`, `Mô tả trang phục tiếng Trung`, `Prompt trang phục tiếng Anh`
- **Ảnh tham chiếu chân dung AI (`PortraitGalleryNode`)**: xuất `Ảnh chân dung (IMAGE)`, `ID ảnh`, `Mô tả kiểu tóc chân dung`
- **Công thức tổng hợp 3-trong-1 nhân vật AI (`CharacterRecipeNode`)**: 1 node xuất đồng thời `Ảnh chân dung`, `Ảnh trang phục`, `Ảnh tư thế (hỗ trợ chuyển ảnh độ sâu use_depth)`, `Ảnh ghép 3-trong-1` cùng `Prompt tổng hợp tiếng Trung` và `Prompt tổng hợp tiếng Anh` được ghép tự động, tích hợp **bộ chọn ảnh dạng popup trực quan 6.162 mục tiếng Trung (gồm công tắc xem trước ảnh độ sâu 🌗)** và xem trước ảnh thu nhỏ thời gian thực trong node.

---

## Quy mô dữ liệu

| Thư viện | Phân loại / hệ thống | Số mục | Số file ảnh local |
| --- | --- | ---: | ---: |
| **Thư viện tư thế (Pose mẫu trắng)** | Toàn thân chuẩn (365) · Toàn thân gợi cảm (399) · Nửa thân trên (400) · Đôi quấn quýt (275) | 1,439 | 2,878 ảnh (ảnh thu nhỏ `.jpg` + ảnh gốc `.png`) |
| **Ảnh độ sâu tư thế (Pose Depth)** | Khớp 1-1 với 1.439 ID tư thế (`POSE-DB-02`) | 1,439 (dùng chung chỉ mục) | 2,878 ảnh (ảnh thu nhỏ `.webp` + ảnh gốc `.webp`) |
| **Thư viện trang phục (ギア thực tế)** | Xuân (215) · Hạ (254) · Thu (244) · Đông (253) · Đồ lót & đồ ngủ (199) · Gợi cảm (140) · Đồ bơi (54) · Lễ phục (48) | 1,407 | 2,814 ảnh (ảnh thu nhỏ `.webp` + ảnh gốc `.webp`) |
| **Trang phục các triều đại Trung Quốc (Shisei)** | Trang phục các triều đại từ Thương tới Thanh (nhiều góc: chính diện / chéo bên / bên hông / sau lưng) | 57 (227 góc nhìn) | 454 ảnh (ảnh thu nhỏ `.webp` + ảnh gốc `.png`) |
| **Trang phục anime (ギア anime)** | Xuân · Hạ · Thu · Đông · Đồ lót & đồ ngủ · Gợi cảm · Đồ bơi · Lễ phục | 1,320 | Hotlink từ trang gốc, kho và gói phát hành không lưu ảnh |
| **Trang phục 2D (CharaDB)** | 15 loại, tên tiếng Trung và nhãn Danbooru gốc | 440 | Hotlink từ trang gốc, kho và gói phát hành không lưu ảnh |
| **Thư viện chân dung (Portrait)** | Tham chiếu chính diện (893) · Tạo hình & không khí (606) / Tóc ngắn (727) · Tóc vừa (376) · Tóc vừa dài (260) · Tóc dài (136) | 1,499 | 2,998 ảnh (ảnh thu nhỏ `.webp` + ảnh gốc `.webp` `1600×2000`) |
| **Tổng cộng** | **3 thư viện lớn với chỉ mục toàn tiếng Trung (gồm 2 chế độ xem mẫu trắng + ảnh độ sâu)** | **6,162** | **12,022 ảnh** |

---

## Sử dụng trong ComfyUI (hỗ trợ 2 chế độ)

### Chế độ A: Cài làm plugin ComfyUI gốc (chọn ảnh trong canvas ComfyUI)

Không cần cài thêm dependency Python (dùng trực tiếp `torch`, `numpy`, `Pillow`, `aiohttp` có sẵn của ComfyUI):

```bash
cd /path/to/ComfyUI/custom_nodes
git clone --depth 1 https://github.com/anhao/ai-pose-gallery-zh.git
```

Khởi động lại ComfyUI rồi:
1. Chuột phải vào chỗ trống trên canvas → **Tạo node mới** → **Thư viện tham chiếu 3-trong-1 nhân vật AI**;
2. Chọn **"Công thức tổng hợp 3-trong-1 nhân vật AI (3-in-1 Recipe)"** hoặc node tư thế / trang phục / chân dung riêng;
3. Bấm nút **"🎨 Mở bộ chọn ảnh 3-trong-1 (6.162 ảnh)"** trên node (hoặc bấm trực tiếp vào ảnh thu nhỏ trên node) để lọc theo phân loại, góc nhìn, độ dài tóc hoặc tìm kiếm tiếng Trung trong popup, điền vào node bằng 1 chạm rồi xuất tensor `IMAGE` và Prompt tiếng Trung + tiếng Anh.

### Chế độ B: Từ bàn tổng hợp Web kết nối trực tiếp API ComfyUI local

Nếu bạn dùng trang web online (hoặc `pnpm dev` local) để chọn ảnh và muốn gọi thẳng ComfyUI trên máy mình để tạo ảnh:
1. Khi khởi động ComfyUI local, bật tham số CORS:
   ```bash
   python main.py --enable-cors-header "*"
   ```
2. Mở bàn làm việc này, trang **"Cấu hình API"** → chuyển sang **"ComfyUI local"** → bấm "Kiểm tra kết nối" (mặc định `http://127.0.0.1:8188`);
3. Có thể import trực tiếp file `.json` mà bạn đã lưu trong ComfyUI qua `Workflow -> Export (API)` (hỗ trợ placeholder `{{prompt}}`, `{{seed}}`, `{{width}}`, `{{height}}`, `{{composite_image}}`, `{{portrait_image}}`, `{{costume_image}}`, `{{pose_image}}`, hoặc hệ thống tự khớp node `CLIPTextEncode` / `KSampler` / `LoadImage`), cũng có thể xuất mẫu workflow chung tích hợp sẵn bằng 1 chạm ở **"Bàn tổng hợp"**.

---

## Công nghệ & cấu trúc thư mục

- **Framework frontend**: React 19.3 + TypeScript 7.0 + Vite 8 (Rolldown)
- **Routing & state**: TanStack Router + TanStack Query + lưu trữ local IndexedDB
- **Kiểu dáng & component**: Tailwind CSS 4.3 + shadcn/ui (Radix UI) + Lucide Icons
- **Plugin ComfyUI**: Python (`aiohttp` + `Pillow` + `torch`) + LiteGraph Frontend Extension
- **Chất lượng code**: Oxlint + Oxfmt

```text
.
├── __init__.py             # ComfyUI 自定义节点插件根入口 (NODE_CLASS_MAPPINGS / WEB_DIRECTORY)
├── comfyui_plugin/         # ComfyUI 原生插件模块
│   ├── nodes.py            # 姿势 / 服装 / 人像 / 三合一角色配方 4 个 ComfyUI 节点实现
│   ├── routes.py           # ComfyUI PromptServer 本地目录与图片静态服务路由
│   └── web/                # ComfyUI 画布节点缩略图预览与 4,785 张可视化弹窗选图器 (extension.js / style.css)
├── src/
│   ├── components/         # 通用组件、AppLayout 响应式导航、GalleryLightbox 灯箱、RecipeDock
│   ├── routes/             # 页面路由：概览(index)、姿势(poses)、服装(costumes)、人像(portraits)、合成台(studio)、配置(settings)、指南(guide)
│   ├── services/           # 5 大 AI 图像协议客户端 (aiGenerator.ts) 与 Canvas 拼图合成 (canvasComposer.ts)
│   ├── store/              # 全局配方、生图状态与 IndexedDB 历史管理 (studioStore.tsx)
│   ├── lib/                # 数据加载器 (dataLoader.ts) 与 IndexedDB 工具 (idbStorage.ts)
│   └── types/              # 三库数据结构与 5 大 AI 协议类型定义 (gallery.ts)
├── functions/api/proxy.ts  # Cloudflare Pages Functions / Workers 同源 CORS 代理 (/api/proxy)
├── worker.ts               # Cloudflare Workers 入口（静态资源 ASSETS + /api/proxy 路由）
├── wrangler.jsonc          # Cloudflare Workers 配置文件
├── data/
│   ├── pose.json / pose-zh.json                 # 姿势库原始数据 & 中文数据（1,439 条）
│   ├── costume.json / costume-zh.json           # 服装库原始数据 & 中文数据（1,407 条）
│   ├── portrait.json / portrait-zh.json         # 人像库原始数据 & 中文数据（1,499 条）
│   ├── meta-zh.json / *-meta-zh.json            # 三库中文体系分类元数据与热门榜单
│   └── translations.csv                         # 日⇄中翻译对照表
├── thumbs/                 # 缩略图目录（姿势根目录 + depth/ + costume/ + portrait/）
├── img/                    # 高清原图目录（姿势根目录 + depth/ + costume/ + portrait/）
├── scripts/
│   ├── download.py         # 四站并发下载器（支持 DATASET=all|pose|depth|costume|portrait）
│   ├── i18n.py             # 日译中词典与人像发型/服装标签映射
│   ├── apply_translation.py# 生成三库 *-zh.json 纯中文数据与检索索引
│   ├── verify.py           # 校验本地图片完整性（存在性 / 大小 / 文件头）
│   └── build.sh            # 构建 Cloudflare 发布目录 dist/
├── skills/                 # Claude Code / Agent 姿势・服装・人像检索技能包
└── README.md
```

---

## Phát triển & build local

Cần **Node.js 20+** và **pnpm**:

```bash
# 1. 安装依赖
pnpm install

# 2. 启动本地开发服务器（默认 http://localhost:5173）
pnpm dev

# 3. 类型检查 + 生产构建 + 代码规范检查
pnpm build && pnpm lint
```

### Script bảo trì dữ liệu & ảnh (Python 3)

```bash
# 拉取/补全三站图片（已存在的文件自动跳过，支持断点续传）
python3 scripts/download.py
WORKERS=64 python3 scripts/download.py   # 调整并发线程数

# 修改 scripts/i18n.py 词典后，重新生成三库中文 JSON
python3 scripts/apply_translation.py

# 校验全部图片文件是否完整
python3 scripts/verify.py
```

---

## Triển khai lên Cloudflare (Workers / Pages)

Dự án này có sẵn [wrangler.jsonc](wrangler.jsonc) và [worker.ts](worker.ts), đồng thời hỗ trợ **Cloudflare Workers (gồm Assets tĩnh + proxy cùng nguồn `/api/proxy`)** và **Cloudflare Pages**. Tổng dung lượng kho khoảng `1.1 GB`, tổng số file khoảng `11,600`, mỗi file đều `< 2 MB`, hoàn toàn phù hợp giới hạn bản miễn phí Cloudflare (mỗi file ≤ 25 MiB, số file ≤ 20.000).

> 💡 **Whitelist domain proxy tùy chỉnh (tùy chọn)**: `/api/proxy` mặc định cho phép 5 domain API AI chính thức, và tự bật khi chuyển sang Alibaba Cloud Bailian (Qwen) hoặc Volcengine Ark (Doubao). Nếu cần chuyển tiếp trạm trung chuyển tùy chỉnh qua proxy phía server, có thể cấu hình whitelist nguồn phân tách bằng dấu phẩy trong biến môi trường Cloudflare hoặc `vars.PROXY_ALLOWED_ORIGINS` của `wrangler.jsonc` (hỗ trợ domain chính xác và domain con dùng ký tự đại diện, vd `https://api.example.com,https://*.openai.com`).

### Cách 1: Triển khai tự động/bằng dòng lệnh Cloudflare Workers (khuyên dùng, tích hợp sẵn `/api/proxy` để giải quyết CORS của Qwen/Doubao)

```bash
# 1. 构建前端与静态资源目录 dist/
bash scripts/build.sh

# 2. 本地或预览环境验证
npx wrangler versions upload

# 3. 正式部署到 Cloudflare Workers
npx wrangler deploy
```

Nếu dùng Cloudflare Dashboard kết nối GitHub để tự build Workers:
- **Build command**: `bash scripts/build.sh`
- **Deploy command**: `npx wrangler deploy`

### Cách 2: Triển khai Cloudflare Pages

1. Đăng nhập Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Chọn kho này → nhánh production `main`
3. Cài đặt build:

   | Trường | Giá trị |
   | --- | --- |
   | Framework preset | `None` (hoặc `Vite`) |
   | Build command | `bash scripts/build.sh` |
   | Build output directory | `dist` |

---

## Kỹ năng Agent (Skills)

`skills/` cung cấp 9 kỹ năng Agent định dạng `SKILL.md` để AI Agent tra cứu tham chiếu tư thế, trang phục, chân dung. `references/catalog.csv` của kỹ năng gốc dùng **đường dẫn tương đối** (`../../img/…`) trỏ tới `img/` của kho này; kỹ năng 2D dùng URL trang gốc, không lưu trùng ảnh:

| Kỹ năng | Số ảnh | Phạm vi |
| --- | ---: | --- |
| `pose-reference-standard` | 365 | Toàn thân đơn · hệ chuẩn |
| `pose-reference-upper` | 400 | Nửa thân trên đơn |
| `pose-reference-sexy` | 399 | Toàn thân đơn · hệ gợi cảm (18+) |
| `pose-reference-couple` | 275 | Đôi quấn quýt (18+) |
| `pose-reference-all` | 1,439 | Tất cả tư thế |
| `costume-reference` | 1,068 | Trang phục: xuân hạ thu đông · lễ phục tiệc · đồ bơi nghỉ dưỡng (tra cứu theo từng món / màu sắc / từ khóa tiếng Anh) |
| `costume-reference-anime` | 440 | Trang phục 2D CharaDB, ảnh tham chiếu cần mạng, giới hạn nguồn độc lập |
| `costume-reference-sexy` | 339 | Trang phục: đồ lót & đồ ngủ · phối đồ gợi cảm (18+) |
| `portrait-reference` | 1,499 | Chân dung: tham chiếu chính diện · tạo hình & không khí, tra cứu theo độ dài tóc / 51 kiểu tóc |

```bash
git clone --depth 1 https://github.com/anhao/ai-pose-gallery-zh.git ~/ai-pose-gallery-zh
mkdir -p ~/.claude/skills
for d in ~/ai-pose-gallery-zh/skills/*-reference*; do ln -s "$d" ~/.claude/skills/; done
```

Kỹ năng gốc đọc `img/` bằng đường dẫn tương đối, hãy **tạo symlink** thay vì sao chép, và giữ nguyên cả kho. `costume-reference-anime` dùng URL trang gốc, không lưu ảnh, và áp dụng giới hạn nguồn độc lập. Khi kết hợp tham chiếu phải tuân thủ riêng điều kiện của từng nguồn.

---

## Trang phục 2D (CharaDB)

Bổ sung **440 bộ** trang phục 2D bản công khai của **たき AI ([@taki_auto](https://x.com/taki_auto))** [CharaDB](https://charadb-2fi.pages.dev/): trang trang phục và bộ chọn ảnh ComfyUI đều hỗ trợ lọc theo phân loại cấp 1 **`[ Tất cả | Thực tế | 2D ]`**, 15 phân loại cấp 2 và nhãn màu từng món, hỗ trợ tra cứu bằng tên tiếng Trung, nhãn Danbooru tiếng Anh và mã số.

- **Tải ảnh gốc online**: Theo [LICENSE gốc](https://github.com/taki-ttt/charadb/blob/main/LICENSE) (nhãn là CC0, ảnh chỉ để tham khảo và cấm phân phối lại, cấm dùng cho người thật hoặc trẻ vị thành niên), kho này chỉ thu thập bản dịch tiếng Trung và metadata nhãn (`data/costume-anime-zh.json`), ảnh tải trực tiếp từ trang gốc online, không đóng gói phát hành cùng kho này.
- **Script cập nhật dữ liệu**:
  ```bash
  python3 scripts/import_charadb.py
  ```

## Tuyên bố miễn trừ trách nhiệm & bản quyền (Disclaimer)

1. **Tuyên bố sử dụng hợp pháp & học tập (nghiêm cấm vi phạm)**
   - Dự án này (gồm bàn làm việc frontend, plugin ComfyUI, mẫu workflow và kỹ năng Agent) **chỉ dùng cho học tập cá nhân, nghiên cứu cấu trúc cơ thể, tham khảo động tác vẽ và trao đổi kỹ thuật**.
   - **Nghiêm cấm dùng dự án này cho bất kỳ mục đích vi phạm pháp luật nào**, bao gồm nhưng không giới hạn ở tạo/làm/lan truyền vật phẩm khiêu dâm, nội dung bạo lực/khủng bố, thông tin giả mạo vi phạm pháp luật, hoặc dùng ảnh người thật khi chưa được họ cho phép rõ ràng để đổi mặt/tổng hợp deepfake (Deepfake) hay các hành vi xâm phạm quyền chân dung, quyền riêng tư và quyền danh dự của người khác.
   - Bàn làm việc này là công cụ thuần frontend/local, mọi yêu cầu tạo ảnh AI đều do API đám mây mà chính người dùng cấu hình hoặc môi trường ComfyUI trên máy người dùng thực hiện, nền tảng không thu thập, không lưu trữ bất kỳ ảnh nào người dùng tải lên hay kết quả đã tạo. **Người dùng chịu toàn bộ trách nhiệm pháp lý với tư liệu mình tải lên và nội dung mình tạo, tác giả và người đóng góp của kho này không chịu trách nhiệm với bất kỳ hành vi không đúng hoặc vi phạm nào của người dùng.**
2. **Tuyên bố nội dung nhạy cảm NSFW (18+)**
   - Thư viện chứa một phần tư thế mẫu 3D người lớn (toàn thân đơn · hệ gợi cảm, đôi quấn quýt) và trang phục gợi cảm/nội y, nhằm phục vụ họa sĩ minh họa và người sáng tạo luyện tập động tác cơ thể và ánh sáng-bóng.
   - Trang web và plugin mặc định bật **"Chế độ an toàn (SFW)"** để chặn các phân loại trên; **người chưa đủ 18 tuổi tuyệt đối không được tắt chế độ an toàn hoặc truy cập nội dung liên quan**.
3. **Tuyên bố nguồn dữ liệu & quyền sở hữu bản quyền**
   - Bản quyền ảnh và dữ liệu gốc của tư thế gốc (`ai-pose-gallery.pages.dev`), trang phục (`ai-costume-gallery.pages.dev`), chân dung (`ai-portrait-gallery.pages.dev`, giao thức CC0 1.0) trong kho này thuộc về tác giả gốc **ギア (@giaaibusi)**.
   - Kho này chỉ là bản lưu trữ bản địa hóa tiếng Trung và thực hành kỹ thuật frontend, không khẳng định bất kỳ quyền nào với ảnh gốc, **nghiêm cấm bất kỳ ai trích xuất ảnh trong kho này để bán thương mại hoặc phân phối có phí**. Nếu tác giả gốc có ý kiến gì về bản mirror lưu trữ này, hãy liên hệ người duy trì để xử lý ngay.
4. **Giấy phép mã nguồn mở**
   - Code ứng dụng frontend (`src/`), plugin ComfyUI (`comfyui_plugin/`) và script xử lý dữ liệu (`scripts/`) được phát hành theo [giấy phép MIT](LICENSE); giấy phép này **không áp dụng** cho ảnh và dữ liệu gốc trong `img/`, `thumbs/` và `data/`.
