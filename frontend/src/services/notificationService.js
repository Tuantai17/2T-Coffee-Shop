import axiosClient from "../api/axiosClient";

export const getAdminNotifications = async (params) => {
  return axiosClient.get("/api/notifications/admin", { params });
};

export const getAdminUnreadCount = async () => {
  return axiosClient.get("/api/notifications/admin/unread-count");
};

export const markNotificationAsRead = async (id) => {
  return axiosClient.patch(`/api/notifications/admin/${id}/read`);
};

export const markNotificationAsUnread = async (id) => {
  return axiosClient.patch(`/api/notifications/admin/${id}/unread`);
};

export const markAllNotificationsAsRead = async () => {
  return axiosClient.patch("/api/notifications/admin/read-all");
};

export const deleteNotification = async (id) => {
  return axiosClient.delete(`/api/notifications/admin/${id}`);
};

export const bulkDeleteNotifications = async (ids) => {
  return axiosClient.post("/api/notifications/admin/bulk-delete", { ids });
};

export const bulkMarkAsRead = async (ids) => {
  return axiosClient.post("/api/notifications/admin/bulk-read", { ids });
};

export const deleteReadNotifications = async () => {
  return axiosClient.delete("/api/notifications/admin/read");
};
