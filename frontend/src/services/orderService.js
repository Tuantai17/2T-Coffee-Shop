import axiosClient from "../api/axiosClient";

export const createOrder = async (userId, payload = {}) => {
  return axiosClient.post(`/api/shop/order/${userId}`, payload);
};

export const getOrdersByUser = async (userId) => {
  return axiosClient.get(`/api/shop/order/user/${userId}`);
};

export const getAllOrders = async () => {
  return axiosClient.get("/api/shop/order");
};

export const updateOrderStatus = async (orderId, status, paymentStatus) => {
  return axiosClient.put(`/api/shop/order/${orderId}/status`, { status, paymentStatus });
};
