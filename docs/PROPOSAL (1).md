### **0\. ĐĂNG NHẬP & ĐĂNG KÝ (AUTH)**

#### **Đăng nhập (Login) — 2 cách**

* ### **Cách 1: Đăng nhập bằng Gmail (Sign in with Google)**
  * User bấm "Đăng nhập bằng Google" \-\> Chọn tài khoản Gmail.
  * Hệ thống: Xác thực qua Google \-\> Tạo hoặc liên kết tài khoản \-\> Trả JWT \-\> Redirect theo role.

* ### **Cách 2: Đăng nhập bằng Username / Email + Mật khẩu**
  * User nhập Username (hoặc Email) và Password \-\> Bấm Đăng nhập.
  * Hệ thống: Tra cứu User theo `UserName` hoặc `Email` \-\> Xác thực \-\> Trả JWT \-\> Redirect theo role.

* ### **Quên mật khẩu (Forgot Password) — Reset mật khẩu:**
  * User bấm "Quên mật khẩu?" \-\> Nhập Email đăng ký \-\> Bấm Gửi.
  * Hệ thống: Gửi link reset mật khẩu qua Gmail (email của user).
  * User mở link trong email \-\> Nhập mật khẩu mới \-\> Xác nhận \-\> Reset thành công \-\> Đăng nhập lại.

* ### **Đăng xuất (Logout):**
  * User bấm Đăng xuất \-\> Xóa token \-\> Chuyển về trang Login.

### **1\. IMPORT & KÍCH HOẠT TÀI KHOẢN (ADMIN)**

### **Admin**: Upload Excel (Email/Tên) \-\> Bấm Import.

* ### **Hệ thống:** Lọc trùng (bỏ qua email đã tồn tại) \-\> Tạo tài khoản mới thành công (Mật khẩu mặc định: 123456) \-\> Gán quyền \-\> Gửi email (Gmail) cho từng user: thông báo tạo tài khoản + gửi kèm mật khẩu đăng nhập.

* ### **User**: Login lần đầu (Pass: 123456) \-\> Hệ thống chặn: Bắt buộc đổi Pass & Cập nhật Info \-\> Vào Dashboard.

* ### **Admin Dashboard:** Xem tổng quan (Số User, Traffic, thống kê hệ thống).

* ### **Admin quản lý User:** Tạo / Sửa / Khóa tài khoản từ danh sách.

* ### **Admin phân quyền:** Gán Role (Admin / Manager / Teacher / Student) cho từng User.

* ### **Admin Audit Logs:** Xem log hoạt động hệ thống \-\> Xuất báo cáo (nếu cần).

  ### **2\. QUẢN LÝ (MANAGER) \- TẠO MÔN HỌC & COURSE MẪU (TEMPLATE)**

* ### **Manager tạo Môn học (Subject):** Tạo tên môn & icon (VD: Toán, Lý, Hóa) \-\> Lưu. Chỉ là nhãn để gắn với khóa học mẫu.

* ### **Manager tạo Khóa học Mẫu (Course Template) cho môn đó** — tạo ra **khung nội dung mẫu** để giáo viên dùng sau (chọn template \-\> upload nội dung vào từng bài):

  * ### **Cách 1: Upload file đề cương**
    * Manager: Chọn Subject (VD: Toán) \-\> Tích "Là khóa học mẫu" \-\> Upload 1 file (đề cương Word/PDF) \-\> Bấm "AI Scan".
    * Hệ thống (AI): Đọc file \-\> Trả về cấu trúc gợi ý (Chương / Bài) \-\> Manager duyệt \-\> Bấm Lưu.

  * ### **Cách 2: Tạo manual (thủ công)**
    * Manager: Chọn Subject + Grade Level \-\> Tích "Là khóa học mẫu" \-\> Nhập tên Course (VD: *Toán Đại số 11*) \-\> Thêm Section (VD: *Đạo hàm*) \-\> Thêm từng Lesson kèm mô tả/outline (VD: *Lesson 1: Định nghĩa đạo hàm*, *Lesson 2: Quy tắc tính đạo hàm*, …) \-\> Bấm Lưu.

