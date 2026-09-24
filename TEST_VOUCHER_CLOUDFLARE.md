# Test Voucher trên Cloudflare

> **Quan trọng:** nếu project đang chạy D1 tốt trên Cloudflare, hãy giữ nguyên `wrangler.jsonc` hiện tại của bạn (đặc biệt là `database_id` và binding `DB`). Bản test này không yêu cầu đổi database hay migration mới.

## 1. Tạo secret test một lần

Trong VS Code Terminal, tại thư mục project:

```bash
npx wrangler secret put VOUCHER_TEST_KEY
```

Nhập một mã bí mật dài do bạn tự đặt. Không commit mã này lên GitHub.

Sau đó deploy lại:

```bash
npx wrangler deploy
```

## 2. Test bằng giao diện website

Mở:

```text
https://TEN-WEBSITE.workers.dev/?testVoucher=MA_BI_MAT
```

Bạn sẽ thấy nhãn `TEST VOUCHER · Tỷ lệ ép trúng 100%`.

- Vào Cung Trăng.
- Chọn `Khách / Bên ngoài`.
- Bấm bất kỳ lồng đèn nào.
- Phải hiện `Quẻ May Mắn Voucher` ngay.
- Trong voucher sẽ có nhãn `CHẾ ĐỘ TEST`.
- Nhập tên + số điện thoại test + tick đồng ý.
- Bấm `Yêu cầu tư vấn gọi lại`.

Khách truy cập URL bình thường, không có `?testVoucher=...`, vẫn luôn dùng xác suất thật 1%.

## 3. Kiểm tra D1

D1 Console:

```sql
SELECT id, prize_key, created_at, lead_submitted
FROM voucher_wins
ORDER BY id DESC
LIMIT 20;
```

Lượt test sẽ có:

```text
prize_key = test_mid_autumn_voucher
```

Kiểm tra lead:

```sql
SELECT id, customer_name, phone, created_at, claim_token
FROM voucher_leads
ORDER BY id DESC
LIMIT 20;
```

## 4. Smoke test tự động

PowerShell:

```powershell
$env:SITE_URL="https://TEN-WEBSITE.workers.dev"
$env:VOUCHER_TEST_KEY="MA_BI_MAT"
$env:TEST_PHONE="0912345678"
$env:TEST_NAME="TEST VOUCHER"
npm run test:voucher
```

Nếu mọi thứ đúng sẽ hiện:

```text
🎉 VOUCHER SMOKE TEST PASSED
```

Nếu không muốn ghi một lead test vào D1, bỏ dòng `TEST_PHONE`; script chỉ kiểm tra ép trúng + cookie.

## 5. Bảo mật

- Không ghi `VOUCHER_TEST_KEY` vào `wrangler.jsonc`, JavaScript hoặc GitHub.
- Sau khi test xong, đóng URL có mã test.
- Có thể đổi secret bất cứ lúc nào bằng `npx wrangler secret put VOUCHER_TEST_KEY` rồi deploy lại.
