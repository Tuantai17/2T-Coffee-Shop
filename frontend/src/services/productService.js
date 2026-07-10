import axiosClient from "../api/axiosClient";

export const getProducts = async (params = {}) => {
  return axiosClient.get("/api/catalog/products", { params });
};

export const getPagedProducts = async (params = {}) => {
  return axiosClient.get("/api/catalog/products/paged", { params });
};

export const getProductById = async (id) => {
  return axiosClient.get(`/api/catalog/products/${id}`);
};

export const getProductBySlug = async (slug) => {
  return axiosClient.get(`/api/catalog/products/slug/${slug}`);
};

export const createProduct = async (data) => {
  return axiosClient.post("/api/catalog/admin/products", data);
};

export const updateProduct = async (id, data) => {
  return axiosClient.put(`/api/catalog/admin/products/${id}`, data);
};

export const deleteProduct = async (id, params = {}) => {
  return axiosClient.delete(`/api/catalog/admin/products/${id}`, { params });
};

export const getTrashProducts = async () => {
  return axiosClient.get("/api/catalog/admin/products/trash");
};

export const restoreProduct = async (id) => {
  return axiosClient.patch(`/api/catalog/admin/products/${id}/restore`);
};

export const permanentlyDeleteProduct = async (id) => {
  return axiosClient.delete(`/api/catalog/admin/products/${id}/permanent`);
};

export const getCategories = async () => {
  return axiosClient.get("/api/catalog/products/categories");
};

export const getBanners = async (params = {}) => {
  return axiosClient.get("/api/catalog/banners", { params });
};

export const getCollections = async (params = {}) => {
  return axiosClient.get("/api/catalog/collections", { params });
};

export const getCollectionBySlug = async (slug) => {
  return axiosClient.get(`/api/catalog/collections/${slug}`);
};

export const createCollection = async (data) => {
  return axiosClient.post("/api/catalog/admin/collections", data);
};

export const updateCollection = async (id, data) => {
  return axiosClient.put(`/api/catalog/admin/collections/${id}`, data);
};

export const deleteCollection = async (id) => {
  return axiosClient.delete(`/api/catalog/admin/collections/${id}`);
};

export const createBanner = async (data) => {
  return axiosClient.post("/api/catalog/admin/banners", data);
};

export const updateBanner = async (id, data) => {
  return axiosClient.put(`/api/catalog/admin/banners/${id}`, data);
};

export const deleteBanner = async (id) => {
  return axiosClient.delete(`/api/catalog/admin/banners/${id}`);
};

export const createCategory = async (data) => {
  return axiosClient.post("/api/catalog/admin/categories", data);
};

export const updateCategory = async (id, data) => {
  return axiosClient.put(`/api/catalog/admin/categories/${id}`, data);
};

export const deleteCategory = async (id) => {
  return axiosClient.delete(`/api/catalog/admin/categories/${id}`);
};

export const getOptionGroups = async () => {
  return axiosClient.get("/api/catalog/admin/option-groups");
};

export const createOptionGroup = async (data) => {
  return axiosClient.post("/api/catalog/admin/option-groups", data);
};

export const updateOptionGroup = async (id, data) => {
  return axiosClient.put(`/api/catalog/admin/option-groups/${id}`, data);
};

export const deleteOptionGroup = async (id) => {
  return axiosClient.delete(`/api/catalog/admin/option-groups/${id}`);
};

export const getToppings = async () => {
  return axiosClient.get("/api/catalog/admin/toppings");
};

export const createTopping = async (data) => {
  return axiosClient.post("/api/catalog/admin/toppings", data);
};

export const updateTopping = async (id, data) => {
  return axiosClient.put(`/api/catalog/admin/toppings/${id}`, data);
};

export const deleteTopping = async (id) => {
  return axiosClient.delete(`/api/catalog/admin/toppings/${id}`);
};

