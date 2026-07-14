import { useNavigate } from "react-router-dom";
import { logout } from "../../../services/authService";
import { AUTH_SCOPES, getAuthSession } from "../../../utils/authStorage";
import NotificationDropdown from "./NotificationDropdown";

function AdminHeader() {
  const navigate = useNavigate();
  const { email } = getAuthSession(AUTH_SCOPES.ADMIN) || {};

  const handleLogout = () => {
    logout(AUTH_SCOPES.ADMIN);
    navigate("/admin/login");
  };

  return (
    <header 
      className="d-flex justify-content-between align-items-center"
      style={{
        padding: "16px 24px",
        zIndex: 10,
        backgroundColor: "var(--admin-surface)",
        borderRadius: "var(--admin-radius-lg)",
        boxShadow: "8px 8px 18px var(--admin-shadow-dark), -8px -8px 18px var(--admin-shadow-light)",
        border: "1px solid rgba(255, 255, 255, 0.55)"
      }}
    >
      <div className="d-flex align-items-center" style={{ width: "400px" }}>
        <div className="position-relative w-100">
          <i className="fa-solid fa-search position-absolute" style={{ top: "15px", left: "20px", color: "var(--admin-muted)" }}></i>
          <input 
            type="text" 
            className="neu-input ps-5" 
            placeholder="Tìm kiếm sản phẩm, đơn hàng, người dùng..." 
          />
        </div>
      </div>

      <div className="d-flex align-items-center gap-4">
        <NotificationDropdown />

        <div className="dropdown">
          <div 
            className="d-flex align-items-center gap-3 cursor-pointer" 
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ cursor: "pointer" }}
          >
            <div className="text-end d-none d-md-block">
              <div className="fw-bold text-dark">{email || "Admin"}</div>
              <div className="small text-muted">Quản trị viên</div>
            </div>
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white bg-primary shadow-sm"
              style={{ width: "45px", height: "45px" }}
            >
              {email ? email.charAt(0).toUpperCase() : "A"}
            </div>
            <i className="fa-solid fa-chevron-down text-muted small"></i>
          </div>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 mt-2">
            <li>
              <button className="dropdown-item py-2" type="button">
                <i className="fa-regular fa-user me-2 text-muted"></i> Hồ sơ cá nhân
              </button>
            </li>
            <li>
              <button className="dropdown-item py-2" type="button">
                <i className="fa-solid fa-gear me-2 text-muted"></i> Cài đặt
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item py-2 text-danger" type="button" onClick={handleLogout}>
                <i className="fa-solid fa-arrow-right-from-bracket me-2"></i> Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
