## EduAISystem.Infrastructure

Đây là **Infrastructure layer** – chứa toàn bộ **implementation cụ thể** cho các abstraction ở Application (database, dịch vụ ngoài, cache, background jobs, v.v.).

- **Mục tiêu chính**
  - Cài đặt chi tiết (EF Core, Redis, SMTP, OpenAI, …) mà **Application không cần biết**.
  - Có thể thay thế công nghệ mà không làm thay đổi business logic ở Application.
  - Tuân thủ Clean Architecture: Application phụ thuộc vào abstraction, Infrastructure implement.

- **Cấu trúc thư mục chính**
  - `Persistence/`  
    Chứa Context, Entities, Repositories (và có thể có `Configurations`, `Migrations` – xem `Persistence/Note.md`).  
    Đây là phần **bắt buộc**, chịu trách nhiệm truy cập database (EF Core, DB First).

  - `Services/`  
    Chứa implementation cho các service mà Application yêu cầu (được khai báo trong `Application/Abstractions`).  
    Folder này **thường nên có** nếu hệ thống dùng nhiều dịch vụ ngoài.

    - `Identity/`  
      Implement `ICurrentUserService`, JWT service, password hashing, auth service.  
      Thường gắn với **ASP.NET Identity** hoặc custom auth.

    - `Email/`  
      Chứa implementation gửi mail (SMTP, SendGrid, MailKit, …) cho `IEmailService`.

    - `FileStorage/`  
      Implement lưu file (Local storage, AWS S3, Azure Blob, Cloudinary, …) cho `IFileStorageService`.

    - `Cache/`  
      Implement cache (Redis, In-memory cache, …) cho `ICacheService`.

    - `Payment/`  
      Tích hợp cổng thanh toán (VNPay, Stripe, PayPal, …) cho `IPaymentGateway`.

    - `ExternalApis/`  
      Chứa code gọi Google API, OpenAI API, và các third-party API khác, tách riêng khỏi business để dễ mock/test.

  - `Messaging/`  
    Folder này **OPTIONAL (tùy chọn)**, dùng khi hệ thống có event / message broker (RabbitMQ, Kafka, Azure Service Bus, …).  
    Thường chia thành `EventBus`, `Consumers`, `Publishers` (ví dụ: `UserRegisteredEventPublisher`, `SendEmailConsumer`) – hữu ích cho microservices / distributed system.

  - `BackgroundJobs/`  
    Folder này **OPTIONAL (tùy chọn)**, dùng cho các job chạy nền (Quartz.NET, Hangfire, Worker Service, …).  
    Ví dụ: gửi email định kỳ, cleanup data, sync dữ liệu với hệ thống khác.

  - `Settings/`  
    Chứa các class cấu hình như `DatabaseSettings`, `JwtSettings`, `EmailSettings`, `PaymentSettings`, …  
    Thường được **map từ `appsettings.json`** để tránh hard-code connection string, key, endpoint trong code.

- **Định hướng khi thêm mới**
  - Nếu Application cần thêm interface mới (ví dụ `ISmsService`, `INotificationService`):
    1. Định nghĩa interface ở `Application/Abstractions`.
    2. Implement ở Infrastructure (thường trong `Services/` hoặc folder phù hợp).
    3. Đăng ký DI trong WebAPI/Infrastructure.
  - Mỗi integration với hệ thống ngoài (payment, third-party API, message broker, background job, …) nên có **folder riêng** để code gọn, dễ bảo trì.
