import React, { useState } from "react";

function LoyaltyPointAdjustModal({ selectedUser, onClose, onSubmit, savingAdjustment }) {
  const [pointForm, setPointForm] = useState({
    adjustType: "addPoint",
    points: 500,
    reason: "Chăm sóc khách hàng",
    note: "",
  });
  const [error, setError] = useState("");

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

  const handleSubmit = () => {
    setError("");
    const points = Number(pointForm.points);
    if (!Number.isFinite(points) || points <= 0) {
      setError("Số điểm phải lớn hơn 0.");
      return;
    }

    if (pointForm.adjustType === "subPoint" && points > (selectedUser.points || 0)) {
      setError("Không được trừ quá số điểm hiện tại.");
      return;
    }

    onSubmit({
      ...pointForm,
      points
    });
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={!savingAdjustment ? onClose : undefined}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div className="modal-header border-bottom bg-light">
              <h5 className="modal-title fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "14px" }}>
                <i className="fa-solid fa-calculator text-primary"></i> CỘNG / TRỪ ĐIỂM THÀNH VIÊN
              </h5>
              <button type="button" className="btn-close shadow-none" onClick={onClose} disabled={savingAdjustment}></button>
            </div>
            <div className="modal-body p-4">
              <div className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-3 mb-4 shadow-sm">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={selectedUser.avatar || "https://api.dicebear.com/9.x/initials/svg?seed=" + selectedUser.name}
                    alt="avatar"
                    className="rounded-circle object-fit-cover"
                    style={{ width: "40px", height: "40px" }}
                  />
                  <div>
                    <div className="fw-bold" style={{ fontSize: "12px" }}>
                      {selectedUser.name}
                    </div>
                    <div>{getTierBadge(selectedUser.tier)}</div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-muted" style={{ fontSize: "10px" }}>
                    Điểm hiện tại
                  </div>
                  <div className="fw-black text-danger fs-5">
                    {selectedUser.points?.toLocaleString("vi-VN") || 0}
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2 px-3 small fw-medium rounded-3 mb-3">
                  <i className="fa-solid fa-triangle-exclamation me-2"></i> {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label text-muted fw-bold" style={{ fontSize: "11px" }}>
                  Loại điều chỉnh
                </label>
                <div className="d-flex gap-3">
                  <div
                    className={`form-check border rounded py-2 px-4 flex-grow-1 ${
                      pointForm.adjustType === "addPoint" ? "bg-success bg-opacity-10 border-success" : "bg-light"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setPointForm((prev) => ({ ...prev, adjustType: "addPoint" }))}
                  >
                    <input
                      className="form-check-input mt-1"
                      type="radio"
                      name="adjustType"
                      id="addPoint"
                      checked={pointForm.adjustType === "addPoint"}
                      onChange={() => {}}
                    />
                    <label className="form-check-label fw-bold text-success" style={{ fontSize: "12px", cursor: "pointer" }}>
                      <i className="fa-solid fa-plus me-1"></i> Cộng điểm
                    </label>
                  </div>
                  <div
                    className={`form-check border rounded py-2 px-4 flex-grow-1 ${
                      pointForm.adjustType === "subPoint" ? "bg-danger bg-opacity-10 border-danger" : "bg-light"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setPointForm((prev) => ({ ...prev, adjustType: "subPoint" }))}
                  >
                    <input
                      className="form-check-input mt-1"
                      type="radio"
                      name="adjustType"
                      id="subPoint"
                      checked={pointForm.adjustType === "subPoint"}
                      onChange={() => {}}
                    />
                    <label className="form-check-label fw-bold text-danger" style={{ fontSize: "12px", cursor: "pointer" }}>
                      <i className="fa-solid fa-minus me-1"></i> Trừ điểm
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted fw-bold" style={{ fontSize: "11px" }}>
                  Số điểm
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-control rounded-3"
                  placeholder="Ví dụ: 500"
                  value={pointForm.points}
                  onChange={(event) =>
                    setPointForm((prev) => ({ ...prev, points: event.target.value }))
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted fw-bold" style={{ fontSize: "11px" }}>
                  Lý do
                </label>
                <select
                  className="form-select rounded-3"
                  value={pointForm.reason}
                  onChange={(event) =>
                    setPointForm((prev) => ({ ...prev, reason: event.target.value }))
                  }
                >
                  <option>Chăm sóc khách hàng</option>
                  <option>Xử lý khiếu nại</option>
                  <option>Khuyến mãi thủ công</option>
                  <option>Lỗi hệ thống</option>
                  <option>Khác</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label text-muted fw-bold" style={{ fontSize: "11px" }}>
                  Ghi chú (Tùy chọn)
                </label>
                <textarea
                  className="form-control rounded-3"
                  rows="2"
                  placeholder="Thêm mô tả cho lần điều chỉnh điểm..."
                  value={pointForm.note}
                  onChange={(event) =>
                    setPointForm((prev) => ({ ...prev, note: event.target.value }))
                  }
                ></textarea>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4 fw-medium border"
                  onClick={onClose}
                  disabled={savingAdjustment}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm"
                  onClick={handleSubmit}
                  disabled={savingAdjustment}
                >
                  {savingAdjustment ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang lưu...</>
                  ) : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoyaltyPointAdjustModal;
