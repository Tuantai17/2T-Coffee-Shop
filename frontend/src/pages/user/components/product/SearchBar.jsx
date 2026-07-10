import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <div className="position-relative w-100 mb-4" style={{ zIndex: 10 }}>
      <form onSubmit={handleSubmit} className="position-relative">
        <div 
          className="d-flex align-items-center bg-white rounded-pill px-4 shadow-sm transition-all"
          style={{ 
            height: "56px", 
            border: isFocused ? "2px solid var(--secondary-color)" : "1px solid #e2e8f0",
            boxShadow: isFocused ? "0 10px 25px rgba(212, 140, 91, 0.15)" : "0 4px 6px rgba(0,0,0,0.02)"
          }}
        >
          <i className="fa-solid fa-magnifying-glass text-muted me-3 fs-5"></i>
          <input
            type="text"
            className="form-control border-0 shadow-none bg-transparent flex-grow-1 fs-6"
            placeholder="Tìm tên đồ uống..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                className="btn border-0 text-muted p-2 hover-text-primary"
                onClick={handleClear}
              >
                <i className="fa-solid fa-xmark fs-5"></i>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Auto Suggest Mock Popover */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="position-absolute w-100 bg-white rounded-4 shadow-lg mt-2 overflow-hidden"
            style={{ border: "1px solid #f1f5f9" }}
          >
            <div className="p-3 border-bottom">
              <h6 className="fw-bold text-muted small mb-3">TÌM KIẾM GẦN ĐÂY</h6>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-light text-dark fw-normal px-3 py-2 rounded-pill hover-scale cursor-pointer" style={{ border: "1px solid #e2e8f0" }}>Trà đào cam sả</span>
                <span className="badge bg-light text-dark fw-normal px-3 py-2 rounded-pill hover-scale cursor-pointer" style={{ border: "1px solid #e2e8f0" }}>Cà phê đen đá</span>
                <span className="badge bg-light text-dark fw-normal px-3 py-2 rounded-pill hover-scale cursor-pointer" style={{ border: "1px solid #e2e8f0" }}>Freeze Matcha</span>
              </div>
            </div>
            <div className="p-3">
              <h6 className="fw-bold text-muted small mb-3">TÌM KIẾM PHỔ BIẾN</h6>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-3 p-2 hover-bg-light rounded cursor-pointer transition-all">
                  <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                    <i className="fa-solid fa-fire"></i>
                  </div>
                  <span className="fw-medium">Cà phê sữa đá</span>
                </div>
                <div className="d-flex align-items-center gap-3 p-2 hover-bg-light rounded cursor-pointer transition-all">
                  <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                    <i className="fa-solid fa-fire"></i>
                  </div>
                  <span className="fw-medium">Trà sen vàng</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}

export default SearchBar;
