# VI-SYNC-MAP — ai-pose-gallery-zh, nhánh vi-ui

- Fork: `o0nebullet/ai-pose-gallery-zh`; upstream: `anhao/ai-pose-gallery-zh`
- Commit gốc: `488939139c69acfe078372b39d4bd0c457dc060e` (fork head, 2026-11-16)
- Phạm vi dịch (theo mẫu apkstart): giao diện + thông báo + README. Dịch hẳn sang tiếng Việt, không nút đổi ngôn ngữ. Không đổi logic, không đổi tên biến/hàm, không đổi tên field JSON.
- "Số dòng Trung đã dịch" = số dòng chứa CJK ở commit gốc trừ số dòng chứa CJK còn lại (đếm bằng regex `[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\U00020000-\U0002A6DF]`).
- Tổng phạm vi: 1.406 dòng Trung trong 48 file → còn 433 dòng → **đã dịch 973 dòng**, 46 file đổi (1 file không đổi: `src/lib/randomRecipe.ts`; 1 file giữ nguyên: `src/workflows/qwen_image_edit_2509_3img.api.json`, xem mục Vùng được bảo vệ).
- Thuật ngữ thống nhất: 姿势=tư thế, 服装=trang phục, 肖像/人像=chân dung, 角色=nhân vật, 参考=tham chiếu, 工作台=bàn làm việc, 合成台=bàn tổng hợp, 图库=thư viện, 设置=cài đặt, 配置=cấu hình, 生成=tạo, 随机=ngẫu nhiên, 上传=tải lên, 下载=tải xuống, 删除=xóa. Giữ nguyên: prompt, workflow, node, model, API Key, Base URL, ComfyUI, Qwen, Doubao, Gemini, GPT, CharaDB, Shisei, GitHub, CC0. Tên provider: Alibaba Cloud Bailian Qwen, Volcengine Ark Doubao.

## File đã dịch

