# Kiến thức Frontend trong Project SWD-EDU-AI-System

File này tổng hợp toàn bộ các công nghệ, thư viện, cấu trúc và nguyên lý đang được sử dụng trong dự án này.

## 1. Tech Stack (Công nghệ cốt lõi)

- **Library**: `React` (v19) - Phiên bản mới nhất của React với các tính năng Concurrent Mode mặc định.
- **Build Tool**: `Vite` (v7) - Công cụ build cực nhanh, hỗ trợ HMR (Hot Module Replacement) ngay lập tức.
- **Language**: `JavaScript` (.jsx) - Dự án sử dụng JS thuần với cú pháp JSX.
- **Routing**: `react-router-dom` (v7) - Quản lý điều hướng trang, sử dụng cấu trúc `Routes`, `Route` và `Outlet`.

## 2. Styling (Giao diện & Styles)

Dự án kết hợp giữa **Tailwind CSS** (chính) và **Ant Design** (bổ trợ):

- **Tailwind CSS 4**:
  - Sử dụng `@tailwindcss/vite` plugin.
  - Styles được viết trực tiếp trong className (Utility-first).
  - Config màu sắc/theme nằm trong CSS variables hoặc mặc định của Tailwind.
  - Các class thường dùng: `flex`, `grid`, `rounded-2xl`, `bg-white`, `border-gray-100`, `shadow-sm`, `text-blue-600`...
  
- **Ant Design (antd v6)**:
  - Có thể được sử dụng cho các component phức tạp như Table, Modal, Button (nếu cần nhất quán styles enterprise).
  - Icons: `@ant-design/icons` (bộ icon của Antd).

- **Lucide React**:
  - Bộ icon chính được dùng trong giao diện Dashboard (nhẹ, đẹp, hiện đại).
  - Ví dụ: `BookOpen`, `Clock`, `ArrowRight`.

## 3. Kiến trúc dự án (Architecture)

Dự án áp dụng kiến trúc **Feature-based** (dựa trên tính năng) kết hợp phân quyền (Role-based):

### Cấu trúc thư mục (`src/`)
- **features/**: Chứa toàn bộ logic nghiệp vụ, chia theo domain.
  - Ví dụ: `dashboard`, `course`, `classes`, `quiz`, `user`...
  - Trong mỗi feature thường chia nhỏ theo role: `student`, `teacher`, `manager`, `admin`.
  - Mỗi role folder có `pages/` riêng.
- **components/**: Các UI components dùng chung (Global).
  - `layout/`: Sidebar, Header, Footer, Layout Wrappers.
- **routes/**: Cấu hình routing tập trung (`RouteMap.jsx`).
- **pages/**: Các trang chung không thuộc feature cụ thể (ví dụ: `Home`, `Login` - nếu có).

### Layout System
Dự án sử dụng Nested Routes để chia Layout:
1. **Public Layout**: Header + Footer (Dành cho trang chủ).
2. **Dashboard Layout**:
   - Sidebar + Header + Content Area.
   - Các layout riêng biệt cho từng role:
     - `Sidebar` (Teacher/Manager/Admin)
     - `StudentLayout` (Student)

## 4. Các thư viện hỗ trợ khác

- **Recharts**: Vẽ biểu đồ (LineChart, BarChart...) - Dùng trong Dashboard để hiển thị thống kê học tập.
- **xlsx**: Xử lý file Excel (Import/Export dữ liệu).
- **ESLint**: Linter để kiểm tra lỗi code và quy chuẩn.

## 5. Patterns & Best Practices đang dùng

- **Functional Components & Hooks**: Chỉ sử dụng React Hooks (`useState`, `useEffect`...).
- **Mock Data**: Hiện tại dữ liệu (stats, danh sách khóa học, chart data) đang được hardcode trực tiếp trong file (ví dụ `StudentDashboard.jsx`).
- **Separation of Concerns**:
  - Logic hiển thị tách biệt theo feature.
  - Layout tách biệt khỏi Page content.
- **Responsive Design**: Mobile-first hoặc Desktop-first tùy trang, sử dụng các prefix `sm:`, `md:`, `lg:` của Tailwind.

## 6. Ghi chú luồng Role (Role-based Flow)

Dự án phân chia rõ ràng 4 luồng người dùng:
1. **Student**: Tập trung vào Dashboard học tập, xem khóa học, làm bài quiz, xem tiến độ.
2. **Teacher**: Quản lý lớp học, học sinh, tạo khóa học, chấm điểm.
3. **Manager**: Quản lý chung (sẽ được mở rộng).
4. **Admin**: Quản lý cấu hình hệ thống, roles, users, audit logs.

Hiện tại Routing đã cấu hình sẵn đường dẫn `/dashboard/:role` để map tới đúng giao diện của role đó.

## 7. Cập nhật mới nhất (Recent Updates)
- **UI/UX Refactoring**:
  - Áp dụng Color Palette mới: Primary Blue (`#0487e2`), Secondary (`#0463ca`).
  - Giao diện Dashboard được làm sạch, sử dụng nền `bg-slate-50`.
  - Thống nhất style hiển thị Stats Card (số to, bold, margin thoáng).
  - Navigation styles chuyển từ background active sang border-bottom active tinh tế hơn.
- **Routing Structure Changes**:
  - Chuyển `Student Dashboard` ra khỏi nested route `/dashboard`.
  - Đường dẫn mới cho học sinh: `/student`, `/student/courses`... (Top-level route).
  - Các role Teacher, Manager, Admin vẫn giữ cấu trúc `/dashboard/:role`.
- **Component Updates**:
  - `StudentHeader`: Đã thêm Logo riêng, đồng bộ style với Sidebar.
  - `StudentDashboard`: Cập nhật Chart (AreaChart với Gradient) và UI tổng quan.
