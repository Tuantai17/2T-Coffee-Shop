import React from 'react';
import { motion } from 'framer-motion';

function CategorySlider({ categories = [], activeCategory, onCategoryChange }) {
  // If no categories yet (loading or no data), render skeleton frames
  if (!categories || categories.length === 0) {
    return (
      <div className="mb-4">
        <div className="d-flex gap-3 overflow-hidden pb-3 px-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="placeholder-glow">
              <div 
                className="placeholder rounded-pill" 
                style={{ width: "120px", height: "42px", backgroundColor: "#e9ecef" }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="d-flex gap-3 overflow-auto hide-scrollbar pb-3 px-1" style={{ scrollSnapType: "x mandatory" }}>
        
        {/* All button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0 }} style={{ scrollSnapAlign: "start" }}>
          <button
            className={`btn d-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-semibold transition-all shadow-sm`}
            style={{
              backgroundColor: (!activeCategory || activeCategory === '') ? "var(--primary-color)" : "#fff",
              color: (!activeCategory || activeCategory === '') ? "#fff" : "var(--dark-text)",
              border: (!activeCategory || activeCategory === '') ? "1px solid var(--primary-color)" : "1px solid #e2e8f0",
              whiteSpace: "nowrap"
            }}
            onClick={() => onCategoryChange('')}
          >
            <i className="fa-solid fa-mug-hot"></i>
            Tất cả
          </button>
        </motion.div>

        {/* Dynamic Categories */}
        {categories.map((cat, idx) => {
          const isActive = activeCategory === cat.id.toString();
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (idx + 1) * 0.05 }}
              style={{ scrollSnapAlign: "start" }}
            >
              <button
                className={`btn d-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-semibold transition-all shadow-sm`}
                style={{
                  backgroundColor: isActive ? "var(--primary-color)" : "#fff",
                  color: isActive ? "#fff" : "var(--dark-text)",
                  border: isActive ? "1px solid var(--primary-color)" : "1px solid #e2e8f0",
                  whiteSpace: "nowrap"
                }}
                onClick={() => onCategoryChange(cat.id.toString())}
              >
                {/* Generic placeholder icon for DB categories */}
                <div className="rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px", color: "var(--primary-color)" }}>
                  <i className="fa-solid fa-coffee small"></i>
                </div>
                {cat.name}
              </button>
            </motion.div>
          );
        })}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default CategorySlider;
