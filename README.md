# NGUYỆT ĐĂNG – bản sạch hoàn chỉnh

Đây là bản dựng lại từ đầu, không kế thừa chuỗi CSS/JS vá chồng của các bản cũ.

## 1. Chạy thử nhanh

### Cách A – chỉ xem giao diện
Mở trực tiếp:

`public/index.html`

Ở chế độ này, nếu không có backend thì ước nguyện tự fallback sang `localStorage` của trình duyệt.

### Cách B – khuyên dùng để test đầy đủ và lưu file thật
Máy cần có Node.js. Chạy:

```bash
node server.mjs
```

Hoặc trên Windows double-click `START_LOCAL.bat`.

Sau đó mở:

`http://localhost:8787`

Khi chạy theo cách này, mỗi ước nguyện được ghi thật xuống thư mục `uoc-nguyen/`:

- `uoc-nguyen/wishes.json`
- `uoc-nguyen/uoc-nguyen.csv` – mở trực tiếp bằng Excel
- `uoc-nguyen/uoc-nguyen.txt`

## 2. Deploy Cloudflare – giao diện trước, chưa bật kho chung

File `wrangler.jsonc` mặc định deploy được ngay mà không cần D1:

```bash
npx wrangler deploy
```

Website vẫn hoạt động. Phần ước nguyện sẽ fallback sang trình duyệt của từng người nếu D1 chưa được cấu hình.

## 3. Bật kho ước nguyện chung trên Cloudflare D1

Tạo database:

```bash
npx wrangler d1 create trung-thu-wishes
```

Cloudflare sẽ trả về `database_id`.

Copy file:

`wrangler.d1.example.jsonc` → `wrangler.jsonc`

Sau đó thay:

`PASTE_DATABASE_ID_HERE`

bằng `database_id` vừa nhận.

Tạo bảng:

```bash
npx wrangler d1 execute trung-thu-wishes --remote --file=./schema.sql
```

Deploy:

```bash
npx wrangler deploy
```

Khi đó:

- tất cả người truy cập dùng chung một kho ước nguyện;
- nút **Xem ước nguyện** đọc được lời ước của mọi người;
- nút **Tải CSV** xuất toàn bộ danh sách để mở bằng Excel.

## 4. Các phần chính

- `public/` – website HTML/CSS/JS và toàn bộ ảnh/nhạc;
- `src/worker.js` – API Cloudflare Worker;
- `schema.sql` – bảng D1;
- `server.mjs` – server local có ghi file thật;
- `uoc-nguyen/` – file ước nguyện khi chạy local;
- `QA_CHECKLIST.md` – checklist rà soát cuối.

## 5. Tính năng trong bản này

- mở đầu Đêm Trung Thu → thả đèn → bay lên Cung Trăng;
- phân rõ phần trời và dòng sông hoa đăng;
- Cung Trăng, Chị Hằng, Chú Cuội, Thỏ Ngọc dùng asset riêng;
- Chú Cuội đứng trên cầu;
- Chị Hằng và Thỏ Ngọc chuyển động quanh Cung Trăng;
- lồng đèn thật xuất hiện từ dưới màn hình, bay dần lên trời, vị trí ngang random;
- hover: dừng chiếc đèn hiện tại và phóng to, không nhấp nháy;
- bấm đèn để nhận quẻ;
- 8 chủ đề quẻ: An, Duyên, Trí, Lộc, Phúc, Viên, Nguyện, Tâm;
- nội dung quẻ ghép động nên có nhiều tổ hợp;
- ảnh quẻ random từ bộ ảnh Trung Thu đã cung cấp;
- không có nút “Nhận quẻ khác”;
- gửi và xem ước nguyện;
- xuất CSV;
- nhạc nền Trung Thu;
- responsive desktop/mobile.

## 6. Cập nhật tên người gửi / tên thiết bị

Bản này lưu thêm trường `sender_name` cùng nội dung ước nguyện. Ví dụ:

- Tên / thiết bị: `Namdhh`
- Ước nguyện: `Mong gia đình luôn bình an...`

Dữ liệu CSV/TXT sẽ có dạng tương ứng để dễ đọc bằng Excel hoặc Notepad.

### Nếu D1 đã tạo bảng `wishes` từ bản cũ

Chạy một lần trong D1 Console:

```sql
ALTER TABLE wishes ADD COLUMN sender_name TEXT NOT NULL DEFAULT 'Ẩn danh';
```

Hoặc chạy ở Terminal:

```bash
npx wrangler d1 execute trung-thu-wishes --remote --file=./migration-add-sender-name.sql
```

Worker mới cũng có cơ chế kiểm tra và bổ sung cột này tự động khi API được gọi, nhưng chạy migration thủ công trước khi deploy là cách dễ kiểm tra nhất.

Sau đó deploy lại:

```bash
npx wrangler deploy
```

Kiểm tra:

```sql
SELECT id, sender_name, message, created_at
FROM wishes
ORDER BY id DESC;
```
