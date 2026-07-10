import React from "react";

function LoyaltyPointHistory({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fa-solid fa-clock-rotate-left mb-3 fs-1 text-light-muted"></i>
        <h6 className="fw-bold text-dark">Thành viên chưa có giao dịch điểm</h6>
        <p className="text-muted small mb-0">Lịch sử tích lũy và sử dụng điểm sẽ hiển thị tại đây.</p>
      </div>
    );
  }

  const getTypeStyle = (type, points) => {
    if (points > 0) return { color: "text-success", icon: "fa-arrow-trend-up", bg: "bg-success" };
    if (points < 0) return { color: "text-danger", icon: "fa-arrow-trend-down", bg: "bg-danger" };
    return { color: "text-warning", icon: "fa-clock", bg: "bg-warning" };
  };

  const getTypeLabel = (type, source) => {
    if (source === "ADMIN_ADJUSTMENT") return "Admin chỉnh tay";
    if (source === "ORDER_EARN") return "Cộng điểm mua hàng";
    if (source === "REWARD_REDEEM") return "Đổi voucher";
    if (source === "MINI_GAME") return "Mini game";
    if (source === "DAILY_CHECKIN") return "Điểm danh";
    if (source === "ORDER_REFUND") return "Hoàn điểm";
    return type || source || "Khác";
  };

  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead className="bg-light">
          <tr>
            <th className="border-0 text-muted small fw-bold py-2 ps-3">Thời gian</th>
            <th className="border-0 text-muted small fw-bold py-2">Loại giao dịch</th>
            <th className="border-0 text-muted small fw-bold py-2 text-end">Thay đổi</th>
            <th className="border-0 text-muted small fw-bold py-2 text-end">Sau GD</th>
            <th className="border-0 text-muted small fw-bold py-2">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => {
            const style = getTypeStyle(tx.type, tx.points);
            return (
              <tr key={tx.id || idx}>
                <td className="ps-3 text-muted" style={{ fontSize: "11px" }}>
                  {tx.date || "-"}
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${style.bg} bg-opacity-10 ${style.color}`} style={{ width: "24px", height: "24px" }}>
                      <i className={`fa-solid ${style.icon}`} style={{ fontSize: "10px" }}></i>
                    </div>
                    <span className="fw-medium text-dark" style={{ fontSize: "12px" }}>
                      {getTypeLabel(tx.type, tx.source)}
                    </span>
                  </div>
                </td>
                <td className={`text-end fw-black ${style.color}`} style={{ fontSize: "13px" }}>
                  {tx.points > 0 ? "+" : ""}{tx.points?.toLocaleString("vi-VN") || 0}
                </td>
                <td className="text-end fw-bold text-dark" style={{ fontSize: "12px" }}>
                  {tx.balanceAfter?.toLocaleString("vi-VN") || 0}
                </td>
                <td className="text-muted" style={{ fontSize: "11px", maxWidth: "150px", whiteSpace: "normal" }}>
                  {tx.description || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default LoyaltyPointHistory;
