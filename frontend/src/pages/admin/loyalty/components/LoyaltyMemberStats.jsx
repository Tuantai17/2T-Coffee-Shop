import React, { useMemo } from "react";

function LoyaltyMemberStats({ members, onOpenTopMembers }) {
  const stats = useMemo(() => {
    if (!members || members.length === 0) {
      return { total: 0, active: 0, circulatingPoints: 0 };
    }
    const total = members.length;
    const active = members.filter(
      (m) => m.status === "Hoat dong" || m.status === "Hoạt động"
    ).length;
    const circulatingPoints = members.reduce(
      (sum, m) => sum + (m.points || 0),
      0
    );
    return { total, active, circulatingPoints };
  }, [members]);

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-4">
        <div className="card border-0 rounded-4 bg-white shadow-sm p-3 d-flex flex-row align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"
            style={{ width: "48px", height: "48px" }}
          >
            <i className="fa-solid fa-users fs-5"></i>
          </div>
          <div>
            <div className="text-muted small fw-medium">Tổng thành viên</div>
            <div className="fw-black fs-5 text-dark">
              {stats.total.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="card border-0 rounded-4 bg-white shadow-sm p-3 d-flex flex-row align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success"
            style={{ width: "48px", height: "48px" }}
          >
            <i className="fa-solid fa-user-check fs-5"></i>
          </div>
          <div>
            <div className="text-muted small fw-medium">Đang hoạt động</div>
            <div className="fw-black fs-5 text-dark">
              {stats.active.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="card border-0 rounded-4 bg-white shadow-sm p-3 d-flex flex-row align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning"
            style={{ width: "48px", height: "48px" }}
          >
            <i className="fa-solid fa-coins fs-5"></i>
          </div>
          <div className="flex-grow-1">
            <div className="text-muted small fw-medium">
              Tổng điểm lưu hành
            </div>
            <div className="fw-black fs-5 text-dark">
              {stats.circulatingPoints.toLocaleString("vi-VN")}
            </div>
          </div>
          <button
            className="btn btn-light border rounded-pill shadow-sm py-1 px-3 fw-bold text-nowrap action-btn"
            style={{ fontSize: "12px", color: "#d35400" }}
            onClick={onOpenTopMembers}
          >
            <i className="fa-solid fa-trophy me-1"></i> Top thành viên
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoyaltyMemberStats;
