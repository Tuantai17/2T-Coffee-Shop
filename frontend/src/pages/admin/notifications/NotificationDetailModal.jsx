import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNotificationIcon, getNotificationTypeBadge, formatTimeDisplay } from "../../../utils/notificationUtils";

function NotificationDetailModal({ show, notif, onClose, onToggleRead, onDelete }) {
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  if (!show || !notif) return null;

  const handleNavigate = () => {
    onClose();
    if (notif.targetUrl) {
      let finalUrl = notif.targetUrl;
      if (finalUrl.match(/^\/admin\/orders\/\d+$/)) {
        finalUrl = `${finalUrl}/edit`;
      }
      navigate(finalUrl);
    } else if (notif.type?.startsWith("ORDER") && notif.relatedEntityId) {
      navigate(`/admin/orders/${notif.relatedEntityId}/edit`);
    } else if (notif.type?.startsWith("PRODUCT") && notif.relatedEntityId) {
      navigate(`/admin/products`);
    } else if (notif.type?.startsWith("USER") && notif.relatedEntityId) {
      navigate(`/admin/users`);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div 
        className="modal fade show d-block" 
        tabIndex="-1" 
        style={{ zIndex: 1055 }}
        onClick={(e) => {
          if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
          }
        }}
      >
        <div className="modal-dialog modal-dialog-centered" ref={modalRef}>
          <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
            <div className="modal-header bg-light border-bottom px-4 py-3">
              <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                Chi tiết thông báo
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            
            <div className="modal-body p-4">
              <div className="d-flex align-items-start gap-3 mb-4">
                <div style={{ transform: "scale(1.2)", transformOrigin: "top left" }}>
                  {getNotificationIcon(notif.type)}
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-1">{notif.title}</h5>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    {getNotificationTypeBadge(notif.type)}
                    <span className="small text-muted"><i className="fa-regular fa-clock me-1"></i> {formatTimeDisplay(notif.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-light rounded-3 border mb-4">
                <p className="mb-0 text-dark" style={{ lineHeight: "1.6" }}>{notif.message}</p>
              </div>

              {notif.metadata && Object.keys(notif.metadata).length > 0 && (
                <div className="mb-3">
                  <h6 className="fw-bold small text-muted text-uppercase mb-2">Dữ liệu đính kèm</h6>
                  <pre className="bg-dark text-light p-3 rounded-3 small" style={{ whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(notif.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="modal-footer bg-light border-top px-4 py-3 d-flex justify-content-between align-items-center">
              <div>
                <button 
                  className={`btn btn-sm ${notif.isRead ? "btn-outline-secondary" : "btn-outline-success"} fw-semibold rounded-pill px-3 me-2`}
                  onClick={() => onToggleRead([notif.id], !notif.isRead)}
                >
                  <i className={`fa-solid ${notif.isRead ? "fa-envelope" : "fa-envelope-open"} me-1`}></i>
                  {notif.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger fw-semibold rounded-pill px-3"
                  onClick={() => {
                    onDelete([notif.id]);
                    onClose();
                  }}
                >
                  <i className="fa-regular fa-trash-can me-1"></i> Xóa
                </button>
              </div>
              
              {(notif.targetUrl || notif.relatedEntityId) && (
                <button 
                  className="btn btn-primary fw-bold rounded-pill px-4"
                  onClick={handleNavigate}
                >
                  Xem chi tiết <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationDetailModal;
