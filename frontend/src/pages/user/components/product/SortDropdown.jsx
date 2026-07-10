import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'best_seller', label: 'Bán chạy' },
  { id: 'popular', label: 'Được yêu thích' },
  { id: 'price_asc', label: 'Giá tăng' },
  { id: 'price_desc', label: 'Giá giảm' },
  { id: 'rating', label: 'Đánh giá cao' },
  { id: 'sale', label: 'Khuyến mãi' },
  { id: 'name_asc', label: 'Tên A-Z' }
];

function SortDropdown({ sortValue, onSortChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLabel = SORT_OPTIONS.find(o => o.id === sortValue)?.label || 'Mới nhất';

  const handleSelect = (id) => {
    onSortChange(id);
    setIsOpen(false);
  };

  return (
    <div className="position-relative d-inline-block">
      <button 
        className="btn bg-white border d-flex align-items-center justify-content-between gap-2 px-3 py-2 rounded-pill shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        style={{ minWidth: "180px", color: "var(--dark-text)" }}
      >
        <span className="fw-medium text-muted">Sắp xếp: <span className="text-dark fw-bold">{currentLabel}</span></span>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} small text-muted transition-all`}></i>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="position-absolute end-0 bg-white shadow-lg mt-2 py-2 rounded-4 z-3"
            style={{ minWidth: "200px", border: "1px solid #f1f5f9" }}
          >
            {SORT_OPTIONS.map(opt => (
              <button 
                key={opt.id}
                className={`dropdown-item py-2 px-4 text-start fw-medium transition-all ${sortValue === opt.id ? 'active bg-light text-danger' : 'text-dark hover-bg-light'}`}
                onClick={() => handleSelect(opt.id)}
              >
                {opt.label}
                {sortValue === opt.id && <i className="fa-solid fa-check ms-2 text-danger"></i>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .hover-bg-light:hover { background-color: #f8f9fa; }
      `}</style>
    </div>
  );
}

export default SortDropdown;
