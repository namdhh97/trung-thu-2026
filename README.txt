NGUYỆT ĐĂNG - WEBSITE TRUNG THU INTERACTIVE
============================================

CÁCH CHẠY NHANH
1. Giải nén toàn bộ thư mục.
2. Mở file index.html bằng Chrome/Edge/Firefox.
3. Hoặc mở TRUNG_THU_DEMO_1_FILE.html. Lưu ý file này vẫn dùng ảnh trong thư mục assets nên không được tách riêng file HTML ra khỏi project.

TÍNH NĂNG
- Intro đêm Trung Thu + nút Thả đèn.
- Animation bay lên Cung Trăng.
- Cung Trăng, Chị Hằng, Chú Cuội, Thỏ Ngọc bằng asset ảnh.
- Đèn quẻ liên tục bay từ dưới lên trời, biến mất rồi sinh chu kỳ mới ở vị trí ngẫu nhiên.
- 8 chủ đề quẻ: AN, DUYÊN, TRÍ, LỘC, PHÚC, VIÊN, NGUYỆN, TÂM.
- Quẻ được sinh động theo tổ hợp câu thay vì danh sách quẻ cố định; có thể mở liên tục.
- Mỗi quẻ random 1 trong 13 ảnh Trung Thu do người dùng cung cấp; ảnh được phép lặp.
- Gửi ước nguyện, animation đèn bay lên trời.
- Ước nguyện được lưu bằng localStorage trên trình duyệt và có thông báo sau khi lưu.
- Nút Xem ước nguyện để đọc lại những lời ước đã lưu.
- Responsive desktop/mobile.

CẤU TRÚC
index.html                  Giao diện chính
css/style.css               Toàn bộ style/animation
js/main.js                  Logic đèn, quẻ, ảnh random, lưu ước nguyện
assets/moon-palace.png      Cung Trăng
assets/chi-hang.png         Chị Hằng
assets/chu-cuoi.png         Chú Cuội
assets/jade-rabbit.png      Thỏ Ngọc
assets/fortune/             13 ảnh hiển thị kèm quẻ

THÊM ẢNH QUẺ
- Copy ảnh mới vào assets/fortune/.
- Mở js/main.js và cập nhật FORTUNE_IMAGES.
- Hiện source đang tạo tự động fortune-01.png đến fortune-13.png.

THÊM / SỬA CHỦ ĐỀ QUẺ
- Mở js/main.js.
- Tìm const FORTUNE_THEMES.
- Mỗi theme gồm: name, symbol, poemA, poemB, opening, direction, ending, whispers.
- Nội dung mỗi quẻ được random ghép từ các phần này nên không cần khai báo từng quẻ riêng.

LƯU TRỮ ƯỚC NGUYỆN
- Bản này dùng localStorage: dữ liệu chỉ tồn tại trên đúng trình duyệt/máy đang truy cập.
- Nếu deploy thật và muốn mọi nhân viên cùng gửi/lưu tập trung, cần nối backend/database (ví dụ Supabase/Firebase/API riêng).
