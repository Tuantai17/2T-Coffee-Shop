import React from 'react';

function ProductToolbar({ viewMode, setViewMode, totalElements, filters, onFilterChange }) {
  return (
    <div className="product-toolbar d-flex flex-wrap align-items-center justify-content-between mb-4 pb-3 border-bottom">
      <div className="d-flex align-items-center gap-3 mb-2 mb-md-0">
        <span className="fw-semibold text-muted">Kiểu xem</span>
        <div className="view-mode-toggle d-flex gap-2">
          <button 
            className={`btn-view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Xem dạng lưới"
            aria-pressed={viewMode === 'grid'}
          >
            <i className="fa-solid fa-border-all"></i>
          </button>
          <button 
            className={`btn-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="Xem dạng danh sách"
            aria-pressed={viewMode === 'list'}
          >
            <i className="fa-solid fa-list-ul"></i>
          </button>
        </div>
      </div>

      <div className="text-center flex-grow-1 fw-bold fs-5 my-2 my-md-0">
        {totalElements || 0} sản phẩm
      </div>

      <div className="d-flex align-items-center gap-2">
        <span className="text-muted text-nowrap">Sắp xếp theo:</span>
        <div className="sort-dropdown">
          <select 
            className="form-select form-select-sm sort-select border-0 bg-transparent fw-bold shadow-none cursor-pointer"
            value={filters.sort || "newest"}
            onChange={(e) => onFilterChange("sort", e.target.value)}
          >
            <option value="newest">Sản phẩm mới</option>
            <option value="featured_order">Bán chạy</option>
            <option value="on_sale_order">Hàng khuyến mãi</option>
            <option value="name_asc">Tên sản phẩm A-Z</option>
            <option value="name_desc">Tên sản phẩm Z-A</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="price_asc">Giá tăng dần</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ProductToolbar;