* ### **Kết quả:** Hệ thống lưu Course Mẫu với cấu trúc + mô tả tham khảo cho từng Lesson. Học sinh không thấy; dùng để giáo viên clone (kiểu Canva: clone \-\> chỉnh sửa \-\> dùng).

* ### **Manager cập nhật Khóa học Mẫu:** Sửa tên Course / Section / thêm bớt Lesson \-\> Bấm Lưu.

* ### **Manager tạo Danh mục Khóa học (Course Category):** Phân cấp cha/con (VD: Luyện thi \> Khối A) \-\> Lưu.

* ### **Manager tạo Khối lớp (Grade Level):** Định nghĩa khối (10, 11, 12) \-\> Lưu.

* ### **Manager quản lý Lớp học phần (Class):** Tạo / Sửa / Đóng lớp.

  ### **3\. GIÁO VIÊN \- SOẠN GIÁO TRÌNH (Clone Template kiểu Canva)** 

* ### **Bước 1 — Xem & chọn Template (Preview trước khi clone):**
  * Teacher: Tạo Khóa học mới \-\> Chọn Subject + Grade Level (VD: Toán \-\> Khối 11) \-\> Hệ thống hiển thị danh sách template phù hợp.
  * Teacher: Bấm xem Preview từng template \-\> Màn hình hiện cấu trúc (Course \-\> Section \-\> Lesson + mô tả) \-\> Chọn template muốn dùng \-\> Bấm Clone.

* ### **Bước 2 — Clone (mẫu + dữ liệu tham khảo):**
  * Hệ thống: Clone template sang Khóa mới của GV \-\> Trạng thái Draft.
  * Teacher chọn với từng Lesson: **Giữ** mô tả/outline của Manager (VD: "Bài 1: Định nghĩa đạo hàm") \-\> Chỉ cần upload video/PDF; hoặc **Bỏ** \-\> Tự nhập mô tả mới.

* ### **Bước 3 — Chỉnh sửa sau khi clone (như Canva):**
  * Hệ thống: Hiển thị màn hình Preview cấu trúc (Course \-\> Section \-\> Lesson) \-\> Teacher chỉnh sửa trước khi upload nội dung:
    * Đổi tên Section / Lesson.
    * Xóa Lesson không cần.
    * Thêm Section / Lesson mới.
  * Teacher: Bấm Lưu cấu trúc \-\> Upload Video + PDF vào từng Lesson.

* ### **Bước 4 — AI Chuẩn hóa:** Teacher bấm "AI Chuẩn hóa Sư phạm".

* ### **Hệ thống (AI Processing)**:

  * ### Phân tích nội dung thô.

  * ### Tự động chia nhỏ Video nếu quá dài (gợi ý timestamp).

  * ### Tóm tắt ý chính (Key takeaways) để làm phần mô tả bài học.

  * ### Sắp xếp lại File tài liệu vào đúng mục (Lý thuyết/Bài tập).

* ### **Hệ thống**: Hiển thị màn hình Preview (Xem trước) hai cột: *Bản gốc* vs *Bản AI tối ưu*.

* ### **Teacher**: Chấp nhận đề xuất AI \-\> Bấm "Gửi duyệt" \-\> Trạng thái: Pending.

* ### **Teacher tạo Quiz:** Tạo bài trắc nghiệm \-\> Thêm câu hỏi \-\> Xuất bản (gắn vào Lesson).

* ### **Teacher tạo Enrollment Key:** Tạo mật khẩu lớp \-\> Gửi cho học sinh.

* ### **Teacher xem kết quả HS:** Vào Dashboard lớp \-\> Xem điểm Quiz, tiến độ \-\> Phân tích hiệu suất.

  ### **4\. GHI DANH VÀO LỚP (ENROLLMENT)**

###       **Cách 1: Học sinh tự ghi danh (Enrollment Key)**

* ### **Student:** Chọn lớp học \-\> Nhập Enrollment Key.

* ### **Hệ thống:** Kiểm tra Key với dữ liệu lớp học.

  * ### *Nếu sai:* Trả về lỗi, chặn truy cập.

  * ### *Nếu đúng:*

    1. ### Tạo bản ghi trong bảng `Enrollments`.

    2. ### Khởi tạo tiến độ `Progress = 0`.

    3. ### Chuyển hướng Student vào màn hình nội dung khóa học.

