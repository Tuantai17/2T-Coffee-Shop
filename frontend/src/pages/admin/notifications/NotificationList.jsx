import React from "react";
import { getNotificationIcon, getNotificationTypeBadge, formatTimeDisplay } from "../../../utils/notificationUtils";

function NotificationList({
  notifications,
  loading,
  error,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onViewDetail,
  onDelete,
  onToggleRead
}) {
  const isAllSelected = notifications.length > 0 && notifications.every((n) => selectedIds.includes(n.id));
  const isIndeterminate = !isAllSelected && notifications.some((n) => selectedIds.includes(n.id));

  return (
    <div className="neu-card overflow-hidden mb-4">
      {/* Bulk Actions Header */}
      {selectedIds.length > 0 && (
        <div className="bg-light px-4 py-3 d-flex align-items-center justify-content-between border-bottom">
          <div className="fw-bold text-primary">
            <i className="fa-regular fa-square-check me-2"></i>
            Đã chọn {selectedIds.length} thông báo
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold" onClick={() => onToggleRead(selectedIds, true)}>
              <i className="fa-solid fa-check-double me-1"></i> Đánh dấu đã đọc
            </button>
            <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold" onClick={() => onDelete(selectedIds)}>
              <i className="fa-regular fa-trash-can me-1"></i> Xóa
            </button>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ minWidth: "1000px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface)", borderBottom: "2px solid rgba(0,0,0,0.05)" }}>
              <th className="px-4 py-3" style={{ width: "40px" }}>
                <input
                  type="checkbox"
                  className="form-check-input shadow-sm"
                  style={{ cursor: "pointer" }}
                  checked={isAllSelected}
                  ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
                  onChange={(e) => onSelectAll(e.target.checked, notifications)}
                />
              </th>
              <th className="py-3 text-muted small fw-bold">Thông báo</th>
              <th className="py-3 text-muted small fw-bold text-center">Loại thông báo</th>
              <th className="py-3 text-muted small fw-bold text-center">Thời gian</th>
              <th className="py-3 text-muted small fw-bold text-center">Trạng thái</th>
              <th className="py-3 text-muted small fw-bold text-center" style={{ width: "150px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan="6" className="px-4 py-3">
                    <div className="placeholder-glow d-flex gap-3 align-items-center">
                      <span className="placeholder rounded-circle" style={{ width: "40px", height: "40px" }}></span>
                      <span className="placeholder rounded col-4"></span>
                      <span className="placeholder rounded col-2"></span>
                    </div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  <i className="fa-regular fa-face-frown fs-1 mb-3"></i>
                  <p className="mb-0">Không thể tải danh sách thông báo. Vui lòng thử lại sau.</p>
                </td>
              </tr>
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  <i className="fa-regular fa-bell-slash fs-1 mb-3"></i>
                  <p className="mb-0">Bạn chưa có thông báo nào thỏa mãn điều kiện lọc.</p>
                </td>
              </tr>
            ) : (
              notifications.map((notif) => (
                <tr key={notif.id} style={{ borderBottom: "1px dashed rgba(0,0,0,0.05)", backgroundColor: notif.isRead ? "transparent" : "rgba(248, 249, 250, 0.5)" }}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="form-check-input shadow-sm"
                      style={{ cursor: "pointer" }}
                      checked={selectedIds.includes(notif.id)}
                      onChange={(e) => onSelectOne(notif.id, e.target.checked)}
                    />
                  </td>
                  <td className="py-3 cursor-pointer" onClick={() => onViewDetail(notif)}>
                    <div className="d-flex align-items-center gap-3">
                      {getNotificationIcon(notif.type)}
                      <div>
                        <div className={`mb-1 ${!notif.isRead ? "fw-bold text-dark" : "fw-semibold text-secondary"}`}>
                          {notif.title}
                        </div>
                        <div className="small text-muted" style={{ display: "-webkit-box", WebkitLineClamp: "1", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {notif.message}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    {getNotificationTypeBadge(notif.type)}
                  </td>
                  <td className="py-3 text-center small text-muted">
                    {formatTimeDisplay(notif.createdAt)}
                  </td>
                  <td className="py-3 text-center">
                    {notif.isRead ? (
                      <span className="badge text-success d-flex align-items-center justify-content-center gap-1 mx-auto" style={{ width: "fit-content" }}>
                        <div className="rounded-circle bg-success" style={{ width: "6px", height: "6px", opacity: 0.5 }}></div> Đã đọc
                      </span>
                    ) : (
                      <span className="badge text-warning d-flex align-items-center justify-content-center gap-1 mx-auto fw-bold" style={{ width: "fit-content" }}>
                        <div className="rounded-circle bg-warning" style={{ width: "8px", height: "8px" }}></div> Chưa đọc
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button 
                        className="btn btn-sm btn-light text-secondary rounded-circle shadow-sm" 
                        style={{ width: "32px", height: "32px" }} 
                        title="Xem chi tiết" 
                        onClick={() => onViewDetail(notif)}
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                      <button 
                        className={`btn btn-sm btn-light rounded-circle shadow-sm ${notif.isRead ? "text-primary" : "text-success"}`} 
                        style={{ width: "32px", height: "32px" }} 
                        title={notif.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"} 
                        onClick={() => onToggleRead([notif.id], !notif.isRead)}
                      >
                        <i className={`fa-solid ${notif.isRead ? "fa-envelope" : "fa-envelope-open"}`}></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-light text-danger rounded-circle shadow-sm" 
                        style={{ width: "32px", height: "32px" }} 
                        title="Xóa" 
                        onClick={() => onDelete([notif.id])}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NotificationList;
