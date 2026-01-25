import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import ScrollToTop from "../components/layout/ScrollToTop";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";

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
  <div style={{ padding: 24, fontSize: 16 }}>App is up </div>
);

export default function RouteMap() {
  return (
    <Routes>
      <Route path="dashboard">
        <Route path="teacher" element={<Sidebar />}>
          <Route index element={<Dashboard />} />
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
