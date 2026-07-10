import axiosClient from "../api/axiosClient";

export const getPublicPosts = async (params = {}) => {
  return axiosClient.get("/api/public/posts", { params });
};

export const getFeaturedPosts = async () => {
  return axiosClient.get("/api/public/posts/featured");
};

export const getPublicPostBySlug = async (slug) => {
  return axiosClient.get(`/api/public/posts/${slug}`);
};

export const getRelatedPosts = async (slug) => {
  return axiosClient.get(`/api/public/posts/${slug}/related`);
};

export const incrementPostView = async (slug) => {
  return axiosClient.post(`/api/public/posts/${slug}/view`);
};
