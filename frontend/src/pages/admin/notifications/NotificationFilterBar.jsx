import React, { useState } from "react";

function NotificationFilterBar({ filters, setFilters, onReset }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
    if (name === "type" || name === "isRead" || name === "timeRange") {
      setFilters(newFilters);
    }
  };

  const handleSearchBlur = () => setFilters(localFilters);
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") setFilters(localFilters);
  };

  const handleApply = () => setFilters(localFilters);
  const handleReset = () => {
    setLocalFilters({ search: "", type: "", isRead: "", timeRange: "" });
    onReset();
  };

  return (
    <div className="d-flex flex-wrap gap-3 mb-4 p-3 bg-white rounded-pill shadow-sm align-items-center" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
      <div className="flex-grow-1 position-relative" style={{ minWidth: "250px" }}>
        <i className="fa-solid fa-search position-absolute text-muted" style={{ top: "12px", left: "15px" }}></i>
        <input 
          type="text" 
          className="form-control border-0 bg-transparent ps-5" 
          placeholder="Tìm kiếm thông báo..." 
          name="search"
          value={localFilters.search}
          onChange={handleChange}
          onBlur={handleSearchBlur}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1" style={{ minWidth: "200px" }}>
        <select 
          className="form-select border-0 bg-transparent fw-semibold text-secondary shadow-none" 
          name="type"
          value={localFilters.type}
          onChange={handleChange}
        >
          <option value="">Tất cả loại thông báo</option>
          <option value="ORDER">Đơn hàng</option>
          <option value="PRODUCT">Sản phẩm</option>
          <option value="USER">Người dùng</option>
          <option value="SYSTEM">Hệ thống</option>
          <option value="SECURITY">Bảo mật</option>
          <option value="BANNER">Banner</option>
        </select>
      </div>

      <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1" style={{ minWidth: "180px" }}>
        <select 
          className="form-select border-0 bg-transparent fw-semibold text-secondary shadow-none" 
          name="isRead"
          value={localFilters.isRead}
          onChange={handleChange}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="false">Chưa đọc</option>
          <option value="true">Đã đọc</option>
        </select>
      </div>

      <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1" style={{ minWidth: "180px" }}>
        <select 
          className="form-select border-0 bg-transparent fw-semibold text-secondary shadow-none" 
          name="timeRange"
          value={localFilters.timeRange}
          onChange={handleChange}
        >
          <option value="">Tất cả thời gian</option>
          <option value="today">Hôm nay</option>
          <option value="7days">7 ngày gần nhất</option>
          <option value="30days">30 ngày gần nhất</option>
        </select>
        <i className="fa-regular fa-calendar text-muted"></i>
      </div>

      <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-none" onClick={handleApply}>
        Áp dụng
      </button>
      <div className="dropdown">
        <button className="btn btn-light rounded-pill px-4 fw-bold border shadow-sm dropdown-toggle" data-bs-toggle="dropdown">
          <i className="fa-solid fa-filter text-muted me-2"></i> Bộ lọc nhanh
        </button>
        <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 mt-2 p-2">
          <li><button className="dropdown-item py-2 fw-semibold text-danger rounded" onClick={handleReset}><i className="fa-solid fa-xmark me-2"></i> Xóa tất cả bộ lọc</button></li>
        </ul>
      </div>
    </div>
  );
}

export default NotificationFilterBar;
