# Báo cáo Kiểm tra Mapping API Role Admin

Tài liệu này tổng hợp trạng thái tích hợp API cho vai trò Admin, phân loại theo 3 mức độ:
1. **Đã có và đã map**: API có trong hệ thống và đã được gọi trong code frontend.
2. **Đã có nhưng chưa map**: API đã được liệt kê trong danh sách Backend cung cấp nhưng frontend chưa gọi.
3. **Chưa có API**: Cả Backend và Frontend đều chưa có endpoint/xử lý cho tính năng này.

---

## 1. Tổng quan (Dashboard)
- **File:** `src/features/dashboard/admin/pages/AdminDashboard.jsx`

| Chức năng | Trạng thái | API Endpoint |
| :--- | :--- | :--- |
| **Đã có và đã map** | Thành công | `GET /api/admin/users` (Thống kê User/Role) |
| | Thành công | `GET /api/manager/subjects` (Thống kê Môn học) |
| | Thành công | `GET /api/manager/courses/templates` (Thống kê mẫu Khóa học) |
| **Chưa có API** | Thiếu | API Thống kê hạ tầng (CPU, RAM, DB load) |
| | Thiếu | API Lấy nhật ký hệ thống gần đây (Dashboard log) |

---

## 2. Vai trò hệ thống (System Roles)
- **File:** `src/features/role-permission/admin/pages/RolePermission.jsx`
- **Ghi chú:** Đã chuyển đổi từ "Phân quyền chi tiết" sang "Tổng quan vai trò" (RBAC cố định) để phù hợp với Backend.

| Chức năng | Trạng thái | API Endpoint |
| :--- | :--- | :--- |
| **Đã có và đã map** | Thành công | Không cần API (Sử dụng cấu hình Role cố định tại Frontend) |
| **Đã có nhưng chưa map** | Không có | |
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
| **Đã có và đã map** | 🚀 Thành công | `POST /api/admin/users/import` (Kết nối thành công) |
| **Chưa có API** | Thiếu | `PATCH /api/admin/users/{id}/status` (Đổi trạng thái Hoạt động/Khóa) |

---

## 4. Thông báo (Notifications)
- **File:** `src/features/notification/admin/pages/NotificationManagement.jsx`

| Chức năng | Trạng thái | API Endpoint |
| :--- | :--- | :--- |
| **Đã có và đã map** | Không có | (Trang này hiện 100% dùng Mock Data) |
| **Chưa có API** | Thiếu toàn bộ | `GET /api/notifications` (Lấy danh sách thông báo) |
| | Thiếu toàn bộ | `POST /api/notifications` (Gửi thông báo tới người dùng) |

---

## 5. Nhật ký hệ thống (Audit Logs)
- **File:** `src/features/audit-log/admin/pages/AuditLogManagement.jsx`

| Chức năng | Trạng thái | API Endpoint |
| :--- | :--- | :--- |
| **Đã có và đã map** | Không có | (Trang này hiện 100% dùng Mock Data) |
| **Chưa có API** | Thiếu toàn bộ | `GET /api/logs` (Lấy nhật ký hoạt động hệ thống) |

---

## 6. Danh sách Discrepancies (Thiếu trường / Sai lệch logic)

Dưới đây là các điểm UI đã sẵn sàng nhưng Backend đang thiếu trường hoặc trả về không đúng cấu trúc yêu cầu:

| API Endpoint | Loại thiếu sót | Chi tiết |
| :--- | :--- | :--- |
| `POST /api/admin/users` | **Request Body** | Thiếu trường `status` (hoặc `isActive`). UI cho phép chọn trạng thái khi tạo nhưng Backend hiện không nhận trường này. |
| `POST /api/admin/users` | **Response Body** | Backend trả về thiếu thông tin `fullName` ngay sau khi tạo (nên trả về object vừa tạo hoàn chỉnh). |
| `GET /api/admin/users` | **Response Body** | Cấu trúc trả về chưa thống nhất (đang phải check thủ công nhiều trường hợp: `.items`, `.data.items`, `.data`). Cần chuẩn hóa về `data.items`. |
| `PUT /api/admin/users/{id}/profile` | **Request Body** | Cần xác nhận Backend có hỗ trợ đầy đủ: `phoneNumber`, `dateOfBirth`, `gender`, `address`, `bio`. |

---

## Ghi chú bổ sung
- Các API về **Lớp học (Classes)**, **Kỳ học (Terms)**, **Khối lớp (GradeLevels)** đã có đầy đủ trong Backend nhưng chưa có trang quản lý riêng cho Admin.
- Hệ thống Phân trang (Pagination) đã được tích hợp tại Frontend, yêu cầu Backend luôn trả về `totalCount` hoặc `totalItems`.
