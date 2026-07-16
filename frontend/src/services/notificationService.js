import axiosClient from "../api/axiosClient";

export const getAdminNotifications = async (params) => {
  return axiosClient.get("/api/notifications", { params });
};

export const getAdminUnreadCount = async () => {
  return axiosClient.get("/api/notifications/unread-count");
};

export const markNotificationAsRead = async (id) => {
  return axiosClient.patch(`/api/notifications/${id}/read`);
};

export const markNotificationAsUnread = async (id) => {
  // Not implemented in backend yet, keeping signature
  return { data: true };
};

export const markAllNotificationsAsRead = async () => {
  return axiosClient.patch("/api/notifications/read-all");
};

export const deleteNotification = async (id) => {
  return { data: true };
};

export const bulkDeleteNotifications = async (ids) => {
  return { data: true };
};

export const bulkMarkAsRead = async (ids) => {
  return axiosClient.patch("/api/notifications/read-all");
};

export const deleteReadNotifications = async () => {
  return { data: true };
};

// --- USER NOTIFICATIONS ---
export const getMyNotifications = async (params) => {
  return axiosClient.get("/api/notifications", { params });
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
