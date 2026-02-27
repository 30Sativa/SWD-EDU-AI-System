# Báo cáo Kiểm tra Mapping API Role Admin

Tài liệu này tổng hợp trạng thái tích hợp API cho vai trò Admin, phân loại theo 3 mức độ:
1. **Đã có và đã map**: API có trong hệ thống và đã được gọi trong code frontend.
2. **Đã có nhưng chưa map**: API đã được liệt kê trong danh sách Backend cung cấp nhưng frontend chưa gọi (hoặc đang dùng dữ liệu giả).
3. **Chưa có API**: Cả Backend và Frontend đều chưa có endpoint/xử lý cho tính năng này.

---

## 1. Tổng quan (Dashboard)
- **File:** `src/features/dashboard/admin/pages/AdminDashboard.jsx`

| Chức năng | Trạng thái | API Endpoint |
| :--- | :--- | :--- |
| **Đã có và đã map** | Thành công | `GET /api/admin/users` (Thống kê User/Role) |
| | Thành công | `GET /api/manager/subjects` (Thống kê Môn học) |
| | Thành công | `GET /api/manager/courses/templates` (Thống kê mẫu Khóa học) |
| **Đã có nhưng chưa map** | Không còn | |
| **Chưa có API** | Thiếu | API Thống kê hạ tầng (CPU, RAM, DB load) |
| | Thiếu | API Lấy nhật ký hệ thống gần đây (Dashboard log) |

---

## 2. Vai trò & Quyền (Roles & Permissions)
- **File:** `src/features/role-permission/admin/pages/RolePermission.jsx`

| Chức năng | Trạng thái | API Endpoint |
| :--- | :--- | :--- |
| **Đã có và đã map** | Không có | (Trang này hiện 100% là dữ liệu giả) |
| **Đã có nhưng chưa map** | Không có | (Danh sách API hiện tại chưa liệt kê module Roles) |
| **Chưa có API** | Thiếu toàn bộ | `GET /api/roles` (Lấy danh sách vai trò) |
| | Thiếu toàn bộ | `GET /api/permissions` (Lấy ma trận quyền) |
| | Thiếu toàn bộ | `POST/PUT /api/permissions/update` (Lưu phân quyền) |

---

## 3. Người dùng (Users Management)
- **File:** `src/features/user/admin/pages/UserManagement.jsx`

| Chức năng | Trạng thái | API Endpoint |
| :--- | :--- | :--- |
| **Đã có và đã map** | Thành công | `GET /api/admin/users` (Danh sách người dùng) |
| | Thành công | `GET /api/admin/users/{id}` (Chi tiết người dùng) |
| | Thành công | `POST /api/admin/users` (Tạo người dùng) |
| | Thành công | `PUT /api/admin/users/{id}/profile` (Cập nhật hồ sơ) |
| | Thành công | `DELETE /api/admin/users/{id}` (Xóa mềm người dùng) |
| **Đã có nhưng chưa map** | Cần cập nhật | `POST /api/admin/users/import` (Frontend đã có UI Import nhưng chưa gọi API này) |
| **Chưa có API** | Thiếu | `PATCH /api/admin/users/{id}/status` (Đổi trạng thái Hoạt động/Khóa) |

---

## 4. Thông báo (Notifications)
- **File:** `src/features/notification/admin/pages/NotificationManagement.jsx`

| Chức năng | Trạng thái | API Endpoint |
| :--- | :--- | :--- |
| **Đã có và đã map** | Không có | (Trang này hiện 100% dùng Mock Data) |
| **Đã có nhưng chưa map** | Không có | (Chưa liệt kê API Notification trong danh sách hiện tại) |
| **Chưa có API** | Thiếu toàn bộ | `GET /api/notifications` (Lấy danh sách thông báo) |
| | Thiếu toàn bộ | `POST /api/notifications` (Gửi thông báo tới người dùng) |

---

## 5. Nhật ký hệ thống (Audit Logs)
- **File:** `src/features/audit-log/admin/pages/AuditLogManagement.jsx`

| Chức năng | Trạng thái | API Endpoint |
| :--- | :--- | :--- |
| **Đã có và đã map** | Không có | (Trang này hiện 100% dùng Mock Data) |
| **Đã có nhưng chưa map** | Không có | (Chưa có API Logs trong danh sách hiện tại) |
| **Chưa có API** | Thiếu toàn bộ | `GET /api/logs` (Lấy nhật ký hoạt động hệ thống) |
| | Thiếu toàn bộ | `GET /api/logs/export` (Xuất báo cáo log ra CSV/Excel) |

---

## Các Module khác (Manager Role)
Dựa theo danh sách API bạn cung cấp, các module sau đã có API nhưng **chưa được phân trang/tạo UI cho Admin/Manager**:
- **Terms (Kỳ học)**: Đã có đủ GET, POST, PUT, DELETE, PATCH status.
- **Classes (Lớp học)**: Đã có đủ GET, POST, PUT, DELETE, PATCH status.
- **GradeLevels (Khối lớp)**: Đã có đủ GET, POST, PUT, PATCH status.
- **CourseCategories**: Đã có đủ GET, POST, PUT, PATCH status.
