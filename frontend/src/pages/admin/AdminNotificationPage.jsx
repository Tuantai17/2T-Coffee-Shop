import React, { useEffect, useState, useCallback, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminNotifications, markNotificationAsRead, markNotificationAsUnread, deleteNotification, markAllNotificationsAsRead, bulkDeleteNotifications, bulkMarkAsRead, deleteReadNotifications } from "../../services/notificationService";

import NotificationFilterBar from "./notifications/NotificationFilterBar";
import NotificationList from "./notifications/NotificationList";
import NotificationPagination from "./notifications/NotificationPagination";
import NotificationDetailModal from "./notifications/NotificationDetailModal";

function AdminNotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filter & Sort
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    isRead: "",
    timeRange: ""
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail Modal
  const [detailNotif, setDetailNotif] = useState(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      
      const params = {
        page: currentPage - 1,
        size: pageSize,
        sort: "createdAt,desc",
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.isRead && { isRead: filters.isRead }),
        ...(filters.timeRange && { timeRange: filters.timeRange })
      };

      const res = await getAdminNotifications(params);
      
      // Handle page structure or array depending on Spring Data Page format
      const dataContent = res.data?.content || res.data || [];
      const totalElements = res.data?.totalElements || dataContent.length;

      setNotifications(dataContent);
      setTotalItems(totalElements);
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
      setError(true);
      setNotifications([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  // Handle cross-tab or header sync
  const syncEvent = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadNotifications();
    window.addEventListener("notifications_updated", syncEvent);
    return () => window.removeEventListener("notifications_updated", syncEvent);
  }, [loadNotifications, syncEvent]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [filters, pageSize]);

  // --- ACTIONS ---

  const handleSelectAll = (checked, currentNotifs) => {
    if (checked) {
      const newIds = [...new Set([...selectedIds, ...currentNotifs.map(n => n.id)])];
      setSelectedIds(newIds);
    } else {
      const idsToRemove = currentNotifs.map(n => n.id);
      setSelectedIds(selectedIds.filter(id => !idsToRemove.includes(id)));
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleToggleRead = async (ids, isReadStatus) => {
    if (ids.length === 0) return;
    
    // Check if we need to update
    const targetIds = ids.filter(id => {
      const notif = notifications.find(n => n.id === id);
      return notif && notif.isRead !== isReadStatus;
    });

    if (targetIds.length === 0) return;

    try {
      if (targetIds.length > 1) {
        // Bulk update
        // We will just use Promise.all if bulk endpoints don't exist, but we have bulkMarkAsRead in service.
        // For unread we don't have bulk unread yet, so we use Promise.all
        const promises = targetIds.map(id => isReadStatus ? markNotificationAsRead(id) : markNotificationAsUnread(id));
        await Promise.allSettled(promises);
      } else {
        // Single update
        const id = targetIds[0];
        if (isReadStatus) {
          await markNotificationAsRead(id);
        } else {
          await markNotificationAsUnread(id);
        }
      }

      setNotifications(prev => prev.map(n => targetIds.includes(n.id) ? { ...n, isRead: isReadStatus } : n));
      setSelectedIds([]);
      
      if (detailNotif && targetIds.includes(detailNotif.id)) {
        setDetailNotif({ ...detailNotif, isRead: isReadStatus });
      }

      // Notify header dropdown to update badge
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (e) {
      console.error(e);
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại!");
    }
  };

  const handleDelete = async (ids) => {
    if (ids.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${ids.length} thông báo đã chọn?`)) return;

    try {
      if (ids.length > 1) {
        await bulkDeleteNotifications(ids);
      } else {
        await deleteNotification(ids[0]);
      }
      
      setSelectedIds([]);
      loadNotifications();
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (e) {
      console.error(e);
      alert("Xóa thông báo thất bại!");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      loadNotifications();
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (e) {
      console.error(e);
      alert("Đánh dấu tất cả thất bại!");
    }
  };

  const handleDeleteRead = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa TẤT CẢ thông báo đã đọc?")) return;
    try {
      await deleteReadNotifications();
      loadNotifications();
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (e) {
      console.error(e);
      alert("Xóa thông báo đã đọc thất bại!");
    }
  };

  const handleViewDetail = (notif) => {
    setDetailNotif(notif);
    // Auto mark as read when opening detail
    if (!notif.isRead) {
      handleToggleRead([notif.id], true);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid mt-4 px-xl-4 pb-5">
        
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Tất cả thông báo</h2>
            <p className="text-muted small mb-0">Quản lý thông báo hệ thống, đơn hàng và hoạt động gần đây.</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button className="btn btn-outline-primary neu-pill shadow-sm fw-semibold px-3" onClick={handleMarkAllRead}>
              <i className="fa-solid fa-check-double me-1"></i> Đánh dấu tất cả đã đọc
            </button>
            <button className="btn btn-outline-danger neu-pill shadow-sm fw-semibold px-3" onClick={handleDeleteRead}>
              <i className="fa-regular fa-trash-can me-1"></i> Xóa đã đọc
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <NotificationFilterBar 
          filters={filters} 
          setFilters={setFilters} 
          onReset={() => setFilters({ search: "", type: "", isRead: "", timeRange: "" })} 
        />

        {/* List */}
        <NotificationList 
          notifications={notifications}
          loading={loading}
          error={error}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onViewDetail={handleViewDetail}
          onDelete={handleDelete}
          onToggleRead={handleToggleRead}
        />

        {/* Pagination */}
        {!loading && !error && totalItems > 0 && (
          <NotificationPagination 
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            setPageSize={setPageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      <NotificationDetailModal 
        show={!!detailNotif}
        notif={detailNotif}
        onClose={() => setDetailNotif(null)}
        onToggleRead={handleToggleRead}
        onDelete={handleDelete}
      />
    </AdminLayout>
  );
}

export default AdminNotificationPage;
