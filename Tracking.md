# SWD-EDU-AI-System

## Tiến độ và thống kê

> Mục tiêu: giúp team **tracking tiến độ** theo từng module lớn, biết **đã có gì**, **còn thiếu gì**, và **hướng cải thiện** theo nghiệp vụ trường THPT Việt Nam.
>
> Quy ước:
> - `[x]` = đã có/đang chạy ổn ở WebAPI + Application + DB
> - `[ ]` = cần implement thêm (todo)
> - `⚠️` = đã có nhưng cần cải thiện/chuẩn hóa thêm

### 1) Tài khoản, phân quyền & bảo mật (Auth / Users / Sessions)

- **Đăng nhập / đăng ký**
  - [x] Đăng nhập (email + password) (`AuthController`)
  - [x] Đăng ký tài khoản (`AuthController`)
  - [ ] Refresh token (cấp access token mới bằng `RefreshToken`)
  - [ ] Logout / revoke refresh token / đóng `LoginSession`
  - [ ] Quản lý phiên đăng nhập: list sessions, revoke từng session (phù hợp khi GV đăng nhập máy trường)
- **Quên mật khẩu / đặt lại mật khẩu**
  - [ ] Gửi yêu cầu reset password (tạo `PasswordReset`, gửi email/SMS)
  - [ ] Xác thực token reset + đặt mật khẩu mới
  - [ ] Hết hạn & chống reuse (dựa trên `PasswordReset.IsUsed`, `ExpiresAt`)
- **Quản lý người dùng (Admin)**
  - [x] Danh sách user (paging/filter cơ bản)
  - [x] Tạo user
  - [x] Xem chi tiết user theo id
  - [x] Cập nhật profile user
  - [x] Soft delete user
  - [x] Import users từ Excel
  - [ ] Khôi phục user đã soft delete (restore)
  - [ ] Activate / deactivate user (khác soft delete)
  - [ ] Đổi role cho user (nếu chưa expose endpoint)
- **Hồ sơ cá nhân (Self-service)**
  - [x] Xem thông tin “me”
  - [x] Cập nhật profile “me”
  - [ ] Đổi mật khẩu (user tự đổi khi đã login)
  - [ ] Verify email (nếu dùng luồng xác thực email)

**Cần cải thiện (Auth/Security)**

- ⚠️ Chuẩn hoá JWT claims + role mapping (Teacher/Student/Manager/Admin) thống nhất.
- ⚠️ Bổ sung rate-limit / lockout dựa trên `LoginAttempt` (THPT: hay bị login sai khi nhập liệu hàng loạt).
- ⚠️ Log security events vào `AuditLog` (login thất bại nhiều lần, revoke token, reset password).

---

### 2) Cấu trúc trường học (THPT) (GradeLevel / Term / Class / Subject / Teacher-Student mapping)

> Gợi ý nghiệp vụ THPT (hợp lý & phổ biến):
> - **Khối**: 10, 11, 12 (`GradeLevel`)
> - **Kỳ học/Năm học**: ví dụ 2025-2026 HK1, HK2 (`Term`) — nhiều trường dùng “Năm học” + “Học kỳ”
> - **Lớp hành chính**: 10A1, 10A2... có **GVCN** (`Class.TeacherId`)
> - **Giáo viên bộ môn**: phân công theo lớp + môn (`ClassSubjectTeacher`)
> - Học sinh thuộc lớp hành chính qua `StudentClass`

- **Danh mục nền**
  - [x] Quản lý môn học (`Subject`) – CRUD + bật/tắt
  - [x] Quản lý khối lớp (`GradeLevel`) – CRUD + bật/tắt
  - [x] Quản lý kỳ học (`Term`) – CRUD + bật/tắt
- **Lớp học hành chính**
  - [x] CRUD lớp (`Class`)
  - [x] Activate/deactivate lớp
  - [x] Xoá lớp (nếu đã implement delete ở Manager)
  - [x] Phân công GV bộ môn theo lớp + môn (`ClassSubjectTeacher`)
  - [x] Giáo viên chủ nhiệm xem lớp mình chủ nhiệm + danh sách học sinh
  - [x] Thêm/xóa học sinh khỏi lớp
  - [x] Import học sinh vào lớp từ Excel
