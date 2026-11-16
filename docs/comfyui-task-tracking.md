# Kết nối & khôi phục task ComfyUI

Bàn làm việc gửi 1 lần tạo thành 1 ComfyUI prompt, và lưu mã task. Khi làm mới trang, kết nối mạng lại hoặc khôi phục tab, nó sẽ truy vấn task gốc; không gửi lại `/prompt`. Khi mất phản hồi gửi, backend có thể đã nhận task, cần kiểm tra hàng đợi thủ công trước, không được coi lỗi mạng là căn cứ để thử lại an toàn.

## Kết nối thời gian thực & dự phòng HTTP

- Trước khi gửi, khởi động WebSocket, dùng `clientId` giống `client_id` của `/prompt`. Kết nối thất bại không chặn việc gửi.
- Sau khi lấy `prompt_id` và lưu bản ghi khôi phục, truy vấn history ngay để bù các task nhanh đã kết thúc trước khi đăng ký, task toàn cache, v.v.
- Khi WebSocket bình thường, vòng đời và sự kiện sampling cập nhật tiến độ, history đối soát mỗi 30 giây. `status` chỉ kích hoạt truy vấn hàng đợi, tối đa mỗi 3 giây 1 lần, không coi tổng số hàng đợi dùng chung là trạng thái của task hiện tại.
- Khi WebSocket ngắt, HTTP truy vấn mỗi 3 giây; khi kết nối khôi phục, mạng trở lại và trang hiện lại thì đối soát ngay. HTTP lỗi tạm thời cũng thử lại sau 3 giây; HTTP 401/403 sẽ dừng theo dõi hiện tại và giữ bản ghi task, sửa lại credential là khôi phục được.
- Sự kiện hoàn thành, lỗi, ngắt và `executing` với node trống sẽ kích hoạt truy vấn history ngay. Sự kiện hoàn thành có thể tới trước khi history ghi xong, thử lại ngắn theo khoảng 500 ms trước, rồi tiếp tục truy vấn dự phòng.
- Sau khi history xác nhận có đầu ra thì tải ảnh; 1 sự kiện node `executed` riêng lẻ không có nghĩa là cả task đã thành công. Mọi lần đối soát HTTP chạy nối tiếp, tránh dồn request khi sự kiện dày.

Phần trăm tiến độ node chỉ đại diện cho node hiện tại. Một số node không có sự kiện sampling, lâu không có tin tiến độ không có nghĩa là task thất bại. Bộ đếm thời gian nền của trình duyệt có thể bị tiết chế, kích hoạt lại trang sẽ đối soát trạng thái ngay.

Chỉ nhận sự kiện thực thi khớp với `prompt_id` hiện tại. Khi ComfyUI kết nối lại có thể gửi tin node hiện tại không kèm `prompt_id`, loại tin này không dùng để xác nhận task thuộc về ai, phần thiếu do HTTP đối soát bù lại.

## Lưu & khôi phục trên trình duyệt

Task chưa xong và lịch sử tạo lưu trong IndexedDB của trình duyệt hiện tại; chỉ sau khi transaction gửi thành công mới cập nhật trạng thái đã lưu. Ảnh tham chiếu và kết quả tạo sẽ chuyển thành dạng lưu bền được, tránh URL Blob tạm thời hết hiệu lực sau khi làm mới. Ảnh chụp nhanh lúc tạo lưu công thức, tham số và workflow thực tế đã gửi, không sao chép API Key và endpoint trong cấu hình của nhà cung cấp.

Khi bộ nhớ không dùng được thì tạm dừng tạo, tránh ghi đè task chưa rõ. Hết thời gian chờ hoặc dừng đợi không có nghĩa là đã hủy thực thi ở backend; bấm "Dừng theo dõi (không hủy backend)" sẽ xóa bản ghi chưa xong hiện tại, task backend vẫn có thể tiếp tục, trước lần gửi sau nên kiểm tra hàng đợi. Khi service khởi động lại hoặc history bị xóa, có thể không tìm được task gốc, bàn làm việc sẽ không tự gửi lại.

## ComfyUI gốc & gateway tùy chọn

ComfyUI gốc dùng `/ws?clientId=...` để gửi sự kiện task. Dự án này không thêm giao thức xác thực từ xa cho backend ComfyUI.

Nếu trước địa chỉ truy cập có triển khai gateway xác thực tự duy trì, trình duyệt không thể đặt trực tiếp header Authorization cho WebSocket; quy ước tùy chọn là subprotocol `comfyui` và `comfyui-auth.<token>`, gateway xác minh credential và Origin rồi chỉ echo lại subprotocol cố định `comfyui`, và bóc credential trước khi chuyển tới backend. Đây là quy ước giữa gateway và trang web, không phải năng lực gốc của ComfyUI, cần tự cấu hình gateway hỗ trợ. Request HTTP tiếp tục dùng Bearer Authorization.

Không đưa token vào URL, ảnh chụp màn hình hay log. Gateway chưa cấu hình quy ước này thì kiểm tra trước cách xác thực thực tế của nó; test kết nối HTTP thành công cũng không thay thế việc xác minh bắt tay WebSocket.
