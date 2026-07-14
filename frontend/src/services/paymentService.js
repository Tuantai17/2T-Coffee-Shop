import axiosClient from "../api/axiosClient";

export const createPayment = (payload) => {
  return axiosClient.post("/api/payments/vnpay/create", payload);
};

export const getPaymentStatus = (paymentId) => {
  return axiosClient.get(`/api/payments/${paymentId}`);
};

export const getPaymentStatusByTxnRef = (txnRef) => {
  return axiosClient.get(`/api/payments/vnpay/status/${txnRef}`);
};

export const verifyVNPayReturn = (payload) => {
  return axiosClient.post("/api/payments/vnpay/verify-return", payload);
};