| File | Commit gốc | Số dòng Trung đã dịch | Ghi chú |
|---|---|---|---|
| README.md | 4889391 | 125 (162→37) | Còn 37 dòng: code block (cây thư mục, comment trong bash), giữ theo quy tắc. Tiêu đề "中文版" → "Bản tiếng Việt (3-trong-1)", nội dung ghi rõ dữ liệu vẫn tiếng Trung |
| index.html | 4889391 | 9 (9→0) | Hết tiếng Trung; `lang`/`hreflang`/`og:locale`/`inLanguage` zh-CN → vi |
| docs/comfyui-local.md | 4889391 | 29 (29→0) | Hết tiếng Trung |
| docs/comfyui-workflow-parameters.md | 4889391 | 16 (22→6) | Còn 6 dòng: JSON ví dụ trong code block |
| docs/comfyui-task-tracking.md | 4889391 | 18 (18→0) | Hết tiếng Trung |
| docs/GIA-ANIME-COSTUMES.md | 4889391 | 10 (11→1) | Còn 1 dòng: tên trang gốc + tên tác giả ギア |
| docs/SHISEI-COSTUMES.md | 4889391 | 11 (11→0) | Hết tiếng Trung |
| src/routes/studio.tsx | 4889391 | 163 (186→23) | Còn 23 dòng: giá trị state `missingReferences` ('人像'/'服装'/'姿势') + field dữ liệu + nhãn so sánh |
| src/routes/costumes.tsx | 4889391 | 36 (66→30) | Còn 30 dòng: sentinel lọc '全部'/'现实'/'二次元' + tên nguồn + field dữ liệu |
| src/routes/poses.tsx | 4889391 | 37 (60→23) | Còn 23 dòng: giá trị lọc theo dữ liệu + field dữ liệu; '组'/'张' đã dịch (nhóm/ảnh/bộ) |
| src/routes/portraits.tsx | 4889391 | 24 (51→27) | Còn 27 dòng: `HAIRS` ('短发'...) + section ('正脸参考'/'造型氛围') là giá trị lọc theo dữ liệu |
| src/routes/index.tsx | 4889391 | 27 (36→9) | Còn 9 dòng: tên field/giá trị dữ liệu render ra |
| src/routes/settings.tsx | 4889391 | 33 (33→0) | Hết tiếng Trung; lệnh/URL giữ nguyên |
| src/routes/guide.tsx | 4889391 | 32 (32→0) | Hết tiếng Trung; tên hệ trong văn xuôi diễn giải bằng tiếng Việt, không dùng tên danh mục dữ liệu |
| src/components/layout/nav.ts | 4889391 | 10 (10→0) | Hết tiếng Trung; badge PRO + số lượng giữ nguyên |
| src/components/layout/RecipeDock.tsx | 4889391 | 16 (24→8) | Còn 8 dòng: key field JSON |
| src/components/layout/AppHeader.tsx | 4889391 | 5 (5→0) | Hết tiếng Trung |
| src/components/layout/AppSidebar.tsx | 4889391 | 5 (5→0) | Hết tiếng Trung |
| src/components/common/ReferenceComparisonDialog.tsx | 4889391 | 21 (21→0) | Hết tiếng Trung; state `mode` là 'side'/'slider' (tiếng Anh sẵn) |
| src/components/common/ZoomViewport.tsx | 4889391 | 9 (9→0) | Hết tiếng Trung |
| src/components/common/ImageViewer.tsx | 4889391 | 3 (3→0) | Hết tiếng Trung |
| src/components/common/FormSection.tsx | 4889391 | 2 (2→0) | Hết tiếng Trung |
| src/components/common/StatCard.tsx | 4889391 | 1 (1→0) | Hết tiếng Trung |
| src/components/studio/WorkflowParameters.tsx | 4889391 | 20 (20→0) | Hết tiếng Trung; thông báo lỗi đọc ảnh đã dịch |
| src/components/studio/ComfyConnectionStatus.tsx | 4889391 | 2 (2→0) | Hết tiếng Trung |
| src/components/theme/ThemeToggle.tsx | 4889391 | 4 (4→0) | Hết tiếng Trung |
| src/components/theme/ThemeProvider.tsx | 4889391 | 1 (1→0) | Hết tiếng Trung |
| src/components/ui/sonner.tsx | 4889391 | 3 (3→0) | Hết tiếng Trung |
| src/index.css | 4889391 | 3 (3→0) | Chỉ comment; tên font (PingFang SC, Microsoft YaHei...) giữ nguyên |
| src/services/aiGenerator.ts | 4889391 | 118 (222→104) | Còn 104 dòng: prompt mẫu gửi model + regex node + tên node workflow + giá trị gửi ComfyUI (xem dưới) |
| src/store/studioStore.tsx | 4889391 | 32 (48→16) | Còn 16 dòng: so sánh dữ liệu ('标准基础款', '二次元', tên danh mục NSFW trong age-gate) + comment code |
| src/store/useComfyConnection.ts | 4889391 | 7 (9→2) | Còn 2 dòng: tên field/trạng thái |
| src/api/gallery.ts | 4889391 | 3 (20→17) | Còn 17 dòng: tên field JSON + `NSFW_COSTUME_CATEGORIES.has(item.分类)` |
| src/types/gallery.ts | 4889391 | 2 (39→37) | Chỉ dịch comment giải thích; tên field JSON + literal type '现实' \| '二次元' giữ nguyên |
| src/lib/comfyWorkflowParameters.ts | 4889391 | 3 (3→0) | Hết tiếng Trung; nhãn '角色设定集' → dịch (chỉ hiển thị) |
| src/lib/comparisonReferences.ts | 4889391 | 2 (6→4) | Còn 4 dòng: so sánh class_type/node |
| src/lib/persistentImages.ts | 4889391 | 3 (6→3) | Còn 3 dòng: tên field + kiểm tra kiểu file |
| src/lib/randomRecipe.ts | 4889391 | 0 (3→3) | Không đổi: toàn tên field + literal '现实' |
| src/lib/recipeImages.ts | 4889391 | 0 (7→7) | Giá trị nhóm ảnh upload '上传' → 'Tải lên' (nhãn tự tạo, không code nào so sánh chéo — đã grep kiểm chứng); còn 7 dòng là tên field JSON |
| src/lib/costumeSources.ts | 4889391 | 4 (5→1) | Còn 1 dòng: tên riêng ギア/たき; label/notice đã dịch ('中国历代' → 'Trung Quốc các triều đại') |
| src/lib/idbStorage.ts | 4889391 | 1 (2→1) | Còn 1 dòng: tên key |
| comfyui_plugin/nodes.py | 4889391 | 49 (75→26) | Còn 26 dòng: prompt tiếng Trung + key field JSON (xem dưới). Key `STYLE_PRESETS`/`RESIZE_MODES` đã dịch nhất quán trong file (key + default + so sánh) |
| comfyui_plugin/web/extension.js | 4889391 | 39 (61→22) | Còn 22 dòng: key field JSON + giá trị lọc NSFW |
| comfyui_plugin/routes.py | 4889391 | 16 (20→4) | Còn 4 dòng: key field JSON |
| comfyui_plugin/web/style.css | 4889391 | 2 (2→0) | Chỉ comment; tên font giữ nguyên |
| comfyui_plugin/__init__.py | 4889391 | 1 (1→0) | Hết tiếng Trung |
| functions/api/proxy.ts | 4889391 | 16 (16→0) | Hết tiếng Trung; status code/header giữ nguyên |

## Vùng được bảo vệ (phải giữ nguyên)

