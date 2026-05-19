# Kepiton

Kepiton là web app quản lý deadline theo đồng hồ đếm ngược thời gian thực.

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database/Auth: Supabase
- ORM: Prisma
- Extension: Chrome Extension Manifest V3

## Branch Structure

- `main`: stable branch, dùng cho bản đã ổn định.
- `develop`: active branch, dùng để tích hợp các sprint đang phát triển.

Các sprint mới sẽ tạo branch riêng từ `develop`, ví dụ:

```text
codex/sprint-4-countdown-ui
codex/sprint-5-email-reminders
codex/phase-b-landing-legal-ga4
codex/phase-c-claude-api-deploy
```

Khi sprint hoàn thành, tạo PR vào `develop`. Khi `develop` ổn định, merge `develop` vào `main`.

## Sprints Đã Hoàn Thành

- Sprint 0: Setup cấu trúc repo, frontend, backend, extension, Prisma schema.
- Sprint 1: Backend API nền tảng cho auth, projects, milestone, tasks.
- Sprint 2: Smart Import upload file, Google Sheets, GPT-4o parsing, review trước khi confirm.
- Sprint 3: Frontend auth, project flow, React Router, Smart Import chọn project thật.
- Sprint 4: Countdown UI hiển thị đồng hồ đếm ngược trên Project Card.
- Sprint 5: Email reminders, Share Link read-only, Settings, mobile responsive, Chrome Extension v0.1.
- Sprint 6: Payment, Upgrade Pro, Admin Panel xác nhận thanh toán thủ công.
- Giai đoạn A: Project Detail, Task UX, task CRUD trên giao diện, mobile-friendly task actions.
- Giai đoạn B: Landing page, Legal pages, GA4 tracking.

## Giai Đoạn Tiếp Theo

- Giai đoạn C: Claude API thật cho Smart Import và deploy beta lên Render.

## Local Setup

```bash
npm install
npm run dev
```

Backend API base path: `/api/v1`.
