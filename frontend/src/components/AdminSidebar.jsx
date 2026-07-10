import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function AdminSidebar() {
  const location = useLocation();
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(
    location.pathname.includes("/admin/loyalty")
  );
  const [isGamificationOpen, setIsGamificationOpen] = useState(
    location.pathname.includes("/admin/check-in") || location.pathname.includes("/admin/mini-games")
  );

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: "fa-chart-pie" },
    { path: "/admin/products", label: "Quản lý sản phẩm", icon: "fa-box-open" },
    { path: "/admin/categories", label: "Quản lý danh mục", icon: "fa-folder-open" },
    { path: "/admin/toppings", label: "Quản lý Topping", icon: "fa-ice-cream" },
    { path: "/admin/option-groups", label: "Quản lý Option", icon: "fa-sliders" },
    { path: "/admin/posts", label: "Quản lý bài viết", icon: "fa-newspaper" },
    { path: "/admin/post-categories", label: "Chuyên mục bài viết", icon: "fa-tags" },
    { path: "/admin/banners", label: "Quản lý banner", icon: "fa-panorama" },
    { path: "/admin/collections", label: "Quản lý collection", icon: "fa-layer-group" },
    { path: "/admin/menus", label: "Quản lý menu", icon: "fa-sitemap" },
    { path: "/admin/orders", label: "Quản lý đơn hàng", icon: "fa-receipt" },
    { path: "/admin/users", label: "Quản lý người dùng", icon: "fa-users" },
  ];

  const loyaltyItems = [
    { path: "/admin/loyalty/dashboard", label: "Tổng quan", icon: "fa-chart-line" },
    { path: "/admin/loyalty/members", label: "Thành viên", icon: "fa-users-gear" },
    { path: "/admin/loyalty/tiers", label: "Hạng thành viên", icon: "fa-ranking-star" },
    { path: "/admin/loyalty/rules", label: "Quy tắc tích điểm", icon: "fa-scale-balanced" },
    { path: "/admin/loyalty/rewards", label: "Quản lý đổi thưởng", icon: "fa-gift" },
    { path: "/admin/vouchers", label: "Voucher", icon: "fa-ticket" },
  ];

  const gamificationItems = [
    { path: "/admin/check-in/dashboard", label: "Điểm danh hằng ngày", icon: "fa-calendar-check" },
    { path: "/admin/check-in/missions", label: "Nhiệm vụ", icon: "fa-bullseye" },
    { path: "/admin/check-in/reward-cycles", label: "Chu kỳ Phần thưởng", icon: "fa-gift" },
    { path: "/admin/mini-games", label: "Mini Game", icon: "fa-gamepad" },
    { path: "/admin/check-in/achievements", label: "Thành tích", icon: "fa-medal" },
  ];

  const renderMenuItem = (item, isSubItem = false) => {
    const isActive = location.pathname === item.path;
    return (
      <li className="nav-item" key={item.path}>
        <Link
          to={item.path}
          className="nav-link d-flex align-items-center gap-3"
          style={{
            transition: "all 0.2s ease",
            borderRadius: "12px",
            padding: isSubItem ? "10px 18px 10px 45px" : "12px 18px",
            color: isActive ? "#ffffff" : "var(--admin-sidebar-muted)",
            backgroundColor: isActive ? "var(--admin-sidebar-active)" : "transparent",
            fontWeight: isActive ? "600" : "400",
            fontSize: isSubItem ? "14px" : "15px"
          }}
          onMouseEnter={(e) => {
            if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={(e) => {
            if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {!isSubItem && (
            <i 
              className={`fa-solid ${item.icon}`} 
              style={{ 
                width: "20px", 
                textAlign: "center",
                color: isActive ? "#ffffff" : "var(--admin-sidebar-muted)" 
              }}
            ></i>
          )}
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <div 
      className="p-3 d-flex flex-column custom-scrollbar-sidebar" 
      style={{ 
        minWidth: "260px", 
        width: "260px",
        height: "100vh", 
        backgroundColor: "var(--admin-sidebar-bg)",
        color: "var(--admin-sidebar-text)",
        position: "sticky",
        top: 0,
        overflowY: "auto"
      }}
    >
      <style>{`
        .custom-scrollbar-sidebar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar-sidebar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-sidebar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
      `}</style>
      <div className="mb-4 text-center mt-2">
        <h4 className="fw-bold mb-1" style={{ color: "var(--admin-warning)" }}>Admin Panel</h4>
        <small style={{ color: "var(--admin-sidebar-muted)" }}>E-Commerce Management</small>
      </div>
      
      <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "0 0 20px 0" }} />
      
      <ul className="nav nav-pills flex-column mb-auto gap-2">
        {menuItems.map(item => renderMenuItem(item))}

        {/* LOYALTY & THÀNH VIÊN Submenu */}
        <li className="nav-item mt-2">
          <div
            className="nav-link d-flex align-items-center justify-content-between gap-3"
            style={{
              cursor: "pointer",
              borderRadius: "12px",
              padding: "12px 18px",
              color: isLoyaltyOpen ? "#ffffff" : "var(--admin-sidebar-muted)",
              fontWeight: isLoyaltyOpen ? "600" : "400",
              transition: "all 0.2s ease"
            }}
            onClick={() => setIsLoyaltyOpen(!isLoyaltyOpen)}
            onMouseEnter={(e) => {
              if (!isLoyaltyOpen) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              if (!isLoyaltyOpen) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <i className="fa-solid fa-crown text-warning" style={{ width: "20px", textAlign: "center" }}></i>
              LOYALTY & THÀNH VIÊN
            </div>
            <i className={`fa-solid fa-chevron-${isLoyaltyOpen ? 'down' : 'right'} small`}></i>
          </div>
          
          {isLoyaltyOpen && (
            <ul className="nav flex-column mt-1 gap-1">
              {loyaltyItems.map(item => renderMenuItem(item, true))}
            </ul>
          )}
        </li>
        {/* GAMIFICATION Submenu */}
        <li className="nav-item mt-2">
          <div
            className="nav-link d-flex align-items-center justify-content-between gap-3"
            style={{
              cursor: "pointer",
              borderRadius: "12px",
              padding: "12px 18px",
              color: isGamificationOpen ? "#ffffff" : "var(--admin-sidebar-muted)",
              fontWeight: isGamificationOpen ? "600" : "400",
              transition: "all 0.2s ease"
            }}
            onClick={() => setIsGamificationOpen(!isGamificationOpen)}
            onMouseEnter={(e) => {
              if (!isGamificationOpen) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              if (!isGamificationOpen) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <i className="fa-solid fa-gamepad text-success" style={{ width: "20px", textAlign: "center" }}></i>
              GAMIFICATION
            </div>
            <i className={`fa-solid fa-chevron-${isGamificationOpen ? 'down' : 'right'} small`}></i>
          </div>
          
          {isGamificationOpen && (
            <ul className="nav flex-column mt-1 gap-1">
              {gamificationItems.map(item => renderMenuItem(item, true))}
            </ul>
          )}
        </li>

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
