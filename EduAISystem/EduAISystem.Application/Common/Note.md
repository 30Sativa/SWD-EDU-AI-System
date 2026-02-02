## Thư mục `Common` (Application Layer)

Thư mục này chứa **các thành phần dùng chung** cho nhiều feature trong Application layer.

- **Mục đích**
  - Tránh lặp lại code ở từng feature.
  - Gom các khối logic hạ tầng ứng dụng (application infrastructure) như behaviours, exception chung, mapping, model dùng chung.

- **Các thư mục con điển hình**
  - `Behaviours/`  
    - Chứa các **pipeline behaviours** (ví dụ khi dùng MediatR) như logging, validation, transaction, performance, authorization, …  
    - Các behaviour này chạy trước/sau mỗi Command/Query để áp dụng quy tắc chung cho toàn hệ thống.

  - `Exceptions/`  
    - Chứa các **exception tùy biến** cho Application (ví dụ: `NotFoundException`, `ForbiddenException`, `ValidationException`, …).  
    - Dùng để ném lỗi có ý nghĩa, sau đó WebAPI có thể map sang HTTP status code phù hợp.

  - `Mappings/`  
    - Khai báo **profile AutoMapper** hoặc các mapper thủ công dùng chung giữa nhiều feature.  
    - Dùng để map giữa Domain entity ↔ DTO, hoặc các model khác nhau.

  - `Models/`  
    - Chứa **model dùng chung**: base response, paging request/response, filter, sort, v.v.  
    - Không chứa logic nghiệp vụ phức tạp, chủ yếu là cấu trúc dữ liệu.

- **Hướng dẫn sử dụng**
  - Khi code nào có khả năng dùng lại ở nhiều feature → cân nhắc đưa vào `Common/`.
  - Exception dùng chung hoặc pattern xử lý pipeline nên đặt ở đây để toàn Application layer đều dùng được.
  - Nếu mapping chỉ phục vụ 1 feature cụ thể, có thể đặt trong `Features/<FeatureName>/Mappings`; nếu dùng rộng rãi thì đặt ở `Common/Mappings`.