- **Thiếu/todo cho THPT**
  - [ ] Năm học (SchoolYear) tách khỏi Term (nếu muốn chuẩn THPT: HK1/HK2 thuộc năm học)
  - [ ] Danh sách “học sinh toàn trường” theo năm học/khối/lớp (admin/manager)
  - [ ] Luồng “chuyển lớp” (học sinh đổi lớp giữa năm) + lưu lịch sử
  - [ ] Đồng bộ “sĩ số hiện tại” (`Class.CurrentStudents`) tự động theo `StudentClass`

**Cần cải thiện (School structure)**

- ⚠️ Ràng buộc dữ liệu: mã lớp, mã môn, mã khối, mã kỳ học cần validate/unique rõ ràng.
- ⚠️ Quy tắc xoá: khi xoá lớp/kỳ học cần policy (soft delete, chặn xoá nếu đã có enrollment/course mapping).

---

### 3) Danh mục khóa học & phân loại (CourseCategory / Course discovery)

- **Danh mục**
  - [x] CRUD danh mục khóa học (`CourseCategory`) + bật/tắt
  - [x] Hỗ trợ danh mục cha–con (ParentId)
- **Course Discovery (Public Catalog)**
  - [x] API public/student để duyệt danh mục + xem course theo danh mục
    - `GET /api/catalog/categories` – duyệt danh mục (filter parentId, active)
    - `GET /api/catalog/categories/{categoryId}/courses` – courses theo danh mục
    - `GET /api/catalog/courses` – tất cả courses published + active
    - `GET /api/catalog/courses/{id}` – chi tiết course
  - [x] Tìm kiếm course theo môn/khối/kỳ học/danh mục (filter/search)
    - Query params: `searchTerm`, `categoryId`, `subjectId`, `gradeLevelId`, `termId`
    - TermId lọc qua CourseClasses → Classes.TermId

**Cần cải thiện**

- ⚠️ Chuẩn hoá slug generation + xử lý trùng slug khi soft delete.

---

### 4) Quản lý khóa học & lifecycle (Courses, Templates, Classes)

- **Course templates (Manager)**
  - [x] Tạo template course
  - [x] Upload/scan template bằng AI (dựa vào `TeacherDocument` + AI)
  - [x] Lưu cấu trúc sections từ kết quả scan
  - [x] List templates
- **Course của giáo viên**
  - [x] Tạo course (gán teacherId theo token)
  - [x] Cập nhật course
  - [x] Xem chi tiết course theo id
  - [x] List “my courses”
  - [x] Publish course
  - [x] Clone course từ template
  - [x] Gán course cho lớp (`CourseClass`)
- **Thiếu/todo (rất quan trọng để vận hành thật)**
  - [ ] Archive course (đưa về trạng thái ngừng dùng nhưng giữ dữ liệu)
  - [ ] Soft delete course (DeletedAt) + restore (nếu cần)
  - [ ] Unpublish course (Published → Draft) trong trường hợp cần sửa nội dung
  - [x] Student course catalog: xem danh sách course đã publish & active để đăng ký → `GET /api/catalog/courses`
  - [ ] Quản lý `CourseSetting` (AllowAIChat, RequireQuizCompletion, EnableDiscussions, PassingScore…)

**Cần cải thiện (Course lifecycle)**

- ⚠️ Rõ “ownership” dữ liệu: course theo THPT thường thuộc trường/khối/môn, GV là người phụ trách (không nhất thiết sở hữu tuyệt đối).
- ⚠️ Quy trình phê duyệt (optional): THPT hay cần “Tổ trưởng/Quản lý duyệt course” trước publish.

---

### 5) Cấu trúc nội dung (Sections / Lessons / Blocks / FAQ)

- **Sections**
  - [x] Tạo section trong course
  - [x] Update section
  - [ ] List sections theo course
  - [ ] Xem chi tiết section
  - [ ] Xoá section / deactivate section
  - [ ] Reorder sections (SortOrder)
- **Lessons**
  - [x] Tạo lesson
  - [x] Update lesson
  - [x] Delete lesson (soft delete nếu có)
  - [x] Xem lesson theo id
  - [ ] List lessons (toàn bộ) cho giáo viên (đang bị comment-out)
  - [ ] List lessons theo section (đang bị comment-out)
  - [ ] Publish/unpublish lesson (nếu muốn điều khiển `Lesson.Status`)
