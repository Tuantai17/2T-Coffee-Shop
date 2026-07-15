import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const saveHistory = (term) => {
    if (!term || !term.trim()) return;
    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const removeHistoryItem = (term, e) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h !== term);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleHistoryClick = (term) => {
    setQuery(term);
    if (onSearch) onSearch(term);
    setIsFocused(false);
    saveHistory(term);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      if (onSearch) onSearch(val);
    }, 300);
  };

  const handleClear = () => {
    setQuery('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (onSearch) onSearch('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (onSearch) onSearch(query);
    saveHistory(query);
    setIsFocused(false);
    document.activeElement.blur(); // Remove focus so the dropdown closes
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
            onChange={handleChange}
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
        {isFocused && !query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="position-absolute w-100 bg-white rounded-4 shadow-lg mt-2 overflow-hidden"
            style={{ border: "1px solid #f1f5f9" }}
          >
            <div className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-muted small mb-0">TÌM KIẾM GẦN ĐÂY</h6>
                {history.length > 0 && (
                  <span 
                    className="small text-danger cursor-pointer hover-text-primary" 
                    onClick={clearHistory}
                  >
                    Xóa tất cả
                  </span>
                )}
              </div>
              
              {history.length === 0 ? (
                <div className="text-muted small">Chưa có lịch sử tìm kiếm.</div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {history.map((term, idx) => (
                    <span 
                      key={idx} 
                      className="badge bg-light text-dark fw-normal px-3 py-2 rounded-pill cursor-pointer d-flex align-items-center gap-2" 
                      style={{ border: "1px solid #e2e8f0" }}
                      onMouseDown={(e) => {
                        // Prevent blur event from firing before click
                        e.preventDefault();
                      }}
                      onClick={() => handleHistoryClick(term)}
                    >
                      {term}
                      <i 
                        className="fa-solid fa-xmark text-muted hover-text-danger" 
                        onClick={(e) => removeHistoryItem(term, e)}
                        style={{ fontSize: "0.8rem", padding: "2px" }}
                      ></i>
                    </span>
                  ))}
                </div>
              )}
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
