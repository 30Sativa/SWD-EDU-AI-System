# Báo cáo Kiểm tra Mapping API Role Student (Cập nhật 28/02/2026)

Tài liệu này tổng hợp trạng thái tích hợp API cho vai trò **Student**, phân loại theo các module chức năng chính: Tổng quan, Khóa học, Bài kiểm tra và Tiến độ.

**Các mức độ trạng thái:**
1. **Đã maped**: API đã có trong code (`src/api/` hoặc `features/*/api/`) và đã được gọi trong UI.
2. **Đã có API cần mapped**: Backend đã có Endpoint nhưng UI chưa tích hợp hoặc vẫn dùng Mock Data.
3. **Chưa có API**: Tính năng cần thiết cho UI nhưng Backend chưa cung cấp Endpoint.

---

## 1. Tổng quan & Tài khoản (Dashboard & Account)

| Chức năng | API Endpoint | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Lấy profile hiện tại** | `GET /api/users/me` | **Đã maped** | Dùng để hiển thị tên user chính xác (`fullName`) tại Dashboard và Header. |
| **Thống kê Dashboard** | (Cần API tổng hợp) | **Chưa có API** | UI `StudentDashboard.jsx` đang mock: Giờ học tuần này, Tỷ lệ hoàn thành bài tập, Biểu đồ học tập 7 ngày. |
| **Lịch học sắp tới** | (Cần API Deadline/Schedule) | **Chưa có API** | UI "Lịch sắp tới" tại Dashboard đang dùng Mock Data. |
| **Mục tiêu tuần** | (Cần API Goals) | **Chưa có API** | UI "Mục tiêu tuần" tại Dashboard đang dùng Mock Data. |

---

## 2. Khóa học (Courses Management)

| Chức năng | API Endpoint | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Danh sách khóa học của tôi** | `GET /api/student/courses/my` | **Đã maped** | Đã tích hợp vào `CoursesList.jsx` (Tab Khóa học của tôi) và Dashboard. |
| **Khám phá khóa học mới** | `GET /api/manager/classes` | **Đã maped** | Đã tích hợp vào `CoursesList.jsx` (Tab Khám phá). |
| **Chi tiết khóa học** | `GET /api/manager/classes/{id}` | **Đã maped** | `CourseDetail.jsx` đã load Info và Curriculum (Sections/Lessons) từ API. |
| **Bộ lọc (Môn, Khối)** | `GET /api/manager/subjects`, `GET /api/manager/grade-levels` | **Đã maped** | Đã load động từ API vào sidebar filter của `CoursesList.jsx`. |
| **Danh mục & Kỳ học** | `GET /api/manager/course-categories`, `GET /api/manager/terms` | **Đã có API cần mapped** | Backend đã có nhưng UI Filter chưa tích hợp 2 loại bộ lọc này. |
| **Đăng ký khóa học mới** | `POST /api/student/courses/{id}/enroll` | **Đã maped** | Đã thêm nút "Đăng ký ngay" tại tab Khám phá trong `CoursesList.jsx`. |

---

## 3. Nội dung & Bài kiểm tra (Lessons & Quizzes)

| Chức năng | API Endpoint | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Danh sách bài kiểm tra** | `GET /api/student/quizzes` (Dự kiến) | **Chưa có API** | UI `QuizList.jsx` đang dùng 100% Mock Data. Backend chỉ mới có `POST /api/teacher/quizzes` cho giáo viên. |
| **Chi tiết bài kiểm tra** | `GET /api/student/quizzes/{id}` | **Chưa có API** | `QuizDetail.jsx` đang dùng Mock Data. |
| **Nộp bài Quiz** | `POST /api/student/quizzes/submit` | **Chưa có API** | Backend chưa cung cấp Endpoint nộp bài cho Student. |
| **Xem chi tiết bài học** | `GET /api/teacher/lessons/{id}` | **Đã maped** | Đã tích hợp vào `LessonDetail.jsx` để load nội dung bài học, video và tài liệu. |

---

## 4. Tiến độ học tập (Learning Progress)

| Chức năng | API Endpoint | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Tổng quan tiến độ** | `GET /api/student/statistics` (Dự kiến) | **Chưa có API** | UI `StudentProgress.jsx` (Radar chart, Score trend, Activity chart) dùng 100% Mock Data. |
| **Tiến độ từng khóa học** | `GET /api/student/courses/{id}/progress` | **Chưa có API** | Cần để hiển thị % hoàn thành chi tiết trong `StudentProgress.jsx`. |
| **Thành tựu (Achievements)**| (N/A) | **Chưa có API** | UI "Thành tựu" đang dùng Mock Data. |
| **Lộ trình hàng tuần** | (N/A) | **Chưa có API** | UI "Weekly Journey Path" đang dùng Mock Data. |

---

## 5. Danh sách Discrepancies (Sự sai lệch & Thiếu sót)

Dựa trên các cập nhật gần đây, đây là danh sách ưu tiên tiếp theo:

| Tính năng | Loại | Chi tiết |
| :--- | :--- | :--- |
| **API Thống kê Dashboard** | **Thiếu API** | Cần dữ liệu thật cho: Tổng số giờ học, % hoàn thành bài tập, Biểu đồ học tập (7 ngày). |
| **Luồng Quiz hoàn chỉnh** | **Thiếu API** | Backend cần gấp bộ API cho Student làm bài: Lấy đề, Submit, Lấy kết quả. |
| **Lịch học và Deadline** | **Thiếu API** | Hiển thị lịch thi, hạn nộp bài trực tiếp lên Dashboard và Sidebar. |
| **Bộ lọc Nâng cao** | **Cần mapped** | Tích hợp thêm bộ lọc theo Kỳ học (Terms) và Danh mục (Categories) vào trang Khóa học. |

---

## Ghi chú bổ sung
- **Tiến độ đã đạt được**: Đã chuyển trang `CoursesList`, `CourseDetail` và `LessonDetail` sang **100% API Data**.
- **Cảnh báo**: API Chi tiết bài học đang dùng `/api/teacher/lessons/{id}` theo tài liệu cung cấp. Cần kiểm tra lại phân quyền để chắc chắn Student có thể gọi Endpoint này.
- **Tiếp theo**: Nên tập trung vào phân hệ Quiz và Statistics vì đây là 2 mảng lớn cuối cùng vẫn còn đang dùng Mock Data hoàn toàn.
