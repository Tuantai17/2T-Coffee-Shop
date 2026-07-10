import React, { useState } from "react";
import LoyaltyPointHistory from "./LoyaltyPointHistory";
import LoyaltyActivityTimeline from "./LoyaltyActivityTimeline";

function LoyaltyMemberDetailDrawer({
  showDrawer,
  onClose,
  selectedUser,
  detailLoading,
  onOpenPointModal,
}) {
  const [internalNote, setInternalNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Default empty objects for missing API data to ensure safe mapping
  const safeUser = selectedUser || {};
  const stats = {
    totalOrders: safeUser.totalOrders || 0,
    totalSpent: safeUser.totalSpent || 0,
    lastOrderDate: safeUser.lastOrderDate || "-",
    averageOrderValue: safeUser.averageOrderValue || 0,
    returnRate: safeUser.returnRate || 0,
  };

  const vouchers = {
    available: safeUser.vouchersAvailable || 0,
    used: safeUser.vouchersUsed || 0,
    expired: safeUser.vouchersExpired || 0,
    exchanged: safeUser.vouchersExchanged || 0,
  };

  const miniGame = {
    played: safeUser.miniGamePlayed || 0,
    won: safeUser.miniGameWon || 0,
    rewards: safeUser.rewardsReceived || 0,
    points: safeUser.miniGamePoints || 0,
    lastPlayed: safeUser.lastPlayed || "-",
  };

  const checkin = {
    today: safeUser.checkinToday || false,
    currentStreak: safeUser.currentCheckinStreak || 0,
    bestStreak: safeUser.bestCheckinStreak || 0,
    points: safeUser.checkinPoints || 0,
    lastCheckin: safeUser.lastCheckinDate || "-",
  };

  const activityLogs = safeUser.activityLogs || [];
  const pointTransactions = safeUser.recentTransactions || [];

  const handleSaveNote = () => {
    setSavingNote(true);
    // Simulate API call
    setTimeout(() => {
      setSavingNote(false);
      // alert("Đã lưu ghi chú!");
    }, 500);
  };

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
      {showDrawer && (
        <div
          className="modal-backdrop fade show"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        ></div>
      )}

      <div
        className={`offcanvas offcanvas-end border-0 shadow-lg ${
          showDrawer ? "show" : ""
        }`}
        tabIndex="-1"
        style={{
          width: "520px",
          zIndex: 1050,
          visibility: showDrawer ? "visible" : "hidden",
          transition: "transform 0.3s ease-in-out",
          transform: showDrawer ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* HEADER (Fixed) */}
        <div className="offcanvas-header bg-light border-bottom d-flex align-items-center justify-content-between p-3">
          <h5 className="offcanvas-title fw-bold d-flex align-items-center gap-2 m-0" style={{ fontSize: "14px" }}>
            <i className="fa-solid fa-user-circle text-primary"></i> CHI TIẾT THÀNH VIÊN
          </h5>
          <button
            type="button"
            className="btn-close shadow-none"
            onClick={onClose}
          ></button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="offcanvas-body p-0 custom-scrollbar bg-light" style={{ overflowY: "auto" }}>
          {detailLoading ? (
            <div className="p-5 text-center text-muted">
              <div
                className="spinner-border text-primary mb-3"
                role="status"
              ></div>
              <p>Đang tải dữ liệu chi tiết...</p>
            </div>
          ) : safeUser.id ? (
            <div className="d-flex flex-column gap-3 p-3">
              {/* Profile Card */}
              <div className="card border-0 rounded-4 shadow-sm p-3">
                <div className="d-flex gap-3 align-items-center mb-3">
                  <img
                    src={
                      safeUser.avatar ||
                      "https://api.dicebear.com/9.x/initials/svg?seed=" +
                        safeUser.name
                    }
                    alt="avatar"
                    className="rounded-circle shadow-sm object-fit-cover border"
                    style={{ width: "64px", height: "64px" }}
                  />
                  <div className="flex-grow-1">
                    <h5 className="fw-black mb-1 text-dark d-flex align-items-center gap-2">
                      {safeUser.name}
                      {safeUser.status === "Tam khoa" ? (
                        <span className="badge bg-danger ms-2" style={{ fontSize: "10px" }}>Bị khóa</span>
                      ) : (
                        <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>Hoạt động</span>
                      )}
                    </h5>
                    <div className="text-muted" style={{ fontSize: "12px" }}>
                      ID: #{safeUser.id || safeUser.userId}
                    </div>
                  </div>
                  <div>{getTierBadge(safeUser.tier)}</div>
                </div>
                <div className="row g-2 text-dark mt-2" style={{ fontSize: "12px" }}>
                  <div className="col-6 d-flex align-items-center gap-2">
                    <i className="fa-solid fa-envelope text-muted"></i>{" "}
                    <span className="text-truncate">{safeUser.email || "Chưa có email"}</span>
                  </div>
                  <div className="col-6 d-flex align-items-center gap-2">
                    <i className="fa-solid fa-phone text-muted"></i>{" "}
                    {safeUser.phone || "Chưa cập nhật"}
                  </div>
                  <div className="col-6 d-flex align-items-center gap-2">
                    <i className="fa-regular fa-calendar-check text-muted"></i>{" "}
                    Tham gia: {safeUser.date || "-"}
                  </div>
                </div>
              </div>

              {/* Loyalty Points Card */}
              <div className="card border-0 rounded-4 shadow-sm p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h6 className="fw-bold mb-0 text-dark">
                    <i className="fa-solid fa-star text-warning me-2"></i>Điểm Loyalty
                  </h6>
                </div>
                <div className="text-center mb-4">
                  <div className="text-muted small fw-medium mb-1">ĐIỂM HIỆN TẠI</div>
                  <div className="fw-black text-danger" style={{ fontSize: "28px" }}>
                    {safeUser.points?.toLocaleString("vi-VN") || 0}
                  </div>
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="bg-light rounded-3 p-2 text-center border">
                      <div className="text-muted" style={{ fontSize: "10px" }}>Tổng điểm đã tích</div>
                      <div className="fw-bold text-dark">{safeUser.lifetimeEarnedPoints?.toLocaleString("vi-VN") || 0}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light rounded-3 p-2 text-center border">
                      <div className="text-muted" style={{ fontSize: "10px" }}>Tổng điểm đã sử dụng</div>
                      <div className="fw-bold text-dark">{safeUser.lifetimeUsedPoints?.toLocaleString("vi-VN") || 0}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="bg-light rounded-3 p-2 text-center border">
                      <div className="text-muted" style={{ fontSize: "10px" }}>Điểm chờ cộng</div>
                      <div className="fw-bold text-warning">{safeUser.pendingPoints?.toLocaleString("vi-VN") || 0}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="bg-light rounded-3 p-2 text-center border">
                      <div className="text-muted" style={{ fontSize: "10px" }}>Điểm đang giữ</div>
                      <div className="fw-bold text-info">{safeUser.reservedPoints?.toLocaleString("vi-VN") || 0}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="bg-light rounded-3 p-2 text-center border">
                      <div className="text-muted" style={{ fontSize: "10px" }}>Sắp hết hạn</div>
                      <div className="fw-bold text-danger">{safeUser.expiringPoints?.toLocaleString("vi-VN") || 0}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Stats Card */}
              <div className="card border-0 rounded-4 shadow-sm p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h6 className="fw-bold mb-0 text-dark">
                    <i className="fa-solid fa-bag-shopping text-primary me-2"></i>Thống kê mua hàng
                  </h6>
                </div>
                {stats.totalOrders > 0 ? (
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="text-muted" style={{ fontSize: "11px" }}>Tổng số đơn hàng</div>
                      <div className="fw-bold text-dark">{stats.totalOrders} đơn</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted" style={{ fontSize: "11px" }}>Tổng tiền đã mua</div>
                      <div className="fw-bold text-dark">{stats.totalSpent.toLocaleString("vi-VN")}đ</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted" style={{ fontSize: "11px" }}>Đơn gần nhất</div>
                      <div className="fw-bold text-dark">{stats.lastOrderDate}</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted" style={{ fontSize: "11px" }}>Trung bình/đơn</div>
                      <div className="fw-bold text-dark">{stats.averageOrderValue.toLocaleString("vi-VN")}đ</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <i className="fa-solid fa-box-open fs-3 text-light-muted mb-2"></i>
                    <p className="text-muted small mb-0">Chưa có dữ liệu mua hàng</p>
                  </div>
                )}
              </div>

              {/* Vouchers Card */}
              <div className="card border-0 rounded-4 shadow-sm p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h6 className="fw-bold mb-0 text-dark">
                    <i className="fa-solid fa-ticket text-danger me-2"></i>Voucher
                  </h6>
                  <button className="btn btn-link btn-sm text-decoration-none p-0">Xem tất cả</button>
                </div>
                <div className="row g-2 text-center">
                  <div className="col-3">
                    <div className="fs-5 fw-bold text-success">{vouchers.available}</div>
                    <div className="text-muted" style={{ fontSize: "10px" }}>Đang có</div>
                  </div>
                  <div className="col-3">
                    <div className="fs-5 fw-bold text-primary">{vouchers.used}</div>
                    <div className="text-muted" style={{ fontSize: "10px" }}>Đã dùng</div>
                  </div>
                  <div className="col-3">
                    <div className="fs-5 fw-bold text-secondary">{vouchers.expired}</div>
                    <div className="text-muted" style={{ fontSize: "10px" }}>Hết hạn</div>
                  </div>
                  <div className="col-3">
                    <div className="fs-5 fw-bold text-warning">{vouchers.exchanged}</div>
                    <div className="text-muted" style={{ fontSize: "10px" }}>Đã đổi</div>
                  </div>
                </div>
              </div>

              {/* Mini Game & Check-in Accordion (Space saving) */}
              <div className="accordion" id="accordionGames">
                <div className="accordion-item border-0 rounded-4 shadow-sm mb-3 overflow-hidden">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed bg-white fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseGame" style={{ fontSize: "14px" }}>
                      <i className="fa-solid fa-gamepad text-info me-2"></i> Mini Game
                    </button>
                  </h2>
                  <div id="collapseGame" className="accordion-collapse collapse" data-bs-parent="#accordionGames">
                    <div className="accordion-body bg-white border-top">
                      {miniGame.played > 0 ? (
                        <div className="row g-3">
                          <div className="col-6">
                            <div className="text-muted" style={{ fontSize: "11px" }}>Số lần chơi</div>
                            <div className="fw-bold text-dark">{miniGame.played}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted" style={{ fontSize: "11px" }}>Số lần thắng</div>
                            <div className="fw-bold text-dark">{miniGame.won}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted" style={{ fontSize: "11px" }}>Điểm nhận được</div>
                            <div className="fw-bold text-success">+{miniGame.points}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted" style={{ fontSize: "11px" }}>Lần chơi gần nhất</div>
                            <div className="fw-bold text-dark">{miniGame.lastPlayed}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <i className="fa-solid fa-ghost fs-3 text-light-muted mb-2"></i>
                          <p className="text-muted small mb-0">Chưa có dữ liệu mini game</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item border-0 rounded-4 shadow-sm overflow-hidden">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed bg-white fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCheckin" style={{ fontSize: "14px" }}>
                      <i className="fa-solid fa-calendar-check text-success me-2"></i> Điểm danh
                    </button>
                  </h2>
                  <div id="collapseCheckin" className="accordion-collapse collapse" data-bs-parent="#accordionGames">
                    <div className="accordion-body bg-white border-top">
                      {checkin.currentStreak > 0 || checkin.lastCheckin !== "-" ? (
                        <div className="row g-3">
                          <div className="col-6">
                            <div className="text-muted" style={{ fontSize: "11px" }}>Trạng thái hôm nay</div>
                            <div className="fw-bold text-dark">{checkin.today ? <span className="text-success"><i className="fa-solid fa-check me-1"></i>Đã điểm danh</span> : "Chưa điểm danh"}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted" style={{ fontSize: "11px" }}>Chuỗi hiện tại</div>
                            <div className="fw-bold text-dark">{checkin.currentStreak} ngày</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted" style={{ fontSize: "11px" }}>Chuỗi cao nhất</div>
                            <div className="fw-bold text-dark">{checkin.bestStreak} ngày</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted" style={{ fontSize: "11px" }}>Điểm nhận được</div>
                            <div className="fw-bold text-success">+{checkin.points}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <i className="fa-regular fa-calendar-xmark fs-3 text-light-muted mb-2"></i>
                          <p className="text-muted small mb-0">Chưa có dữ liệu điểm danh</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Point History Card */}
              <div className="card border-0 rounded-4 shadow-sm p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h6 className="fw-bold mb-0 text-dark">
                    <i className="fa-solid fa-clock-rotate-left text-secondary me-2"></i>Lịch sử điểm Loyalty
                  </h6>
                </div>
                <LoyaltyPointHistory transactions={pointTransactions} />
              </div>

              {/* Activity Timeline Card */}
              <div className="card border-0 rounded-4 shadow-sm p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h6 className="fw-bold mb-0 text-dark">
                    <i className="fa-solid fa-list-check text-info me-2"></i>Nhật ký hoạt động
                  </h6>
                </div>
                <LoyaltyActivityTimeline logs={activityLogs} />
              </div>

              {/* Admin Note Card */}
              <div className="card border-0 rounded-4 shadow-sm p-3 border-start border-warning border-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-dark">
                    <i className="fa-solid fa-note-sticky text-warning me-2"></i>Ghi chú nội bộ
                  </h6>
                  <span className="badge bg-light text-muted border">Chỉ admin thấy</span>
                </div>
                <textarea 
                  className="form-control bg-light rounded-3 border-0 shadow-none mb-2 text-dark" 
                  rows="3"
                  placeholder="Nhập ghi chú nội bộ về thành viên này (ví dụ: Khách VIP, hay mua cuối tuần...)"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  style={{ fontSize: "13px" }}
                ></textarea>
                <div className="text-end">
                  <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={handleSaveNote} disabled={savingNote}>
                    {savingNote ? <><span className="spinner-border spinner-border-sm me-1"></span> Đang lưu...</> : "Lưu ghi chú"}
                  </button>
                </div>
              </div>
              
              {/* Extra spacing for sticky footer */}
              <div style={{ height: "40px" }}></div>
            </div>
          ) : null}
        </div>

        {/* FOOTER (Sticky Actions) */}
        <div className="offcanvas-footer bg-white border-top p-3 shadow-lg" style={{ position: "sticky", bottom: 0, zIndex: 10 }}>
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-success flex-grow-1 rounded-pill fw-bold text-nowrap"
              onClick={() => onOpenPointModal(safeUser)}
            >
              <i className="fa-solid fa-plus me-1"></i> Cộng/Trừ điểm
            </button>
            <button
              className="btn btn-outline-danger rounded-pill fw-medium text-nowrap"
            >
              <i className="fa-solid fa-lock me-1"></i> Khóa
            </button>
            <button className="btn btn-light border rounded-pill shadow-sm" title="Xem lịch sử">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        .text-light-muted { color: #dee2e6; }
      `}</style>
    </>
  );
}

export default LoyaltyMemberDetailDrawer;
