# Kepiton Beta QA Checklist

Checklist này dùng cho Giai đoạn D trước khi mời beta users.

## 1. User mới

1. Vào landing page.
2. Bấm `Bắt đầu miễn phí`.
3. Đăng ký email mới và xác thực email.
4. Vào Dashboard, kiểm tra empty state.
5. Tạo project hoặc import file.
6. Mở Project Detail, kiểm tra countdown và task list.

Kết quả đúng: không có màn hình trắng, mọi lỗi đều là tiếng Việt.

## 2. Free tier

1. Tạo project 1, 2, 3.
2. Tạo project 4.
3. Xóa project 1.
4. Thử tạo project mới lần nữa.

Kết quả đúng: project 4 vẫn bị chặn vì gói miễn phí đếm toàn bộ project từng tạo.

## 3. Milestone và task

1. Tạo project có deadline.
2. Tạo milestone có deadline vượt deadline project.
3. Tạo milestone hợp lệ.
4. Tạo task không có deadline.
5. Tạo task có deadline vượt milestone.

Kết quả đúng: milestone vượt project bị chặn, task thiếu deadline bị chặn, task vượt milestone chỉ hiện cảnh báo vàng.

## 4. Share link

1. Tạo share link cho project.
2. Mở link bằng tab ẩn danh.
3. Revoke link bằng API hoặc thao tác admin/dev.
4. Mở lại link.

Kết quả đúng: link còn hiệu lực xem được không cần đăng nhập; link revoke/hết hạn trả 410 và hiện thông báo hết hạn.

## 5. Payment

1. User thường vào `/upgrade`.
2. Tạo yêu cầu nâng cấp.
3. Admin vào `/admin`.
4. Admin kích hoạt Pro.
5. Admin hủy Pro.

Kết quả đúng: trạng thái gói đổi đúng, email gửi đúng, user thường không vào được admin.

## 6. Empty và loading state

Kiểm tra:

- Dashboard chưa có project.
- Project Detail chưa có task.
- Project Detail chưa có milestone.
- Admin chưa có payment request.
- Settings khi đang lưu.
- Smart Import khi đang đọc file.

Kết quả đúng: có thông báo hoặc loading state, không có màn hình trắng.

## 7. Mobile 375px

Kiểm tra bằng Chrome DevTools iPhone SE:

- Landing đọc được.
- Dashboard không overflow ngang.
- ProjectCard hiển thị countdown gọn.
- ProjectDetail đọc được task list.
- Swipe task row hiện nút sửa/xóa.
- Modal form không bị che hoàn toàn.

## 8. Route bảo mật

Khi chưa đăng nhập:

- `/dashboard` chuyển về `/login`.
- `/projects/:id` chuyển về `/login`.
- `/settings` chuyển về `/login`.
- `/upgrade` chuyển về `/login`.
- `/admin` chuyển về `/login`.
- `/share/:uuid` xem được nếu link hợp lệ.
- `/dieu-khoan` xem được.
- `/chinh-sach-bao-mat` xem được.

Khi đăng nhập bằng user thường:

- `/admin` bị chặn bởi backend, không chỉ ẩn nút trên giao diện.

## 9. Network lỗi

1. Bật Slow 3G.
2. Bấm các action chính: tạo project, lưu task, confirm import, tạo payment.
3. Tắt network.
4. Lặp lại các action chính.

Kết quả đúng: button có trạng thái chờ, không gửi double click, lỗi hiện tiếng Việt.

## Known blockers cần PO/dev chạy trên production

- Test Claude API với file thật cần `ANTHROPIC_API_KEY`.
- Test email cần `RESEND_API_KEY` và sender domain hợp lệ.
- Test OAuth Google/Facebook cần credentials production.
- Test Render cold start cần URL production live.
