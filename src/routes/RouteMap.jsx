import { Routes, Route, Outlet } from "react-router-dom";
import ScrollToTop from "../components/layout/ScrollToTop";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Home from "../pages/Home";

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
      <Route element={<Layout />}>
        <Route index element={<Home />} />      
        <Route path="*" element={<Fallback />} />
      </Route>
    </Routes>
  );
}
