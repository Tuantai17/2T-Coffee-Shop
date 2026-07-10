import React from 'react';

function IceSugarSelector({ type, title, levels = [], selectedLevel, onLevelChange }) {
  // type can be 'ice' or 'sugar' for different styling if needed
  const isIce = type === 'ice';
  const themeColor = isIce ? 'info' : 'warning';
  const iconClass = isIce ? 'fa-cubes' : 'fa-spoon';

  return (
    <div className="mb-4">
      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
        {title}
      </h6>
      <div className="d-flex flex-wrap gap-2">
        {levels.map((level) => {
          const isActive = selectedLevel === level.id;
          return (
            <label
              key={level.id}
              className={`flex-grow-1 position-relative rounded-3 py-2 px-2 border text-center transition-all ${
                isActive ? `border-${themeColor} bg-${themeColor}-subtle` : `border-light bg-white hover-border-${themeColor}`
              }`}
              style={{ cursor: "pointer", minWidth: "60px" }}
            >
              <input
                type="radio"
                name={type}
                className="position-absolute opacity-0"
                checked={isActive}
                onChange={() => onLevelChange(level.id)}
              />
              <div className="d-flex flex-column align-items-center gap-1">
                <i className={`fa-solid ${iconClass} ${isActive ? `text-${themeColor}` : "text-muted"}`} style={{ fontSize: "1.2rem" }}></i>
                <span className={`fw-semibold small ${isActive ? `text-${themeColor}` : "text-dark"}`}>{level.name}</span>
              </div>
            </label>
          );
        })}
      </div>
      <style>{`
        .hover-border-info:hover { border-color: var(--bs-info) !important; }
        .hover-border-warning:hover { border-color: var(--bs-warning) !important; }
        .bg-warning-subtle { background-color: #fff3cd !important; }
        .text-warning { color: #ffc107 !important; }
      `}</style>
    </div>
  );
}

export default IceSugarSelector;
