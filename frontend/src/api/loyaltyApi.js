import axiosClient from "./axiosClient";

const loyaltyApi = {
  getMyLoyaltyAccount: () => axiosClient.get("/api/loyalty/me"),
  getMyTransactions: () => axiosClient.get("/api/loyalty/me/transactions"),
  getTiers: () => axiosClient.get("/api/loyalty/tiers"),
  getTierProgress: () => axiosClient.get("/api/loyalty/me/tier-progress"),
  getRewards: (params = {}) => axiosClient.get("/api/loyalty/rewards", { params }),
  previewReward: (rewardId) => axiosClient.post(`/api/loyalty/rewards/${rewardId}/preview`),
  redeemReward: (rewardId) => axiosClient.post(`/api/loyalty/rewards/${rewardId}/redeem`),
  getMyVouchers: (params = {}) => axiosClient.get("/api/loyalty/me/vouchers", { params }),
  getMyVoucherSummary: () => axiosClient.get("/api/loyalty/me/vouchers/summary"),
  previewCheckoutVoucher: (payload) => axiosClient.post("/api/loyalty/vouchers/preview-checkout", payload),
  getCheckinStatus: () => axiosClient.get("/api/loyalty/me/checkin-status"),
  claimBenefits: () => axiosClient.post("/api/loyalty/me/claim-benefits"),
  getClaimStatus: () => axiosClient.get("/api/loyalty/me/claim-status"),
};

export default loyaltyApi;

