import React from "react";

function BannerFilterBar({ filters, setFilters, onApply, onReset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="neu-card p-4 mb-4">
      <div className="row g-3 align-items-end">
        {/* Search */}
        <div className="col-md-4">
          <label className="form-label small text-muted fw-bold">Tìm kiếm</label>
          <div className="position-relative">
            <i className="fa-solid fa-search position-absolute text-muted" style={{ top: "12px", left: "15px" }}></i>
            <input
              type="text"
              className="neu-input w-100"
              style={{ paddingLeft: "40px" }}
              placeholder="Nhập tiêu đề, mô tả hoặc đường dẫn..."
              name="search"
              value={filters.search || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Status */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Trạng thái</label>
          <select
            className="neu-input w-100 form-select"
            name="status"
            value={filters.status || ""}
            onChange={handleChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hiển thị</option>
            <option value="inactive">Đang ẩn</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Sắp xếp theo</label>
          <select
            className="neu-input w-100 form-select"
            name="sort"
            value={filters.sort || "asc"}
            onChange={handleChange}
          >
            <option value="asc">Thứ tự tăng dần</option>
            <option value="desc">Thứ tự giảm dần</option>
            <option value="newest">Mới cập nhật</option>
            <option value="oldest">Cũ cập nhật</option>
          </select>
        </div>

        {/* Actions */}
        <div className="col-md-2 d-flex gap-2 justify-content-end">
          <button 
            className="neu-pill d-flex justify-content-center w-100" 
            style={{ backgroundColor: "var(--admin-primary)", color: "#fff" }}
            onClick={onApply}
          >
            <i className="fa-solid fa-filter me-2 mt-1"></i> Áp dụng
          </button>
          <button 
            className="neu-pill d-flex justify-content-center w-100" 
            onClick={onReset}
          >
            <i className="fa-solid fa-rotate-right me-2 mt-1"></i> Xóa lọc
          </button>
        </div>
      </div>
    </div>
  );
}

export default BannerFilterBar;
