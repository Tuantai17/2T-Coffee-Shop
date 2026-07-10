import axiosClient from "../api/axiosClient";

export const getUserAddresses = async (userId) => {
  return axiosClient.get(`/api/users/${userId}/addresses`);
};

export const getDefaultAddress = async (userId) => {
  return axiosClient.get(`/api/users/${userId}/addresses/default`);
};

export const addUserAddress = async (userId, addressData) => {
  return axiosClient.post(`/api/users/${userId}/addresses`, addressData);
};

export const updateUserAddress = async (userId, addressId, addressData) => {
  return axiosClient.put(`/api/users/${userId}/addresses/${addressId}`, addressData);
};

export const deleteUserAddress = async (userId, addressId) => {
  return axiosClient.delete(`/api/users/${userId}/addresses/${addressId}`);
};
