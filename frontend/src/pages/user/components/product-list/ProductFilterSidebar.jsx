import React, { useState } from 'react';

function ProductFilterSidebar({ categories, filters, onFilterChange, onReset }) {
  const [openCategories, setOpenCategories] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [expandedCats, setExpandedCats] = useState({});

  // Xây dựng cây danh mục
  const parentCategories = categories.filter(c => !c.parentId);
  const getChildren = (parentId) => categories.filter(c => c.parentId === parentId);

  const toggleCategory = (catId) => {
    setExpandedCats(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Helper cho khoảng giá
  const priceRanges = [
    { label: "Dưới 200.000đ", min: null, max: 200000 },
    { label: "200.000đ - 500.000đ", min: 200000, max: 500000 },
    { label: "500.000đ - 1.000.000đ", min: 500000, max: 1000000 },
    { label: "1.000.000đ - 2.000.000đ", min: 1000000, max: 2000000 },
    { label: "2.000.000đ - 4.000.000đ", min: 2000000, max: 4000000 },
    { label: "Trên 4.000.000đ", min: 4000000, max: null }
  ];

  const handlePriceChange = (min, max) => {
    // Nếu click lại cái đang chọn thì bỏ chọn
    if (filters.minPrice === (min?.toString() || "") && filters.maxPrice === (max?.toString() || "")) {
      onFilterChange("minPrice", "");
      onFilterChange("maxPrice", "");
    } else {
      onFilterChange("minPrice", min != null ? min.toString() : "");
      onFilterChange("maxPrice", max != null ? max.toString() : "");
    }
  };

  const hasActiveFilters = 
    filters.category || filters.minPrice || filters.maxPrice || 
    filters.brand || filters.keyword ||
    filters.onSale || filters.featured || filters.newArrival;

  return (
    <div className="product-filter-sidebar">
      {hasActiveFilters && (
        <div className="mb-4">
          <button onClick={onReset} className="btn-clear-filter w-100 fw-bold">
            <i className="fa-solid fa-trash-can me-2"></i> Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="filter-group mb-4">
        <div 
          className="filter-header d-flex justify-content-between align-items-center cursor-pointer"
          onClick={() => setOpenCategories(!openCategories)}
        >
          <h5 className="fw-bold mb-0 text-danger">Danh Mục</h5>
          <i className={`fa-solid fa-chevron-${openCategories ? 'up' : 'down'} text-danger`}></i>
        </div>
        
        {openCategories && (
          <div className="filter-content mt-3">
            <div className="category-list">
              {/* Nút Xóa bộ lọc danh mục (Tất cả sản phẩm) */}
              <div 
                className="d-flex align-items-center mb-3 cursor-pointer"
                onClick={() => onFilterChange("category", "")}
              >
                <span className={`flex-grow-1 ${!filters.category ? 'fw-bold text-danger' : 'text-muted'}`}>
                  Tất cả sản phẩm
                </span>
              </div>

              {parentCategories.map(cat => {
                const children = getChildren(cat.id);
                const hasChildren = children.length > 0;
                const isExpanded = expandedCats[cat.id];
                
                // Kiểm tra xem danh mục cha hoặc bất kỳ con nào có đang được chọn không
                const isParentActive = filters.category === cat.id.toString();
                const isChildActive = children.some(child => filters.category === child.id.toString());
                const isAnyActive = isParentActive || isChildActive;

                return (
                  <div key={cat.id} className="category-item mb-2">
                    <div className="d-flex justify-content-between align-items-center py-1">
                      <span 
                        className={`flex-grow-1 cursor-pointer ${isAnyActive ? 'fw-bold text-danger' : 'text-dark'}`}
                        onClick={() => {
                          onFilterChange("category", filters.category === cat.id.toString() ? "" : cat.id.toString());
                        }}
                      >
                        {cat.name}
                      </span>
                      {hasChildren && (
                        <i 
                          className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'} text-muted ms-2 cursor-pointer`} 
                          style={{ fontSize: '12px', padding: '5px' }}
                          onClick={() => toggleCategory(cat.id)}
                        ></i>
                      )}
                    </div>
                    
                    {/* Render Children */}
                    {hasChildren && isExpanded && (
                      <div className="category-children mt-2 ms-3 border-start ps-3 border-danger">
                        {children.map(child => {
                          const isChildSelected = filters.category === child.id.toString();
                          return (
                            <div key={child.id} className="form-check custom-checkbox mb-2 d-flex align-items-center">
                              <input 
                                className="form-check-input mt-0" 
                                type="checkbox" 
                                id={`cat_${child.id}`}
                                checked={isChildSelected}
                                onChange={() => {
                                  if (isChildSelected) {
                                    onFilterChange("category", "");
                                  } else {
                                    onFilterChange("category", child.id.toString());
                                  }
                                }}
                              />
                              <label 
                                className={`form-check-label ms-2 cursor-pointer ${isChildSelected ? 'fw-bold text-danger' : 'text-dark'}`} 
                                htmlFor={`cat_${child.id}`}
                              >
                                {child.name}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <hr className="my-2 opacity-10" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <hr className="my-3 text-muted opacity-25" />

      {/* Price Filter */}
      <div className="filter-group mb-4">
        <div 
          className="filter-header d-flex justify-content-between align-items-center cursor-pointer"
          onClick={() => setOpenPrice(!openPrice)}
        >
          <h5 className="fw-bold mb-0 text-danger">Giá (đ)</h5>
          <i className={`fa-solid fa-chevron-${openPrice ? 'up' : 'down'} text-danger`}></i>
        </div>
        
        {openPrice && (
          <div className="filter-content mt-3">
            {priceRanges.map((range, idx) => {
              const isChecked = filters.minPrice === (range.min?.toString() || "") && 
                                filters.maxPrice === (range.max?.toString() || "");
              return (
                <div key={idx} className="form-check custom-checkbox mb-2">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id={`price_${idx}`}
                    checked={isChecked}
                    onChange={() => handlePriceChange(range.min, range.max)}
                  />
                  <label className="form-check-label ms-2" htmlFor={`price_${idx}`}>
                    {range.label}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
    </div>
  );
}

export default ProductFilterSidebar;
