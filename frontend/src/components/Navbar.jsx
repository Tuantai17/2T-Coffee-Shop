import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { AUTH_SCOPES, getAuthSession } from "../utils/authStorage";
import HomeMenu from "../pages/user/components/home/HomeMenu";

function Navbar() {
  const navigate = useNavigate();
  const { token, role, email } = getAuthSession(AUTH_SCOPES.USER);

  const handleLogout = () => {
    logout(AUTH_SCOPES.USER);
    alert("Đã đăng xuất thành công!");
    navigate("/login");
  };

  return (
    <header className="sticky-top shadow-sm">
      {/* Top Utility Bar */}
      <div className="text-white py-2 px-3" style={{ backgroundColor: "#0b1c55", fontSize: "0.85rem", fontWeight: "500" }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span style={{ color: "#ffcf00", fontSize: "1rem" }}>
              <i className="fa-solid fa-truck-fast"></i>
            </span>
            <span>Giao hàng hỏa tốc 4 tiếng</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ color: "#ffcf00", fontSize: "1rem" }}>
              <i className="fa-solid fa-users"></i>
            </span>
            <span>Chương trình thành viên</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ color: "#ffcf00", fontSize: "1rem" }}>
              <i className="fa-solid fa-circle-dollar-to-slot"></i>
            </span>
            <span>Mua hàng trả góp</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ color: "#ffcf00", fontSize: "1rem" }}>
              <i className="fa-solid fa-store"></i>
            </span>
            <span>Hệ thống 200 cửa hàng</span>
          </div>
        </div>
      </div>

      {/* Main Header (Red Background) */}
      <div style={{ backgroundColor: "#ce1f28" }} className="pt-3 pb-2">
        <div className="container d-flex flex-column gap-3">
          {/* Top Row: Logo, Search, User Controls */}
          <div className="d-flex justify-content-between align-items-center">
            {/* Logo */}
            <Link className="navbar-brand text-decoration-none" to="/" style={{ marginRight: "2rem" }}>
              <span className="fw-extrabold fs-2 text-white position-relative" style={{ fontFamily: "'Fredoka One', 'Plus Jakarta Sans', sans-serif", textShadow: "3px 3px 0px #a1141c, -1px -1px 0px #a1141c, 1px -1px 0px #a1141c, -1px 1px 0px #a1141c, 1px 1px 0px #a1141c", letterSpacing: "1px" }}>
                My<span style={{ color: "#ffcf00" }}>KINGDOM</span>
              </span>
            </Link>

            {/* Search Bar */}
            <div className="flex-grow-1 position-relative" style={{ maxWidth: "600px", margin: "0 auto" }}>
              <div className="input-group">
                <span className="input-group-text bg-white border-0 rounded-start-pill ps-3 pe-2 text-danger">
                  <i className="fa-solid fa-magnifying-glass" style={{ color: "#ce1f28" }}></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 rounded-end-pill py-2.5 shadow-none"
                  placeholder="Nhập từ khóa để tìm kiếm (ví dụ: lắp ráp, mô hình, ba lô,...)"
                  style={{ fontSize: "0.95rem" }}
                />
              </div>
            </div>

            {/* User Controls */}
            <div className="d-flex align-items-center gap-4 text-white ms-4">
              {/* Login / User */}
              {token ? (
                <div className="dropdown">
                  <button className="btn text-white fw-semibold d-flex align-items-center gap-2 border-0 p-0 shadow-none dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="fa-solid fa-user bg-white text-danger rounded-circle p-1"></i>
                    <span>{email.split('@')[0]}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2">
                    {(role === "ROLE_ADMIN" || role === "ROLE_STAFF") && (
                      <li>
                        <Link to="/admin" className="dropdown-item py-2 fw-semibold text-danger">
                          <i className="fa-solid fa-user-shield me-2"></i> Admin Panel
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link to="/profile" className="dropdown-item py-2 fw-semibold">
                        <i className="fa-solid fa-user-gear me-2 text-muted"></i> Tài khoản
                      </Link>
                    </li>
                    <li>
                      <Link to="/orders" className="dropdown-item py-2 fw-semibold">
                        <i className="fa-solid fa-receipt me-2 text-muted"></i> Đơn hàng
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item py-2 fw-semibold text-danger" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="text-white text-decoration-none d-flex align-items-center gap-2 fw-semibold">
                  <i className="fa-solid fa-user bg-white text-danger rounded-circle p-1" style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}></i>
                  <span>Đăng nhập</span>
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="text-white text-decoration-none d-flex align-items-center gap-2 fw-semibold">
                <i className="fa-solid fa-basket-shopping fs-5"></i>
                <span>Giỏ hàng</span>
              </Link>

              {/* Language / Region */}
              <div className="d-flex align-items-center gap-1 border border-white p-1 rounded" style={{ cursor: "pointer" }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg" width="20" height="14" alt="VN" style={{ objectFit: "cover" }} />
                <i className="fa-solid fa-caret-down" style={{ fontSize: "12px" }}></i>
              </div>
            </div>
          </div>

        </div>
      </div>
      <HomeMenu />
    </header>
  );
}

export default Navbar;
