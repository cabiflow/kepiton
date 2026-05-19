# Kepiton Beta Deployment

Tài liệu này dùng cho Giai đoạn C: deploy beta lên Render.com với Supabase production.

## Backend Render Web Service

- Name: `kepiton-backend`
- Environment: `Node`
- Branch: `develop`
- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`

Environment variables cần khai báo trên Render:

```bash
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
EMAIL_FROM=
ENABLE_REMINDER_JOB=true
NODE_ENV=production
PORT=10000
JWT_SECRET=
ADMIN_USER_IDS=
BANK_NAME=
BANK_ACCOUNT_NUMBER=
BANK_ACCOUNT_NAME=
PAYMENT_AMOUNT_VND=299000
```

Sau khi set biến môi trường, chạy migration production:

```bash
npx prisma migrate deploy
```

## Frontend Render Static Site

- Name: `kepiton-frontend`
- Branch: `develop`
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`

Environment variables:

```bash
VITE_API_BASE_URL=https://kepiton-backend.onrender.com/api/v1
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GA4_MEASUREMENT_ID=
VITE_PAYMENT_QR_URL=
VITE_CHROME_EXTENSION_URL=
```

File `frontend/public/_redirects` đã được thêm để refresh các route React Router không bị 404.

## Smoke Test Sau Deploy

1. Mở landing page production, kiểm tra không trắng màn hình.
2. Đăng ký tài khoản mới bằng email.
3. Đăng nhập và tạo project mới.
4. Upload file import, kiểm tra Claude trả danh sách task review.
5. Confirm import, kiểm tra task xuất hiện trong Project Detail.
6. Tạo share link và mở bằng tab ẩn danh.
7. Vào Settings, đổi timezone và lưu.
8. Vào Upgrade, kiểm tra QR hoặc placeholder.
9. Vào Admin bằng tài khoản PO, kiểm tra payment requests.
10. Load Chrome Extension unpacked, kiểm tra badge deadline.
