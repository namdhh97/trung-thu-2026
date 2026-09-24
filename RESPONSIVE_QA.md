# RESPONSIVE QA – FINAL v15

Các kích thước mục tiêu đã được thiết kế trong CSS:

- 1920×1080 – Desktop
- 1440×900 – Desktop/Laptop lớn
- 1366×768 – Laptop
- 1024×768 – Tablet ngang
- 768×1024 – Tablet dọc
- 430×932 – Smartphone lớn
- 390×844 – Smartphone phổ biến
- 360×640 – Smartphone nhỏ
- 844×390 – Smartphone xoay ngang

## Checklist

- [x] Không dùng `min-height: 620px` bắt buộc trên mobile.
- [x] Sử dụng `100dvh / 100svh` cho chiều cao viewport động.
- [x] Hỗ trợ `env(safe-area-inset-*)`.
- [x] Header tự thu gọn theo viewport.
- [x] Cung Trăng và nhân vật scale theo cả width và height.
- [x] Cụm 4 nút chuyển 2×2 trên tablet/mobile.
- [x] Guide bubble và character bubble có vị trí riêng theo breakpoint.
- [x] Quẻ khách tự co và scroll khi thiếu chiều cao.
- [x] Quẻ nhân viên: 2 cột trên desktop, xếp dọc trên tablet/mobile, trở lại 2 cột ở landscape thấp để tận dụng chiều ngang.
- [x] Ảnh quẻ nhân viên luôn `object-fit: contain`.
- [x] Lucky Voucher modal responsive và scroll được.
- [x] Wish modal / Wishes modal responsive và input >= 16px để tránh iOS zoom.
- [x] Site credit ẩn trên mobile nhỏ để không che controls.
- [x] Touch UI không phụ thuộc hover.
- [x] CSS parse: 0 lỗi cú pháp.
- [x] JavaScript `node --check`: đạt.

Khi deploy thật, nên kiểm tra thêm trên Chrome Android và Safari iPhone vì thanh địa chỉ động của trình duyệt có thể thay đổi chiều cao viewport khi cuộn.
