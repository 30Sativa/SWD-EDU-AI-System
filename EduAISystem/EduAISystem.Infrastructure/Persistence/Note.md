## Thư mục `Persistence` (Infrastructure)

Thư mục này chứa toàn bộ phần **làm việc với database** trong Infrastructure layer.

- **📂 `Context/`**
  - Chứa `DbContext` sinh ra từ **Scaffold** (DB First).  
  - **Không chỉnh sửa trực tiếp** trừ khi bạn biết rõ mình đang làm gì (vì có thể phải scaffold lại).

- **📂 `Entities/`**
  - Chứa các **entity generate từ database**.  
  - Với mô hình **DB First**, entity thường được sinh auto từ lệnh scaffold.  
  - 👉 Folder này **bắt buộc phải có** vì entity vẫn là **core của data** cho toàn hệ thống.

- **📂 `Configurations/` → OPTIONAL (tùy chọn)**
  - Dùng để tách riêng cấu hình mapping (Fluent API) cho từng entity.  
  - Tuy nhiên, nếu:
    - Bạn dùng **DataAnnotation** trực tiếp trong entity, **hoặc**  
    - Lệnh scaffold đã generate mapping đầy đủ trong `OnModelCreating` của `DbContext`
  - 👉 Thì thư mục `Configurations/` **có thể bỏ hoàn toàn**,  
    vì mapping đã nằm sẵn trong `DbContext`.

- **📂 `Migrations/` → OPTIONAL (tùy chọn)**
  - Tùy cách bạn quản lý schema DB:
  - **Nên bỏ (`❌`) nếu:**
    - DB do team DBA/SQL script quản lý riêng (bạn không dùng EF để migrate).  
    - DB lấy từ hệ thống ngoài (bạn không kiểm soát schema).
  - **Nên giữ (`✅`) nếu:**
    - Bạn muốn **EF Core quản lý schema** (Code First hoặc hybrid).  
    - Project nội bộ, bạn làm full từ DB tới API.
  - Trong nhiều công ty enterprise dùng **DB First**, `Migrations/` thường **không dùng đến**.

- **📂 `Repositories/` → BẮT BUỘC (required)**
  - Dù bạn dùng **DB First** hay **Code First**:
    - Application layer **chỉ biết interface repository** (đặt ở `Application/Abstractions`).  
    - Infrastructure layer **phải implement repository** (đặt ở đây).
  - 👉 Theo **Clean Architecture**, nguyên tắc này **không thay đổi**:
    - Application phụ thuộc vào **abstraction**.  
    - Infrastructure cung cấp **implementation** cụ thể làm việc với EF Core / DB.
