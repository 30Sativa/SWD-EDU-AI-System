## Thư mục `Abstractions`

Thư mục này chứa các **abstraction / contract / interface** mà Application layer dùng để:

- Giao tiếp với **Infrastructure layer** (repository, unit of work, external service, email, file storage, AI service, v.v.).
- Định nghĩa các **service trong Application** để WebAPI gọi vào (nếu không dùng trực tiếp MediatR hoặc pattern tương tự).

- **Mục đích**
  - Application **không phụ thuộc** trực tiếp vào implement cụ thể (EF Core, provider email, AI API, …).  
  - Cho phép thay thế implementation ở Infrastructure dễ dàng mà không ảnh hưởng tới Application.
  - Hỗ trợ viết **unit test** cho Application: test dựa trên interface, mock implementation.

- **Ví dụ các loại abstraction nên đặt ở đây**
  - `IUserRepository`, `ICourseRepository`, `ILessonRepository`, …  
    → Định nghĩa hành vi làm việc với dữ liệu user/course/lesson.

  - `IUnitOfWork`  
    → Quản lý transaction ở mức Application (commit/rollback một nhóm thay đổi).

  - `IEmailSender`, `ISmsSender`, `INotificationSender`  
    → Gửi email/SMS/thông báo mà không cần biết đang dùng dịch vụ nào (SendGrid, SMTP, Firebase, v.v.).

  - `IAiLessonGenerator`, `IAiChatService`, …  
    → Các service làm việc với AI (gọi OpenAI, Azure OpenAI, v.v.), Application chỉ gọi qua interface.

- **Hướng dẫn khi thêm mới abstraction**
1. Xác định rõ: logic này thuộc về Application hay hạ tầng (implementation).  
2. Nếu Application cần một hành vi mà không muốn phụ thuộc trực tiếp vào công nghệ cụ thể → tạo interface trong `Abstractions/`.  
3. Implement interface đó ở `Infrastructure` và đăng ký DI (Dependency Injection) trong WebAPI/Infrastructure.  
4. Trong Application (Command/Query handler, service), chỉ inject **interface**, không inject lớp implement cụ thể.

Nhờ đó, Application layer giữ được vai trò “core logic”, không bị trói buộc vào database hay service ngoài nào cụ thể.

