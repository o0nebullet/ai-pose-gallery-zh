# Tham số nâng cao workflow ComfyUI

Sau khi import workflow API và kết nối ComfyUI, khu vực nâng cao sẽ nhận diện các tham số boolean, số, chuỗi và enum có thể chỉnh sửa theo định nghĩa node thực tế. Đầu vào đã nối dây, đầu vào ẩn và đầu vào bắt buộc phải kết nối sẽ không sinh control chỉnh sửa.

Tham số chưa sửa dùng nguyên workflow gốc. Chỉnh sửa chỉ áp dụng cho bản sao lúc gửi và lúc export, không ghi đè lên bản import gốc; có thể khôi phục từng mục hoặc tất cả. Chuyển workflow sẽ không áp nhầm giá trị ghi đè theo số node cũ sang ảnh mới.

## Khai báo hiển thị tùy chọn

Metadata `studio` dưới đây là quy ước mở rộng của dự án này, không phải chuẩn ComfyUI. API thường không có khai báo vẫn nhận diện được tham số có thể chỉnh của nó.

```json
{
  "32": {
    "class_type": "PrimitiveInt",
    "inputs": { "value": 0 },
    "_meta": {
      "title": "输出模式",
      "studio": {
        "controls": [{
          "input": "value",
          "label": "输出类型",
          "description": "选择此工作流实现的输出形式。",
          "group": "输出",
          "options": [
            { "value": 0, "label": "单个人物" },
            { "value": 1, "label": "设定页" }
          ]
        }]
      }
    }
  }
}
```

`controls` liệt kê trường đã thực sự tồn tại thành tham số khuyên dùng, và có thể cung cấp tên, mô tả, nhóm và nhãn enum; nó không thể tạo trường không tồn tại, đổi loại kết nối hay vượt qua miền giá trị của định nghĩa node. Trường có thể chỉnh mà không có khai báo khuyên dùng sẽ vào mục gấp "Tham số khác". `hiddenInputs` có thể liệt kê tên trường không muốn hiển thị hoặc ghi đè, vd toán tử so sánh của routing nội bộ, biểu thức chính quy và cấu hình cố định.

Đường nối boolean tự tính toán sẽ không biến thành công tắc chỉnh tay. Workflow cần "tự động / bật / tắt" thì nên cung cấp hằng số chế độ thực sự, và triển khai nhánh tương ứng trong ảnh.

## Ảnh tham chiếu nâng cao

Node tải ảnh chưa gắn với 3 ô chính hoặc mapping ảnh ghép tham chiếu có thể tải ảnh thay thế trong khu vực nâng cao. Node ảnh thường khi chưa tải lên sẽ giữ ảnh gốc của workflow; node bộ thiết lập hỗ trợ giá trị rỗng khi chưa cung cấp sẽ được xóa rõ ràng.

Sau khi thêm `_meta.studio.imageRole: "character_sheet"` cho node tải bộ thiết lập đầy đủ, nó sẽ hiển thị thành cổng vào bộ thiết lập nhân vật, không tham gia mapping tự động của 3 ô chính. Ảnh tải lên dùng cách đọc theo cạnh dài nhất 1024, lưu trong IndexedDB; bản sao lưu công thức trong localStorage không chứa các ảnh này.

Bộ thiết lập làm đầu vào và trang thiết lập làm đầu ra là 2 mục đích khác nhau. Metadata chỉ mô tả cổng vào và control, khả năng tạo thực tế phải do node và kết nối trong API triển khai.

## Tổ hợp tham chiếu cho phép

Workflow có thể khai báo tập hợp node đầu vào được phép trong `_meta.studio.referenceCombinations` của 1 node, ví dụ:

```json
[["1", "2"], ["1", "3"], ["2", "3"], ["1", "2", "3"], ["31"]]
```

Trang web khớp chính xác tập hợp theo ảnh mà người dùng thực sự cung cấp; ảnh dư trong JSON không tính là người dùng đã cung cấp. Workflow cũ không khai báo trường này vẫn theo mapping gốc và kiểm tra bắt buộc.

"Export API hiện tại" gồm tham số nâng cao đã chọn và prompt hiện tại; ảnh tải lên diễn ra lúc gửi, export sẽ không đóng gói ảnh trong trình duyệt vào JSON. Cũng có thể export API gốc từ cửa sổ chỉnh JSON.

Một số công cụ chuyển canvas ComfyUI sang API chỉ giữ tiêu đề node, sẽ làm mất metadata `studio` tùy chỉnh. Muốn giữ control khuyên dùng và khai báo tổ hợp, hãy dùng file API có chứa khai báo đó.
