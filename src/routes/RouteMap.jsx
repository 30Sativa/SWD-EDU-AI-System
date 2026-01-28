import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import ScrollToTop from "../components/layout/ScrollToTop";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import Home from "../pages/Home";
import TeacherDashboard from "../feature/dashboard/teacher/pages/TeacherDashboard";
import CourseManagement from "../feature/course/teacher/pages/CourseManagement";
import StudentDashboard from "../feature/dashboard/student/pages/StudentDashboard";
import CourseDetail from "../feature/course/student/pages/CourseDetail";
import CoursesList from "../feature/course/student/pages/CoursesList";
import LessonDetail from "../feature/lesson/student/pages/LessonDetail";
import QuizList from "../feature/quiz/student/pages/QuizList";
import QuizDetail from "../feature/quiz/student/pages/QuizDetail";
import StudentProgress from "../feature/progress/student/pages/StudentProgress";
import AdminDashboard from "../feature/dashboard/admin/pages/AdminDashboard";
import RolePermission from "../feature/role-permission/admin/pages/RolePermission";
import UserManagement from "../feature/user/admin/pages/UserManagement";
import NotificationManagement from "../feature/notification/admin/pages/NotificationManagement";

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
      <Route path="dashboard">
        <Route path="teacher" element={<Sidebar userRole="teacher" />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="courses" element={<CourseManagement />} />
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
        <Route path="admin" element={<Sidebar userRole="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="roles-permissions" element={<RolePermission />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="notifications" element={<NotificationManagement />} />
        </Route>
        <Route index element={<Navigate to="/dashboard/teacher" replace />} />
      </Route>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<Fallback />} />
      </Route>
    </Routes>
  );
}
