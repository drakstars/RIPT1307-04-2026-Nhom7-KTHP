# 📚 English Learning Platform (ELP) — Nhóm 7 · RIPT1307

> **Hệ thống học tiếng Anh toàn diện** với Landing Page, cổng quản trị Admin, từ điển thông minh, khóa học có nhúng video, flashcard, trò chơi từ vựng, luyện gõ phím và AI chatbot.

Dự án được xây dựng theo mô hình **Monorepo** (pnpm workspaces) gồm hai ứng dụng độc lập:

| | Công nghệ | Thư mục |
|---|---|---|
| **Frontend** | UmiJS v4 · Ant Design v5 · Less · Zustand | `apps/frontend` |
| **Backend** | NestJS · Prisma ORM · MySQL 8 | `apps/backend` |
| **Database** | MySQL 8 (Docker) | `docker-compose.yml` |

---

## ✨ Tính năng nổi bật

### 🏠 Landing Page
- Trang giới thiệu sản phẩm lấy cảm hứng từ Quizlet
- Hero section với floating vocab cards animation, flashcard demo UI
- Sections: Tính năng, Cách hoạt động, Bộ từ vựng, Bảng giá
- Navbar sticky khi cuộn, điều hướng đến Đăng nhập / Đăng ký

### 🛡️ Cổng Quản Trị Admin (Admin Portal)
- Dashboard với biểu đồ doanh thu MRR, phân bổ gói dịch vụ và KPI học viên
- Quản lý người dùng: phân trang, tìm kiếm, khoá/mở khoá tài khoản, xoá
- Quản lý từ vựng theo **bộ tài liệu** (Document Sets): thêm/sửa/xoá bộ tài liệu, thêm từ vào từng bộ
- Quản lý khoá học, bài kiểm tra, thanh toán, cài đặt hệ thống, analytics
- Lối tắt chuyển đổi nhanh Admin ↔ User ngay trên Sidebar

### 📖 Khóa Học Tiếng Anh
- Thư viện khóa học với nhiều bài học
- Mỗi bài học hỗ trợ nội dung **Markdown** và nhúng **video YouTube** responsive 16:9
- Theo dõi tiến độ học từng bài

### 🔍 Từ Điển Thông Minh
- **Widget nổi** tra cứu từ vựng mọi lúc không cần rời trang
- Trang tra từ chi tiết: nghĩa, loại từ, phiên âm IPA, ví dụ minh họa
- Phát âm thanh chuẩn Anh-Anh / Anh-Mỹ
- Lịch sử 5 từ tra gần nhất

### ⬡ Flashcard & Từ Vựng
- Bộ flashcard với thuật toán lặp lại ngắt quãng (Spaced Repetition)
- Từ vựng tổ chức theo **bộ tài liệu** (IELTS, TOEIC, TOEFL, SAT, ...)
- Trang người dùng hiển thị danh sách bộ tài liệu, cuộn để xem thêm
- Học & ôn từ vựng theo từng bộ tài liệu

### 🎯 Quiz & Kiểm Tra
- Tạo bài kiểm tra tuỳ chỉnh (nhiều lựa chọn, điền từ, đúng/sai)
- Lưu lịch sử kiểm tra và điểm số
- Xem lại kết quả chi tiết từng câu

### 🎮 Trò Chơi Từ Vựng (Games)
- Memory Card: lật thẻ ghép nghĩa
- Matching: ghép đôi từ-nghĩa
- Drag & Drop: kéo thả từ vào đúng vị trí

### ⌨️ Luyện Gõ Phím (Type Words)
- Luyện gõ phím 10 ngón qua các đoạn văn tiếng Anh thực tế
- Quản lý sách cá nhân: tạo sách, thêm/xoá bài viết
- Theo dõi tốc độ gõ (WPM) và độ chính xác

### 🤖 AI Chatbot (AI Tutor)
- Gia sư AI hỗ trợ ngữ pháp, giải thích từ vựng và thực hành hội thoại

### 💳 Pricing & Thanh Toán
- Trang bảng giá 3 gói: Free · Pro · Team
- Hệ thống thanh toán và quản lý subscription

### 🌓 Dynamic Theme
- Chuyển đổi tức thì Dark / Light mode
- Tùy chỉnh cỡ chữ từ 12px đến 18px

### 👤 Hồ Sơ & Cài Đặt Cá Nhân
- Modal chỉnh sửa hồ sơ: họ tên, tiểu sử, upload avatar (NestJS Multer)
- Modal cài đặt: đổi mật khẩu, thông báo, giao diện, quyền riêng tư

### 🔑 Đăng nhập bằng Google OAuth
- Tích hợp Google Sign-In trên trang đăng nhập
- Tự động đăng ký tài khoản mới nếu email chưa tồn tại

---

