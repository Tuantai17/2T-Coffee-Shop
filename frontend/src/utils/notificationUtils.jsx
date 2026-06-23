import React from "react";

export const getNotificationIcon = (type) => {
  switch (type) {
    case "ORDER_NEW":
    case "ORDER_UPDATED":
    case "ORDER_COMPLETED":
    case "ORDER_CANCELLED":
    case "ORDER":
      return <div className="rounded-circle d-flex align-items-center justify-content-center text-primary bg-primary bg-opacity-10 shadow-sm" style={{ width: "40px", height: "40px" }}><i className="fa-solid fa-cart-shopping"></i></div>;
    case "PRODUCT_LOW_STOCK":
    case "PRODUCT_OUT_OF_STOCK":
      return <div className="rounded-circle d-flex align-items-center justify-content-center text-warning bg-warning bg-opacity-10 shadow-sm" style={{ width: "40px", height: "40px" }}><i className="fa-solid fa-triangle-exclamation"></i></div>;
    case "PRODUCT_CREATED":
    case "PRODUCT":
      return <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "40px", height: "40px", color: "var(--admin-purple)", backgroundColor: "rgba(124, 58, 237, 0.1)" }}><i className="fa-solid fa-box"></i></div>;
    case "USER_REGISTERED":
    case "USER":
      return <div className="rounded-circle d-flex align-items-center justify-content-center text-success bg-success bg-opacity-10 shadow-sm" style={{ width: "40px", height: "40px" }}><i className="fa-regular fa-user"></i></div>;
    case "BANNER_UPDATED":
    case "BANNER":
      return <div className="rounded-circle d-flex align-items-center justify-content-center text-danger bg-danger bg-opacity-10 shadow-sm" style={{ width: "40px", height: "40px" }}><i className="fa-regular fa-image"></i></div>;
    case "PROMOTION_STARTED":
    case "PROMOTION":
      return <div className="rounded-circle d-flex align-items-center justify-content-center text-warning bg-warning bg-opacity-10 shadow-sm" style={{ width: "40px", height: "40px" }}><i className="fa-solid fa-bullhorn"></i></div>;
    case "REVIEW_CREATED":
    case "REVIEW":
      return <div className="rounded-circle d-flex align-items-center justify-content-center text-primary bg-primary bg-opacity-10 shadow-sm" style={{ width: "40px", height: "40px" }}><i className="fa-regular fa-star"></i></div>;
    case "RETURN_REQUESTED":
    case "RETURN":
      return <div className="rounded-circle d-flex align-items-center justify-content-center text-danger bg-danger bg-opacity-10 shadow-sm" style={{ width: "40px", height: "40px" }}><i className="fa-solid fa-rotate-left"></i></div>;
    case "SYSTEM":
    case "SECURITY":
      return <div className="rounded-circle d-flex align-items-center justify-content-center text-secondary bg-secondary bg-opacity-10 shadow-sm" style={{ width: "40px", height: "40px" }}><i className="fa-regular fa-bell"></i></div>;
    default:
      return <div className="rounded-circle d-flex align-items-center justify-content-center text-secondary bg-secondary bg-opacity-10 shadow-sm" style={{ width: "40px", height: "40px" }}><i className="fa-solid fa-circle-info"></i></div>;
  }
};

export const getNotificationTypeBadge = (type) => {
  if (!type) return <span className="badge bg-light text-secondary border">Khác</span>;
  
  if (type.startsWith("ORDER")) return <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill">Đơn hàng</span>;
  if (type.startsWith("PRODUCT")) return <span className="badge bg-opacity-10 border border-opacity-25 px-3 py-2 rounded-pill" style={{ color: "var(--admin-purple)", backgroundColor: "rgba(124, 58, 237, 0.1)", borderColor: "rgba(124, 58, 237, 0.25)" }}>Sản phẩm</span>;
  if (type.startsWith("USER")) return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill">Người dùng</span>;
  if (type.startsWith("BANNER")) return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill">Banner</span>;
  if (type.startsWith("PROMOTION")) return <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2 rounded-pill">Khuyến mãi</span>;
  if (type.startsWith("SYSTEM")) return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-2 rounded-pill">Hệ thống</span>;
  if (type.startsWith("SECURITY")) return <span className="badge bg-dark bg-opacity-10 text-dark border border-dark border-opacity-25 px-3 py-2 rounded-pill">Bảo mật</span>;
  if (type.startsWith("REVIEW")) return <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 rounded-pill">Đánh giá</span>;
  
  return <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill">{type}</span>;
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  
  const diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays === 1) {
    return `Hôm qua, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const formatTimeDisplay = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0 && date.getDate() === now.getDate()) {
    return `Hôm nay, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  if (diffInDays === 1 || (diffInDays === 0 && date.getDate() !== now.getDate())) {
    return `Hôm qua, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
