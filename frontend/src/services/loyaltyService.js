import axiosClient from "../api/axiosClient";

export const getMyLoyaltyAccount = async () => {
  return axiosClient.get("/api/loyalty/me");
};

export const getMyVouchers = async (status = "AVAILABLE") => {
  return axiosClient.get(`/api/loyalty/me/vouchers?status=${status}`);
};

export const previewCheckoutVoucher = async (voucherCode, orderTotal) => {
  return axiosClient.post("/api/loyalty/vouchers/preview-checkout", {
    voucherCode,
    orderTotal,
  });
};

export const getPublicRewards = async () => {
  return axiosClient.get("/api/loyalty/rewards");
};
