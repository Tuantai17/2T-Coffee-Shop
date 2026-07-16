import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getMyNotifications, getMyUnreadCount, markMyNotificationAsRead, markAllMyNotificationsAsRead } from "../services/notificationService";
import { getAuthSession, AUTH_SCOPES } from "../utils/authStorage";

import { getNotificationIcon, formatRelativeTime } from "../utils/notificationUtils";
import notificationSocket from "../services/notificationSocket";

function UserNotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const { token } = getAuthSession(AUTH_SCOPES.USER);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(false);
      const [listRes, countRes] = await Promise.all([
        getMyNotifications(),
        getMyUnreadCount()
      ]);
      setNotifications(listRes.data?.content || []);
      setUnreadCount(countRes.data || 0);
    } catch (err) {
      console.error("Lỗi lấy thông báo:", err);
      setError(true);
      setNotifications([]);
      setUnreadCount(0);
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
    
    // Connect websocket
    notificationSocket.connect((msg) => {
      // The socket already dispatches notifications_updated event
    });
    
    return () => {
      window.removeEventListener("notifications_updated", syncEvent);
    };
  }, [syncEvent]);

  const dropdownRef = React.useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (isOpen && e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevents multiple instances from triggering each other
    setIsOpen(prev => !prev);
    if (!isOpen && !notifications.length && !error) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markMyNotificationAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        window.dispatchEvent(new Event("notifications_updated"));
      } catch (e) {
        console.error("Lỗi đánh dấu đã đọc", e);
      }
    }
    
    setIsOpen(false);
    
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    } else if (notif.type?.startsWith("ORDER") && notif.referenceId) {
      navigate('/profile/orders', { state: { openOrder: notif.referenceId } });
    } else if (notif.type?.startsWith("PRODUCT") && notif.referenceId) {
      navigate(`/products/${notif.referenceId}`);
    } else {
      navigate("/profile/notifications");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllMyNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (e) {
      console.error("Lỗi mark all read", e);
    }
  };

  return (
    <div ref={dropdownRef} className="position-relative text-dark" style={{ cursor: "pointer" }} onClick={handleToggle}>
      <i className="fa-regular fa-bell fs-5"></i>
      {unreadCount > 0 && (
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {isOpen && (
        <div 
          className="position-absolute bg-white shadow-lg rounded-4 overflow-hidden" 
          style={{ 
            top: "55px", 
            right: "0", 
            width: "420px", 
            zIndex: 1050,
            border: "1px solid rgba(0,0,0,0.05)"
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="fw-bold mb-0 d-flex align-items-center">
              Thông báo 
              {unreadCount > 0 && <span className="badge bg-danger rounded-pill ms-2">{unreadCount}</span>}
            </h6>
            {unreadCount > 0 && (
              <button 
                className="btn btn-link btn-sm text-primary text-decoration-none fw-semibold p-0" 
                onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div style={{ maxHeight: "400px", overflowY: "auto" }} className="notification-list">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="d-flex gap-3 p-3 border-bottom">
                  <div className="placeholder-glow"><span className="placeholder rounded-circle" style={{ width: "40px", height: "40px" }}></span></div>
                  <div className="w-100 placeholder-glow">
                    <span className="placeholder col-8 mb-2"></span>
                    <span className="placeholder col-12 mb-1"></span>
                    <span className="placeholder col-4"></span>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="text-center py-5">
                <i className="fa-regular fa-face-frown text-muted fs-1 mb-3"></i>
                <p className="text-muted mb-2">Không thể tải thông báo.</p>
                <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={fetchNotifications}>Thử lại</button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-5">
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: "60px", height: "60px" }}>
                  <i className="fa-regular fa-bell-slash text-muted fs-4"></i>
                </div>
                <p className="text-muted mb-0">Bạn chưa có thông báo mới.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`d-flex gap-3 p-3 border-bottom position-relative ${!notif.read ? "bg-light bg-opacity-50" : ""}`}
                  style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                  onClick={(e) => { e.stopPropagation(); handleNotificationClick(notif); }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--admin-surface)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notif.read ? "rgba(248, 249, 250, 0.5)" : "transparent"}
                >
                  {/* Unread Dot */}
                  {!notif.read && (
                    <div className="position-absolute bg-primary rounded-circle" style={{ width: "8px", height: "8px", left: "8px", top: "20px" }}></div>
                  )}
                  
                  <div className="ms-2">
                    {getNotificationIcon(notif.type)}
                  </div>
                  
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className={`mb-0 ${!notif.read ? "fw-bold text-dark" : "fw-semibold text-secondary"}`} style={{ fontSize: "14px" }}>
                        {notif.title}
                      </h6>
                      <span className="small text-muted text-nowrap ms-2" style={{ fontSize: "11px" }}>
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className={`mb-0 small ${!notif.read ? "text-dark" : "text-muted"}`} style={{ fontSize: "13px", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-top text-center bg-light">
            <Link 
              to="/profile/notifications" 
              className="btn btn-sm btn-link text-decoration-none fw-bold text-primary w-100"
              onClick={() => setIsOpen(false)}
            >
              Xem tất cả thông báo <i className="fa-solid fa-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserNotificationDropdown;
