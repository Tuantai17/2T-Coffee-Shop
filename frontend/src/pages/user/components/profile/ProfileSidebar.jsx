import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../../../services/authService";
import { AUTH_SCOPES } from "../../../../utils/authStorage";

function ProfileSidebar({ profile }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout(AUTH_SCOPES.USER);
    navigate("/login");
  };

  const displayName = profile?.userDetails
    ? `${profile.userDetails.firstName} ${profile.userDetails.lastName}`
    : profile?.userName || "Thành viên";

  const email = profile?.userDetails?.email || profile?.userName;
  const roleName = profile?.role?.roleName === "ROLE_USER" ? "Thành viên" : (profile?.role?.roleName || "Thành viên");

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
      <div className="text-center mb-4 pb-3 border-bottom">
        <div className="position-relative d-inline-block mb-3">
          <img
            src="https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0b1c55&color=fff&size=100"
            alt="Avatar"
            className="rounded-circle border border-2 border-white shadow-sm"
            style={{ width: "90px", height: "90px", objectFit: "cover" }}
          />
        </div>
        <h5 className="fw-bold mb-1 text-dark text-truncate" title={displayName}>{displayName}</h5>
        <p className="text-muted small mb-2 text-truncate" title={email}>{email}</p>
        <span className="badge text-dark fw-medium px-3 py-1" style={{ backgroundColor: "#ffcf00", borderRadius: "12px" }}>
          <i className="fa-solid fa-crown me-1 small"></i> {roleName}
        </span>
      </div>

      <nav className="nav flex-column gap-2">
        <Link
          to="/profile"
          className={`nav-link px-3 py-2 rounded-3 d-flex align-items-center fw-medium ${location.pathname === "/profile" ? "bg-danger text-white" : "text-dark"}`}
          style={{ transition: "all 0.2s" }}
        >
          <i className="fa-solid fa-user me-3" style={{ width: "20px", textAlign: "center" }}></i> Thông tin tài khoản
        </Link>
        <button
          onClick={handleLogout}
          className="nav-link px-3 py-2 rounded-3 d-flex align-items-center text-dark bg-transparent border-0 text-start w-100 fw-medium"
          style={{ transition: "all 0.2s" }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket me-3" style={{ width: "20px", textAlign: "center" }}></i> Đăng xuất
        </button>
      </nav>
    </div>
  );
}

export default ProfileSidebar;
