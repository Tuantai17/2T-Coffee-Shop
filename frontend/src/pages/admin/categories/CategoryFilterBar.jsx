import React from "react";

function CategoryFilterBar({ filters, setFilters, parentCategories, onApply, onReset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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
              placeholder="Nhập tên danh mục, slug..."
              name="search"
              value={filters.search || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Level */}
        <div className="col-md-2">
          <label className="form-label small text-muted fw-bold">Cấp danh mục</label>
          <select
            className="neu-input w-100 form-select"
            name="level"
            value={filters.level || ""}
            onChange={handleChange}
          >
            <option value="">Tất cả cấp</option>
            <option value="parent">Danh mục cha</option>
            <option value="child">Danh mục con</option>
          </select>
        </div>

        {/* Parent Category Filter */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Danh mục cha</label>
          <select
            className="neu-input w-100 form-select"
            name="parentId"
            value={filters.parentId || ""}
            onChange={handleChange}
            disabled={filters.level === "parent"}
          >
            <option value="">Tất cả</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Has Products Filter */}
        <div className="col-md-2">
          <label className="form-label small text-muted fw-bold">Có sản phẩm</label>
          <select
            className="neu-input w-100 form-select"
            name="hasProducts"
            value={filters.hasProducts || ""}
            onChange={handleChange}
          >
            <option value="">Tất cả</option>
            <option value="yes">Có</option>
            <option value="no">Chưa có</option>
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

export default CategoryFilterBar;
