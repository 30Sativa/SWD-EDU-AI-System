# Kiến thức Frontend trong Project SWD-EDU-AI-System

File này tổng hợp toàn bộ các công nghệ, thư viện, cấu trúc, nguyên lý và tiến độ phát triển của dự án.

## 1. Tech Stack (Công nghệ cốt lõi)

### Core
- **Library**: `React` (v19) - Functional Components, Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **Build Tool**: `Vite` (v7) - Fast build, HMR, Environment Variables.
- **Language**: `JavaScript` (.jsx).
- **Routing**: `react-router-dom` (v7) - Routes, Outlet, Navigate, Hooks (`useNavigate`, `useSearchParams`).

### Styling & UI
- **Tailwind CSS 4**:
  - Utility-first CSS.
  - Theme Colors:
    - **Primary**: `#0487e2` (Blue) - Main actions.
    - **Secondary**: `#0463ca` - Hover states.
    - **Neutral**: `bg-slate-50` - Backgrounds.
- **Lucide React**: Modern Outline Icons.
- **Ant Design (antd)**: Sử dụng cho các component phức tạp như `Spin` (Loading), `message` (Toast notification).
- **Recharts**: Thư viện biểu đồ (AreaChart, BarChart) cho Dashboard.

### Data & Logic
- **Axios**: HTTP Client quản lý request/response.
- **XLSX**: Thư viện xử lý Excel (Import/Export user data).
- **LocalStorage**: Lưu trữ Access Token & User Info.

## 2. Kiến trúc dự án (Architecture)

Dự án áp dụng kiến trúc **Feature-based** hybrid (kết hợp global & modular):

### Cấu trúc API (`src/features/.../api` & `src/api`)
1.  **Global Lib (`src/lib/axiosClient.js`)**:
    - Config `baseURL` từ biến môi trường.
    - Interceptors: Tự động gắn `Authorization: Bearer <token>` vào request header.
    - Xử lý lỗi chung (401 Unauthorized -> Logout).

2.  **Global API (`src/api/authApi.js`)**:
    - Chứa logic Authentication (Login, Register).
    - Đây là feature dùng chung toàn app nên đặt ở root `api`.

3.  **Feature API (`src/features/*/api/*.js`)**:
    - Mỗi feature tự quản lý API của nó.
    - Ví dụ: `src/features/user/api/userApi.js` chứa `getUsers`.
    - Sử dụng **Named Exports** (`export const getUsers...`) thay vì default export object.

### Routing Logic (`src/routes/RouteMap.jsx`)
- **Public Routes**: `/login`, `/register`, `/` (Home - Redirects to Login).
- **Protected Routes**: Được bọc bởi `<ProtectedRoute allowedRoles={[...]} />`. check token từ localStorage.
- **Role-based Redirects**:
  - `/student` -> Student Dashboard.
  - `/dashboard/teacher` -> Teacher Dashboard.
  - `/dashboard/manager` -> Manager Dashboard.
  - `/dashboard/admin` -> Admin Dashboard.

## 3. Các tính năng đã hoàn thiện (Completed Features)

### A. Authentication
- **Login**: Gọi API, lưu token, điều hướng theo role của user.
- **Register**: Đăng ký tài khoản mới (hiện đang mock hoặc logic cơ bản).
- **Home Page**: Landing page giới thiệu, các nút CTA đều điều hướng về Login form để ép luồng user.

### B. Admin Dashboard (`src/features/dashboard/admin`)
- **UI**: Giao diện Slate/Blue modern style.
- **Stats**: Hiển thị 4 metrics chính (Users, Active, Courses, Subjects) với Sparkline Charts (Recharts).
- **Charts**: Biểu đồ phân bố Role (Donut Chart).
- **System Info**: Trạng thái hạ tầng (CPU/RAM dummy visualizations).

### C. User Management (`src/features/user/admin`)
- **Data Fetching**: Tích hợp API thật `/api/admin/users`.
  - Xử lý response đa dạng (`response.data`, `response.data.items`).
