import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { getCart } from "../../services/cartService";
import { createOrder } from "../../services/orderService";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";

function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [form, setForm] = useState({
    receiverName: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    note: "",
    paymentMethod: "COD",
    voucherCode: "",
  });

  const loadCart = async () => {
    try {
      const response = await getCart();
      setCart(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
      setCart([]);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const subTotal = cart.reduce(
    (total, item) => total + ((item.product ? item.product.price : 0) * item.quantity),
    0
  );
  const discount = form.voucherCode.trim().toUpperCase() === "TOY10" ? subTotal * 0.1 : 0;
  const shippingFee = subTotal >= 500000 ? 0 : cart.length > 0 ? 30000 : 0;
  const grandTotal = Math.max(0, subTotal - discount + shippingFee);

  const handleCheckout = async (event) => {
    event.preventDefault();

    const { userId } = getAuthSession(AUTH_SCOPES.USER);
    if (!userId) {
      navigate("/login");
      return;
    }

    if (!cart.length) {
      alert("Giỏ hàng đang trống, chưa thể thanh toán.");
      return;
    }

    setLoadingSubmit(true);
    try {
      await createOrder(Number(userId), {
        ...form,
        voucherCode: form.voucherCode || null,
      });
      alert("Đặt hàng thành công! Đơn hàng của bạn đã được ghi nhận.");
      navigate("/orders");
    } catch (error) {
      console.error(error);
      alert("Đặt hàng thất bại, vui lòng thử lại.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <UserLayout>
      <div className="container mt-4">
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 rounded-5 p-4 bg-white">
              <div className="mb-4">
                <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-2 fw-bold mb-2">
                  Checkout
                </span>
                <h3 className="fw-bold text-dark mb-1">Thông tin nhận hàng và thanh toán</h3>
                <p className="text-muted mb-0">
                  Hoàn thiện đơn hàng với thông tin giao hàng, voucher và phương thức thanh toán.
                </p>
              </div>

              <form onSubmit={handleCheckout}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">Người nhận</label>
                    <input
                      name="receiverName"
                      type="text"
                      className="form-control rounded-4"
                      placeholder="Tên phụ huynh hoặc người nhận"
                      value={form.receiverName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">Số điện thoại</label>
                    <input
                      name="phone"
                      type="tel"
                      className="form-control rounded-4"
                      placeholder="09xxxxxxxx"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark">Địa chỉ nhận hàng</label>
                    <input
                      name="address"
                      type="text"
                      className="form-control rounded-4"
                      placeholder="Số nhà, tên đường"
                      value={form.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold text-dark">Tỉnh/Thành</label>
                    <input
                      name="province"
                      type="text"
                      className="form-control rounded-4"
                      value={form.province}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold text-dark">Quận/Huyện</label>
                    <input
                      name="district"
                      type="text"
                      className="form-control rounded-4"
                      value={form.district}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold text-dark">Phường/Xã</label>
                    <input
                      name="ward"
                      type="text"
                      className="form-control rounded-4"
                      value={form.ward}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">Phương thức thanh toán</label>
                    <select
                      name="paymentMethod"
                      className="form-select rounded-4"
                      value={form.paymentMethod}
                      onChange={handleChange}
                    >
                      <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                      <option value="BANKING">Chuyển khoản ngân hàng</option>
                      <option value="VNPAY">VNPay mô phỏng</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">Mã voucher</label>
                    <input
                      name="voucherCode"
                      type="text"
                      className="form-control rounded-4"
                      placeholder="TOY10 hoặc FREESHIP"
                      value={form.voucherCode}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark">Ghi chú</label>
                    <textarea
                      name="note"
                      className="form-control rounded-4"
                      rows="4"
                      placeholder="Ví dụ: giao giờ hành chính, liên hệ trước khi giao..."
                      value={form.note}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-danger w-100 py-3 rounded-pill fw-bold fs-6 text-white mt-4"
                  disabled={loadingSubmit || loadingCart || !cart.length}
                >
                  {loadingSubmit ? "Đang tạo đơn hàng..." : "XÁC NHẬN ĐẶT HÀNG"}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm border-0 rounded-5 p-4 bg-white">
              <h4 className="fw-bold mb-3">Tóm tắt đơn hàng</h4>
              {loadingCart ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : !cart.length ? (
                <div className="alert alert-warning rounded-4 mb-0">
                  Giỏ hàng đang trống. Hãy chọn thêm sản phẩm trước khi thanh toán.
                </div>
              ) : (
                <>
                  <div className="d-flex flex-column gap-3 mb-4">
                    {cart.map((item) => (
                      <div
                        key={item.id || item.product?.id}
                        className="d-flex justify-content-between align-items-start border-bottom pb-3"
                      >
                        <div className="pe-3">
                          <div className="fw-semibold">{item.product?.productName || "Sản phẩm đồ chơi"}</div>
                          <div className="small text-muted">Số lượng: {item.quantity}</div>
                        </div>
                        <div className="text-danger fw-bold">
                          {((item.product?.price || 0) * item.quantity).toLocaleString("vi-VN")} VNĐ
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tạm tính</span>
                    <span className="fw-semibold">{subTotal.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Giảm giá</span>
                    <span className="fw-semibold text-success">-{discount.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Phí vận chuyển</span>
                    <span className="fw-semibold">{shippingFee.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                  <div className="bg-danger text-white rounded-4 px-4 py-3 d-flex justify-content-between align-items-center">
                    <span className="fw-bold fs-5">Tổng thanh toán</span>
                    <span className="fw-extrabold fs-4">{grandTotal.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default CheckoutPage;
