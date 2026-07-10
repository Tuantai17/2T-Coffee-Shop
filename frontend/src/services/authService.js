import axiosClient from "../api/axiosClient";
import { AUTH_SCOPES, clearAuthSession } from "../utils/authStorage";

export const login = async (data) => {
  return axiosClient.post("/api/auth/login", {
    username: data.username,
    password: data.password
  });
};

export const register = async (data) => {
  const parts = data.fullName.trim().split(" ");
  const firstName = parts[0] || "Phụ";
  const lastName = parts.slice(1).join(" ") || "Huynh";

  return axiosClient.post("/api/users/registration", {
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

export const sendForgotPasswordOtp = async (data) => {
  return axiosClient.post("/api/auth/forgot-password/send-otp", {
    email: data.email,
  });
};

export const verifyForgotPasswordOtp = async (data) => {
  return axiosClient.post("/api/auth/forgot-password/verify-otp", {
    email: data.email,
    otp: data.otp,
  });
};

export const resetForgotPassword = async (data) => {
  return axiosClient.post("/api/auth/forgot-password/reset", {
    email: data.email,
    resetToken: data.resetToken,
    newPassword: data.newPassword,
  });
};

export const logout = (scope = AUTH_SCOPES.USER) => {
  clearAuthSession(scope);
};

export const getUserProfile = async (userId) => {
  return axiosClient.get(`/api/users/${userId}`);
};

export const getUsers = async () => {
  return axiosClient.get("/api/users");
};

export const updateUser = async (id, data) => {
  return axiosClient.put(`/api/users/${id}`, data);
};

export const getUserAddresses = async (userId) => {
  return axiosClient.get(`/api/users/${userId}/addresses`);
};

export const createUserAddress = async (userId, data) => {
  return axiosClient.post(`/api/users/${userId}/addresses`, data);
};

export const updateUserAddress = async (userId, addressId, data) => {
  return axiosClient.put(`/api/users/${userId}/addresses/${addressId}`, data);
};

export const deleteUserAddress = async (userId, addressId) => {
  return axiosClient.delete(`/api/users/${userId}/addresses/${addressId}`);
};

export const getWishlist = async (userId) => {
  return axiosClient.get(`/api/users/${userId}/wishlist`);
};

export const addWishlistItem = async (userId, data) => {
  return axiosClient.post(`/api/users/${userId}/wishlist`, data);
};

export const deleteWishlistItem = async (userId, wishlistItemId) => {
  return axiosClient.delete(`/api/users/${userId}/wishlist/${wishlistItemId}`);
};
