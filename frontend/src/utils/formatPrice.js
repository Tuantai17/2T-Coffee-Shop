export const formatPrice = (price) => {
  if (price == null) return "0đ";
  return new Intl.NumberFormat('vi-VN').format(price) + "đ";
};