- **Blocks/FAQ**
  - [x] Có entity `LessonBlock`, `LessonFaq` trong DB
  - [x] API quản lý lesson blocks (CRUD)
    - `GET /api/teacher/lessons/{lessonId}/blocks` – danh sách blocks
    - `GET /api/teacher/lessons/{lessonId}/blocks/{id}` – chi tiết
    - `POST /api/teacher/lessons/{lessonId}/blocks` – tạo block (type: Text/Video/Image/File/Quiz/Code)
    - `PUT /api/teacher/lessons/{lessonId}/blocks/{id}` – cập nhật
    - `DELETE /api/teacher/lessons/{lessonId}/blocks/{id}` – xoá
  - [x] API quản lý lesson FAQ (CRUD)
    - `GET /api/teacher/lessons/{lessonId}/faqs` – danh sách FAQ
    - `GET /api/teacher/lessons/{lessonId}/faqs/{id}` – chi tiết
    - `POST /api/teacher/lessons/{lessonId}/faqs` – tạo FAQ
    - `PUT /api/teacher/lessons/{lessonId}/faqs/{id}` – cập nhật
    - `DELETE /api/teacher/lessons/{lessonId}/faqs/{id}` – xoá

**Cần cải thiện (Content)**

- ⚠️ Chuẩn hoá luồng soạn bài kiểu THPT: “Kế hoạch bài dạy” → “Hoạt động” → “Tài nguyên” → “Câu hỏi kiểm tra”.
- ⚠️ Cân nhắc versioning bài giảng (thay đổi nội dung giữa các năm học).

---

### 6) Ghi danh & học tập (Enrollment / LessonProgress)

- **Enrollment**
  - [x] Học sinh enroll vào course theo `courseId`
  - [x] Học sinh xem danh sách course đã enroll
  - [x] API lấy danh sách courses theo studentId (admin/teacher xem) → `GET /api/student/students/{studentId}/courses`
  - [ ] Unenroll/withdraw course (khi chuyển lớp hoặc học sinh nghỉ)
  - [ ] Hạn dùng enrollment (`Enrollment.ExpiresAt`) – API/logic enforce
- **Tiến độ học**
  - [x] Có entity `LessonProgress` (watchedDuration, isCompleted, lastAccessedAt)
  - [ ] API cập nhật tiến độ xem video/bài học (client gửi watchedDuration, complete)
  - [ ] Tổng hợp tiến độ course (từ lesson progress + quiz/assignment) → update `Enrollment.Progress`

**Cần cải thiện (Learning progress)**

- ⚠️ THPT thường cần báo cáo theo **lớp** và theo **kỳ học**: ai chưa hoàn thành, ai bỏ học, điểm kiểm tra.

---

### 7) Kiểm tra trắc nghiệm (Quiz / Questions / Attempts)

- **Giáo viên**
  - [x] Tạo quiz formative (theo lesson)
  - [x] Tạo quiz summative (theo course)
  - [x] CRUD quiz
  - [x] CRUD câu hỏi (add/update/delete question)
- **Học sinh**
  - [x] List quiz theo lesson
  - [x] List quiz theo course
  - [x] Xem chi tiết quiz để làm bài
  - [x] Start attempt
  - [x] Submit attempt
  - [x] Xem kết quả attempt
- **Thiếu/todo**
  - [ ] Học sinh xem lịch sử attempts theo quiz/course
  - [ ] Giáo viên xem thống kê kết quả quiz theo lớp/course (điểm, tỷ lệ đạt)
  - [ ] Cấu hình show answers / shuffle / max attempts theo `CourseSetting` hoặc theo quiz

**Cần cải thiện (Quiz)**

- ⚠️ THPT hay yêu cầu nhiều “đợt kiểm tra” (15 phút, 1 tiết, giữa kỳ, cuối kỳ) → cân nhắc thêm “AssessmentType”.

---

### 8) Bài tập & nộp bài (Assignments / Submissions)

> DB đã có đầy đủ entity `Assignment`, `Submission`, nhưng hiện chưa thấy module API tương ứng.

- **Todo (cần implement)**
  - [ ] Teacher: CRUD assignment theo course
  - [ ] Teacher: publish/unpublish assignment
  - [ ] Student: list assignments theo course
  - [ ] Student: nộp bài (file/link) tạo submission
  - [ ] Teacher: chấm điểm + feedback, đổi trạng thái submission
  - [ ] Student: xem điểm/feedback

**Cần cải thiện**

- ⚠️ THPT thường cần hỗ trợ: nộp nhiều lần, trễ hạn, chấm lại, rubric chấm điểm.

---

