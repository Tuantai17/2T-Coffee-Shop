import React from "react";

function ProductPagination({ currentPage, totalItems, pageSize, setPageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Calculate start and end item index for display
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show (simple pagination logic, max 5 pages)
  let pages = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      pages = [1, 2, 3, 4, 5];
    } else if (currentPage >= totalPages - 2) {
      pages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    }
  }

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 text-muted small">
      <div className="mb-3 mb-md-0">
        Hiển thị {startItem} đến {endItem} trong tổng số {totalItems} sản phẩm
      </div>
      
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <span>Hiển thị</span>
          <select 
            className="neu-input form-select form-select-sm" 
            style={{ width: "70px", height: "32px", padding: "0 10px" }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              onPageChange(1); // Reset to page 1 when changing page size
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div className="d-flex gap-1">
          <button 
            className="btn btn-sm neu-pill p-0 d-flex justify-content-center align-items-center" 
            style={{ width: "32px", height: "32px", opacity: currentPage === 1 ? 0.5 : 1 }}
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          {pages[0] > 1 && (
            <>
              <button 
                className="btn btn-sm neu-pill p-0 fw-semibold" 
                style={{ width: "32px", height: "32px" }}
                onClick={() => onPageChange(1)}
              >
                1
              </button>
              {pages[0] > 2 && <span className="d-flex align-items-center px-1">...</span>}
            </>
          )}

          {pages.map(page => (
            <button 
              key={page}
              className="btn btn-sm neu-pill p-0 fw-semibold" 
              style={{ 
                width: "32px", 
                height: "32px",
                backgroundColor: page === currentPage ? "var(--admin-primary)" : "transparent",
                color: page === currentPage ? "#fff" : "inherit"
              }}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && <span className="d-flex align-items-center px-1">...</span>}
              <button 
                className="btn btn-sm neu-pill p-0 fw-semibold" 
                style={{ width: "32px", height: "32px" }}
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}

          <button 
            className="btn btn-sm neu-pill p-0 d-flex justify-content-center align-items-center" 
            style={{ width: "32px", height: "32px", opacity: currentPage === totalPages ? 0.5 : 1 }}
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPagination;
