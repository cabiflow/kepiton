# Hướng dẫn vận hành Kepiton Beta

Tài liệu này dành cho PO vận hành bản beta hằng ngày, không yêu cầu nền tảng kỹ thuật.

## Thao tác PO làm hằng ngày

### Xử lý yêu cầu nâng cấp Pro

1. Vào `https://kepiton.onrender.com/admin` và đăng nhập bằng tài khoản admin.
2. Mở tab yêu cầu thanh toán.
3. Kiểm tra giao dịch ngân hàng có đúng số tiền và đúng nội dung chuyển khoản `KEPITON [mã]`.
4. Nếu đã chuyển đúng, bấm `Kích hoạt Pro`.
5. Nếu chưa chuyển hoặc sai nội dung, chờ thêm hoặc bấm `Từ chối` nếu quá hạn xử lý.

Sau khi kích hoạt hoặc từ chối, hệ thống sẽ gửi email thông báo cho người dùng.

### Hủy tài khoản Pro

1. Vào `/admin`.
2. Mở danh sách người dùng.
3. Tìm email cần xử lý.
4. Bấm `Hủy Pro`.

Tài khoản sẽ về gói miễn phí ngay lập tức và hệ thống gửi email thông báo.

### Khi có người dùng báo lỗi

Hỏi người dùng 4 thông tin:

1. Họ đang ở màn hình nào.
2. Họ vừa bấm hoặc nhập gì.
3. Họ thấy thông báo lỗi gì.
4. Thời điểm xảy ra lỗi và email tài khoản.

Nếu có thể, xin thêm ảnh chụp màn hình rồi gửi lại cho developer.

## Tài khoản demo

Email demo: `demo@kepiton.com`

Mật khẩu demo không lưu trong GitHub. Khi cần tạo hoặc đổi mật khẩu demo, đặt biến `DEMO_USER_PASSWORD` trên máy/server rồi chạy:

```bash
npm run seed:demo --workspace backend
```

Script sẽ tạo 3 dự án mẫu, task mẫu, milestone mẫu và in ra 1 share link demo.

## Thông tin hệ thống

| Hạng mục | Thông tin |
|---|---|
| Frontend beta | `https://kepiton.onrender.com` |
| Backend beta | `https://kepiton-backend.onrender.com` |
| Database/Auth | Supabase |
| Email | Resend.com |
| Analytics | Google Analytics 4 |
| Hosting | Render.com |

## Lưu ý quan trọng

- Render free tier có thể ngủ sau một thời gian không có người dùng. Người đầu tiên mở app có thể phải chờ 30-60 giây.
- Nếu app bị chậm lần đầu trong ngày, đó thường là cold start của Render, không phải lỗi dữ liệu.
- Nếu cần restart service, vào Render Dashboard và bấm Manual Deploy.
- Không gửi API key, service role key hoặc mật khẩu demo qua tin nhắn công khai.

## Khi nào cần gọi developer ngay

- User không đăng nhập được dù email/mật khẩu đúng.
- Dashboard trắng hoặc không tải sau hơn 1 phút.
- Thanh toán đã xác nhận nhưng tài khoản chưa lên Pro.
- Smart Import trừ lượt nhưng không tạo task.
- Share link bị hết hạn sai hoặc người ngoài không xem được.
