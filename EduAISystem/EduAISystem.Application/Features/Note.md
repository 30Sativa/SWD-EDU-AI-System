## Thư mục `Features`

Thư mục `Features` tổ chức Application layer theo **feature/module** thay vì theo kỹ thuật (controller/service/repository).  
Mỗi thư mục con đại diện cho **một nhóm chức năng nghiệp vụ** (ví dụ: `Auth`, `Course`, `Lesson`, …).

- **Cấu trúc chung của một feature**
  Một feature điển hình sẽ có các thư mục con:

  - `Commands/`  
    - Chứa các **Command** (ghi dữ liệu) như: Create, Update, Delete, ChangeStatus, …  
    - Mỗi Command thường có:
      - Request model (command object).
      - Handler (ví dụ: `CreateUserCommandHandler`) xử lý logic nghiệp vụ.

  - `Queries/`  
    - Chứa các **Query** (đọc dữ liệu) như: GetById, GetList, Search, …  
    - Mỗi Query thường có:
      - Request model (query object).
      - Handler xử lý đọc dữ liệu, mapping sang DTO trả về.

  - `DTOs/`  
    - Dùng cho **Request/Response** của API, tách biệt với Domain entity.  
    - Có thể tách thành `Request/` và `Response/` để rõ ràng.

  - `Validators/`  
    - Chứa các lớp **Validator** (thường dùng FluentValidation) cho Command/Query.  
    - Đảm bảo dữ liệu đầu vào hợp lệ trước khi vào handler.

  - `Mappings/`  
    - Cấu hình mapping riêng cho feature này (AutoMapper profile hoặc mapper thủ công).  
    - Chỉ dùng trong phạm vi feature, không dùng chung nhiều feature.

- **Ví dụ: `Auth` feature**
  - `Commands/` – Đăng ký, Đăng nhập, Đổi mật khẩu, Đăng xuất, v.v.
  - `Queries/` – Lấy thông tin user hiện tại, kiểm tra token, …
  - `DTOs/Request/` – Model cho request đăng nhập, đăng ký, refresh token, …
  - `DTOs/Response/` – Model trả về token, thông tin user, quyền, …
  - `Validators/` – Kiểm tra định dạng email, password, rule nghiệp vụ cho Auth.

- **Hướng dẫn khi thêm feature mới**
1. Tạo thư mục mới trong `Features/` với tên rõ ràng (ví dụ: `Courses`, `Lessons`, `Assignments`, …).
2. Bên trong, tạo các thư mục con cần thiết: `Commands`, `Queries`, `DTOs`, `Validators`, `Mappings`.
3. Mỗi use case (ví dụ: “Tạo khóa học mới”) nên có 1 Command/Query riêng với handler tương ứng.
4. Không truy cập trực tiếp DB trong Controller – luôn thông qua Command/Query của Application.

