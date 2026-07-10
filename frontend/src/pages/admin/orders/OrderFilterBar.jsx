import React, { useState } from "react";

function OrderFilterBar({ filters, setFilters, onApply, onReset }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
    // Apply immediately when sorting or status changes
    if (name === "sort" || name === "status" || name === "dateRange") {
      setFilters(newFilters);
    }
  };

  const handleSearchBlur = () => {
    setFilters(localFilters);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setFilters(localFilters);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyDateRange = () => {
    setFilters(localFilters);
  };

  return (
    <div className="neu-card p-4 mb-4">
      <div className="row g-3 align-items-end">
        {/* Search */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Tìm kiếm</label>
          <div className="position-relative">
            <i className="fa-solid fa-search position-absolute text-muted" style={{ top: "12px", left: "15px" }}></i>
            <input
              type="text"
              className="neu-input w-100"
              style={{ paddingLeft: "40px" }}
              placeholder="Nhập mã đơn, tên, SĐT, email..."
              name="search"
              value={localFilters.search || ""}
              onChange={handleChange}
              onBlur={handleSearchBlur}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>

        {/* Status */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Trạng thái đơn</label>
          <select
            className="neu-input w-100 form-select"
            name="status"
            value={localFilters.status || ""}
            onChange={handleChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING_CONFIRMATION">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PREPARING">Đang chuẩn bị</option>
            <option value="READY_FOR_PICKUP">Chờ nhận tại quầy</option>
            <option value="READY_FOR_DELIVERY">Chờ giao hàng</option>
            <option value="DELIVERING">Đang giao</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Sắp xếp theo</label>
          <select
            className="neu-input w-100 form-select"
            name="sort"
            value={localFilters.sort || "newest"}
            onChange={handleChange}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="totalDesc">Tổng tiền cao nhất</option>
            <option value="totalAsc">Tổng tiền thấp nhất</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Khoảng thời gian</label>
          <div className="d-flex align-items-center bg-white rounded-3 overflow-hidden shadow-sm border" style={{ padding: "1px" }}>
            <input 
              type="date" 
              name="startDate" 
              className="form-control border-0 shadow-none text-muted small px-2" 
              value={localFilters.startDate || ""} 
              onChange={handleDateChange} 
              onBlur={applyDateRange}
              style={{ fontSize: "12px", width: "115px" }}
            />
            <span className="text-muted">-</span>
            <input 
              type="date" 
              name="endDate" 
              className="form-control border-0 shadow-none text-muted small px-2" 
              value={localFilters.endDate || ""} 
              onChange={handleDateChange} 
              onBlur={applyDateRange}
              style={{ fontSize: "12px", width: "115px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderFilterBar;
