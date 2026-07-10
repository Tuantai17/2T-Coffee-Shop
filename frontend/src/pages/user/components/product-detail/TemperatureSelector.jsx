import React from 'react';

function TemperatureSelector({ levels = [], selectedTemp, onTempChange }) {
  if (!levels || levels.length === 0) return null;

  return (
    <div className="mb-4">
      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
        2. Nhiệt độ <span className="text-danger">*</span>
      </h6>
      <div className="d-flex flex-wrap gap-3">
        {levels.map((level) => {
          const isHot = level.name.toLowerCase().includes('nóng') || level.name.toLowerCase().includes('hot');
          const isActive = selectedTemp === level.id;
          const themeColor = isHot ? 'danger' : 'info';
          const iconClass = isHot ? 'fa-fire' : 'fa-snowflake';

          return (
            <label
              key={level.id}
              className={`flex-grow-1 position-relative rounded-pill py-2 px-3 border text-center transition-all ${
                isActive ? `border-${themeColor} bg-${themeColor} text-white shadow-sm` : `border-light bg-white text-dark hover-border-${themeColor}`
              }`}
              style={{ cursor: "pointer" }}
            >
              <input
                type="radio"
                name="temperature"
                className="position-absolute opacity-0"
                checked={isActive}
                onChange={() => onTempChange(level.id)}
              />
              <div className="d-flex align-items-center justify-content-center gap-2 fw-semibold">
                <i className={`fa-solid ${iconClass}`}></i> {level.name}
              </div>
            </label>
          );
        })}
      </div>
      <style>{`
        .hover-border-info:hover { border-color: var(--bs-info) !important; color: var(--bs-info) !important; }
        .hover-border-danger:hover { border-color: var(--bs-danger) !important; color: var(--bs-danger) !important; }
      `}</style>
    </div>
  );
}

export default TemperatureSelector;
