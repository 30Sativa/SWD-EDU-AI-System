# SWD-EDU-AI-System

Hệ thống quản lý giáo dục thông minh được xây dựng với kiến trúc Full-Stack hiện đại, tích hợp AI để hỗ trợ quá trình dạy và học.

## 📋 Tổng quan

Dự án này là một hệ thống quản lý giáo dục toàn diện với các tính năng quản lý khóa học, lớp học, câu hỏi, bài kiểm tra và theo dõi tiến độ học tập. Hệ thống hỗ trợ nhiều vai trò người dùng với các quyền truy cập khác nhau.

## 🏗️ Kiến trúc hệ thống

### Frontend
- **Framework**: React 19 với Vite 7
- **Styling**: Tailwind CSS 4 + Ant Design 6
- **Routing**: React Router DOM 7
- **Icons**: Lucide React + Ant Design Icons
- **Charts**: Recharts
- **Utilities**: xlsx (xử lý Excel)

### Backend
- **Framework**: .NET 8.0 Web API
- **Kiến trúc**: Clean Architecture (Domain-Driven Design)
- **Authentication**: JWT Bearer Token
- **Database**: Entity Framework Core (có thể cấu hình)
- **API Documentation**: Swagger/OpenAPI

### Cấu trúc Backend
```
EduAISystem/
├── EduAISystem.Domain/          # Domain entities và business logic
├── EduAISystem.Application/     # Application services và use cases
├── EduAISystem.Infrastructure/  # Data access, external services
└── EduAISystem.WebAPI/         # API controllers và configuration
```

## 🎯 Tính năng chính

### Cho Học sinh (Student)
- 📊 Dashboard học tập với thống kê tiến độ
- 📚 Xem danh sách khóa học và chi tiết khóa học
- 📖 Xem bài học và nội dung chi tiết
- ✅ Làm bài kiểm tra (Quiz)
- 📈 Theo dõi tiến độ học tập

### Cho Giáo viên (Teacher)
- 📊 Dashboard quản lý lớp học
- 📚 Quản lý khóa học (tạo, chỉnh sửa, xem chi tiết)
- 👥 Quản lý lớp học và danh sách học sinh
- 📝 Quản lý ngân hàng câu hỏi (Question Bank)
- 📁 Tổ chức câu hỏi theo thư mục

### Cho Quản lý (Manager)
- 📊 Dashboard quản lý tổng quan
- 📈 Xem báo cáo và thống kê hệ thống

### Cho Quản trị viên (Admin)
- 📊 Dashboard quản trị hệ thống
- 👥 Quản lý người dùng
- 🔐 Quản lý vai trò và quyền truy cập
- 📢 Quản lý thông báo
- 📋 Xem nhật ký kiểm tra (Audit Logs)
- ⚙️ Cài đặt hệ thống

## 🚀 Cài đặt và Chạy dự án

### Yêu cầu hệ thống
- Node.js (phiên bản 18 trở lên)
- .NET 8.0 SDK
- Git

### Frontend

1. **Cài đặt dependencies**
```bash
npm install
```

2. **Chạy development server**
```bash
npm run dev
```

3. **Build cho production**
```bash
npm run build
```

4. **Preview build**
```bash
npm run preview
```

5. **Kiểm tra lỗi code**
```bash
npm run lint
```

### Backend

1. **Khôi phục packages**
```bash
cd EduAISystem
dotnet restore
```

2. **Chạy API server**
```bash
cd EduAISystem.WebAPI
dotnet run
```

3. **Truy cập Swagger UI**
- Mở trình duyệt tại: `https://localhost:5001/swagger` (hoặc port được cấu hình)

## 🐳 DevOps

### Docker

Dự án sử dụng Docker để containerize backend API với multi-stage build để tối ưu kích thước image.

#### Build Docker Image

```bash
docker build -t swd-edu-ai-api .
```

#### Chạy Container

```bash
docker run -p 5000:5000 swd-edu-ai-api
```

#### Docker Image Details

- **Base Image**: `mcr.microsoft.com/dotnet/aspnet:8.0` (runtime)
- **Build Image**: `mcr.microsoft.com/dotnet/sdk:8.0` (build stage)
- **Port**: 5000
- **Multi-stage Build**: Giảm kích thước image cuối cùng

### CI/CD với GitHub Actions

Dự án có thể được cấu hình với GitHub Actions để tự động hóa:

- ✅ Build và test tự động khi push code
- ✅ Build Docker image
- ✅ Deploy tự động (tùy cấu hình)

Workflow files được đặt trong `.github/workflows/` (nếu có).

## 📁 Cấu trúc thư mục

### Frontend (`src/`)
```
src/
├── components/          # Components dùng chung
│   └── layout/         # Header, Footer, Sidebar, Layouts
├── features/           # Features theo domain
│   ├── dashboard/      # Dashboard cho các role
│   ├── course/         # Quản lý khóa học
│   ├── classes/        # Quản lý lớp học
│   ├── quiz/           # Bài kiểm tra
│   ├── question-bank/  # Ngân hàng câu hỏi
│   ├── user/           # Quản lý người dùng
│   ├── role-permission/# Quản lý quyền
│   ├── notification/   # Thông báo
│   ├── audit-log/      # Nhật ký kiểm tra
│   └── settings/       # Cài đặt
├── pages/              # Trang chung
├── routes/             # Cấu hình routing
└── main.jsx            # Entry point
```

### Backend (`EduAISystem/`)
```
EduAISystem/
├── Domain/             # Domain entities, enums
├── Application/        # Business logic, features
├── Infrastructure/     # Data persistence, services
└── WebAPI/            # Controllers, middleware, config
```

## 🔐 Xác thực và Bảo mật

- **JWT Authentication**: Hệ thống sử dụng JWT Bearer tokens cho xác thực
- **Role-based Access Control**: Phân quyền truy cập dựa trên vai trò người dùng
- **CORS**: Đã cấu hình CORS để cho phép frontend kết nối với API

## 🛠️ Công nghệ sử dụng

### Frontend
- React 19.2.0
- Vite 7.2.4
- Tailwind CSS 4.1.18
- Ant Design 6.2.1
- React Router DOM 7.12.0
- Recharts 3.7.0
- Lucide React 0.563.0

### Backend
- .NET 8.0
- ASP.NET Core Web API
- Entity Framework Core
- JWT Bearer Authentication
- Swashbuckle (Swagger)

## 📝 Ghi chú

- Dự án sử dụng kiến trúc Feature-based cho frontend
- Backend tuân theo Clean Architecture với Domain-Driven Design
- Hiện tại dữ liệu có thể đang sử dụng mock data (cần kết nối API thực tế)
- Cần cấu hình JWT Secret trong `appsettings.json` của WebAPI

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## 📄 License

[Thêm thông tin license nếu có]
