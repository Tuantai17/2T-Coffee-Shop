import React from "react";

function ProductFilterBar({ filters, setFilters, categories, onApply, onReset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="neu-card p-4 mb-4">
      <div className="row g-3 mb-3">
        {/* Search */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Tìm kiếm</label>
          <div className="position-relative">
            <i className="fa-solid fa-search position-absolute text-muted" style={{ top: "12px", left: "15px" }}></i>
            <input
              type="text"
              className="neu-input w-100"
              style={{ paddingLeft: "40px" }}
              placeholder="Nhập tên, SKU, slug..."
              name="search"
              value={filters.search || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Category */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Danh mục</label>
          <select
            className="neu-input w-100 form-select"
            name="category"
            value={filters.category || ""}
            onChange={handleChange}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
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
            <option value="ACTIVE">Đang bán</option>
            <option value="INACTIVE">Ẩn</option>
            <option value="OUT_OF_STOCK">Hết hàng</option>
          </select>
        </div>

        {/* Stock */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Kho hàng</label>
          <select
            className="neu-input w-100 form-select"
            name="stock"
            value={filters.stock || ""}
            onChange={handleChange}
          >
            <option value="">Tất cả</option>
            <option value="in_stock">Còn hàng</option>
            <option value="low_stock">Sắp hết hàng</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>
        </div>
      </div>

      <div className="row g-3 align-items-end">
        {/* New Product */}
        <div className="col-md-2">
          <label className="form-label small text-muted fw-bold">Sản phẩm mới</label>
          <select
            className="neu-input w-100 form-select"
            name="isNew"
            value={filters.isNew || ""}
            onChange={handleChange}
          >
            <option value="">Tất cả</option>
            <option value="true">Có</option>
            <option value="false">Không</option>
          </select>
        </div>

        {/* Sale Product */}
        <div className="col-md-2">
          <label className="form-label small text-muted fw-bold">Khuyến mãi</label>
          <select
            className="neu-input w-100 form-select"
            name="isSale"
            value={filters.isSale || ""}
            onChange={handleChange}
          >
            <option value="">Tất cả</option>
            <option value="true">Có</option>
            <option value="false">Không</option>
          </select>
        </div>

        {/* Best Seller */}
        <div className="col-md-2">
          <label className="form-label small text-muted fw-bold">Bán chạy</label>
          <select
            className="neu-input w-100 form-select"
            name="isBestSeller"
            value={filters.isBestSeller || ""}
            onChange={handleChange}
          >
            <option value="">Tất cả</option>
            <option value="true">Có</option>
            <option value="false">Không</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="col-md-4">
          <label className="form-label small text-muted fw-bold">Khoảng giá (VNĐ)</label>
          <div className="d-flex align-items-center gap-2">
            <input
              type="number"
              className="neu-input w-100"
              placeholder="Từ giá"
              name="priceMin"
              value={filters.priceMin || ""}
              onChange={handleChange}
            />
            <span className="text-muted">-</span>
            <input
              type="number"
              className="neu-input w-100"
              placeholder="Đến giá"
              name="priceMax"
              value={filters.priceMax || ""}
              onChange={handleChange}
            />
          </div>
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

export default ProductFilterBar;
