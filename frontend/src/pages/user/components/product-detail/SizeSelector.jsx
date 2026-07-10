import React from 'react';
import { formatPrice } from '../../../../utils/formatPrice';

function SizeSelector({ selectedSize, onSizeChange, sizes = [] }) {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="mb-3">
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
          Kích thước <span className="text-danger">*</span>
        </h6>
        <div className="d-flex flex-wrap gap-2">
          {sizes.map((size) => {
            const isActive = selectedSize === size.id;
            return (
              <label
                key={size.id}
                className={`position-relative rounded-3 d-flex flex-column align-items-center justify-content-center border transition-all px-3 py-2 ${
                  isActive ? "border-danger bg-danger-subtle text-danger" : "border-secondary-subtle bg-white hover-border-danger text-dark"
                }`}
                style={{ cursor: "pointer", minWidth: "60px" }}
              >
                <input
                  type="radio"
                  name="size"
                  className="position-absolute opacity-0"
                  checked={isActive}
                  onChange={() => onSizeChange(size.id)}
                />
                <span className="fw-bold" style={{ fontSize: "14px" }}>
                  {size.name.replace(/size\s*/i, '') || size.name}
                </span>
                {size.price > 0 && (
                  <span className={isActive ? "text-danger" : "text-muted"} style={{ fontSize: "11px", fontWeight: "500" }}>
                    +{formatPrice(size.price)}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>
      <style>{`
        .hover-border-danger:hover { border-color: var(--bs-danger) !important; }
      `}</style>
    </div>
  );
}

export default SizeSelector;
