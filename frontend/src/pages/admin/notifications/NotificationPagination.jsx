import React from "react";

function NotificationPagination({ currentPage, totalItems, pageSize, setPageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 px-2">
      <div className="text-muted small mb-3 mb-md-0 fw-semibold">
        Hiển thị {startItem} đến {endItem} trong tổng số {totalItems} thông báo
      </div>
      
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <select 
            className="form-select form-select-sm neu-input py-1 fw-bold text-secondary" 
            style={{ width: "100px", borderRadius: "10px" }}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value="10">10 / trang</option>
            <option value="20">20 / trang</option>
            <option value="50">50 / trang</option>
          </select>
        </div>
        
        <nav>
          <ul className="pagination pagination-sm mb-0 gap-1">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button 
                className="page-link neu-pill px-2" 
                style={{ borderRadius: "8px", border: "none" }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fa-solid fa-chevron-left fa-xs"></i>
              </button>
            </li>
            
            {getPageNumbers().map(page => (
              <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                <button 
                  className={`page-link neu-pill px-3 fw-bold ${currentPage === page ? "bg-primary text-white" : "text-muted"}`}
                  style={{ borderRadius: "8px", border: "none" }}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              </li>
            ))}
            
            {totalPages > 5 && getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <li className="page-item disabled"><span className="page-link border-0 bg-transparent text-muted">...</span></li>
            )}
            
            {totalPages > 5 && getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <li className="page-item">
                <button 
                  className="page-link neu-pill px-3 fw-bold text-muted"
                  style={{ borderRadius: "8px", border: "none" }}
                  onClick={() => onPageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </li>
            )}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button 
                className="page-link neu-pill px-2" 
                style={{ borderRadius: "8px", border: "none" }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="fa-solid fa-chevron-right fa-xs"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default NotificationPagination;