- **Tên field JSON** trong `src/types/gallery.ts` và khắp `src/` (体系, 分类, 姿势名称, 缩略图, 原图, 检索, 标题, 发型名称, 分区, 发长, 一级分类, 来源, 关键词, 标签...): đổi là hỏng đọc file `data/*-zh.json`.
- **Giá trị lọc/sentinel so với dữ liệu**: '全部', '现实', '二次元', '标准基础款', `HAIRS` ('短发','中发','中长发','长发'), section ('正脸参考','造型氛围'), `missingReferences` ('人像'/'服装'/'姿势'), tên danh mục NSFW trong age-gate (全身单人・性感系, 双人缠绵, 内衣・睡衣, 性感穿搭).
- **Prompt mẫu gửi model AI** trong `src/services/aiGenerator.ts` (`buildRecipePrompt`, 11 `prompt` trong `STYLE_PRESETS` — chỉ dịch `label`): dịch là đổi hành vi model. Ngoại lệ: chuỗi rỗng khi chưa chọn gì (`请先选择人像/服装/姿势...`) đã dịch sang tiếng Việt vì thực tế là thông báo cho người dùng (luồng tạo báo lỗi thiếu ảnh trước khi prompt tới model).
- **Regex nhận diện node ComfyUI** (`/人像|脸|人物|.../`, `/服装|衣|穿搭|.../`, `/姿势|动作|骨架|pose/i`, `/拼图|合成|stitch/i`, `/negative|反向|负面/`) và **giá trị gửi workflow** (`emptyValue '无'`, `inputs.image = '无'`).
- **`src/workflows/qwen_image_edit_2509_3img.api.json`** (22 dòng): không dịch — `_meta.title` của node được regex auto-detect khớp theo tên tiếng Trung, dịch là hỏng nhận diện vai trò node.
- **Nội dung prompt tiếng Trung trong `comfyui_plugin/nodes.py`** (`STYLE_PRESETS` zh, template `_build_pose/costume/portrait_prompts`, `zh_parts` trong `build_recipe`): data nguồn vẫn tiếng Trung nên prompt ghép ra buộc phải tiếng Trung mới nhất quán.
- **Code block trong README/docs**: cây thư mục, comment trong lệnh bash, JSON ví dụ.
- **Tên font** (PingFang SC, Microsoft YaHei, Hiragino Sans GB, Noto Sans SC), tên riêng (ギア, たき, Shisei, CharaDB, @giaaibusi, wquguru), tên file LoRA, tên node workflow.

## Kiểm chứng

- Repo **không có test** (không có test script trong `package.json`, không có file `*.test.*`/`*.spec.*`): không có baseline test để so. Baseline build cây sạch: `npm run build` (tsc + vite build) chạy được, 3,7s.
- Sau dịch: `npm run build` chạy được (3,1s); `npm run lint` (oxlint) 0 warning, 0 error; `py_compile` cho 3 file Python trong `comfyui_plugin/` đều qua; `node --check` cho `extension.js` qua; workflow JSON parse được.
- Sửa trong lúc kiểm chứng: `comfyui_plugin/nodes.py` bị mất thụt lề 273 dòng do quá trình dịch (lỗi `IndentationError`) — đã khôi phục thụt lề theo từng dòng từ bản gốc, kiểm chứng lại bằng `py_compile` + so cấu trúc AST với bản gốc (88 định nghĩa, giống hệt), diff còn 51 dòng nội dung.
- Thống nhất thuật ngữ lúc kiểm chứng: tên provider Doubao dùng "Volcengine Ark" ở mọi chỗ (aiGenerator.ts, settings.tsx, README).

## Chưa dịch (đợt sau)

- `data/`: ~105.688 dòng — tên tư thế/trang phục/chân dung (dữ liệu gốc tiếng Nhật, bản `-zh.json` là bản dịch Trung). UI đang load file `-zh.json` nên tên hiển thị trong thư viện vẫn tiếng Trung sau đợt này. Dịch data là một đợt riêng (cần map Nhật→Trung→Việt + giữ `id`/`检索` khớp tìm kiếm).
- `skills/`: ~7.065 dòng — skill markdown + catalog CSV (nội dung tham chiếu cho agent, mirror theo `data/`).
- `scripts/`: ~623 dòng — script build/i18n (Nhật→Trung), không phải UI.
- `src/workflows/*.api.json`: 22 dòng (xem Vùng được bảo vệ).

## Chỗ mơ hồ

- 素体白模 → "mẫu trắng" (mô hình trắng dùng làm mẫu tư thế); 深度图 → "ảnh depth (Depth)".
- 设定集: theo ngữ cảnh — "character sheet" trong WorkflowParameters, "bộ thiết lập nhân vật" trong docs.
- 捏人 → "tạo nhân vật"; 复制词 → "Sao chép prompt"; 配方 → "công thức nhân vật".
- `guide.tsx`: tên hệ trong văn xuôi diễn giải bằng tiếng Việt ("hệ gợi cảm đơn toàn thân, đôi quấn quýt") thay vì dùng nguyên tên danh mục dữ liệu.
