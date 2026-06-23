import { Link, useLocation } from "react-router-dom";

function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: "fa-chart-pie" },
    { path: "/admin/products", label: "Quản lý sản phẩm", icon: "fa-box-open" },
    { path: "/admin/categories", label: "Quản lý danh mục", icon: "fa-folder-open" },
    { path: "/admin/banners", label: "Quản lý banner", icon: "fa-panorama" },
    { path: "/admin/collections", label: "Quản lý collection", icon: "fa-layer-group" },
    { path: "/admin/menus", label: "Quản lý menu", icon: "fa-sitemap" },
    { path: "/admin/orders", label: "Quản lý đơn hàng", icon: "fa-receipt" },
    { path: "/admin/users", label: "Quản lý người dùng", icon: "fa-users" },
  ];

  return (
    <div 
      className="p-3 d-flex flex-column h-100" 
      style={{ 
        minWidth: "260px", 
        width: "260px",
        minHeight: "100vh", 
        backgroundColor: "var(--admin-sidebar-bg)",
        color: "var(--admin-sidebar-text)",
        position: "sticky",
        top: 0
      }}
    >
      <div className="mb-4 text-center mt-2">
        <h4 className="fw-bold mb-1" style={{ color: "var(--admin-warning)" }}>Admin Panel</h4>
        <small style={{ color: "var(--admin-sidebar-muted)" }}>E-Commerce Management</small>
      </div>
      
      <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "0 0 20px 0" }} />
      
      <ul className="nav nav-pills flex-column mb-auto gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li className="nav-item" key={item.path}>
              <Link
                to={item.path}
                className="nav-link d-flex align-items-center gap-3"
                style={{
                  transition: "all 0.2s ease",
                  borderRadius: "12px",
                  padding: "12px 18px",
                  color: isActive ? "#ffffff" : "var(--admin-sidebar-muted)",
                  backgroundColor: isActive ? "var(--admin-sidebar-active)" : "transparent",
                  fontWeight: isActive ? "600" : "400"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <i 
                  className={`fa-solid ${item.icon}`} 
                  style={{ 
                    width: "20px", 
                    textAlign: "center",
                    color: isActive ? "#ffffff" : "var(--admin-sidebar-muted)" 
                  }}
                ></i>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      
      <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "20px 0" }} />
      
      <Link 
        to="/" 
        className="nav-link d-flex align-items-center gap-3"
        style={{
          borderRadius: "12px",
          padding: "12px 18px",
          color: "var(--admin-sidebar-muted)",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
          e.currentTarget.style.color = "#ffffff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--admin-sidebar-muted)";
        }}
      >
        <i className="fa-solid fa-house" style={{ width: "20px", textAlign: "center" }}></i>
        Về Trang Chủ
      </Link>
    </div>
  );
}

export default AdminSidebar;
