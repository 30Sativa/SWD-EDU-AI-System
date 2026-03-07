# Kiến thức Frontend trong Project SWD-EDU-AI-System

File này tổng hợp toàn bộ các công nghệ, thư viện, cấu trúc, nguyên lý và tiến độ phát triển của dự án.

## 1. Tech Stack (Công nghệ cốt lõi)

### Core
- **Library**: `React` (v19) - Functional Components, Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **Build Tool**: `Vite` (v7) - Fast build, HMR, Environment Variables.
- **Language**: `JavaScript` (.jsx).
- **Routing**: `react-router-dom` (v7) - Routes, Outlet, Navigate, Hooks (`useNavigate`, `useSearchParams`, `useParams`).

### Styling & UI
- **Tailwind CSS 4**:
  - CSS-first configuration, `@tailwindcss/vite` plugin.
  - Theme Colors:
    - **Primary**: `#0487e2` (Blue) - Main actions.
    - **Secondary**: `#0463ca` - Hover states.
    - **Neutral**: `bg-slate-50` - Backgrounds.
- **Ant Design (antd)** (v6):
  - Component phức tạp: `Modal`, `Spin`, `Form`, `Input`, `Select`, `Button`, `Tag`, `Empty`, `Switch`, `Dropdown`, `Menu`, `DatePicker`, `InputNumber`.
  - Notifications: `message.error`, `message.success`, `message.loading`.
- **Lucide React**: Modern Outline Icons.

### Special Functionalities
- **Drag & Drop**: `@dnd-kit` (core, sortable, utilities) - Dùng để kéo thả sắp xếp Section trong khóa học.
- **Auth**: `@react-oauth/google` - Đăng nhập bằng Google.
- **Charts**: `Recharts` - Biểu đồ thống kê AreaChart, BarChart cho Dashboard.
- **Date Handling**: `dayjs` - Xử lý định dạng ngày tháng.
- **Data Export/Import**: `xlsx` - Xử lý file Excel/CSV cho User Management.
- **HTTP Client**: `axios` - Quản lý request/response với `axiosClient.js`.

## 2. Kiến trúc dự án (Architecture)

Dự án áp dụng kiến trúc **Feature-based** hybrid (kết hợp global & modular):

### Cấu trúc API (`src/features/.../api` & `src/api`)
1.  **Global Lib (`src/lib/axiosClient.js`)**:
    - Config `baseURL` từ biến môi trường.
    - Interceptors: Tự động gắn `Authorization: Bearer <token>` vào request header.
    - Xử lý lỗi chung (401 Unauthorized -> Logout).

2.  **Auth API**:
    - `src/api/authApi.js`: Login, Register truyền thống.
    - Tích hợp Google OAuth2 cho quy trình SSO.

3.  **Feature API (`src/features/*/api/*.js`)**:
    - Mỗi feature có API tập trung: `userApi.js`, `courseApi.js`, `classApi.js`, `lessonApi.js`, `quizApi.js`, `assignmentApi.js`.
    - Sử dụng **Named Exports** và hỗ trợ **Cache Busting** (`?t=timestamp`).

### Routing & Security (`src/routes/RouteMap.jsx`)
- **ProtectedRoute**: Kiểm tra `allowedRoles` và `accessToken`.
- **CheckProfileWrapper**: 
  - Chặn người dùng chưa cập nhật thông tin cơ bản.
  - Kiểm tra `fullName`, `phoneNumber`, `gender`, `dob` (Date of Birth).
  - Tích hợp Modal cập nhật nhanh (Fast Profile Update).

## 3. Các tính năng đã hoàn thiện (Completed Features)

### A. Authentication & Security
- **Login / Register**: Hệ thống tài khoản nội bộ.
- **Google Login**: Đã tích hợp OAuth client qua `@react-oauth/google`.
- **Profile Enforcer**: Ép buộc cập nhật profile đầy đủ trước khi vào Dashboard.

### B. Admin & Manager Dashboards
- **Enterprise UI**: Giao diện Slate/Blue modern với Sidebar động.
- **Stats & Charts**: Visualization cho Users, Courses, Subjects, Roles bằng Recharts.
- **Subject/Grade/Term**: Quản lý đa cấp bậc khối lớp và học kỳ.

### C. User Management
- **CRUD Profiles**: Quản lý người dùng toàn hệ thống.
- **Import/Export**: Xử lý dữ liệu hàng loạt từ Excel (Mapping PascalCase cho Backend).
- **Profile Page**: Trang cá nhân chi tiết (Cập nhật Bio, Gender, DOB, Avatar).

### D. Course Management (Teacher View)
- **Course Detail Editor**: Sắp xếp khóa học theo Section (Chương) và Lesson (Bài học).
- **Curriculum Management**:
  - Dùng **Dnd-kit** để kéo thả thay đổi thứ tự chương học.
  - **API Sync**: Tự động gửi `sortOrder` / `order` khi lưu.
  - **Lesson Types**: Video, File, Quiz, Content Blocks.
- **Section APIs**: Tích hợp `/api/courses/{id}/sections` cho các thao tác Thêm/Sửa/Xóa.

### E. Teacher Dashboard & Class Management
- **Class List**: Quản lý Lớp chủ nhiệm (Homeroom) và Lớp bộ môn (Assigned).
- **Sĩ số (Student Count)**: Hiển thị chính xác bằng cách dùng fallback fields (`currentStudents`, `studentCount`, `enrollmentCount`).
- **Student List**: Trang danh sách học sinh theo từng lớp với trạng thái học tập.

## 4. Quy ước Code (Conventions)

- **Components**: PascalCase.
- **Hooks & API**: camelCase.
- **ID Robustness**: 
  - Luôn check cả `id` và `Id` (PascalCase từ Backend).
  - Sử dụng `(s.id || s.Id || s.sectionId)` để tránh crash UI.
- **Optimistic UI**: Cập nhật trạng thái ngay lập tức trên UI trước khi API trả về để tăng cảm giác mượt mà.
- **Cache Busting**: Sử dụng `?t=timestamp` trong các GET request lấy dữ liệu nhạy cảm hoặc dễ bị cache.

## 5. Hướng dẫn tích hợp API (API Integration Guide)

### Thư viện sử dụng
- **Axios**: Library chính để gửi HTTP/HTTPS requests.
- **Config**: Được cấu hình tập trung tại `src/lib/axiosClient.js`.

### 1. Cấu hình Axios Client (`src/lib/axiosClient.js`)
File này chịu trách nhiệm:
- Gán `BaseURL`.
- Tự động gắn Token vào Header (`Authorization: Bearer ...`).
- Xử lý Response trả về (lấy `response.data`) và Global Error Handling (401 Logout).

```javascript
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: '',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
});

export default axiosClient;
```

### 2. Định nghĩa API (`src/features/.../api/myApi.js`)
Luôn sử dụng **Named Exports**.

```javascript
import axiosClient from "../../../lib/axiosClient";

export const getUsers = (params) => {
    return axiosClient.get('/api/admin/users', { params });
};
```

### 6. Kế hoạch tiếp theo (Next Steps)

1.  **Student Experience**: Hoàn thiện trang học tập và làm bài tập.
2.  **Report & Analytics**: Hệ thống báo cáo chi tiết cho Manager/Admin.
3.  **Refactor**: Tối ưu hóa hiệu năng và cấu trúc file khi dự án phình to.

---
*Last Updated: 2026-03-06*
