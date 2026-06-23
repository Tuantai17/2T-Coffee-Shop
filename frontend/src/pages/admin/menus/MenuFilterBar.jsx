import React from "react";

function MenuFilterBar({ filters, onFilterChange, onExpandAll, onCollapseAll }) {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      {/* Search and Filters */}
      <div className="d-flex flex-wrap align-items-center gap-3 flex-grow-1">
        <div className="input-group" style={{ maxWidth: "300px" }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="fa-solid fa-magnifying-glass text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0 shadow-none"
            placeholder="Tìm kiếm menu..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <label className="text-muted small mb-0 text-nowrap">Cấp menu</label>
          <select 
            className="form-select shadow-none" 
            style={{ minWidth: "140px" }}
            value={filters.level}
            onChange={(e) => onFilterChange("level", e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="1">Menu cấp 1</option>
            <option value="2">Menu cấp 2</option>
          </select>
        </div>

        <div className="d-flex align-items-center gap-2">
          <label className="text-muted small mb-0 text-nowrap">Trạng thái</label>
          <select 
            className="form-select shadow-none" 
            style={{ minWidth: "140px" }}
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hiển thị</option>
            <option value="inactive">Đang ẩn</option>
          </select>
        </div>

        <div className="d-flex align-items-center gap-2">
          <label className="text-muted small mb-0 text-nowrap">Sắp xếp theo</label>
          <select 
            className="form-select shadow-none" 
            style={{ minWidth: "160px" }}
            value={filters.sort}
            onChange={(e) => onFilterChange("sort", e.target.value)}
          >
            <option value="order_asc">Thứ tự tăng dần</option>
            <option value="order_desc">Thứ tự giảm dần</option>
            <option value="name_asc">Tên A-Z</option>
            <option value="name_desc">Tên Z-A</option>
            <option value="updated_desc">Mới cập nhật</option>
          </select>
        </div>

        {/* Nút Clear Filters (chỉ hiện khi có filter) */}
        {(filters.search || filters.level !== 'all' || filters.status !== 'all' || filters.sort !== 'order_asc') && (
          <button 
            className="btn btn-light shadow-sm text-nowrap"
            onClick={() => onFilterChange("clear")}
          >
            <i className="fa-solid fa-circle-xmark me-2"></i> Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Expand/Collapse Actions */}
      <div className="d-flex gap-2">
        <button className="btn btn-light shadow-sm d-flex align-items-center gap-2" onClick={onExpandAll}>
          <i className="fa-solid fa-up-right-and-down-left-from-center" style={{ fontSize: '12px' }}></i> Mở rộng tất cả
        </button>
        <button className="btn btn-light shadow-sm d-flex align-items-center gap-2" onClick={onCollapseAll}>
          <i className="fa-solid fa-down-left-and-up-right-to-center" style={{ fontSize: '12px' }}></i> Thu gọn tất cả
        </button>
      </div>
    </div>
  );
}

export default MenuFilterBar;
