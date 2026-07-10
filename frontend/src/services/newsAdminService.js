import axiosClient from "../api/axiosClient";

export const getAdminPosts = async (params = {}) => {
  return axiosClient.get("/api/admin/posts", { params });
};

export const getAdminPostById = async (id) => {
  return axiosClient.get(`/api/admin/posts/${id}`);
};

export const createAdminPost = async (data) => {
  return axiosClient.post("/api/admin/posts", data);
};

export const updateAdminPost = async (id, data) => {
  return axiosClient.put(`/api/admin/posts/${id}`, data);
};

export const publishAdminPost = async (id) => {
  return axiosClient.patch(`/api/admin/posts/${id}/publish`);
};

export const unpublishAdminPost = async (id) => {
  return axiosClient.patch(`/api/admin/posts/${id}/unpublish`);
};

export const toggleAdminPostFeatured = async (id, isFeatured) => {
  return axiosClient.patch(`/api/admin/posts/${id}/featured?isFeatured=${isFeatured}`);
};

export const deleteAdminPost = async (id) => {
  return axiosClient.delete(`/api/admin/posts/${id}`);
};

export const getAdminPostCategories = async (params = {}) => {
  return axiosClient.get("/api/admin/post-categories", { params });
};

export const getAdminPostCategoryById = async (id) => {
  return axiosClient.get(`/api/admin/post-categories/${id}`);
};

export const createAdminPostCategory = async (data) => {
  return axiosClient.post("/api/admin/post-categories", data);
};

export const updateAdminPostCategory = async (id, data) => {
  return axiosClient.put(`/api/admin/post-categories/${id}`, data);
};

export const updateAdminPostCategoryStatus = async (id, status) => {
  return axiosClient.patch(`/api/admin/post-categories/${id}/status?status=${status}`);
};

export const deleteAdminPostCategory = async (id) => {
  return axiosClient.delete(`/api/admin/post-categories/${id}`);
};
