import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyNotifications, markMyNotificationAsRead, markAllMyNotificationsAsRead } from "../../../../services/notificationService";
import { getNotificationIcon, formatRelativeTime, formatTimeDisplay } from "../../../../utils/notificationUtils";
import { getAuthSession, AUTH_SCOPES } from "../../../../utils/authStorage";

function ProfileNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL, UNREAD

  const fetchNotifications = useCallback(async () => {
    const { token } = getAuthSession(AUTH_SCOPES.USER);
    if (!token) return;
    
    try {
      setLoading(true);
      setError(false);
      const res = await getMyNotifications();
      setNotifications(res.data?.content || []);
    } catch (err) {
      console.error("Lỗi lấy thông báo:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncEvent = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    window.addEventListener("notifications_updated", syncEvent);
    return () => {
      window.removeEventListener("notifications_updated", syncEvent);
    };
  }, [syncEvent, fetchNotifications]);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markMyNotificationAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        window.dispatchEvent(new Event("notifications_updated"));
      } catch (e) {
        console.error("Lỗi đánh dấu đã đọc", e);
      }
    }
    
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    } else if (notif.type?.startsWith("ORDER") && notif.referenceId) {
      navigate('/profile/orders', { state: { openOrder: notif.referenceId } });
    } else if (notif.type?.startsWith("PRODUCT") && notif.referenceId) {
      navigate(`/products/${notif.referenceId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllMyNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (e) {
      console.error("Lỗi đánh dấu tất cả đã đọc", e);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "UNREAD") return !n.read;
    return true;
  });

  return (
    <div className="card shadow-sm border-0 rounded-4 h-100 bg-white">
      <div className="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Thông báo</h4>
          <p className="text-muted mb-0 small">Quản lý và xem các thông báo của bạn.</p>
        </div>
        <div>
          <button 
            className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
            onClick={handleMarkAllRead}
            disabled={notifications.filter(n => !n.isRead).length === 0}
          >
            <i className="fa-solid fa-check-double me-2"></i>
            Đánh dấu đã đọc tất cả
          </button>
        </div>
      </div>
      
      <div className="px-4 pb-2">
        <ul className="nav nav-pills custom-nav-pills gap-2 border-bottom pb-2">
          <li className="nav-item">
            <button 
              className={`nav-link px-4 py-2 rounded-pill fw-semibold ${filter === "ALL" ? "active bg-danger text-white" : "text-dark bg-light"}`}
              onClick={() => setFilter("ALL")}
              style={{ transition: "all 0.2s" }}
            >
              Tất cả
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link px-4 py-2 rounded-pill fw-semibold ${filter === "UNREAD" ? "active bg-danger text-white" : "text-dark bg-light"}`}
              onClick={() => setFilter("UNREAD")}
              style={{ transition: "all 0.2s" }}
            >
              Chưa đọc
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="badge bg-white text-danger ms-2 rounded-pill">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          </li>
        </ul>
      </div>

      <div className="card-body p-0">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <p className="text-muted mt-3">Đang tải thông báo...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <i className="fa-regular fa-face-frown text-muted fs-1 mb-3"></i>
            <p className="text-muted mb-2">Không thể tải thông báo.</p>
            <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={fetchNotifications}>Thử lại</button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-5 my-4">
            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: "80px", height: "80px" }}>
              <i className="fa-regular fa-bell-slash text-muted fs-3"></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">Chưa có thông báo nào</h5>
            <p className="text-muted mb-0">Bạn chưa có thông báo {filter === "UNREAD" ? "chưa đọc " : ""}nào tại thời điểm này.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush pb-3">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`d-flex gap-3 p-4 border-bottom position-relative ${!notif.read ? "bg-light bg-opacity-50" : ""}`}
                style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                onClick={() => handleNotificationClick(notif)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--admin-surface)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notif.read ? "rgba(248, 249, 250, 0.5)" : "transparent"}
              >
                {/* Unread Dot */}
                {!notif.read && (
                  <div className="position-absolute bg-primary rounded-circle" style={{ width: "10px", height: "10px", left: "12px", top: "30px" }}></div>
                )}
                
                <div className="ms-2">
                  {getNotificationIcon(notif.type)}
                </div>
                
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className={`mb-0 ${!notif.read ? "fw-bold text-dark" : "fw-semibold text-secondary"}`} style={{ fontSize: "15px" }}>
                      {notif.title}
                    </h6>
                    <span className="small text-muted text-nowrap ms-3" style={{ fontSize: "12px" }}>
                      <i className="fa-regular fa-clock me-1"></i> {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`mb-1 ${!notif.read ? "text-dark" : "text-muted"}`} style={{ fontSize: "14px" }}>
                    {notif.message}
                  </p>
                  {notif.actionUrl && (
                    <button className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-medium" style={{ fontSize: "0.8rem" }}>
                      Xem chi tiết <i className="fa-solid fa-chevron-right ms-1" style={{ fontSize: "0.7rem" }}></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileNotifications;
