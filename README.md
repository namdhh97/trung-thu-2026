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
- 16 chủ đề quẻ: An, Duyên, Trí, Lộc, Phúc, Viên, Nguyện, Tâm;
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

## 6. Header thương hiệu Nha Khoa Sing

Bản này bổ sung header theo phương án thương hiệu + Trung Thu:

- Logo Nha Khoa Sing ở bên trái.
- Giữa: `NHA KHOA SING presents` và `NGUYỆT ĐĂNG · TRUNG THU 2026`.
- Slogan: `Đoàn viên · An lành · Gửi ước nguyện dưới trăng`.
- Nút nhạc nền nằm phía phải header.
- Header responsive: trên mobile tự rút gọn để không che nội dung chính.

Logo nằm tại:

`public/assets/brand/nha-khoa-sing.png`


## Cập nhật: Ước nguyện riêng theo thiết bị

Bản này không công khai toàn bộ kho ước nguyện. Mỗi trình duyệt được Worker cấp một cookie HttpOnly ngẫu nhiên; D1 chỉ lưu SHA-256 hash của mã đó.

- `POST /api/wishes`: gửi ước nguyện của thiết bị hiện tại.
- `GET /api/wishes/mine`: chỉ đọc ước nguyện của thiết bị hiện tại.
- `GET /api/wishes/mine.csv`: chỉ xuất CSV của thiết bị hiện tại.
- `GET /api/wishes/count`: chỉ trả tổng số lời ước, không trả nội dung.
- `GET /api/wishes` và `/api/wishes.csv`: bị khóa, trả HTTP 403.

Nếu D1 đã có bảng `wishes` từ bản trước, chạy **một lần** trong D1 Console:

```sql
ALTER TABLE wishes ADD COLUMN device_hash TEXT NOT NULL DEFAULT 'legacy';
CREATE INDEX IF NOT EXISTS idx_wishes_device_hash ON wishes(device_hash, id DESC);
```

Hoặc dùng file `migration-device-private.sql`. Dữ liệu cũ được đánh dấu `legacy` và không tự hiển thị cho bất kỳ thiết bị mới nào.

Sau đó deploy lại:

```bash
npx wrangler deploy
```

Lưu ý: nếu người dùng xóa cookie/site data, đổi trình duyệt hoặc đổi thiết bị thì hệ thống sẽ coi là một thiết bị mới.

## V14 – Quẻ May Mắn Voucher cho Khách

- Chỉ áp dụng khi chọn **Khách / Bên ngoài công ty**.
- Mỗi lần khách bốc quẻ, Worker quay ngẫu nhiên với xác suất **1%**.
- Nếu không trúng: hiển thị quẻ chữ như bình thường.
- Nếu trúng: hiển thị **Quẻ May Mắn** có ảnh voucher, Zalo/hotline và form để lại số điện thoại.
- Xác suất được quay ở Worker, không quay bằng JavaScript phía trình duyệt.
- Mỗi lần trúng tạo một `claim_token`; form callback chỉ được lưu nếu mã trúng hợp lệ và thuộc đúng thiết bị.

### Cấu hình voucher / tư vấn viên

Sửa file:

`public/js/promo-config.js`

Các trường chính:

- `image`: đường dẫn ảnh voucher/chương trình khuyến mãi.
- `consultantName`: tên tư vấn viên.
- `consultantPhone`: số điện thoại tư vấn.
- `zaloUrl`: link Zalo, ví dụ `https://zalo.me/09xxxxxxxx`.
- `title`, `description`: tiêu đề và mô tả ưu đãi.

Bạn có thể chép ảnh thật vào:

`public/assets/voucher/voucher.jpg`

sau đó đổi `image` thành:

`assets/voucher/voucher.jpg`

### D1

Worker có thể tự tạo bảng khi chạy, nhưng với database đang dùng nên chạy migration một lần:

```bash
npx wrangler d1 execute trung-thu-wishes --remote --file=./migration-lucky-voucher.sql
```

Sau đó deploy:

```bash
npx wrangler deploy
```

Danh sách khách yêu cầu gọi lại nằm trong bảng `voucher_leads`.

SQL kiểm tra:

```sql
SELECT customer_name, phone, created_at, claim_token
FROM voucher_leads
ORDER BY id DESC;
```

Danh sách quẻ trúng nằm trong `voucher_wins`.

### Test giao diện voucher ở local

Chạy:

```bash
node server.mjs
```

Sau đó mở:

`http://localhost:8787/?testVoucher=1`

Chọn **Khách / Bên ngoài công ty**, rồi bốc một quẻ. Chế độ `testVoucher=1` chỉ có tác dụng với server local; Worker production vẫn giữ đúng tỷ lệ 1%.

## Bản FINAL v15 – Responsive toàn thiết bị

Bản này bổ sung một lớp responsive tổng thể ở cuối `public/css/style.css`, tập trung vào:

- desktop rộng >= 1440px;
- laptop / tablet ngang <= 1100px;
- tablet dọc / điện thoại lớn <= 850px;
- điện thoại <= 640px;
- điện thoại rất nhỏ <= 390px;
- màn hình thấp và điện thoại xoay ngang;
- safe-area cho thiết bị có tai thỏ / thanh home;
- modal quẻ khách, quẻ nhân viên, voucher, gửi/xem ước nguyện;
- header, Cung Trăng, nhân vật, Thỏ Ngọc, bong bóng chat, gợi ý, đèn lồng và cụm nút chức năng.

`viewport-fit=cover` đã được bật trong `public/index.html`.