### 9) AI hỗ trợ dạy & học (AI drafts / Q&A / Logs)

- **Hiện có (một phần)**
  - [x] AI scan template course (đã có flow upload/scan/save structure)
  - [x] Có bảng log AI (`Ailog`) lưu feature, input/output, tokens, cost
  - [x] Có entity `AilessonDraft`, `AilessonDraftBlock` để lưu draft bài giảng AI
  - [x] Có entity `StudentQuestion` để lưu Q&A học sinh với AI
- **Todo (để thành tính năng hoàn chỉnh)**
  - [ ] Teacher: list/view/manage AILessonDraft theo document/course
  - [ ] Teacher: “apply draft → tạo lesson thật” (map draft blocks → `LessonBlock`)
  - [ ] Teacher: chỉnh sửa draft blocks, đánh dấu “đã duyệt”
  - [ ] Student: API hỏi AI theo lesson + xem lịch sử Q&A của mình
  - [ ] Teacher: xem câu hỏi học sinh theo course/lớp để hỗ trợ kịp thời
  - [ ] Admin/Manager: dashboard theo dõi chi phí AI từ `Ailog` (theo ngày, theo feature, theo user)

**Cần cải thiện (AI)**

- ⚠️ Policy an toàn nội dung: THPT cần lọc nội dung nhạy cảm, kiểm soát hallucination.
- ⚠️ “AI không thay thế GV”: nên có cơ chế trích dẫn nguồn/tài liệu, và yêu cầu GV duyệt trước khi publish.

---

### 10) Thông báo & nhật ký hệ thống (Notifications / AuditLog)

- **Notifications**
  - [x] List notifications của tôi (paging + filter read/unread)
  - [x] Unread count
  - [x] Mark read
  - [x] Mark all read
- **Audit**
  - [x] Có entity `AuditLog` trong DB
  - [ ] API admin xem audit log theo user/entity/time (phục vụ truy vết & kiểm toán)

**Cần cải thiện**

- ⚠️ Chuẩn hoá event-driven notifications (publish course, giao bài, sắp tới hạn nộp, điểm quiz).

---

### 11) Báo cáo & thống kê (THPT-friendly)

> Đây là phần rất “đáng tiền” cho trường THPT, giúp BGH/GV theo dõi hiệu quả học tập.

- **Todo (đề xuất theo nghiệp vụ THPT)**
  - [ ] Dashboard học sinh: tiến độ course, điểm quiz, bài tập còn thiếu
  - [ ] Dashboard GVCN: thống kê theo lớp (ai chưa hoàn thành, ai vắng học, cảnh báo)
  - [ ] Dashboard GV bộ môn: thống kê theo môn + lớp (điểm theo bài kiểm tra/quiz, phân phối điểm)
  - [ ] Báo cáo theo kỳ học: tổng hợp kết quả theo `Term` (HK1/HK2), xuất Excel/PDF
  - [ ] Nhật ký hoạt động học sinh: last accessed (từ `Enrollment.LastAccessedAt`, `LessonProgress.LastAccessedAt`)

**Cần cải thiện**

- ⚠️ Thống nhất định nghĩa “hoàn thành” course (dựa vào `CourseSetting.RequireQuizCompletion`, assignment, lesson completion).

---

### 12) Các điểm cần cải thiện tổng thể (ưu tiên kỹ thuật & vận hành)

- **Chuẩn hoá trạng thái & soft delete**
  - ⚠️ Rà soát tất cả entity có `DeletedAt`, `IsActive`, `Status` để thống nhất quy tắc lọc dữ liệu ở query.
  - ⚠️ Quy hoạch API: thay vì xóa cứng, ưu tiên soft delete (phù hợp môi trường trường học, cần truy vết).
- **Chuẩn hoá naming & conventions**
  - ⚠️ Chuẩn hoá string status (`Draft/Published/...`, `IN_PROGRESS/GRADED`) → cân nhắc enum mapping.
- **Validation & business rules (THPT)**
  - ⚠️ Ràng buộc: “học sinh chỉ thuộc 1 lớp hành chính trong 1 kỳ/năm học” (tránh dữ liệu sai).
  - ⚠️ Quy trình publish course/quiz/assignment có phê duyệt (optional) theo mô hình tổ chuyên môn.
- **Quan sát hệ thống (observability)**
  - ⚠️ Dùng `AuditLog` + `Ailog` để theo dõi hành vi, lỗi, chi phí AI theo feature. 