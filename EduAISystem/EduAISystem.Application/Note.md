## EduAISystem.Application

Đây là **Application layer** của hệ thống Edu AI – chứa toàn bộ **business logic**, luồng xử lý use case, DTO, validator, mapping, và các interface để làm việc với các layer khác (Domain, Infrastructure, WebAPI).

- **Mục tiêu chính**
  - Tách riêng logic nghiệp vụ khỏi hạ tầng (database, web, v.v.).
  - Dễ kiểm thử (unit test) vì chỉ phụ thuộc vào abstraction, không phụ thuộc trực tiếp vào EF Core hay WebAPI.
  - Tổ chức code theo **Feature** (ví dụ: Auth, Courses, Lessons, …) để dễ mở rộng.

- **Cấu trúc thư mục chính**
  - `Abstractions/`  
    Chứa các **interface / contract** dùng để nói chuyện với Infrastructure (repository, service gửi email, cache, …) và/hoặc để WebAPI gọi vào Application.

  - `Common/`  
    Chứa các thành phần dùng chung cho nhiều feature:
    - Behaviours (pipeline, logging, transaction, …)
    - Exceptions (exception dùng chung)
    - Mappings (cấu hình AutoMapper hoặc các mapper thủ công)
    - Models (DTO chung, response base, paging, …)

  - `Features/`  
    Mỗi feature (ví dụ `Auth`, `Course`, `Lesson`, …) có thư mục riêng, bên trong thường có:
    - `Commands/` – các lệnh ghi (create/update/delete), handler tương ứng.
    - `Queries/` – các truy vấn đọc dữ liệu.
    - `DTOs/` – request/response cho API hoặc cho UI.
    - `Validators/` – kiểm tra dữ liệu đầu vào (thường dùng FluentValidation).
    - `Mappings/` – mapping riêng cho feature đó (nếu cần).

- **Định hướng khi thêm mới code**
  - Mỗi use case cụ thể nên được thể hiện rõ bằng **Command** hoặc **Query**.
  - DTO không được chứa logic nghiệp vụ phức tạp, chỉ nên là model dữ liệu.
  - Không gọi trực tiếp EF Core hoặc infrastructure trong Controller – luôn đi qua Application layer (Command/Query handler, service trong Application).

Nếu bạn thêm feature mới, hãy:
1. Tạo thư mục tương ứng trong `Features/`.
2. Đặt Command, Query, DTO, Validator, Mapping vào đúng thư mục con.
3. Nếu cần làm việc với DB hoặc dịch vụ ngoài, hãy định nghĩa interface trong `Abstractions/` rồi implement ở `Infrastructure`.

