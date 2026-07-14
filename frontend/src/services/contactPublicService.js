import axiosClient from "../api/axiosClient";

export const getStoreContactInfo = async (config = {}) => {
  return axiosClient.get("/api/store-contact", config);
};

export const submitContactMessage = async (data, config = {}) => {
  return axiosClient.post("/api/contacts", data, config);
};
