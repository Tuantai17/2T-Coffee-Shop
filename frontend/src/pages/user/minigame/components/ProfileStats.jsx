import React from "react";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export default function ProfileStats({ summary }) {
  return (
    <div className="mg-card-alt h-100">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: 64, height: 64 }}>
          <i className="fa-solid fa-user text-warning fs-3"></i>
        </div>
        <div>
          <h3 className="mg-card-title mb-1">Hồ sơ người chơi</h3>
          <p className="text-muted small mb-0">Thống kê mini game của bạn</p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-6">
          <div className="p-3 bg-white rounded-3 border">
            <span className="d-block text-muted small mb-1">Tổng lượt chơi</span>
            <strong className="fs-4">{formatNumber(summary?.totalPlays)}</strong>
          </div>
        </div>
        <div className="col-6">
          <div className="p-3 bg-white rounded-3 border">
            <span className="d-block text-muted small mb-1">Tổng điểm</span>
            <strong className="fs-4 text-warning">{formatNumber(summary?.totalPoints)}</strong>
          </div>
        </div>
        <div className="col-6">
          <div className="p-3 bg-white rounded-3 border">
            <span className="d-block text-muted small mb-1">Voucher</span>
            <strong className="fs-4 text-primary">{formatNumber(summary?.totalVouchers)}</strong>
          </div>
        </div>
        <div className="col-6">
          <div className="p-3 bg-white rounded-3 border">
            <span className="d-block text-muted small mb-1">Lần chơi cuối</span>
            <strong className="fs-6 d-block mt-2">
              {summary?.lastPlayedAt ? new Date(summary.lastPlayedAt).toLocaleDateString("vi-VN") : "-"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
