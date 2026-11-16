# Nguồn & cập nhật tư liệu trang phục

ID trang phục thực tế hiện có và 440 ID của CharaDB giữ nguyên.

## Trang phục anime ギア

- Trang gốc: [衣装集 アニメ版](https://ai-costume-anime-gallery.pages.dev/), tác giả ギア (@giaaibusi).
- Thu thập 1.320 mục metadata, ID dạng `gia-anime-<ID gốc>`; phân loại cấp 1 là 2D, 8 phân loại tiếng Trung, tên, nhãn dùng lại mục thực tế tương ứng.
- Ảnh chụp nhanh đối chiếu cố định lấy từ [hongye007/open-pose-costume](https://github.com/hongye007/open-pose-costume/blob/f08f2e48675caeec85f091dde308cd906582b50f/data/source/costume-anime.json), bản sửa `f08f2e48675caeec85f091dde308cd906582b50f`.
- Dự án chỉ lưu ảnh chụp nhanh metadata và SHA-256 của nó; ảnh thu nhỏ, ảnh xem trước, ảnh gốc PNG request trực tiếp từ trang gốc, không tải hàng loạt, không mirror. Điều kiện dùng ảnh theo hướng dẫn của tác giả gốc, không được hiểu giấy phép code của dự án này là giấy phép phân phối lại ảnh.
- Khi trang gốc không dùng được sẽ ảnh hưởng tải ảnh. Ảnh chụp nhanh lịch sử dùng để ổn định danh mục và truy vết, không phải bản sao lưu ảnh.

## Tái tạo & kiểm chứng

Chạy `python scripts/import_gia_anime.py`, tái tạo danh mục và bản ghi nguồn từ ảnh chụp nhanh cố định, không tải ảnh. Trước khi cập nhật ảnh chụp nhanh, kiểm tra trước hướng dẫn của tác giả gốc và bản sửa upstream, rồi cập nhật hash cố định và kiểm tra số lượng.

Tổng số trang phục là 3.167: thực tế gốc 1.407, CharaDB 440, ギア anime 1.320. ComfyUI chỉ cho phép địa chỉ ảnh gốc khớp chính xác với danh mục, giữ JPEG của CharaDB và hỗ trợ PNG/WebP của ギア; giới hạn 10 MiB, 20 triệu pixel, timeout 20 giây, từ chối chuyển hướng từ upstream và URL tùy ý. ID nguồn ngoài không xác định sẽ báo lỗi rõ ràng.
