# Map API cho Role Teacher (Giáo viên)

Tài liệu map các API hiện có với **TEACHER FLOWS**. Dùng làm cơ sở trước khi implement frontend cho giáo viên.

---

## 1. Danh sách API hiện có (từ Swagger/Backend)

### Courses
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/courses` | Danh sách khóa học |
| GET | `/api/courses/my` | Khóa học của tôi |
| GET | `/api/courses/{id}` | Chi tiết khóa học |
| POST | `/api/courses` | Tạo khóa học |
| DELETE | `/api/courses/{id}` | Xóa mềm khóa học |
| POST | `/api/courses/{id}/publish` | Publish khóa học |

### Sections (Chương / Section trong khóa)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/courses/{courseId}/sections` | Tạo section cho khóa học |
| PUT | `/api/courses/{courseId}/sections/{sectionId}` | Cập nhật section |

### Classes (Lớp học phần)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/manager/classes` | Danh sách lớp học |
| GET | `/api/manager/classes/{id}` | Chi tiết lớp học |
| POST | `/api/manager/classes` | Tạo lớp học |
| PUT | `/api/manager/classes/{id}` | Cập nhật lớp học |
| DELETE | `/api/manager/classes/{id}` | Xóa lớp học |
| PATCH | `/api/manager/classes/{id}/status` | Đổi trạng thái lớp học |

### Tham chiếu (Manager – Teacher chỉ đọc khi cần)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/manager/subjects` | Danh sách môn học |
| GET | `/api/manager/grade-levels` | Danh sách khối/lớp |
| GET | `/api/manager/terms` | Danh sách kỳ học |
| GET | `/api/manager/course-categories` | Danh sách danh mục khóa học |

---

## 2. Map API theo TEACHER FLOWS

### Flow 19: Giáo viên → Xem Dashboard → Xem các lớp được phân công

| API map | Ghi chú |
|---------|--------|
| **GET /api/courses/my** | Lấy danh sách khóa học của giáo viên → dùng cho “các lớp/khóa được phân công” trên Dashboard. |
| **GET /api/manager/classes** | Lấy danh sách lớp học (cần filter theo teacher hoặc backend trả theo role). Dùng nếu “lớp” là Class, không chỉ Course. |

**Trạng thái:** ✅ Đã implement — `TeacherDashboard.jsx` gọi `GET /api/courses/my` và `GET /api/manager/classes`, hiển thị khóa học/lớp được phân công, thống kê và bảng "Khóa học / Lớp được phân công".

---

### Flow 20: Giáo viên → Tạo khóa học mới → Chọn Khóa học Mẫu (Template) → Clone sườn

| API map | Ghi chú |
|---------|--------|
| **POST /api/courses** | Tạo khóa học mới. Body theo contract bên dưới. |
| **GET /api/manager/course-categories** | (Tùy chọn) Chọn danh mục khi tạo khóa. |
| **GET /api/manager/subjects** | Chọn môn học khi tạo khóa. |
| **GET /api/manager/grade-levels** | Chọn khối khi tạo khóa. |

**Request body (POST /api/courses):**

```json
{
  "code": "string",
  "title": "string",
  "description": "string",
  "thumbnail": "string",
  "subjectId": "uuid",
  "gradeLevelId": "uuid",
  "categoryId": "uuid",
  "level": "string",
  "language": "string",
  "price": 0,
  "discountPrice": 0,
  "totalLessons": 0,
  "totalDuration": 0
}
```

**Response:**

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": "uuid",
    "code": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "thumbnail": "string",
    "subjectId": "uuid",
    "subjectName": "string",
    "gradeLevelId": "uuid",
    "teacherId": "uuid",
    "categoryId": "uuid",
    "level": "string",
    "language": "string",
    "price": 0,
    "discountPrice": 0,
    "totalLessons": 0,
    "totalDuration": 0,
    "enrollmentCount": 0,
    "rating": 0,
    "reviewCount": 0,
    "status": "string",
    "isActive": true,
    "isFeatured": true,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

