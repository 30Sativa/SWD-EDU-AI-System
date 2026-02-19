### **1\. IMPORT & KÍCH HOẠT TÀI KHOẢN (ADMIN)**

* ### **Admin**: Upload Excel (Email/Tên) \-\> Bấm Import.

  ### Hệ thống: Lọc trùng (bỏ qua email cũ) \-\> Tạo acc mới (Mặc định: 123456\) \-\> Gửi mail thông báo.

* ### **User**: Login lần đầu (Pass: 123456\) \-\> Hệ thống chặn: Bắt buộc đổi Pass & Cập nhật Info \-\> Vào Dashboard.

  ### **2.QUẢN LÝ (MANAGER) \- TẠO COURSE MẪU**

* ### **Manager**: Vào tạo khóa học \-\> Tích chọn checkbox "Là khóa học mẫu" (`isTemplate = True`) **TRONG DB CHƯA CÓ CỘT NÀY**\-\> Upload file Đề cương **CÁI NÀY CHƯA CHỐT** \-\> Bấm "AI Scan"..

  ### Hệ thống (AI): Trả về cấu trúc JSON (Chương/Bài)

* ### Manager: Duyệt cấu trúc \-\> Bấm Lưu.   **DB CHƯA LƯU TOTAL SESSION**

  ### DB: Lưu vào bảng `Courses` với `isTemplate = 1` (Học sinh sẽ không thấy khóa này để đăng ký).

  ### **3.GIÁO VIÊN \- SOẠN GIÁO TRÌNH** 

* ### **Teacher**: Tạo Khóa học \-\> Chọn "Dùng Template Toán 10" (`isTemplate=1`).

* ### Hệ thống: Clone khung sườn rỗng sang Khóa mới của GV (Lúc này là `Draft`).

* ### **Teacher** : Upload Video bài giảng \+ File PDF bài tập (dạng thô).

* ### **Teacher (AI Power)**: Bấm nút  "AI Chuẩn hóa Sư phạm".

* ### **Hệ thống (AI Processing)**:

  * ### Phân tích nội dung thô.

  * ### Tự động chia nhỏ Video nếu quá dài (gợi ý timestamp).

  * ### Tóm tắt ý chính (Key takeaways) để làm phần mô tả bài học.

  * ### Sắp xếp lại File tài liệu vào đúng mục (Lý thuyết/Bài tập).

* ### **Hệ thống**: Hiển thị màn hình Preview (Xem trước) hai cột: *Bản gốc* vs *Bản AI tối ưu*.

* ### **Teacher**: Chấp nhận đề xuất AI \-\> Bấm "Gửi duyệt" \-\> *Trạng thái: Pending."*

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

  * ### *Xử lý:* Thêm các Email hợp lệ vào danh sách lớp (`Enrollments`).

* ### **Hệ thống:** Gửi Email thông báo cho từng học sinh: "Bạn đã được thêm vào lớp".

* ### **Student:** Đăng nhập \-\> Thấy lớp học xuất hiện sẵn trong danh sách (Không cần nhập Key).

### 

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

* ### **Logic:** Nếu `Progress == 100%` \-\> Cập nhật trạng thái khóa học là `Finished` \-\> Kích hoạt cấp chứng chỉ (nếu có).

  ### 

  ### **6\. AI TUTOR (HỖ TRỢ HỌC TẬP)**

* ### Student: Đang học gặp khó \-\> Bấm "Hỏi AI" \-\> Chat nội dung thắc mắc.

* ### Hệ thống (AI): Lấy context bài học hiện tại \+ Câu hỏi \-\> Trả lời giải thích/Gợi ý \-\> Student hiểu bài.

  ### **7\. THỐNG KÊ & CẢNH BÁO (ANALYTICS)**

* ### **Teacher:** Vào Dashboard lớp \-\> Hệ thống hiển thị danh sách học sinh.

* ### **Hệ thống:** Tự động lọc ra nhóm "Nguy cơ" (Tiến độ thấp HOẶC \> 7 ngày chưa đăng nhập).

* ### **Teacher:** Chọn nhóm này \-\> Bấm "Gửi nhắc nhở".

* ### **Hệ thống:** Gửi Email tự động đến từng học sinh: "Vui lòng quay lại học tập".

  ### **8\. QUẢN LÝ HỒ SƠ (PROFILE)**

* ### **User:** Upload Avatar mới hoặc Đổi mật khẩu.

* ### **Hệ thống:** Validate dữ liệu (Kích thước ảnh / Độ mạnh mật khẩu).

  ### **9\. THÔNG BÁO HỆ THỐNG (NOTIFICATIONS)**

* ### **Admin:** Trang quản lí thông báo \-\> Soạn tin nhắn \-\> Chọn đối tượng (Toàn bộ User hoặc Chỉ Giáo viên) \-\> Gửi.

* ### **Hệ thống:** Lưu tin nhắn vào DB \-\> Phân phối ID tin nhắn đến danh sách người nhận.

* ### **User:** Đăng nhập \-\> Hệ thống tải danh sách tin nhắn chưa đọc \-\> Hiển thị số lượng tại biểu tượng Chuông.

  ### **11\. XUẤT BÁO CÁO (EXPORT DATA)**

* ### **Manager/Teacher:** Chọn Lớp học \-\> Bấm "Xuất bảng điểm/Tiến độ".

* ### **Hệ thống:** Query dữ liệu tổng hợp (Điểm Quiz, % xem Video).

* ### **Hệ thống:** Tạo file Excel (.xlsx) \-\> Trả về đường dẫn tải xuống (Direct Download).

  ### **12\. PHẢN HỒI KHÓA HỌC (RATING)**

* ### **Student:** Hoàn thành 100% khóa học \-\> Nhập số sao (1-5) \+ Nội dung đánh giá \-\> Gửi.

* ### **Hệ thống:** Lưu đánh giá \-\> Tính lại điểm trung bình (Rating Average) của Khóa học.

* ### **Hệ thống:** Hiển thị điểm đánh giá mới lên trang chi tiết khóa học (Public).

  ### 