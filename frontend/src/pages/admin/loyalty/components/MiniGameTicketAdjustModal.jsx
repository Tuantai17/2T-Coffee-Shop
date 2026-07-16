import React, { useState, useEffect } from "react";
import miniGameApi from "../../../../api/miniGameApi";

function MiniGameTicketAdjustModal({ selectedUser, onClose, onSubmit, savingAdjustment }) {
  const [ticketForm, setTicketForm] = useState({
    adjustType: "addTicket",
    amount: 1,
    gameId: "",
    reason: "Tặng quà sự kiện",
    note: "",
  });
  const [error, setError] = useState("");
  const [limits, setLimits] = useState([]);
  const [loadingLimits, setLoadingLimits] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchLimits = async () => {
      try {
        setLoadingLimits(true);
        const res = await miniGameApi.getAdminUserLimits(selectedUser.id || selectedUser.userId);
        if (active) {
          const fetchedLimits = res.data || [];
          setLimits(fetchedLimits);
          if (fetchedLimits.length > 0) {
            setTicketForm((prev) => ({ ...prev, gameId: fetchedLimits[0].gameId }));
          }
        }
      } catch (err) {
        if (active) setError("Lỗi khi tải dữ liệu lượt chơi.");
      } finally {
        if (active) setLoadingLimits(false);
      }
    };
    fetchLimits();
    return () => { active = false; };
  }, [selectedUser]);

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
    const amount = Number(ticketForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Số lượt phải lớn hơn 0.");
      return;
    }
    if (!ticketForm.gameId) {
      setError("Vui lòng chọn một trò chơi.");
      return;
    }

    const selectedLimit = limits.find(l => String(l.gameId) === String(ticketForm.gameId));
    if (ticketForm.adjustType === "subTicket" && selectedLimit && amount > selectedLimit.remainingPlays) {
      setError("Không được trừ quá số vé còn lại.");
      return;
    }

    onSubmit({
      ...ticketForm,
      amount: ticketForm.adjustType === "subTicket" ? -amount : amount
    });
  };

  const selectedGameObj = limits.find(l => String(l.gameId) === String(ticketForm.gameId));

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={!savingAdjustment ? onClose : undefined}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div className="modal-header border-bottom bg-light">
              <h5 className="modal-title fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "14px" }}>
                <i className="fa-solid fa-gamepad text-primary"></i> CỘNG / TRỪ VÉ MINI GAME
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
                    Vé hiện tại (Game đã chọn)
                  </div>
                  <div className="fw-black text-danger fs-5">
                    {loadingLimits ? "..." : (selectedGameObj ? selectedGameObj.remainingPlays.toLocaleString("vi-VN") : 0)}
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
                  Trò chơi
                </label>
                <select
                  className="form-select rounded-3"
                  value={ticketForm.gameId}
                  onChange={(event) =>
                    setTicketForm((prev) => ({ ...prev, gameId: event.target.value }))
                  }
                  disabled={loadingLimits || limits.length === 0}
                >
                  {loadingLimits ? (
                    <option>Đang tải...</option>
                  ) : limits.length === 0 ? (
                    <option>Không có game khả dụng</option>
                  ) : (
                    limits.map(game => (
                      <option key={game.gameId} value={game.gameId}>
                        {game.gameName} (Còn {game.remainingPlays} vé)
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted fw-bold" style={{ fontSize: "11px" }}>
                  Loại điều chỉnh
                </label>
                <div className="d-flex gap-3">
                  <div
                    className={`form-check border rounded py-2 px-4 flex-grow-1 ${
                      ticketForm.adjustType === "addTicket" ? "bg-success bg-opacity-10 border-success" : "bg-light"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setTicketForm((prev) => ({ ...prev, adjustType: "addTicket" }))}
                  >
                    <input
                      className="form-check-input mt-1"
                      type="radio"
                      name="adjustType"
                      id="addTicket"
                      checked={ticketForm.adjustType === "addTicket"}
                      onChange={() => {}}
                    />
                    <label className="form-check-label fw-bold text-success" style={{ fontSize: "12px", cursor: "pointer" }}>
                      <i className="fa-solid fa-plus me-1"></i> Cộng vé
                    </label>
                  </div>
                  <div
                    className={`form-check border rounded py-2 px-4 flex-grow-1 ${
                      ticketForm.adjustType === "subTicket" ? "bg-danger bg-opacity-10 border-danger" : "bg-light"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setTicketForm((prev) => ({ ...prev, adjustType: "subTicket" }))}
                  >
                    <input
                      className="form-check-input mt-1"
                      type="radio"
                      name="adjustType"
                      id="subTicket"
                      checked={ticketForm.adjustType === "subTicket"}
                      onChange={() => {}}
                    />
                    <label className="form-check-label fw-bold text-danger" style={{ fontSize: "12px", cursor: "pointer" }}>
                      <i className="fa-solid fa-minus me-1"></i> Trừ vé
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted fw-bold" style={{ fontSize: "11px" }}>
                  Số lượt
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-control rounded-3"
                  placeholder="Ví dụ: 2"
                  value={ticketForm.amount}
                  onChange={(event) =>
                    setTicketForm((prev) => ({ ...prev, amount: event.target.value }))
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted fw-bold" style={{ fontSize: "11px" }}>
                  Lý do
                </label>
                <select
                  className="form-select rounded-3"
                  value={ticketForm.reason}
                  onChange={(event) =>
                    setTicketForm((prev) => ({ ...prev, reason: event.target.value }))
                  }
                >
                  <option>Tặng quà sự kiện</option>
                  <option>Chăm sóc khách hàng</option>
                  <option>Xử lý khiếu nại</option>
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
                  placeholder="Thêm mô tả cho lần điều chỉnh này..."
                  value={ticketForm.note}
                  onChange={(event) =>
                    setTicketForm((prev) => ({ ...prev, note: event.target.value }))
                  }
                ></textarea>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4 fw-medium border"
                  onClick={onClose}
                  disabled={savingAdjustment || loadingLimits}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm"
                  onClick={handleSubmit}
                  disabled={savingAdjustment || loadingLimits || limits.length === 0}
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

export default MiniGameTicketAdjustModal;