**Ghi chú (chờ BE):**  
- **Mong muốn Flow 20:** Khi teacher tạo khóa học → hệ thống **clone syllabus (sườn chương trình) theo subject** từ phần Manager đã tạo (Khóa học Mẫu / Course Template theo môn).  
- Hiện tại **chưa có** API clone syllabus theo subject; FE tạm thời **chỉ map POST /api/courses** như trên và tạo section thủ công (bước 2 form).  
- **Chờ BE:** Hỗ trợ clone syllabus theo `subjectId` (ví dụ: POST /api/courses nhận thêm `templateSubjectId` hoặc BE tự clone khi có subjectId), sau đó FE sẽ bỏ/bổ sung bước tạo section tương ứng.

**Trạng thái:** ✅ Request/response đã khớp backend; form CreateCourse gửi đúng body và lấy `data.id`. ⏳ Clone syllabus theo subject từ manager — chờ BE fix.

---

### Flow 21: Giáo viên → Soạn bài học (Lesson) → Tải tài liệu/Video → Lưu vào khóa mới

| API map | Ghi chú |
|---------|--------|
| **GET /api/courses/{id}** | Lấy chi tiết khóa (cấu trúc section/lesson) để soạn. |
| **POST /api/courses/{courseId}/sections** | Tạo section (chương) trong khóa → tương ứng “sườn bài học”. |
| **PUT /api/courses/{courseId}/sections/{sectionId}** | Cập nhật section (tên, thứ tự, v.v.). |

**Chưa có trong list:**  
- API tạo/sửa **Lesson** trong section (nếu Lesson là entity riêng).  
- API **upload tài liệu/Video** và gắn vào lesson/section.

**Trạng thái:** Phần “sườn chương” (sections) đã map; lesson + upload file cần API bổ sung hoặc xác nhận từ backend.

---

### Flow 22: Giáo viên → Gửi khóa học → Chờ Quản lý duyệt (Pending)

| API map | Ghi chú |
|---------|--------|
| *(Chưa có)* | Cần API kiểu: “Gửi duyệt” / “Submit for approval” hoặc PATCH trạng thái khóa sang Pending. Hiện chỉ thấy POST publish, không thấy submit for review. |

**Trạng thái:** Chưa có API tương ứng trong danh sách → cần backend bổ sung hoặc làm rõ (ví dụ PATCH /api/courses/{id}/status với status = Pending).

---

### Flow 23: Giáo viên → Khóa học được duyệt → Công khai (Publish) → Học sinh nhìn thấy

| API map | Ghi chú |
|---------|--------|
| **POST /api/courses/{id}/publish** | Publish khóa học → map trực tiếp bước “Công khai” sau khi được duyệt. |

**Trạng thái:** Đã map đủ cho bước Publish.

---

### Flow 24: Giáo viên → Tạo Quiz → Thêm câu hỏi → Xuất bản

| API map | Ghi chú |
|---------|--------|
| *(Chưa có)* | Không có API Quiz / Question bank / Question trong danh sách (VD: quiz, question, publish quiz). |

**Trạng thái:** Chưa có API → cần backend cung cấp (quiz, questions, publish).

---

### Flow 25: Giáo viên → Xem kết quả HS → Phân tích hiệu suất lớp

| API map | Ghi chú |
|---------|--------|
| *(Chưa có)* | Không có API kết quả học tập / điểm / thống kê hiệu suất lớp. |

**Trạng thái:** Chưa có API → cần backend cung cấp (results, analytics, reports).

---

### Flow 26: Giáo viên → Quản lý Lớp (Class) → Thêm / Xóa HS thủ công

| API map | Ghi chú |
|---------|--------|
| **GET /api/manager/classes** | Danh sách lớp (teacher chỉ thấy lớp mình phụ trách nếu backend filter). |
| **GET /api/manager/classes/{id}** | Chi tiết lớp → có thể trả về danh sách học sinh nếu backend thiết kế vậy. |
| **PUT /api/manager/classes/{id}** | Cập nhật lớp; nếu body có danh sách studentIds thì có thể dùng cho thêm/xóa HS (cần xác nhận contract). |

**Chưa có trong list:** API riêng “Thêm học sinh vào lớp” / “Xóa học sinh khỏi lớp” (VD: POST/DELETE class-members hoặc enrollments).

**Trạng thái:** ✅ Đã implement — `ClassManagement.jsx` gọi **GET /api/manager/classes** (danh sách lớp, tìm kiếm phía FE). `ClassStudentList.jsx` gọi **GET /api/manager/classes/{id}** (chi tiết lớp); danh sách HS lấy từ `data.students` / `data.enrollments` / `data.members` (tùy BE). Thêm/Xóa HS thủ công: chờ BE API riêng hoặc dùng PUT class với `studentIds` khi có contract.

