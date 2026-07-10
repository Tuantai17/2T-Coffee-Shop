import axiosClient from './axiosClient';

const adminLoyaltyApi = {
  // Dashboard
  getDashboardStats: () => {
    return axiosClient.get('/api/admin/loyalty/dashboard/stats');
  },
  getDashboardCharts: () => {
    return axiosClient.get('/api/admin/loyalty/dashboard/charts');
  },

  // Members
  getMembers: (params) => {
    return axiosClient.get('/api/admin/loyalty/members', { params });
  },
  getMemberDetail: (userId) => {
    return axiosClient.get(`/api/admin/loyalty/members/${userId}`);
  },
  adjustMemberPoint: (userId, data) => {
    return axiosClient.post(`/api/admin/loyalty/members/${userId}/adjust-point`, data);
  },

  // Tiers
  getTiers: () => {
    return axiosClient.get('/api/admin/loyalty/tiers');
  },
  createTier: (data) => {
    return axiosClient.post('/api/admin/loyalty/tiers', data);
  },
  updateTier: (id, data) => {
    return axiosClient.put(`/api/admin/loyalty/tiers/${id}`, data);
  },
  deleteTier: (id) => {
    return axiosClient.delete(`/api/admin/loyalty/tiers/${id}`);
  },
  syncMembersTiers: () => {
    return axiosClient.post('/api/admin/loyalty/tiers/sync');
  },

  // Rules
  getRules: () => {
    return axiosClient.get('/api/admin/loyalty/rules');
  },
  createRule: (data) => {
    return axiosClient.post('/api/admin/loyalty/rules', data);
  },
  updateRule: (id, data) => {
    return axiosClient.put(`/api/admin/loyalty/rules/${id}`, data);
  },
  deleteRule: (id) => {
    return axiosClient.delete(`/api/admin/loyalty/rules/${id}`);
  },
  testRule: (data) => {
    return axiosClient.post('/api/admin/loyalty/rules/test', data);
  },

  // Rewards
  getRewards: () => {
    return axiosClient.get('/api/admin/loyalty/rewards');
  },
  getRewardDetail: (id) => {
    return axiosClient.get(`/api/admin/loyalty/rewards/${id}`);
  },
  getRedeemHistory: (params) => {
    return axiosClient.get('/api/admin/loyalty/rewards/history', { params });
  },

  // Vouchers
  getVouchers: () => {
    return axiosClient.get('/api/admin/loyalty/vouchers');
  },
  getVoucherDetail: (id) => {
    return axiosClient.get(`/api/admin/loyalty/vouchers/${id}`);
  },
  createVoucher: (data) => {
    return axiosClient.post('/api/admin/loyalty/vouchers', data);
  },
  updateVoucher: (id, data) => {
    return axiosClient.put(`/api/admin/loyalty/vouchers/${id}`, data);
  },
  deleteVoucher: (id) => {
    return axiosClient.delete(`/api/admin/loyalty/vouchers/${id}`);
  },
};

export default adminLoyaltyApi;
