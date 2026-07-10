import axiosClient from "./axiosClient";

const loyaltyApi = {
  getMyLoyaltyAccount: () => axiosClient.get("/api/loyalty/me"),
  getMyTransactions: () => axiosClient.get("/api/loyalty/me/transactions"),
  getRewards: (params = {}) => axiosClient.get("/api/loyalty/rewards", { params }),
  previewReward: (rewardId) => axiosClient.post(`/api/loyalty/rewards/${rewardId}/preview`),
  redeemReward: (rewardId) => axiosClient.post(`/api/loyalty/rewards/${rewardId}/redeem`),
  getMyVouchers: (params = {}) => axiosClient.get("/api/loyalty/me/vouchers", { params }),
  getMyVoucherSummary: () => axiosClient.get("/api/loyalty/me/vouchers/summary"),
  previewCheckoutVoucher: (payload) => axiosClient.post("/api/loyalty/vouchers/preview-checkout", payload),
  getCheckinStatus: () => axiosClient.get("/api/loyalty/me/checkin-status"),
};

export default loyaltyApi;
