import axios from "axios";

// Base URL cho product-catalog-service (Gateway route: /api/catalog)
const API_URL = "http://localhost:8900/api/catalog";

// Lấy danh sách menu (Public)
export const getPublicMenus = async () => {
  return await axios.get(`${API_URL}/menus`);
};

// Lấy danh sách menu (Admin)
export const getAdminMenus = async () => {
  return await axios.get(`${API_URL}/admin/menus`);
};

// Lấy chi tiết một menu
export const getMenuById = async (id) => {
  return await axios.get(`${API_URL}/admin/menus/${id}`);
};

// Thêm mới menu
export const createMenu = async (menuData) => {
  return await axios.post(`${API_URL}/admin/menus`, menuData);
};

// Cập nhật menu
export const updateMenu = async (id, menuData) => {
  return await axios.put(`${API_URL}/admin/menus/${id}`, menuData);
};

// Cập nhật trạng thái hiển thị
export const updateMenuStatus = async (id, isActive) => {
  return await axios.patch(`${API_URL}/admin/menus/${id}/status`, { isActive });
};

// Xóa một menu
export const deleteMenu = async (id) => {
  return await axios.delete(`${API_URL}/admin/menus/${id}`);
};

// Xóa nhiều menu
export const deleteBulkMenus = async (ids) => {
  return await axios.delete(`${API_URL}/admin/menus/bulk`, { data: ids });
};
