import React from "react";

function LoyaltyActivityTimeline({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fa-solid fa-list-check mb-3 fs-1 text-light-muted"></i>
        <h6 className="fw-bold text-dark">Chưa có nhật ký hoạt động</h6>
        <p className="text-muted small mb-0">Các hoạt động của thành viên sẽ được ghi nhận tại đây.</p>
      </div>
    );
  }

  const getIconAndColor = (type) => {
    switch (type) {
      case "LOGIN": return { icon: "fa-right-to-bracket", color: "text-primary", bg: "bg-primary" };
      case "ORDER": return { icon: "fa-bag-shopping", color: "text-success", bg: "bg-success" };
      case "VOUCHER": return { icon: "fa-ticket", color: "text-warning", bg: "bg-warning" };
      case "GAME": return { icon: "fa-gamepad", color: "text-info", bg: "bg-info" };
      case "CHECKIN": return { icon: "fa-calendar-check", color: "text-secondary", bg: "bg-secondary" };
      case "TIER_UP": return { icon: "fa-arrow-up-right-dots", color: "text-danger", bg: "bg-danger" };
      default: return { icon: "fa-bolt", color: "text-muted", bg: "bg-secondary" };
    }
  };

  return (
    <div className="position-relative ms-3 mt-3">
      {/* Vertical Line */}
      <div className="position-absolute h-100 border-start border-2" style={{ left: "11px", top: "10px", borderColor: "#e9ecef" }}></div>
      
      <div className="d-flex flex-column gap-4">
        {logs.map((log, index) => {
          const { icon, color, bg } = getIconAndColor(log.type);
          return (
            <div key={index} className="d-flex align-items-start gap-3 position-relative z-1">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center ${bg} text-white shadow-sm`}
                style={{ width: "24px", height: "24px", minWidth: "24px" }}
              >
                <i className={`fa-solid ${icon}`} style={{ fontSize: "10px" }}></i>
              </div>
              <div className="pt-1">
                <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>{log.title}</div>
                <div className="text-muted mb-1" style={{ fontSize: "11px" }}>{log.date}</div>
                <div className="text-muted bg-light p-2 rounded-3 border" style={{ fontSize: "12px" }}>
                  {log.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LoyaltyActivityTimeline;
