import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FilterSidebar({ onFilterChange, filters }) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    size: true,
    topping: true,
    temperature: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceChange = (priceRange) => {
    onFilterChange('priceRange', priceRange);
  };

  const SectionHeader = ({ title, section }) => (
    <div 
      className="d-flex justify-content-between align-items-center mb-3 cursor-pointer"
      onClick={() => toggleSection(section)}
    >
      <h6 className="fw-bold mb-0 text-dark">{title}</h6>
      <i className={`fa-solid fa-chevron-${expandedSections[section] ? 'up' : 'down'} text-muted small transition-all`}></i>
    </div>
  );

  return (
    <div className="brew-card rounded-4 p-4 shadow-sm h-100 position-sticky" style={{ top: "90px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h5 className="fw-bold mb-0" style={{ color: "var(--primary-color)" }}>BỘ LỌC</h5>
        <button className="btn btn-sm btn-link text-muted text-decoration-none px-0 fw-semibold" onClick={() => onFilterChange('reset', true)}>
          Xóa tất cả
        </button>
      </div>

      {/* Khoảng Giá */}
      <div className="mb-4 pb-3 border-bottom">
        <SectionHeader title="KHOẢNG GIÁ" section="price" />
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="d-flex flex-column gap-2 mt-2">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'under-30', label: 'Dưới 30.000đ' },
                  { id: '30-50', label: '30.000đ - 50.000đ' },
                  { id: '50-70', label: '50.000đ - 70.000đ' },
                  { id: 'over-70', label: 'Trên 70.000đ' }
                ].map(item => (
                  <div className="form-check custom-radio" key={item.id}>
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="priceFilter" 
                      id={`price-${item.id}`}
                      checked={filters?.priceRange === item.id || (!filters?.priceRange && item.id === 'all')}
                      onChange={() => handlePriceChange(item.id)}
                    />
                    <label className="form-check-label text-muted ms-2" htmlFor={`price-${item.id}`}>
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Size */}
      <div className="mb-4 pb-3 border-bottom">
        <SectionHeader title="SIZE" section="size" />
        <AnimatePresence>
          {expandedSections.size && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="d-flex flex-column gap-2 mt-2">
                {['S', 'M', 'L'].map(size => (
                  <div className="form-check custom-checkbox" key={size}>
                    <input className="form-check-input" type="checkbox" id={`size-${size}`} />
                    <label className="form-check-label text-muted ms-2" htmlFor={`size-${size}`}>Size {size}</label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Topping */}
      <div className="mb-4 pb-3 border-bottom">
        <SectionHeader title="TOPPING" section="topping" />
        <AnimatePresence>
          {expandedSections.topping && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="d-flex flex-column gap-2 mt-2">
                <div className="form-check custom-checkbox">
                  <input className="form-check-input" type="checkbox" id="topping-yes" />
                  <label className="form-check-label text-muted ms-2" htmlFor="topping-yes">Có Topping</label>
                </div>
                <div className="form-check custom-checkbox">
                  <input className="form-check-input" type="checkbox" id="topping-no" />
                  <label className="form-check-label text-muted ms-2" htmlFor="topping-no">Không Topping</label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Temperature */}
      <div className="mb-4">
        <SectionHeader title="NHIỆT ĐỘ" section="temperature" />
        <AnimatePresence>
          {expandedSections.temperature && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="d-flex flex-column gap-2 mt-2">
                <div className="form-check custom-checkbox">
                  <input className="form-check-input" type="checkbox" id="temp-hot" />
                  <label className="form-check-label text-muted ms-2" htmlFor="temp-hot">Nóng (Hot)</label>
                </div>
                <div className="form-check custom-checkbox">
                  <input className="form-check-input" type="checkbox" id="temp-cold" />
                  <label className="form-check-label text-muted ms-2" htmlFor="temp-cold">Lạnh (Ice)</label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <button className="btn btn-brew-primary w-100 rounded-pill py-2 fw-bold mt-2 shadow-sm">
        ÁP DỤNG LỌC
      </button>

      <style>{`
        .custom-radio .form-check-input:checked {
          background-color: var(--secondary-color);
          border-color: var(--secondary-color);
        }
        .custom-checkbox .form-check-input:checked {
          background-color: var(--secondary-color);
          border-color: var(--secondary-color);
        }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}

export default FilterSidebar;