## 🛠️ Yêu cầu hệ thống

- **Node.js** v18 hoặc v20+
- **pnpm** (bắt buộc):
  ```bash
  npm install -g pnpm
  ```
- **Docker & Docker Compose** (để chạy MySQL)

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### Bước 1 — Clone & Cài đặt thư viện
```bash
git clone <repo-url>
cd Bai_Tap_lon
pnpm install
```

### Bước 2 — Khởi động MySQL bằng Docker
```bash
docker-compose up -d
```

MySQL sẽ chạy tại cổng **3307** (container nội bộ: 3306):
- Root password: `12345678`
- Database: `root`

### Bước 3 — Cấu hình biến môi trường

Tạo tệp `apps/backend/.env`:
```env
DATABASE_URL="mysql://root:12345678@localhost:3307/root"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Tuỳ chọn: Đăng nhập Google OAuth thật
# GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Bước 4 — Tạo Database & Chạy Migrations
```bash
cd apps/backend
npx prisma migrate dev
# Hoặc nếu không muốn tạo migration mới:
npx prisma db push
```

### Bước 5 — Seed dữ liệu

**Seed cốt lõi** (Roles, Admin, Khóa học, Video YouTube):
```bash
pnpm --filter backend prisma db seed
```

**Seed từ vựng** (IELTS, TOEIC, TOEFL, ...):
```bash
cd apps/backend
npx ts-node prisma/seed-vocabularies.ts
```

**Seed dữ liệu học viên ảo** (cho Dashboard Admin analytics):
```bash
cd apps/backend
npx ts-node prisma/seed-mock-data.ts
```

### Bước 6 — Chạy dự án
```bash
# Terminal 1 - Backend (NestJS · cổng 3000)
pnpm --filter backend start:dev

