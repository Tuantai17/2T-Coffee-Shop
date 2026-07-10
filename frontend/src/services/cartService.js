import axiosClient from "../api/axiosClient";

export const getCart = async () => {
  return axiosClient.get("/api/cart");
};

const notifyCartUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cartUpdated"));
  }
};

export const addToCart = async (productId, quantity = 1, options = {}) => {
  const res = await axiosClient.post("/api/cart", {
    productId: productId,
    quantity: quantity,
    variantId: options.variantId || null,
    optionIds: options.optionIds || [],
    toppingIds: options.toppingIds || [],
    note: options.note || null,
  });
  notifyCartUpdate();
  return res;
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  const res = await axiosClient.put(`/api/cart?cartItemId=${cartItemId}&quantity=${quantity}`);
  notifyCartUpdate();
  return res;
};

export const removeCartItem = async (cartItemId) => {
  const res = await axiosClient.delete(`/api/cart?cartItemId=${cartItemId}`);
  notifyCartUpdate();
  return res;
};

export const clearCart = async () => {
  notifyCartUpdate();
  return Promise.resolve();
};
