import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../pages/admin/components/AdminHeader";

function AdminLayout({ children }) {
  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "var(--admin-bg)" }}>
      <AdminSidebar />
      <div 
        className="flex-grow-1 position-relative" 
        style={{ 
          height: "100vh", 
          overflowY: "auto",
          padding: "24px 32px"
        }}
      >
        <AdminHeader />
        <main style={{ marginTop: "32px" }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
