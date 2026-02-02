# Kiến thức Frontend trong Project SWD-EDU-AI-System

File này tổng hợp toàn bộ các công nghệ, thư viện, cấu trúc và nguyên lý đang được sử dụng trong dự án này.

## 1. Tech Stack (Công nghệ cốt lõi)

- **Library**: `React` (v19) - Phiên bản mới nhất của React với các tính năng Concurrent Mode mặc định.
  - Sử dụng 100% **Functional Components**.
  - **React Hooks**: `useState`, `useEffect`, `useMemo`, `useParams`, `useLocation`...
- **Build Tool**: `Vite` (v7) - Công cụ build cực nhanh, hỗ trợ HMR (Hot Module Replacement) ngay lập tức.
- **Language**: `JavaScript` (.jsx) - Dự án sử dụng JS thuần với cú pháp JSX.
- **Routing**: `react-router-dom` (v7) - Quản lý điều hướng trang.
  - Sử dụng `Routes`, `Route`, `Outlet`, `Link`, `useNavigate`.
  - Kiến thức về **Nested Routes** (Route lồng nhau) để chia Layout.
  - **Dynamic Routing**: (ví dụ `/courses/:id`).

## 2. Giao diện & Styling (UI/UX)

Dự án kết hợp giữa **Tailwind CSS** (chính) và các thư viện UI bổ trợ:

- **Tailwind CSS 4**:
  - Sử dụng `@tailwindcss/vite` plugin.
  - Tư duy **Utility-first**.
  - **Color Palette Project**:
    - **Primary**: `#0487e2` (Màu xanh chủ đạo cho Nút, Icon, Progress).
    - **Secondary**: `#0463ca` (Hover, Tiêu đề đậm).
    - **Accent**: `#09b1ec` (Badge, Decor).
    - **Background**: `bg-slate-50` (Nền xám nhạt hiện đại).
  - **Responsive**: `sm:`, `md:`, `lg:` breakpoints.
  - **Flexbox & Grid**: Layout chính.

- **Lucide React**: Bộ icon chính (nhẹ, hiện đại, open source).
  - Ví dụ: `GraduationCap`, `BookOpen`, `Clock`, `ArrowRight`...

- **Ant Design (antd v6)** & **@ant-design/icons**:
  - Dùng cho các component quản trị phức tạp (Table, Modal, DatePicker) khi cần.

## 3. Xử lý Logic & Dữ liệu

- **Recharts**: Thư viện vẽ biểu đồ chính.
  - `AreaChart`: Biểu đồ vùng (Gradient Blue).
  - `LineChart`, `BarChart`, `PieChart`.
  - Tùy biến `Tooltip` custom, `CartesianGrid`.

- **XLSX (SheetJS)**:
  - Xử lý file Excel (Đọc/Ghi) cho tính năng Import/Export danh sách học sinh/điểm.

## 4. Kiến trúc dự án (Architecture)

Dự án áp dụng kiến trúc **Feature-based** phân chia theo Role:

### Routing Structure (`src/routes/RouteMap.jsx`)
1. **Student Routing (Top-level)**:
   - Base Path: `/student`
   - Layout: [`StudentLayout`](src/components/layout/StudentLayout.jsx) (Logo riêng, Menu ngang).
   - Pages: `/student`, `/student/courses`, `/student/quizzes`...
   
2. **Dashboard Routing (Nested)**:
   - Base Path: `/dashboard/:role` (teacher, manager, admin)
   - Layout: `Sidebar Layout` (Menu dọc bên trái).
   - Pages: Dashboard tương ứng theo role.

### Cấu trúc thư mục (`src/`)
- **features/**: Logic nghiệp vụ chia theo domain (`dashboard`, `course`, `lesson`, `quiz`...).
- **components/**: UI chung (`layout`, `common`).
- **routes/**: Cấu hình Route tập trung.

## 5. Patterns & Best Practices

- **Role-based Access Control (RBAC)**: Check role trước khi render nội dung Dashboard.
- **Layout Pattern**: Tách `Layout` (Header, Sidebar) khỏi `Page Content` bằng `<Outlet />`.
- **Mock Data**: Dữ liệu mẫu (JSON array) được đặt trực tiếp trong component để demo UI nhanh chóng.
- **UI Consistency**:
  - Stats Card: Số hiển thị lớn (`text-4xl`), đậm, margin thoáng.
  - Navigation: Active state sử dụng Border Bottom (`border-b-2`) thay vì Background color.

## 6. Luồng người dùng (User Flows)

1. **Student Flow**:
   - Vào `/student` -> Xem tổng quan (Chart, Deadline).
   - Vào `/student/courses` -> Chọn khóa học -> Xem chi tiết khóa -> Vào học (`LessonDetail`).
   
2. **Teacher Flow**:
   - Vào `/dashboard/teacher` -> Xem lớp chủ nhiệm, lịch dạy.
   
3. **Manager Flow**:
   - Vào `/dashboard/manager` -> Xem thống kê toàn trường.

## 7. Kiến thức JavaScript/ES6+ quan trọng
- **ES Modules**: Import/Export.
- **Destructuring**: `const { id } = useParams()`.
- **Spread Operator**: `...props`.
- **Array Methods**: `.map()`, `.filter()`, `.reduce()`.
- **Optional Chaining**: `user?.name`.
