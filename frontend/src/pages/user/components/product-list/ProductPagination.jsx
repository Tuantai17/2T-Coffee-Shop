import React from 'react';

function ProductPagination({ currentPage, totalPages, totalElements, size, onPageChange }) {
  if (totalPages <= 1) return null;

  // Logic hiển thị tối đa 5 trang xung quanh trang hiện tại
  const pageNumbers = [];
  let startPage = Math.max(0, currentPage - 2);
  let endPage = Math.min(totalPages - 1, currentPage + 2);
  
  if (totalPages > 5) {
    if (startPage === 0) {
      endPage = 4;
    } else if (endPage === totalPages - 1) {
      startPage = totalPages - 5;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const startItem = currentPage * size + 1;
  const endItem = Math.min((currentPage + 1) * size, totalElements);

  return (
    <div className="product-pagination-container mt-5 mb-4 text-center">
      <div className="text-muted small mb-3">
        Hiển thị {startItem} – {endItem} trong tổng số {totalElements} sản phẩm
      </div>
      <nav aria-label="Product pagination">
        <ul className="pagination justify-content-center border-0 gap-2">
          <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
            <button 
              className="page-link rounded-circle border-0 d-flex align-items-center justify-content-center" 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              aria-label="Trang trước"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          </li>
          
          {startPage > 0 && (
            <>
              <li className="page-item">
                <button className="page-link rounded-circle border-0 d-flex align-items-center justify-content-center" onClick={() => onPageChange(0)}>1</button>
              </li>
              {startPage > 1 && <li className="page-item disabled"><span className="page-link border-0 bg-transparent">...</span></li>}
            </>
          )}

          {pageNumbers.map(page => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button 
                className="page-link rounded-circle border-0 d-flex align-items-center justify-content-center"
                onClick={() => onPageChange(page)}
              >
                {page + 1}
              </button>
            </li>
          ))}

          {endPage < totalPages - 1 && (
            <>
              {endPage < totalPages - 2 && <li className="page-item disabled"><span className="page-link border-0 bg-transparent">...</span></li>}
              <li className="page-item">
                <button className="page-link rounded-circle border-0 d-flex align-items-center justify-content-center" onClick={() => onPageChange(totalPages - 1)}>{totalPages}</button>
              </li>
            </>
          )}

          <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link rounded-circle border-0 d-flex align-items-center justify-content-center" 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              aria-label="Trang sau"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default ProductPagination;
