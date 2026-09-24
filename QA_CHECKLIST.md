# Checklist đã rà soát

- [x] HTML có UTF-8 và không trùng ID.
- [x] CSS cân bằng toàn bộ dấu `{}`; không còn các lớp override cũ.
- [x] JavaScript `node --check` không lỗi cú pháp.
- [x] Worker và local server không lỗi cú pháp.
- [x] Toàn bộ asset được tham chiếu đều có trong source.
- [x] Cảnh Cung Trăng sinh đủ lồng đèn trên desktop và mobile.
- [x] Lồng đèn đi từ dưới lên trên, vị trí ngang ngẫu nhiên.
- [x] Hover dừng đúng chiếc đèn đang chọn và chỉ phóng to, không nhấp nháy.
- [x] Bấm đèn mở quẻ; nội dung quẻ tiếng Việt hiển thị đúng dấu.
- [x] Quẻ có ảnh random, ảnh dùng `object-fit: contain`.
- [x] Không còn nút “Nhận quẻ khác”.
- [x] Chú Cuội đứng trên cầu; Chị Hằng và Thỏ Ngọc chuyển động quanh Cung Trăng.
- [x] Dòng sông dùng ảnh hoa đăng thật, không có hoa đăng động thừa phía trên ảnh nền.
- [x] Nhạc nền dùng file Trung Thu đã cung cấp.
- [x] Chạy local bằng `server.mjs` ghi thật `uoc-nguyen/uoc-nguyen.csv`, `uoc-nguyen/uoc-nguyen.txt`, `uoc-nguyen/wishes.json`.
- [x] Có API Cloudflare D1 và tải CSV cho kho ước nguyện dùng chung.
- [x] Frontend fallback sang localStorage nếu API chưa được cấu hình.
- [x] Test tự động trình duyệt: 16 đèn desktop, hover pause, mở quẻ, gửi ước nguyện không có JavaScript error.
- [x] Test mobile 390×844: chuyển cảnh thành công, 10 đèn, asset chính tải được.

## Cập nhật sender + ảnh quẻ
- [x] Ảnh quẻ dùng object-fit: contain, không crop/over khung.
- [x] Có trường Tên người gửi / tên thiết bị, tối đa 60 ký tự.
- [x] Tên được nhớ lại trên trình duyệt cho lần gửi sau.
- [x] Local API lưu `sender_name` + `message`.
- [x] D1 Worker lưu `sender_name` + `message`.
- [x] CSV có cột `Tên / thiết bị`.
- [x] TXT local có định dạng `Tên | Ước nguyện`.
- [x] Dữ liệu cũ thiếu sender_name hiển thị là `Ẩn danh`.
