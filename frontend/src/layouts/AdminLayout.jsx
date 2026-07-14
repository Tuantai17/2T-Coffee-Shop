import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../pages/admin/components/AdminHeader";

function AdminLayout({ children }) {
  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "var(--admin-bg)" }}>
      <AdminSidebar />
      <div 
        className="flex-grow-1 position-relative" 
        style={{ height: "100vh", overflowY: "auto" }}
      >
        <div 
          style={{ 
            position: "sticky", 
            top: 0, 
            zIndex: 10, 
            backgroundColor: "var(--admin-bg)", 
            padding: "24px 32px 16px 32px" 
          }}
        >
          <AdminHeader />
        </div>
        <main style={{ padding: "0 32px 32px 32px" }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
