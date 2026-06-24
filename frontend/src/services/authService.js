import axiosClient from "../api/axiosClient";
import { AUTH_SCOPES, clearAuthSession } from "../utils/authStorage";

export const login = async (data) => {
  return axiosClient.post("/api/accounts/api/auth/login", {
    username: data.username,
    password: data.password
  });
};

export const register = async (data) => {
  const parts = data.fullName.trim().split(" ");
  const firstName = parts[0] || "Phụ";
  const lastName = parts.slice(1).join(" ") || "Huynh";

  return axiosClient.post("/api/accounts/registration", {
    userName: data.email, // Use email as userName since it's unique
    userPassword: data.password,
    userDetails: {
      firstName: firstName,
      lastName: lastName,
      email: data.email,
      phoneNumber: data.phone
    }
  });
};

export const logout = (scope = AUTH_SCOPES.USER) => {
  clearAuthSession(scope);
};

export const getUserProfile = async (userId) => {
  return axiosClient.get(`/api/accounts/users/${userId}`);
};

export const getUsers = async () => {
  return axiosClient.get("/api/accounts/users");
};

export const updateUser = async (id, data) => {
  return axiosClient.put(`/api/accounts/users/${id}`, data);
};

export const getUserAddresses = async (userId) => {
  return axiosClient.get(`/api/accounts/users/${userId}/addresses`);
};

export const createUserAddress = async (userId, data) => {
  return axiosClient.post(`/api/accounts/users/${userId}/addresses`, data);
};

export const updateUserAddress = async (userId, addressId, data) => {
  return axiosClient.put(`/api/accounts/users/${userId}/addresses/${addressId}`, data);
};

export const deleteUserAddress = async (userId, addressId) => {
  return axiosClient.delete(`/api/accounts/users/${userId}/addresses/${addressId}`);
};

export const getWishlist = async (userId) => {
  return axiosClient.get(`/api/accounts/users/${userId}/wishlist`);
};

export const addWishlistItem = async (userId, data) => {
  return axiosClient.post(`/api/accounts/users/${userId}/wishlist`, data);
};

export const deleteWishlistItem = async (userId, wishlistItemId) => {
  return axiosClient.delete(`/api/accounts/users/${userId}/wishlist/${wishlistItemId}`);
};