###      **Cách 2: Giáo viên thêm danh sách (Bulk Import)**

* ### **Teacher:** Upload file Excel (chứa danh sách Email học sinh).

* ### **Hệ thống:** Quét danh sách Email trong file.

  * ### *Lọc:* Loại bỏ các email sai định dạng hoặc chưa có tài khoản.

  * ### *Xử lý:* Thêm các Email hợp lệ vào danh sách lớp.

* ### **Hệ thống:** Gửi Email thông báo cho từng học sinh: "Bạn đã được thêm vào lớp".

* ### **Student:** Đăng nhập \-\> Thấy lớp học xuất hiện sẵn trong danh sách (Không cần nhập Key).

  ### **4b\. HỌC SINH \- TRANG CHỦ & ĐĂNG KÝ KHÓA**

* ### **Student xem trang chủ:** Lọc khóa học theo Danh mục (Category) hoặc Khối (Grade).

* ### **Student xem chi tiết khóa học:** Vào trang khóa \-\> Đăng ký / Mua (nếu cho phép) \-\> Hệ thống ghi danh.

  ### **5\. QUY TRÌNH HỌC & LOGIC MỞ KHÓA (LEARNING LOGIC)**

### **Bước 1: Xem Video (Tracking)**

* ### **Student:** Xem Video bài học.

* ### **Hệ thống:** Theo dõi thời gian xem thực tế.

* ### **Điều kiện:** Khi thời gian xem \> 90% tổng thời lượng.

  * ### **Hành động 1:** Cập nhật trạng thái bài học thành `Completed`.

  * ### **Hành động 2:** Cập nhật % tiến độ tổng của Student.

  * ### **Hành động 3:** Mở khóa (Unlock) bài học tiếp theo (nếu có logic học tuần tự).

###      **Bước 2: Làm Quiz (Auto Grading)**

* ### **Student:** Làm bài trắc nghiệm \-\> Bấm Nộp bài.

* ### **Hệ thống:** So sánh đáp án \-\> Tính điểm số.

* ### **Điều kiện:**

  * ### *Nếu Điểm \< Điểm đạt:* Giữ trạng thái `Incomplete`. Yêu cầu làm lại. Không mở bài sau.

  * ### *Nếu Điểm \>= Điểm đạt:*

    1. ### Cập nhật trạng thái bài Quiz thành `Completed`.

    2. ### Lưu điểm số cao nhất.

    3. ### Mở khóa (Unlock) bài học kế tiếp.

###       **Bước 3: Hoàn thành khóa học**

* ### **Hệ thống:** Kiểm tra khi Student hoàn thành bài cuối cùng.

* ### **Logic:** Nếu `Progress == 100%` \-\> Cập nhật trạng thái khóa học là `Finished` \-\> Cấp chứng chỉ / Huy hiệu (Badge).

* ### **Student xem kết quả Quiz:** Sau khi nộp bài \-\> Hệ thống hiển thị Đạt / Không đạt \-\> Xem đáp án (nếu mở).

  ### 

  ### **6\. AI TUTOR (HỖ TRỢ HỌC TẬP)**

* ### Student: Đang học gặp khó \-\> Bấm "Hỏi AI" \-\> Chat nội dung thắc mắc.

* ### **Hệ thống (AI):** Lấy context bài học hiện tại \+ Câu hỏi \-\> Trả lời giải thích / Gợi ý.

* ### **AI gợi ý bài tiếp theo:** Học sinh yêu cầu \-\> AI kiểm tra tiến độ \-\> Gợi ý bài học nên học tiếp.

  ### **7\. THỐNG KÊ & CẢNH BÁO (ANALYTICS)**

* ### **Teacher:** Vào Dashboard lớp \-\> Hệ thống hiển thị danh sách học sinh.

* ### **Hệ thống:** Tự động lọc ra nhóm "Nguy cơ" (Tiến độ thấp hoặc \> 7 ngày chưa đăng nhập).