# Terminal 2 - Frontend (UmiJS · cổng 8000)
pnpm --filter frontend dev
```

Sau khi khởi chạy:
- 🌐 **Frontend / Landing Page**: http://localhost:8000
- 🌐 **Ứng dụng chính**: http://localhost:8000/dashboard
- ⚙️ **Backend API**: http://localhost:3000

---

## Link web dự án ELP
- https://ript-1307-04-2026-nhom7-kthp.vercel.app/

---

## 🔑 Tài khoản thử nghiệm

| Họ tên | Email | Mật khẩu | Vai trò |
|:---|:---|:---|:---|
| **System Admin** | `admin@gmail.com` | `123456` | ADMIN |
| **David Admin** | `admin2@gmail.com` | `123456` | ADMIN |
| **Jessica Admin** | `admin3@gmail.com` | `123456` | ADMIN |

> 💡 **Lối tắt Admin**: Khi đăng nhập bằng tài khoản ADMIN, Sidebar tự động hiện thêm mục **`▲ Quản trị`** màu vàng. Click vào đây để vào cổng Admin.

---

## 📂 Cấu trúc dự án

```
Bai_Tap_lon/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma           # DB schema (User, Role, Course, Quiz, Vocabulary...)
│   │   │   ├── seed.ts                 # Seed chính (Admin, Roles, Courses + Videos)
│   │   │   ├── seed-vocabularies.ts    # Seed bộ từ vựng (IELTS, TOEIC, TOEFL...)
│   │   │   ├── seed-mock-data.ts       # Seed 60+ học viên ảo (analytics)
│   │   │   └── seed-admins.ts          # Seed tài khoản quản trị
│   │   └── src/modules/
│   │       ├── admin/                  # API Quản trị (users, analytics...)
│   │       ├── auth/                   # Xác thực JWT + Google OAuth
│   │       ├── chat/                   # AI Chatbot API
│   │       ├── courses/                # API Khóa học & bài học
│   │       ├── flashcards/             # API Flashcard & Study
│   │       ├── notifications/          # API Thông báo
│   │       ├── payment/                # API Thanh toán & Subscription
│   │       ├── quiz/                   # API Bài kiểm tra
│   │       ├── stats/                  # API Thống kê hoạt động học
│   │       ├── upload/                 # Upload avatar (Multer)
│   │       ├── users/                  # Profile & Settings API
│   │       └── vocabularies/           # API Quản lý từ vựng theo bộ tài liệu
│   │
│   └── frontend/
│       └── src/
│           ├── components/
│           │   ├── AdminRoute.tsx       # Route guard cho Admin
│           │   ├── ProtectedRoute.tsx   # Route guard cho User đã đăng nhập
│           │   └── common/
│           │       ├── DictionaryWidget/   # Widget từ điển nổi
│           │       ├── EditProfileModal/   # Modal chỉnh sửa hồ sơ
│           │       ├── ECard/              # Component thẻ flashcard
│           │       ├── FlipCard/           # Thẻ lật flashcard
│           │       ├── GameResult/         # Màn hình kết quả trò chơi
│           │       ├── Heatmap/            # Biểu đồ hoạt động học
│           │       ├── ImageUpload/        # Upload ảnh avatar
│           │       ├── MessageBubble/      # Bong bóng chat AI
│           │       ├── NotificationBell/   # Chuông thông báo
│           │       ├── ProfileDropdown/    # Dropdown hồ sơ người dùng
│           │       ├── SettingsModal/      # Modal cài đặt hệ thống
│           │       ├── StreakCalendar/      # Lịch chuỗi ngày học
│           │       └── WeeklyChart/        # Biểu đồ hoạt động tuần
│           ├── layouts/
│           │   ├── UserLayout.tsx       # Layout người dùng (sidebar + nav)
│           │   └── AdminLayout.tsx      # Layout quản trị viên
│           ├── pages/
│           │   ├── landing/             # Landing Page (trang chủ giới thiệu)
│           │   ├── Login/               # Đăng nhập (Email + Google OAuth)
│           │   ├── Register/            # Đăng ký tài khoản
│           │   ├── Dashboard/           # Dashboard người dùng (streak, quiz history, vocab)
│           │   ├── Admin/               # Cổng quản trị
│           │   │   ├── index.tsx        # Dashboard Admin (MRR, KPI)
│           │   │   ├── users/           # Quản lý người dùng
│           │   │   ├── vocabulary/      # Quản lý bộ từ vựng
│           │   │   ├── courses/         # Quản lý khóa học
│           │   │   ├── quizzes/         # Quản lý bài kiểm tra
│           │   │   ├── payments/        # Quản lý thanh toán
│           │   │   ├── analytics/       # Thống kê & báo cáo
│           │   │   └── settings/        # Cài đặt hệ thống
│           │   ├── courses/             # Trang khóa học & bài học
│           │   ├── dictionary/          # Trang tra từ điển
│           │   ├── flashcards/          # Flashcard & Spaced Repetition
│           │   ├── games/               # Trò chơi từ vựng (Memory, Matching, Drag)
│           │   ├── quiz/                # Tạo & làm bài kiểm tra
│           │   ├── chatbot/             # AI Tutor chatbot
│           │   ├── typewords/           # Luyện gõ phím (Type Words)
│           │   ├── pricing/             # Trang bảng giá
│           │   ├── checkout/            # Trang thanh toán
│           │   └── settings/            # Cài đặt tài khoản & billing
│           ├── stores/
│           │   ├── auth.store.ts        # Quản lý phiên đăng nhập (Zustand)
│           │   ├── chat.store.ts        # State AI chatbot
│           │   ├── flashcards.store.ts  # State flashcard học
│           │   ├── game.store.ts        # State trò chơi từ vựng
│           │   ├── plan.store.ts        # State gói subscription
│           │   ├── quiz.store.ts        # State bài kiểm tra
│           │   └── settings.store.ts    # Cài đặt giao diện cá nhân
│           └── styles/
│               ├── tokens.less          # Design tokens (màu sắc, spacing, typography)
│               └── global.less          # CSS global reset & base styles
│
├── docker-compose.yml                   # MySQL 8 container (port 3307)
└── README.md
```

---

## 🗄️ Database Schema (tóm tắt)

| Model | Mô tả |
|:---|:---|
| `User` | Người dùng (email, password, Google OAuth, avatar, role) |
| `Role` | Vai trò (ADMIN / USER) |
| `FlashcardSet` | Bộ thẻ flashcard của người dùng |
| `Vocabulary` | Từ vựng gắn với `topic` (bộ tài liệu: IELTS, TOEIC, ...) |
| `Course` | Khóa học với nhiều bài học |
| `Lesson` | Bài học (Markdown + YouTube embed) |
| `Enrollment` | Đăng ký khóa học của người dùng |
| `Quiz` | Bài kiểm tra nhiều câu hỏi |
| `QuizAttempt` | Lịch sử làm bài kiểm tra |
| `Payment` | Thanh toán & subscription |
| `DailyActivity` | Hoạt động học theo ngày (streak) |
| `Notification` | Thông báo người dùng |

---

## 👥 Thành viên Nhóm 7 — Phân chia công việc

### 1.1. Backend & Landing Page & Core Pages (Nguyễn Trung Kiên & Trần Hải Đăng)

#### **Nguyễn Trung Kiên** (Leader · Main Backend & Core FE Pages)
* **Backend:**
  * Cấu hình cơ sở dữ liệu gốc, Docker Compose (MySQL 8) & Prisma Schema migrations.
  * API Xác thực hệ thống (`auth/` - JWT đăng ký/đăng nhập & Google OAuth Backend).
  * API Quản lý từ vựng (`vocabularies/`).
  * API Bài kiểm tra & Lịch sử làm bài (`quiz/`).
  * API Thống kê tiến độ, hoạt động học và streak (`stats/`).
* **Frontend (Trang cốt lõi):**
  * Trang chủ giới thiệu Landing Page.
  * Trang Dashboard học viên (Dashboard từ vựng, biểu đồ heatmap và streak học tập).
  * Trang Luyện gõ phím tiếng Anh (`typewords`).
  * Trang giao diện Gia sư AI Chatbot (`chatbot/`).
* **Tên nhánh Feature:** `feature/landing-dashboard-typewords-auth`

#### **Trần Hải Đăng** (Backend Core)
* **Backend:**
  * API Tích hợp Gia sư thông minh AI Chatbot (`chat/` - Tích hợp với Groq API/OpenAI).
  * API Khóa học & Bài học (`courses/` - nội dung Markdown và nhúng YouTube player).
  * API Thanh toán, nâng cấp tài khoản & Quản lý Subscription (`payment/`).
  * API Chuông thông báo (`notifications/`).
  * API Tải ảnh đại diện và lưu trữ cục bộ (`upload/`).
  * Bộ API Quản trị Admin (`admin/` - Các endpoints thống kê doanh thu MRR, biểu đồ KPI, quản lý Người dùng và cài đặt hệ thống).
* **Tên nhánh Feature:** `feature/backend-core-apis`

### 1.2. Frontend (Vũ Minh Hiếu & Trần Tiến Đạt)

#### **Vũ Minh Hiếu** (Frontend Auth & Security & Course Pages)
* **Frontend:**
  * Thiết lập Bảo vệ định tuyến (`AdminRoute.tsx`, `ProtectedRoute.tsx` - Route guards bảo vệ quyền User/Admin).
  * Trang Đăng nhập & Đăng ký (Login/Register, tích hợp nút đăng nhập nhanh Google Sign-In).
  * Trang Khóa học & Bài học (Giao diện hiển thị bài đọc Markdown, video YouTube responsive).
  * Modals Cá nhân: Sửa hồ sơ, Cài đặt tài khoản, đổi mật khẩu, upload ảnh đại diện avatar.
* **Tên nhánh Feature:** `feature/auth-security-routeguards`

#### **Trần Tiến Đạt** (Frontend Layouts & Dictionary & Games)
* **Frontend:**
  * Thiết lập giao diện chung (`AdminLayout`, `UserLayout` với thanh sidebar điều hướng và nút chuyển Admin ↔ User).
  * Tính năng Từ điển thông minh (Widget tra từ nổi mọi lúc + Trang tra từ chi tiết, phát âm thanh chuẩn IPA, lịch sử 5 từ gần nhất).
  * Trang ôn tập từ vựng qua thẻ lật ghi nhớ (Flashcard & Spaced Repetition).
  * Trọn bộ 3 Trò chơi học từ: Memory Card, Matching (Ghép đôi), Drag & Drop (Kéo thả).
  * Trang Bảng giá dịch vụ (`pricing`), Trang Thanh toán (`checkout`), Đăng ký gói VIP.
  * Cổng Quản trị Admin: Trang Dashboard (Doanh thu MRR, KPI), các trang quản lý người dùng, quản lý bộ từ vựng, quản lý khóa học, quản lý bài kiểm tra và thanh toán.
  * Chế độ Dark / Light mode (Dynamic Theme) toàn diện cùng thiết lập tokens CSS.
* **Tên nhánh Feature:** `feature/layouts-dictionary-games`

---

## ⚠️ Lưu ý kỹ thuật

1. **pnpm bắt buộc**: Không chạy `npm install` trong từng thư mục con — sẽ phá vỡ symlink của workspaces.
2. **Docker MySQL cổng 3307**: Container MySQL dùng port `3307` (host) → `3306` (container). `DATABASE_URL` phải ghi `localhost:3307`.
3. **Case-sensitive imports trên Umi 4**: Thư mục `src/pages/Admin` (chữ A hoa). Đường dẫn trong `routes.ts` phải khớp chính xác chữ hoa/thường.
4. **AdminRoute.tsx**: Phải trả về `<Outlet />` từ `'umi'` (không dùng `{children}`) nếu không trang Admin sẽ trắng.
5. **Landing Page**: Route `/` redirect sang `/landing`. Trang không qua UserLayout (không có sidebar).
6. **DailyActivity unique constraint**: Cột `date` kiểu `@db.Date` — khi seed phải chuẩn hoá về `Date.UTC(y, m, d)` để tránh lỗi duplicate key.
7. **Vocabulary & Topic**: Từ vựng được tổ chức theo trường `topic` (string) thay vì bảng riêng. Mỗi giá trị `topic` tương ứng một "bộ tài liệu" trên UI.
