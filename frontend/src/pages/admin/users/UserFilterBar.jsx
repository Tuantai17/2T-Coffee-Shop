import React, { useState } from "react";

function UserFilterBar({ filters, setFilters, onReset }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
    // Apply immediately when sorting or status/role changes
    if (name === "sort" || name === "status" || name === "role") {
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

  const handleApply = () => {
    setFilters(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({ search: "", role: "", status: "", sort: "newest" });
    onReset();
  };

  return (
    <div className="neu-card p-4 mb-4">
      <div className="row g-3 align-items-end">
        {/* Search */}
        <div className="col-md-4 col-xl-4">
          <label className="form-label small text-muted fw-bold">Tìm kiếm</label>
          <div className="position-relative">
            <i className="fa-solid fa-search position-absolute text-muted" style={{ top: "12px", left: "15px" }}></i>
            <input
              type="text"
              className="neu-input w-100"
              style={{ paddingLeft: "40px" }}
              placeholder="Nhập tên, tài khoản, email hoặc SĐT..."
              name="search"
              value={localFilters.search || ""}
              onChange={handleChange}
              onBlur={handleSearchBlur}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>

        {/* Role */}
        <div className="col-md-3 col-xl-2">
          <label className="form-label small text-muted fw-bold">Vai trò</label>
          <select
            className="neu-input w-100 form-select"
            name="role"
            value={localFilters.role || ""}
            onChange={handleChange}
          >
            <option value="">Tất cả vai trò</option>
            <option value="ROLE_ADMIN">Quản trị viên</option>
            <option value="ROLE_STAFF">Nhân viên</option>
            <option value="ROLE_USER">Khách hàng</option>
          </select>
        </div>

        {/* Status */}
        <div className="col-md-3 col-xl-2">
          <label className="form-label small text-muted fw-bold">Trạng thái</label>
          <select
            className="neu-input w-100 form-select"
            name="status"
            value={localFilters.status || ""}
            onChange={handleChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Hoạt động</option>
            <option value="0">Bị khóa</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="col-md-2 col-xl-2">
          <label className="form-label small text-muted fw-bold">Sắp xếp theo</label>
          <select
            className="neu-input w-100 form-select"
            name="sort"
            value={localFilters.sort || "newest"}
            onChange={handleChange}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="nameAsc">Tên A-Z</option>
            <option value="nameDesc">Tên Z-A</option>
          </select>
        </div>

        {/* Actions */}
        <div className="col-12 col-xl-2 d-flex gap-2 justify-content-end">
          <button className="btn btn-primary neu-pill w-100 fw-bold shadow-sm" onClick={handleApply}>
            <i className="fa-solid fa-filter me-1"></i> Áp dụng
          </button>
          <button className="btn btn-light neu-pill w-100 text-muted fw-bold shadow-sm border" onClick={handleReset}>
            <i className="fa-solid fa-xmark me-1"></i> Xóa bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserFilterBar;
