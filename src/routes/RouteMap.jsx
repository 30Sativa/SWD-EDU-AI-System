import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import ScrollToTop from "../components/layout/ScrollToTop";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import StudentLayout from "../components/layout/StudentLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
// Teacher & Student routes (using features/)
import TeacherDashboard from "../features/dashboard/teacher/pages/TeacherDashboard";
import CourseManagement from "../features/course/teacher/pages/CourseManagement";
import TeacherCourseDetail from "../features/course/teacher/pages/CourseDetail";
import StudentDashboard from "../features/dashboard/student/pages/StudentDashboard";
import ClassManagement from "../features/classes/teacher/pages/ClassManagement";
import ClassStudentList from "../features/classes/teacher/pages/ClassStudentList";
import QuestionBank from "../features/question-bank/teacher/pages/QuestionBank";
import QuestionList from "../features/question-bank/teacher/pages/QuestionList";
import ManagerDashboard from "../features/dashboard/manager/pages/ManagerDashboard";
import SubjectManagement from "../features/subject/manager/pages/SubjectManagement";
import SubjectDetail from "../features/subject/manager/pages/SubjectDetail";
import GradeManagement from "../features/grade/manager/pages/GradeManagement";
import TermManagement from "../features/term/manager/pages/TermManagement";
import CourseDetail from "../features/course/student/pages/CourseDetail";
import CoursesList from "../features/course/student/pages/CoursesList";
import LessonDetail from "../features/lesson/student/pages/LessonDetail";
import QuizList from "../features/quiz/student/pages/QuizList";
import QuizDetail from "../features/quiz/student/pages/QuizDetail";
import StudentProgress from "../features/progress/student/pages/StudentProgress";
import Profile from "../features/user/pages/Profile";

// Admin routes (using features/)
import AdminDashboard from "../features/dashboard/admin/pages/AdminDashboard";
import RolePermission from "../features/role-permission/admin/pages/RolePermission";
import UserManagement from "../features/user/admin/pages/UserManagement";
import NotificationManagement from "../features/notification/admin/pages/NotificationManagement";
import AuditLogManagement from "../features/audit-log/admin/pages/AuditLogManagement";
import SystemSettings from "../features/settings/admin/pages/SystemSettings";

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
        {/* Role: Teacher */}
        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="teacher" element={<Sidebar userRole="teacher" />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="courses/:courseId" element={<TeacherCourseDetail />} />
            <Route path="classes/:classId/students" element={<ClassStudentList />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="question-bank/:folderId" element={<QuestionList />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Role: Student */}
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<CoursesList />} />
            <Route path="courses/:courseId" element={<CourseDetail />} />
            <Route path="courses/:courseId/lessons/:lessonId" element={<LessonDetail />} />
            <Route path="quizzes" element={<QuizList />} />
            <Route path="quizzes/:quizId" element={<QuizDetail />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Role: Manager */}
        <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
          <Route path="manager" element={<Sidebar userRole="manager" />}>
            <Route index element={<ManagerDashboard />} />
            <Route path="subjects" element={<SubjectManagement />} />
            <Route path="subjects/:id" element={<SubjectDetail />} />
            <Route path="grades" element={<GradeManagement />} />
            <Route path="terms" element={<TermManagement />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Role: Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="admin" element={<Sidebar userRole="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="roles-permissions" element={<RolePermission />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="notifications" element={<NotificationManagement />} />
            <Route path="audit-logs" element={<AuditLogManagement />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route index element={<Navigate to="/login" replace />} />
      </Route>

      {/* Các route có layout Header/Footer */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Các route có layout Header/Footer */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<Fallback />} />
      </Route>
    </Routes>
  );
}
