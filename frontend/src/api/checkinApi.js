import axiosClient from "./axiosClient";

const checkinApi = {
  // --- Admin Endpoints ---
  getDashboardStats: (config = {}) => axiosClient.get("/api/admin/check-ins/dashboard", config),
  getPrograms: (params = {}, config = {}) => axiosClient.get("/api/admin/check-ins/programs", { ...config, params }),
  getProgram: (id, config = {}) => axiosClient.get(`/api/admin/check-ins/programs/${id}`, config),
  createProgram: (program, config = {}) => axiosClient.post("/api/admin/check-ins/programs", program, config),
  updateProgram: (id, program, config = {}) => axiosClient.put(`/api/admin/check-ins/programs/${id}`, program, config),
  deleteProgram: (id, config = {}) => axiosClient.delete(`/api/admin/check-ins/programs/${id}`, config),
  duplicateProgram: (id, config = {}) => axiosClient.post(`/api/admin/check-ins/programs/${id}/duplicate`, {}, config),
  getSettings: (config = {}) => axiosClient.get("/api/admin/check-ins/settings", config),
  updateSettings: (settings, config = {}) => axiosClient.put("/api/admin/check-ins/settings", settings, config),
  getHistory: (params = {}, config = {}) => axiosClient.get("/api/admin/check-ins/history", { ...config, params }),
  deleteHistory: (id, config = {}) => axiosClient.delete(`/api/admin/check-ins/history/${id}`, config),
  exportHistory: (params = {}, config = {}) =>
    axiosClient.get("/api/admin/check-ins/history/export", { ...config, params, responseType: "blob" }),
  updateProgramStatus: (id, status, config = {}) =>
    axiosClient.patch(`/api/admin/check-ins/programs/${id}/status`, { status }, config),

  // --- User Endpoints ---
  getCheckinStatus: (config = {}) => axiosClient.get("/api/check-ins/me/overview", config),
  performCheckin: (programId, config = {}) => axiosClient.post(`/api/check-ins/me/programs/${programId}/check-in`, {}, config),
  getUserCheckinHistory: (year, month, config = {}) => axiosClient.get(`/api/check-ins/me/history?year=${year}&month=${month}`, config),
};

export default checkinApi;