- **Filtering & Sorting**:
  - Filter: Vai trò, Trạng thái.
  - Search: Tên, Email.
  - Client-side processing: Fetch danh sách lớn và filter/sort tại client để UX mượt mà (Tạm thời).
- **Role Visualization**:
  - **Admin**: Purple Badge.
  - **Manager**: Orange Badge.
  - **Teacher**: Emerald/Green Badge.
  - **Student**: Blue Badge.
- **Import/Export**:
  - **Import**: Hỗ trợ CSV/Excel, validate dữ liệu trước khi thêm.
  - **Export**: Xuất danh sách user ra file CSV/Excel.
- **CRUD UI**: Modal Tạo mới/Chỉnh sửa user đẹp mắt (sử dụng Backdrop blur).
- **Logic cập nhật**:
  - **Soft Delete**: Xóa user chuyển trạng thái sang "Tạm khóa" (Inactive) thay vì xóa vĩnh viễn.
  - **Bug Fixes**: Sửa lỗi tạo user (Role/Password).

### D. Notification & Audit Log Management (Admin)
- **UI Upgrade**: Đồng bộ thiết kế "Enterprise" cho trang Notification và Audit Log.
- **Data**: Sử dụng Mock Data cho giao diện, sẵn sàng tích hợp API.

### E. Course & Subject Management
- **Fixes**: Sửa lỗi `ReferenceError` trong Course Management.
- **Logic**: Cập nhật logic lưu Subject Detail, Cascade Deactivate cho Grade/Class.

## 4. Quy ước Code (Conventions)

- **Components**: PascalCase (`UserManagement.jsx`).
- **Hooks**: camelCase (`useAuth`, `useNavigate`).
- **API Functions**: camelCase (`getUsers`, `loginAPI`).
- **Constants**: UPPER_CASE (`ROLE_ENUM`).
- **Imports**: Ưu tiên Named Imports.
  ```javascript
  import { getUsers } from "../../api/userApi";
  ```

## 5. Hướng dẫn tích hợp API (API Integration Guide)

### Thư viện sử dụng
- **Axios**: Library chính để gửi HTTP/HTTPS requests.
- **Config**: Được cấu hình tập trung tại `src/lib/axiosClient.js`.

### 1. Cấu hình Axios Client (`src/lib/axiosClient.js`)
File này chịu trách nhiệm:
- Gán `BaseURL` (hoặc để trống nếu dùng Proxy).
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
Luôn sử dụng **Named Exports** để dễ tree-shaking và import rõ ràng.

```javascript
import axiosClient from "../../../lib/axiosClient";

export const getUsers = (params) => {
    return axiosClient.get('/api/admin/users', { params });
};

export const createUser = (data) => {
    return axiosClient.post('/api/admin/users', data);
};
```

### 3. Sử dụng trong Component
Sử dụng `useEffect` để fetch data khi component mount.

```javascript
import { useEffect, useState } from 'react';
import { getUsers } from '../../api/userApi';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await getUsers({ page: 1, size: 10 });
                
                console.log("API Response:", response);
                
                setUsers(response.items || []); 
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div>
            {loading ? "Loading..." : users.length + " users found"}
        </div>
    );
};
```

## 6. Kế hoạch tiếp theo (Next Steps)

1.  **Course Management**:
    - Xây dựng API `courseApi.js`.
    - CRUD Courses cho Teacher/Admin.
2.  **Class Management**:
    - Quản lý lớp học, gán học sinh vào lớp.
3.  **Student Experience**:
    - Hoàn thiện trang Dashboard học sinh.
    - Vào học (Lesson View), Làm bài tập (Quiz UI).
4.  **Refactor**:
    - Chuyển đổi các mock data còn lại sang API call thực tế khi Backend sẵn sàng.

---
*Last Updated: 2026-02-05*
