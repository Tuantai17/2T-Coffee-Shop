import React from "react";

function DashboardStatCard({ title, value, icon, color, percent, isIncrease, subtext, loading }) {
  return (
    <div className="neu-card p-4 h-100 position-relative d-flex flex-column justify-content-between">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "48px",
            height: "48px",
            backgroundColor: "var(--admin-surface)",
            boxShadow: "inset 3px 3px 6px var(--admin-shadow-dark), inset -3px -3px 6px var(--admin-shadow-light)",
            color: `var(--admin-${color})`,
            fontSize: "1.2rem"
          }}
        >
          <i className={`fa-solid ${icon}`}></i>
        </div>
        
        {percent && (
          <div 
            className="neu-pill"
            style={{
              padding: "4px 10px",
              fontSize: "0.8rem",
              color: isIncrease ? "var(--admin-success)" : "var(--admin-danger)",
              fontWeight: "600"
            }}
          >
            <i className={`fa-solid fa-arrow-${isIncrease ? 'up' : 'down'} me-1`}></i>
            {percent}%
          </div>
        )}
      </div>
      
      <div>
        <div className="text-muted mb-1">{title}</div>
        <h3 className="fw-bold mb-1" style={{ color: "var(--admin-text)", fontSize: "2rem" }}>
          {loading ? (
            <div className="placeholder-glow">
              <span className="placeholder col-6 rounded"></span>
            </div>
          ) : (
            value
          )}
        </h3>
        <small className="text-muted">{subtext}</small>
      </div>
    </div>
  );
}

export default DashboardStatCard;
