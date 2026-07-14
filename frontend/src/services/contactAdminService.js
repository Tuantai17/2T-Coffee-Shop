import axiosClient from "../api/axiosClient";

export const getAdminStoreContactInfo = async (config = {}) => {
  return axiosClient.get("/api/admin/store-contact", config);
};

export const updateAdminStoreContactInfo = async (data, config = {}) => {
  return axiosClient.put("/api/admin/store-contact", data, config);
};

export const getAdminContactMessages = async (params, config = {}) => {
  return axiosClient.get("/api/admin/contacts", { ...config, params });
};

export const getAdminContactMessageById = async (id) => {
  return axiosClient.get(`/api/admin/contacts/${id}`);
};

export const updateAdminContactMessageStatus = async (id, status) => {
  return axiosClient.put(`/api/admin/contacts/${id}/status`, { status });
};

export const deleteAdminContactMessage = async (id) => {
  return axiosClient.delete(`/api/admin/contacts/${id}`);
};
