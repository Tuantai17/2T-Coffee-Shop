import axiosClient from "../api/axiosClient";

export const getAdminNotifications = async (params) => {
  // return axiosClient.get("/api/notifications/admin", { params });
  return { data: { content: [], totalElements: 0 } };
};

export const getAdminUnreadCount = async () => {
  // return axiosClient.get("/api/notifications/admin/unread-count");
  return { data: 0 };
};

export const markNotificationAsRead = async (id) => {
  // return axiosClient.patch(`/api/notifications/admin/${id}/read`);
  return { data: true };
};

export const markNotificationAsUnread = async (id) => {
  // return axiosClient.patch(`/api/notifications/admin/${id}/unread`);
  return { data: true };
};

export const markAllNotificationsAsRead = async () => {
  // return axiosClient.patch("/api/notifications/admin/read-all");
  return { data: true };
};

export const deleteNotification = async (id) => {
  // return axiosClient.delete(`/api/notifications/admin/${id}`);
  return { data: true };
};

export const bulkDeleteNotifications = async (ids) => {
  // return axiosClient.post("/api/notifications/admin/bulk-delete", { ids });
  return { data: true };
};

export const bulkMarkAsRead = async (ids) => {
  // return axiosClient.post("/api/notifications/admin/bulk-read", { ids });
  return { data: true };
};

export const deleteReadNotifications = async () => {
  // return axiosClient.delete("/api/notifications/admin/read");
  return { data: true };
};

// --- USER NOTIFICATIONS ---
export const getMyNotifications = async () => {
  return axiosClient.get("/api/notifications/me");
};

export const getMyUnreadCount = async () => {
  return axiosClient.get("/api/notifications/unread-count");
};

export const markMyNotificationAsRead = async (id) => {
  return axiosClient.patch(`/api/notifications/${id}/read`);
};

export const markAllMyNotificationsAsRead = async () => {
  return axiosClient.patch("/api/notifications/read-all");
};
