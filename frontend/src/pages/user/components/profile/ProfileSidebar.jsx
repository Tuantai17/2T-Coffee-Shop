import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../../../services/authService";
import { AUTH_SCOPES } from "../../../../utils/authStorage";
import loyaltyApi from "../../../../api/loyaltyApi";

function ProfileSidebar({ profile, refreshKey = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loyaltyAccount, setLoyaltyAccount] = useState(null);

  useEffect(() => {
    loyaltyApi.getMyLoyaltyAccount()
      .then(res => setLoyaltyAccount(res?.data || null))
      .catch(() => {});
  }, [refreshKey]);

  const handleLogout = () => {
    logout(AUTH_SCOPES.USER);
    navigate("/login");
  };

  const displayName = profile?.userDetails
    ? `${profile.userDetails.firstName || ""} ${profile.userDetails.lastName || ""}`.trim() || profile?.userName
    : profile?.userName || "Thành viên";
    
  const avatarUrl = profile?.userDetails?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=c67c4e&color=fff&size=150`;

  const email = profile?.userDetails?.email || profile?.userName;
  
  // Use real loyalty data from API
  const currentTierCode = loyaltyAccount?.currentTierCode || "SILVER";
  const currentTierName = loyaltyAccount?.currentTierName || currentTierCode;
  const currentTierColor = loyaltyAccount?.currentTierColor || "#C0C0C0";
  const currentPoints = loyaltyAccount?.availablePoints ?? profile?.loyaltyPoints ?? 0;
  const nextTierCode = loyaltyAccount?.nextTierCode || null;
  const nextTierName = loyaltyAccount?.nextTierName || null;
  const nextTierMinSpending = loyaltyAccount?.nextTierMinSpending || 0;
  
  // Progress: 1 point = 1,000đ, so nextTierPointsNeeded = nextTierMinSpending / 1000
  const nextTierPointsNeeded = nextTierMinSpending > 0 ? Math.ceil(nextTierMinSpending / 1000) : 0;
  const pointsToNextTier = nextTierCode ? Math.max(0, nextTierPointsNeeded - currentPoints) : 0;
  const progressPercent = nextTierPointsNeeded > 0 
    ? Math.min(100, Math.round((currentPoints / nextTierPointsNeeded) * 100)) 
    : 100;

  // Get tier medal image
  const getTierImage = (code) => {
    const c = (code || '').toUpperCase();
    if (c === 'DIAMOND') return '/images/diamond-medal.png';
    if (c === 'PLATINUM') return '/images/platinum-medal.png';
    if (c === 'GOLD') return '/images/gold-medal.png';
    return '/images/silver-medal.png';
  };

  const menuItems = [
    { path: "/profile", label: "Tổng quan tài khoản", icon: "fa-solid fa-house-user", exact: true },
    { path: "/profile/info", label: "Thông tin cá nhân", icon: "fa-regular fa-user" },
    { path: "/profile/orders", label: "Đơn hàng của tôi", icon: "fa-solid fa-receipt" },
    { path: "/profile/loyalty", label: "Loyalty", icon: "fa-solid fa-crown" },
    { path: "/profile/vouchers", label: "Voucher của tôi", icon: "fa-solid fa-ticket" },
    { path: "/profile/addresses", label: "Địa chỉ giao hàng", icon: "fa-solid fa-location-dot" },
    { path: "#notification", label: "Thông báo", icon: "fa-regular fa-bell" },
    { path: "/profile/minigame", label: "Mini Game", icon: "fa-solid fa-gamepad" },
    { path: "/profile/checkin", label: "Điểm danh mỗi ngày", icon: "fa-regular fa-calendar-check" },
    { path: "#password", label: "Đổi mật khẩu", icon: "fa-solid fa-key" },
    { path: "#settings", label: "Cài đặt", icon: "fa-solid fa-gear" }
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    if (path.startsWith("#")) return false; // not implemented yet
    return location.pathname.includes(path);
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4 bg-white" style={{ position: "sticky", top: "80px", zIndex: 10 }}>
      {/* User Avatar & Info */}
      <div className="p-4 text-center">
        <div className="position-relative d-inline-block mb-3">
          <img
            src={avatarUrl}
            alt="Profile Avatar"
            className="rounded-circle border border-2 shadow-sm profile-avatar"
            style={{ width: "96px", height: "96px", objectFit: "cover", borderColor: "#f0ebe5" }}
          />
          <div 
            className="position-absolute bg-dark text-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer shadow-sm"
            style={{ width: "28px", height: "28px", bottom: "0", right: "0", border: "2px solid #fff" }}
            title="Đổi ảnh đại diện"
          >
            <i className="fa-solid fa-camera" style={{ fontSize: "10px" }}></i>
          </div>
        </div>
        <h5 className="fw-bold mb-1 text-dark text-truncate" title={displayName}>{displayName}</h5>
        <p className="text-muted small mb-3 text-truncate" title={email}>{email}</p>
        
        {/* Loyalty Badge - dynamic from API */}
        <div className="bg-light rounded-pill d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 border">
          <img src={getTierImage(currentTierCode)} alt={currentTierName} style={{ width: "16px" }} onError={(e) => e.target.style.display = 'none'} />
          <span className="fw-bold" style={{ fontSize: "12px", letterSpacing: "1px", color: currentTierColor }}>
            {currentTierName?.toUpperCase()}
          </span>
        </div>
        
        {/* Loyalty Progress - dynamic from API */}
        <div className="text-start">
          <div className="fw-bold text-dark text-center mb-1" style={{ fontSize: "14px" }}>
            {currentPoints.toLocaleString("vi-VN")} điểm
          </div>
          {nextTierCode ? (
            <div className="text-muted text-center mb-2" style={{ fontSize: "11px" }}>
              {pointsToNextTier.toLocaleString("vi-VN")} điểm nữa để lên hạng <span className="fw-bold" style={{ color: currentTierColor }}>{nextTierName?.toUpperCase()}</span>
            </div>
          ) : (
            <div className="text-center mb-2" style={{ fontSize: "11px", color: currentTierColor }}>
              <i className="fa-solid fa-medal me-1"></i> Hạng cao nhất
            </div>
          )}
          <div className="progress rounded-pill bg-light border" style={{ height: "6px" }}>
            <div 
              className="progress-bar rounded-pill" 
              role="progressbar" 
              style={{ width: `${progressPercent}%`, backgroundColor: currentTierColor || "#c67c4e" }} 
              aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>

      <hr className="m-0" style={{ borderColor: "#f0ebe5" }} />

      {/* Navigation Menu */}
      <div className="p-3">
        <nav className="nav flex-column gap-1 sidebar-nav">
          {menuItems.map((item, index) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={index}
                to={item.path}
                className={`nav-link px-3 py-2 rounded-3 d-flex align-items-center fw-medium ${active ? "active-link" : "text-muted hover-link"}`}
                style={{ 
                  transition: "all 0.2s",
                  backgroundColor: active ? "#fdf2e9" : "transparent",
                  color: active ? "#c67c4e" : "#555",
                  fontSize: "14px"
                }}
              >
                <i className={`${item.icon} me-3`} style={{ width: "20px", textAlign: "center", fontSize: "16px", color: active ? "#c67c4e" : "#888" }}></i> 
                {item.label}
              </Link>
            );
          })}
          
          <div className="mt-2 pt-2 border-top">
            <button
              onClick={handleLogout}
              className="nav-link px-3 py-2 rounded-3 d-flex align-items-center text-danger bg-transparent border-0 text-start w-100 fw-medium hover-link-danger"
              style={{ transition: "all 0.2s", fontSize: "14px" }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket me-3" style={{ width: "20px", textAlign: "center", fontSize: "16px" }}></i> 
              Đăng xuất
            </button>
          </div>
        </nav>
      </div>

      <style>{`
        .sidebar-nav .hover-link:hover {
          background-color: #f8f9fa !important;
          color: #c67c4e !important;
        }
        .sidebar-nav .hover-link:hover i {
          color: #c67c4e !important;
        }
        .sidebar-nav .hover-link-danger:hover {
          background-color: #fff5f5 !important;
        }
        .profile-avatar {
          transition: transform 0.3s ease;
        }
        .profile-avatar:hover {
          transform: scale(1.05);
        }
        .active-link {
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
}

export default ProfileSidebar;
