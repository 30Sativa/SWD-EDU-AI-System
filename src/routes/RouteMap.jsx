import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import ScrollToTop from "../components/layout/ScrollToTop";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import Home from "../pages/Home";

// Teacher & Student routes (using features/)
import TeacherDashboard from "../features/dashboard/teacher/pages/TeacherDashboard";
import CourseManagement from "../features/course/teacher/pages/CourseManagement";
import StudentDashboard from "../features/dashboard/student/pages/StudentDashboard";
import ClassManagement from "../features/classes/teacher/pages/ClassManagement";
import ManagerDashboard from "../features/dashboard/manager/pages/ManagerDashboard";
import CourseDetail from "../features/course/student/pages/CourseDetail";
import CoursesList from "../features/course/student/pages/CoursesList";
import LessonDetail from "../features/lesson/student/pages/LessonDetail";
import QuizList from "../features/quiz/student/pages/QuizList";
import QuizDetail from "../features/quiz/student/pages/QuizDetail";
import StudentProgress from "../features/progress/student/pages/StudentProgress";

// Admin routes (using feature/)
import AdminDashboard from "../feature/dashboard/admin/pages/AdminDashboard";
import RolePermission from "../feature/role-permission/admin/pages/RolePermission";
import UserManagement from "../feature/user/admin/pages/UserManagement";
import NotificationManagement from "../feature/notification/admin/pages/NotificationManagement";
import AuditLogManagement from "../feature/audit-log/admin/pages/AuditLogManagement";
import SystemSettings from "../feature/settings/admin/pages/SystemSettings";

const Layout = () => (
  <div className="flex flex-col min-h-screen">
    <ScrollToTop />
    <Header />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const Fallback = () => (
  <div style={{ padding: 24, fontSize: 16 }}> </div>
);

export default function RouteMap() {
  return (
    <Routes>
      {/* Các route có layout Dashboard */}
      <Route path="dashboard">
        <Route path="teacher" element={<Sidebar userRole="teacher" />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="classes" element={<ClassManagement />} />
        </Route>
        <Route path="student" element={<Sidebar userRole="student" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<CoursesList />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route path="courses/:courseId/lessons/:lessonId" element={<LessonDetail />} />
          <Route path="quizzes" element={<QuizList />} />
          <Route path="quizzes/:quizId" element={<QuizDetail />} />
          <Route path="progress" element={<StudentProgress />} />
        </Route>
        <Route path="manager" element={<Sidebar userRole="manager" />}>
          <Route index element={<ManagerDashboard />} />
        </Route>
        <Route path="admin" element={<Sidebar userRole="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="roles-permissions" element={<RolePermission />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="audit-logs" element={<AuditLogManagement />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
        <Route index element={<Navigate to="/dashboard/teacher" replace />} />
      </Route>

      {/* Các route có layout Header/Footer */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<Fallback />} />
      </Route>
    </Routes>
  );
}
