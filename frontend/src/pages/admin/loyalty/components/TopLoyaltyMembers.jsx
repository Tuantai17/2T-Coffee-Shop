import React, { useMemo } from "react";

function TopLoyaltyMembers({ members, onClose, onOpenDetail }) {
  const topMembers = useMemo(() => {
    return [...members]
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10);
  }, [members]);

  const getTierBadge = (tier) => {
    if (!tier) return <span className="badge bg-light text-dark border rounded-pill px-2 py-1">Khách</span>;
    switch (tier.toLowerCase()) {
      case "silver":
        return (
          <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-2 py-1">
            <i className="fa-solid fa-medal me-1"></i> Silver
          </span>
        );
      case "gold":
        return (
          <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-2 py-1">
            <i className="fa-solid fa-award me-1"></i> Gold
          </span>
        );
      case "platinum":
        return (
          <span
            className="badge border rounded-pill px-2 py-1"
            style={{ backgroundColor: "#f9f6fd", color: "#9b59b6", borderColor: "#9b59b640" }}
          >
            <i className="fa-solid fa-gem me-1"></i> Platinum
          </span>
        );
      case "diamond":
        return (
          <span
            className="badge border rounded-pill px-2 py-1"
            style={{ backgroundColor: "#f5fafd", color: "#3498db", borderColor: "#3498db40" }}
          >
            <i className="fa-solid fa-diamond me-1"></i> Diamond
          </span>
        );
      default:
        return <span className="badge bg-light text-dark border rounded-pill px-2 py-1">{tier}</span>;
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div className="modal-header border-bottom bg-light">
              <h5 className="modal-title fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "14px" }}>
                <i className="fa-solid fa-trophy text-warning"></i> TOP 10 THÀNH VIÊN ĐIỂM CAO NHẤT
              </h5>
              <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
            </div>
            <div className="modal-body p-0 bg-light">
              {topMembers.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <i className="fa-solid fa-box-open fs-2 mb-3"></i>
                  <p>Chưa có dữ liệu thành viên.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {topMembers.map((user, index) => {
                    const isTop3 = index < 3;
                    const rankClass = index === 0 ? "text-warning" : index === 1 ? "text-secondary" : index === 2 ? "text-danger" : "text-muted";
                    
                    return (
                      <div
                        key={user.id || user.userId || index}
                        className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 ${isTop3 ? 'bg-white' : 'bg-transparent'}`}
                        style={{ borderLeft: isTop3 ? `4px solid ${index === 0 ? '#ffc107' : index === 1 ? '#6c757d' : '#dc3545'}` : 'none' }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div className={`fw-black fs-5 ${rankClass}`} style={{ width: "30px", textAlign: "center" }}>
                            #{index + 1}
                          </div>
                          <img
                            src={user.avatar || "https://api.dicebear.com/9.x/initials/svg?seed=" + user.name}
                            alt="avatar"
                            className="rounded-circle shadow-sm object-fit-cover"
                            style={{ width: isTop3 ? "48px" : "36px", height: isTop3 ? "48px" : "36px" }}
                          />
                          <div>
                            <div className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: isTop3 ? "14px" : "13px" }}>
                              {user.name}
                              {index === 0 && <i className="fa-solid fa-crown text-warning" title="Top 1"></i>}
                            </div>
                            <div className="text-muted" style={{ fontSize: "11px" }}>
                              {user.email || "Chưa có email"}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-4">
                          <div className="d-none d-sm-block">
                            {getTierBadge(user.tier)}
                          </div>
                          <div className="text-end">
                            <div className="fw-black text-danger" style={{ fontSize: isTop3 ? "15px" : "14px" }}>
                              {user.points?.toLocaleString("vi-VN") || 0} pts
                            </div>
                            <div className="text-muted small">
                              Đã chi: {user.totalSpent ? user.totalSpent.toLocaleString("vi-VN") + "đ" : "-"}
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-light rounded-circle text-primary action-btn shadow-sm border"
                            title="Xem chi tiết"
                            onClick={() => {
                              onClose();
                              onOpenDetail(user);
                            }}
                          >
                            <i className="fa-regular fa-eye"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-footer border-top bg-white">
              <button type="button" className="btn btn-light border rounded-pill px-4 fw-medium" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TopLoyaltyMembers;
