import React from 'react';
import SortDropdown from './SortDropdown';

function ProductToolbar({ totalElements, viewMode, setViewMode, sortValue, onSortChange }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
      <div className="text-muted fw-medium mb-2 mb-md-0">
        Hiển thị <span className="fw-bold text-dark">{totalElements}</span> sản phẩm
      </div>
      
      <div className="d-flex align-items-center gap-3">
        {/* View Mode Toggle */}
        <div className="d-none d-md-flex bg-white rounded-pill p-1 shadow-sm border">
          <button 
            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${viewMode === 'grid' ? 'btn-brew-primary' : 'text-muted'}`}
            onClick={() => setViewMode('grid')}
          >
            <i className="fa-solid fa-border-all"></i>
          </button>
          <button 
            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${viewMode === 'list' ? 'btn-brew-primary' : 'text-muted'}`}
            onClick={() => setViewMode('list')}
          >
            <i className="fa-solid fa-list"></i>
          </button>
        </div>

        {/* Sort Dropdown */}
        <SortDropdown sortValue={sortValue} onSortChange={onSortChange} />
      </div>
    </div>
  );
}

export default ProductToolbar;