---

### Flow 27: Giáo viên → Tạo mật khẩu lớp (Enrollment Key) → Gửi cho HS

| API map | Ghi chú |
|---------|--------|
| *(Chưa có hoặc chưa rõ)* | Không thấy API enrollment key / mật khẩu lớp. Có thể nằm trong PUT /api/manager/classes/{id} (field enrollmentKey) hoặc API riêng. |

**Trạng thái:** Cần xác nhận với backend (field trong Class hay endpoint riêng).

---

### Flow 28: Giáo viên → Thêm HS thủ công vào lớp → HS được ghi danh

| API map | Ghi chú |
|---------|--------|
| Giống Flow 26 | **PUT /api/manager/classes/{id}** (nếu hỗ trợ danh sách HS) hoặc API thêm/xóa thành viên lớp khi có. |

**Trạng thái:** Cùng tình trạng với Flow 26.

---

## 3. Bảng tóm tắt: API có thể dùng cho Teacher

| # | Flow | API đã map | Ghi chú |
|---|------|------------|--------|
| 19 | Dashboard – Xem lớp được phân công | GET /api/courses/my, GET /api/manager/classes | Đủ để implement |
| 20 | Tạo khóa học (có thể từ template) | POST /api/courses, GET subjects, GET grade-levels | Clone template cần làm rõ |
| 21 | Soạn bài học – Sections | GET /api/courses/{id}, POST/PUT sections | Thiếu Lesson + upload file |
| 22 | Gửi khóa duyệt (Pending) | — | Chưa có API |
| 23 | Publish khóa học | POST /api/courses/{id}/publish | Đủ |
| 24 | Tạo Quiz / Câu hỏi | — | Chưa có API |
| 25 | Kết quả HS / Phân tích | — | Chưa có API |
| 26 | Quản lý lớp – Thêm/xóa HS | GET classes, GET class by id, PUT class | Có thể dùng tạm, nên có API thành viên |
| 27 | Mật khẩu lớp (Enrollment Key) | — | Chưa rõ / chưa có |
| 28 | Thêm HS vào lớp | Như Flow 26 | Cùng API với Flow 26 |

---

## 4. API cần gọi từ frontend Teacher (ưu tiên implement)

Các API dưới đây **đã có** và nên được gọi từ các trang teacher tương ứng:

| API | Trang / Tính năng Teacher |
|-----|----------------------------|
| GET /api/courses/my | Dashboard, Quản lý khóa học (danh sách khóa của tôi) |
| GET /api/courses/{id} | Chi tiết khóa học – soạn section/lesson |
| POST /api/courses | Tạo khóa học mới |
| POST /api/courses/{courseId}/sections | Tạo section (chương) trong khóa |
| PUT /api/courses/{courseId}/sections/{sectionId} | Cập nhật section |
| POST /api/courses/{id}/publish | Nút “Công khai” khóa học |
| GET /api/manager/classes | Quản lý lớp học – danh sách lớp |
| GET /api/manager/classes/{id} | Chi tiết lớp / danh sách học sinh (nếu backend hỗ trợ) |
| PUT /api/manager/classes/{id} | Cập nhật lớp (có thể dùng cho thêm/xóa HS nếu backend hỗ trợ) |
| GET /api/manager/subjects | Form tạo khóa – chọn môn |
| GET /api/manager/grade-levels | Form tạo khóa – chọn khối |

---

## 5. Bước tiếp theo (trước khi code)

1. **Backend:** Xác nhận thêm:
   - Clone khóa từ template (Flow 20).
   - Gửi duyệt khóa – Pending (Flow 22).
   - Thêm/xóa học sinh trong lớp (Flow 26, 28): body PUT class hoặc API riêng.
   - Enrollment key (Flow 27): nằm ở đâu trong API.
2. **Frontend:** Ưu tiên implement theo thứ tự:
   - Flow 19 (Dashboard: GET /api/courses/my, có thể GET classes).
   - Flow 20 + 21 (Tạo khóa, sections: POST course, POST/PUT sections).
   - Flow 23 (Publish: POST /api/courses/{id}/publish).
   - Flow 26/28 (Lớp học: GET classes, GET class by id, PUT class khi đã rõ contract).

File này dùng làm tài liệu tham chiếu khi implement và khi trao đổi với backend.
