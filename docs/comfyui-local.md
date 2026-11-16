# Tổng hợp 3 ảnh bằng ComfyUI local (Qwen Image Edit 2509)

Chân dung (ảnh 1: mặt & danh tính) + trang phục (ảnh 2: kiểu dáng, chất liệu, màu sắc) + tư thế (ảnh 3: động tác & bố cục) → 1 ảnh nhân vật tổng hợp.

## Model cần có (kho ComfyUI chính thức Comfy-Org/Qwen-Image_ComfyUI)

| Mục đích | File | Thư mục | Kích thước |
| --- | --- | --- | --- |
| Mô hình khuếch tán | `qwen_image_edit_2509_fp8_e4m3fn.safetensors` | `models/diffusion_models` hoặc `models/unet` | 20.4 GB |
| Bộ mã hóa văn bản/hình ảnh | `qwen_2.5_vl_7b_fp8_scaled.safetensors` | `models/text_encoders` | 9.4 GB |
| VAE | `qwen_image_vae.safetensors` | `models/vae` | 254 MB |
| LoRA tăng tốc 4 bước (chuyên dùng cho 2509) | `Qwen-Image-Edit-2509-Lightning-4steps-V1.0-bf16.safetensors` | `models/loras` | 850 MB |

Không cần bất kỳ node tùy chỉnh nào, node tích hợp sẵn của ComfyUI 0.3.60 trở lên là đủ (đã test thực tế trên 0.43.0).

## Workflow

`src/workflows/qwen_image_edit_2509_3img.api.json` (định dạng API, có thể `POST /prompt` trực tiếp, cũng có thể "Export .json" ở bàn tổng hợp).

- `UNETLoader → LoraLoaderModelOnly(Lightning) → ModelSamplingAuraFlow(shift=3) → CFGNorm → KSampler(4 bước, cfg=1, euler/simple)`, khớp mẫu chính thức.
- Cả 3 ảnh đều đưa vào `TextEncodeQwenImageEditPlus` (hiểu bằng ngôn ngữ thị giác, chỉ định theo "ảnh 1/ảnh 2/ảnh 3").
- **Chỉ chân dung và trang phục** đi qua `ReferenceLatent` làm tham chiếu cấp pixel; ảnh tư thế chỉ dùng để hiểu ngữ nghĩa.
  Test thực tế: nếu đưa cả ảnh tư thế hình nộm phác thảo làm tham chiếu pixel, kết quả tạo sẽ sao y khớp cầu và đường nét chia khối của hình nộm.
- Kích thước đầu ra scale theo tỉ lệ ảnh tư thế tới khoảng 1 MP (`megapixels` của node 10).
- Khi cfg=1, prompt ngược không có hiệu lực, "không chữ/watermark" và các yêu cầu tương tự viết vào prompt thuận.

Preset Qwen-Image 2.1 cũ vẫn giữ, nhưng cần cài riêng model 2.1; bàn tổng hợp sẽ kiểm tra trước khi gửi và liệt kê file model còn thiếu.

## Chạy local

```bash
corepack pnpm install
corepack pnpm dev
```

Mở http://localhost:5173/studio, giao thức API chọn "ComfyUI local".
Khi chạy local, địa chỉ ComfyUI điền `/comfy` (mặc định): Vite proxy cùng nguồn `/comfy/*` tới `http://127.0.0.1:8000`,
nên không cần sửa `--enable-cors-header` của ComfyUI. Khi ComfyUI ở cổng khác:

```bash
COMFYUI_URL=http://127.0.0.1:8188 corepack pnpm dev
```

Khi kết nối trực tiếp (không qua proxy), tham số khởi động ComfyUI cần `--enable-cors-header "<nguồn của trang web>"`, tham số này chỉ điền được 1 nguồn.

## VRAM & tốc độ (test thực tế trên RTX 4070 SUPER 12 GB / RAM 32 GB)

- Lần tạo đầu khoảng 50 giây (gồm tải model), sau đó mỗi ảnh khoảng 25–30 giây.
- Model fp8 20 GB vượt quá 12 GB VRAM, ComfyUI sẽ tự offload một phần sang RAM, không cần cài đặt thêm.
- Card 8 GB: chỉnh `megapixels` của node 10 xuống 0.6, tắt các chương trình khác đang chiếm card; khi thiếu VRAM, bàn tổng hợp sẽ nhắc và gọi `/free` để giải phóng VRAM.

## Giới hạn đã biết

- Một số seed ngẫu nhiên sẽ tạo ra chữ "logo" vô nghĩa ở góc ảnh, đổi seed khác tạo lại là được.
- Khi tên trang phục và ảnh không khớp (vd tên ghi "denim" nhưng trong ảnh là màu hồng), lấy ảnh làm chuẩn, nhưng không đảm bảo lần nào cũng đúng.
