import React from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav className="mt-5 d-flex justify-content-center">
      <ul className="pagination mb-0 gap-2">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link rounded-circle d-flex align-items-center justify-content-center shadow-sm border-0 hover-scale"
            style={{ width: "40px", height: "40px", color: "var(--dark-text)" }}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <i className="fa-solid fa-chevron-left small"></i>
          </button>
        </li>
        
        {pages.map(page => (
          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
            <button 
              className="page-link rounded-circle d-flex align-items-center justify-content-center shadow-sm border-0 hover-scale fw-bold"
              style={{ 
                width: "40px", height: "40px", 
                backgroundColor: currentPage === page ? "var(--primary-color)" : "#fff",
                color: currentPage === page ? "#fff" : "var(--dark-text)"
              }}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link rounded-circle d-flex align-items-center justify-content-center shadow-sm border-0 hover-scale"
            style={{ width: "40px", height: "40px", color: "var(--dark-text)" }}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <i className="fa-solid fa-chevron-right small"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
