import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import axiosClient from "../../api/axiosClient";
import { clearCart } from "../../services/cartService";

function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    clearCart().catch(console.error);

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/api/shop/order/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Lỗi lấy thông tin đơn hàng:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <UserLayout>
        <div className="container py-5 text-center my-5">
          <div className="spinner-border text-danger mb-3" role="status" style={{ width: "3rem", height: "3rem" }}></div>
          <h4 className="text-muted">Đang tải thông tin đơn hàng...</h4>
        </div>
      </UserLayout>
    );
  }

  if (error || !order) {
    return (
      <UserLayout>
        <div className="container py-5 text-center my-5">
          <div className="mb-4">
            <i className="fa-solid fa-circle-exclamation text-warning" style={{ fontSize: "5rem" }}></i>
          </div>
          <h3 className="fw-bold mb-3">Không tìm thấy đơn hàng</h3>
          <p className="text-muted mb-4">Xin lỗi, chúng tôi không thể tìm thấy thông tin cho đơn hàng này.</p>
          <Link to="/profile/orders" className="btn btn-primary rounded-pill px-4 py-2 fw-bold">
            Về Lịch Sử Đơn Hàng
          </Link>
        </div>
      </UserLayout>
    );
  }

  const orderDateStr = order.orderDate || order.createdAt || order.orderedDate;
  const normalizedDateStr = typeof orderDateStr === 'string' && !orderDateStr.endsWith('Z') ? `${orderDateStr}Z` : orderDateStr;
  const orderDate = new Date(normalizedDateStr || Date.now());
  const formattedDate = `${orderDate.getDate().toString().padStart(2, "0")}/${(orderDate.getMonth() + 1).toString().padStart(2, "0")}/${orderDate.getFullYear()} ${orderDate.getHours().toString().padStart(2, "0")}:${orderDate.getMinutes().toString().padStart(2, "0")}:${orderDate.getSeconds().toString().padStart(2, "0")}`;

  let paymentMethodStr = "Thanh toán khi nhận hàng (COD)";
  if (order.paymentMethod === "BANKING") paymentMethodStr = "Chuyển khoản ngân hàng";
  if (order.paymentMethod === "VNPAY") paymentMethodStr = "Thanh toán qua VNPay";

  return (
    <UserLayout>
      <div className="container py-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-4 shadow" style={{ width: "90px", height: "90px" }}>
                <i className="fa-solid fa-check fs-1" aria-label="Thanh cong"></i>
              </div>
              <h1 className="fw-extrabold text-dark mb-2">Đặt hàng thành công!</h1>
              <p className="text-muted fs-5">Cảm ơn bạn đã mua sắm tại 2T Coffee Shop.</p>
            </div>

            {location.state?.paymentNotice && (
              <div className="alert alert-warning border-0 rounded-4 shadow-sm mb-4">
                {location.state.paymentNotice}
              </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-light rounded p-2 me-3 text-secondary">
                  <i className="fa-solid fa-receipt fs-5"></i>
                </div>
                <div className="flex-grow-1 d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="text-muted fw-medium">Mã đơn hàng</span>
                  <span className="fw-bold text-dark">{order.orderCode || `MKD-${order.id.toString().padStart(6, "0")}`}</span>
                </div>
              </div>

              <div className="d-flex align-items-center mb-4">
                <div className="bg-light rounded p-2 me-3 text-secondary">
                  <i className="fa-regular fa-clock fs-5"></i>
                </div>
                <div className="flex-grow-1 d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="text-muted fw-medium">Ngày đặt hàng</span>
                  <span className="fw-bold text-dark">{formattedDate}</span>
                </div>
              </div>

              <div className="d-flex align-items-center mb-4">
                <div className="bg-light rounded p-2 me-3 text-secondary">
                  <i className="fa-solid fa-wallet fs-5"></i>
                </div>
                <div className="flex-grow-1 d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="text-muted fw-medium">Phương thức thanh toán</span>
                  <span className="fw-bold text-dark">{paymentMethodStr}</span>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="bg-light rounded p-2 me-3 text-secondary">
                  <i className="fa-solid fa-money-bill-wave fs-5"></i>
                </div>
                <div className="flex-grow-1 d-flex justify-content-between align-items-center pb-2">
                  <span className="text-muted fw-medium">Tổng thanh toán</span>
                  <span className="fw-extrabold text-danger fs-4">{(order.total || order.totalAmount || order.totalPrice || 0).toLocaleString("vi-VN")}d</span>
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            {order.items && order.items.length > 0 && (
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h6 className="fw-bold mb-3 border-bottom pb-2">Sản phẩm đã mua ({order.items.length})</h6>
                <div className="table-responsive">
                  <table className="table align-middle table-hover mb-0">
                    <thead className="table-light text-muted small">
                      <tr>
                        <th className="px-3 py-2 border-0">Sản phẩm</th>
                        <th className="text-center py-2 border-0">SL</th>
                        <th className="text-end px-3 py-2 border-0">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="border-top-0">
                      {order.items.map((item) => {
                        const finalQty = item.finalQuantity !== null && item.finalQuantity !== undefined ? item.finalQuantity : item.quantity;
                        const productPrice = item.unitPrice || item.product?.price || 0;
                        const productCost = productPrice * finalQty;
                        const itemSubTotal = item.subTotal || productCost;
                        const toppingCost = Math.max(0, itemSubTotal - productCost);
                        
                        return (
                          <tr key={item.id || item.product?.id}>
                            <td className="px-3 py-2">
                              <div className="d-flex align-items-center gap-2">
                                {item.product?.imageUrl ? (
                                  <img 
                                    src={item.product.imageUrl} 
                                    alt="Product" 
                                    className="rounded-3 border" 
                                    style={{ width: "50px", height: "50px", objectFit: "cover" }} 
                                  />
                                ) : (
                                  <div className="bg-light rounded-3 border d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
                                    <i className="fa-solid fa-image text-muted small"></i>
                                  </div>
                                )}
                                <div>
                                  <div className="fw-semibold text-dark text-wrap" style={{ maxWidth: "250px", fontSize: "0.9rem" }}>
                                    {item.productName || item.product?.productName || "Sản phẩm"}
                                  </div>
                                  {(item.variantName || item.optionsSnapshot || item.toppingsSnapshot || item.note) && (
                                    <div className="mt-1" style={{ fontSize: "0.8rem", color: "#666" }}>
                                      {item.variantName && <div className="mb-1"><i className="fa-solid fa-ruler me-1" style={{ fontSize: "9px" }}></i>Size {item.variantName}</div>}
                                      {item.optionsSnapshot && <div className="mb-1"><i className="fa-solid fa-sliders me-1" style={{ fontSize: "9px" }}></i>Tuỳ chọn: {item.optionsSnapshot}</div>}
                                      {item.toppingsSnapshot && <div className="mb-1"><i className="fa-solid fa-ice-cream me-1" style={{ fontSize: "9px" }}></i>Topping: {Object.entries(item.toppingsSnapshot.split(', ').reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {})).map(([name, count]) => count > 1 ? `${name} (x${count})` : name).join(', ')}</div>}
                                      {item.note && <div className="mb-1 fst-italic"><i className="fa-regular fa-comment-dots me-1" style={{ fontSize: "9px" }}></i>Ghi chú: {item.note}</div>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-center py-2 fw-medium text-dark">x{finalQty}</td>
                            <td className="text-end px-3 py-2 text-dark">
                              {toppingCost > 0 ? (
                                <div className="d-flex flex-column align-items-end" style={{ fontSize: "0.85rem" }}>
                                  <div className="d-flex justify-content-between mb-1 text-muted" style={{ width: "130px" }}>
                                    <span>Sản phẩm:</span>
                                    <span>{productCost.toLocaleString("vi-VN")} đ</span>
                                  </div>
                                  <div className="d-flex justify-content-between mb-1 text-muted" style={{ width: "130px" }}>
                                    <span>Topping:</span>
                                    <span>{toppingCost.toLocaleString("vi-VN")} đ</span>
                                  </div>
                                  <div className="d-flex justify-content-between pt-1 mt-1 border-top" style={{ width: "130px" }}>
                                    <span className="fw-semibold">Tổng:</span>
                                    <span className="fw-bold text-dark">{itemSubTotal.toLocaleString("vi-VN")} đ</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="fw-bold">{itemSubTotal.toLocaleString("vi-VN")} đ</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="d-flex flex-column flex-sm-row gap-3">
              <button
                className="btn btn-danger flex-grow-1 py-3 rounded-pill fw-bold"
                onClick={() => navigate("/profile/orders", { state: { openOrder: order.id } })}
              >
                XEM CHI TIẾT ĐƠN HÀNG
              </button>
              <button
                className="btn btn-outline-secondary flex-grow-1 py-3 rounded-pill fw-bold bg-white"
                onClick={() => navigate("/products")}
              >
                TIẾP TỤC MUA SẮM
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default OrderSuccessPage;