* ### **Teacher:** Chọn nhóm này \-\> Bấm "Gửi nhắc nhở".

* ### **Hệ thống:** Gửi Email tự động đến từng học sinh: "Vui lòng quay lại học tập".

  ### **8\. QUẢN LÝ HỒ SƠ (PROFILE)**

* ### **User:** Upload Avatar mới hoặc Đổi mật khẩu.

* ### **Hệ thống:** Validate dữ liệu (Kích thước ảnh / Độ mạnh mật khẩu).

  ### **9\. THÔNG BÁO HỆ THỐNG (NOTIFICATIONS)**

* ### **Admin:** Trang quản lí thông báo \-\> Soạn tin nhắn \-\> Chọn đối tượng (Toàn bộ User hoặc Chỉ Giáo viên) \-\> Gửi.

* ### **Hệ thống:** Lưu tin nhắn vào DB (bảng `Notifications`) \-\> Phân phối ID tin nhắn đến danh sách người nhận.

* ### **User:** Đăng nhập \-\> Hệ thống tải danh sách tin nhắn chưa đọc \-\> Hiển thị số lượng tại biểu tượng Chuông.

  ### **10\. DUYỆT KHÓA HỌC (MANAGER \- APPROVAL FLOW)**

* ### **Manager:** Vào trang quản lý khóa học \-\> Xem danh sách khóa trạng thái `Pending` (do Teacher gửi duyệt).

* ### **Manager:** Xem chi tiết nội dung \-\> Bấm "Duyệt" hoặc "Từ chối".

* ### **Hệ thống:** Cập nhật trạng thái khóa học \-\> Nếu duyệt: Teacher có thể Publish; nếu từ chối: Trả về kèm lý do.

  ### **11\. XUẤT BÁO CÁO (EXPORT DATA)**

* ### **Manager/Teacher:** Chọn Lớp học \-\> Bấm "Xuất bảng điểm/Tiến độ".

* ### **Hệ thống:** Query dữ liệu tổng hợp (Điểm Quiz, % xem Video) \-\> Tạo file Excel \-\> Trả về đường dẫn tải xuống.

  ### **12\. PHẢN HỒI KHÓA HỌC (RATING)**

* ### **Student:** Hoàn thành 100% khóa học \-\> Nhập số sao (1-5) \+ Nội dung đánh giá \-\> Gửi.

* ### **Hệ thống:** Lưu đánh giá \-\> Tính lại điểm trung bình (Rating Average) của Khóa học.

* ### **Hệ thống:** Hiển thị điểm đánh giá mới lên trang chi tiết khóa học (Public).

  ### **13\. HỆ THỐNG TỰ ĐỘNG**

* ### **Theo dõi tiến độ:** Hệ thống tự động cập nhật % hoàn thành khi Student xem Video / làm Quiz.

* ### **Cấp chứng chỉ / Badge:** Khi Student hoàn thành 100% khóa \-\> Kích hoạt cấp.

* ### **Sao lưu dữ liệu:** Hệ thống sao lưu định kỳ \-\> Lưu trữ an toàn.

* ### **Audit Log:** Phát hiện lỗi (Exception) \-\> Ghi Log \-\> Báo Admin (nếu cần).

---

## **BẢNG THAM CHIẾU: LUỒNG CHÍNH**

### **Quan hệ luồng: Class – Course – Enrollment**

* **Class** (Lớp học phần): Có `TeacherId`, `TermId`, `GradeLevelId`. Liên kết Course qua `CourseClass`.
* **Course** (Khóa học): Nội dung chương trình. Có `Sections` \-> `Lessons` \-> `Quiz`.
* **Enrollment**: `StudentId` + `CourseId` — Học sinh ghi danh vào **Khóa học**.
* **StudentClass**: `StudentId` + `ClassId` — Học sinh thuộc **Lớp**.
* **CourseClass**: `CourseId` + `ClassId` — Lớp được gán Khóa học.

* **Luồng ghi danh:** Học sinh vào Lớp (Class) qua Enrollment Key hoặc được GV thêm \-\> Tạo ghi danh vào Khóa học (Course) liên kết với Lớp đó.