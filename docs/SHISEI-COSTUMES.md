# Trang phục các triều đại Trung Quốc Shisei

## Trang phục các triều đại Trung Quốc Shisei

- Nguồn: [wquguru/shisei](https://github.com/wquguru/shisei), bản sửa cố định `8f61ceab10e45f8d3afd254900903733a0ba76ee`.
- Chỉ import loại HC trong `data/costumes.json`: 60 ứng viên, C007, C014, C015 không có ảnh, cuối cùng 57 bộ, 227 góc nhìn hợp lệ. Không import tư thế Shisei.
- Phân loại cấp 1 là thực tế, loại là trang phục các triều đại Trung Quốc, ID dạng `shisei-C001` v.v. Một bộ 1 thẻ, trang chi tiết hỗ trợ góc chính diện, chéo bên, bên hông, sau lưng trong các góc thực sự có.
- Ghi nhãn **Shisei / wquguru · Tham chiếu trang phục do AI tạo · CC0**. Những tư liệu này là tham chiếu sáng tạo, không phải phục dựng trang phục lịch sử chuyên nghiệp.
- Ảnh của dự án gốc và dữ liệu riêng của nó theo CC0 1.0. Văn bản gốc của phiên bản cố định [LICENSE-images](../data/shisei/LICENSE-images) và [NOTICE](../data/shisei/NOTICE) giữ cùng tư liệu. Bản thân CC0 không yêu cầu ghi nguồn, dự án này vẫn hiển thị nguồn.
- Thu thập WebP gốc w300/w900, mỗi loại 227 ảnh, tổng 454 file, 6.054.726 byte (khoảng 5,77 MiB), không mã hóa lại. Địa chỉ nguồn cố định, kích thước và SHA-256 của mỗi file ghi trong `data/shisei/images-manifest.json`.

## Cập nhật & tái tạo

Chạy `python scripts/import_shisei_costumes.py`, tái tạo danh mục tiếng Trung và danh sách từ ảnh chụp nhanh cố định, không truy cập mạng. Khi thiếu ảnh có thể thêm `--download-shisei`; khi miền raw không tới được có thể thêm `--github-cli /path/to/gh`, lấy cùng file của bản sửa cố định qua CLI đã đăng nhập, không đọc hay xuất token.

Tổng số trang phục là 1.904: thực tế gốc 1.407, CharaDB 440, các triều đại Trung Quốc 57; ID cũ giữ nguyên. Bản lưu công thức giữ selectedView và trường ảnh cũ tương thích, công thức cũ vẫn đọc được. Node trang phục và node công thức nhân vật của ComfyUI thêm costume_view tùy chọn, mặc định front; góc nhìn không phải mặc định mà không tồn tại sẽ báo lỗi rõ ràng. Trước khi cập nhật ảnh chụp nhanh phải kiểm tra bản sửa cố định, giấy phép và số lượng danh mục, rồi cập nhật hash cố định của script.
