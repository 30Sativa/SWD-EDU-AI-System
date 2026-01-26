import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import ScrollToTop from "../components/layout/ScrollToTop";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import Home from "../pages/Home";
import TeacherDashboard from "../feature/dashboard/teacher/pages/TeacherDashboard";
import StudentDashboard from "../feature/dashboard/student/pages/StudentDashboard";
import CourseDetail from "../feature/course/student/pages/CourseDetail";

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
        </Route>
        <Route path="student" element={<Sidebar userRole="student" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
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
