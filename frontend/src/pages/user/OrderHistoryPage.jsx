import { useEffect, useState } from "react";
import UserLayout from "../../layouts/UserLayout";
import { getOrdersByUser } from "../../services/orderService";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";

function statusBadgeClass(status) {
  switch (status) {
    case "COMPLETED":
      return "bg-success";
    case "SHIPPING":
      return "bg-primary";
    case "CANCELLED":
      return "bg-danger";
    case "PACKING":
      return "bg-info";
    default:
      return "bg-warning text-dark";
  }
}

function paymentBadgeClass(status) {
  switch (status) {
    case "PAID":
      return "bg-success";
    case "PAYMENT_ON_DELIVERY":
      return "bg-secondary";
    case "FAILED":
      return "bg-danger";
    default:
      return "bg-warning text-dark";
  }
}

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    const { userId } = getAuthSession(AUTH_SCOPES.USER);
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await getOrdersByUser(userId);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi lấy lịch sử đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <UserLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-2 fw-bold mb-2">
              Order History
            </span>
            <h2 className="fw-bold mb-1">Lịch sử mua hàng</h2>
            <p className="text-muted mb-0">Theo dõi trạng thái đơn, thanh toán và thông tin giao hàng.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="alert alert-info text-center py-4 rounded-4">
            Bạn chưa thực hiện bất kỳ đơn hàng nào.
          </div>
        ) : (
          <div className="row g-3">
            {orders.map((order) => (
              <div className="col-12" key={order.id}>
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <div className="small text-muted">Mã đơn hàng</div>
                      <div className="fw-bold fs-5">#{order.id}</div>
                    </div>
                    <div>
                      <div className="small text-muted">Ngày đặt</div>
                      <div className="fw-semibold">
                        {new Date(order.orderedDate || Date.now()).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div>
                      <div className="small text-muted">Người nhận</div>
                      <div className="fw-semibold">{order.receiverName || order.user?.userName || "Đang cập nhật"}</div>
                    </div>
                    <div className="text-lg-end">
                      <div className="small text-muted">Tổng thanh toán</div>
                      <div className="fw-bold text-danger fs-5">
                        {(order.total || 0).toLocaleString("vi-VN")} VNĐ
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className={`badge ${statusBadgeClass(order.status)} px-3 py-2 rounded-pill`}>
                      {order.status}
                    </span>
                    <span className={`badge ${paymentBadgeClass(order.paymentStatus)} px-3 py-2 rounded-pill`}>
                      {order.paymentStatus || "PENDING"}
                    </span>
                    <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                      {order.paymentMethod || "COD"}
                    </span>
                    {order.voucherCode && (
                      <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                        Voucher: {order.voucherCode}
                      </span>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-lg-8">
                      <p className="mb-2">
                        <span className="fw-semibold">Sản phẩm: </span>
                        {order.items && order.items.length > 0
                          ? order.items
                              .map((item) => `${item.product ? item.product.productName : "Sản phẩm"} (x${item.quantity})`)
                              .join(", ")
                          : "Không có sản phẩm"}
                      </p>
                      <p className="mb-0 text-muted">
                        <span className="fw-semibold text-dark">Giao đến: </span>
                        {[order.address, order.ward, order.district, order.province].filter(Boolean).join(", ") || "Chưa có địa chỉ"}
                      </p>
                    </div>
                    <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                      <button
                        className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold btn-sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            zIndex: 1050,
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white p-4 rounded-5 shadow-lg position-relative"
            style={{ width: "92%", maxWidth: "760px", maxHeight: "88vh", overflowY: "auto" }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="btn btn-light rounded-circle position-absolute"
              style={{ top: "20px", right: "20px", width: "40px", height: "40px" }}
              onClick={() => setSelectedOrder(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="text-center mb-4">
              <span className="badge bg-danger text-white px-3 py-2 rounded-pill fw-bold mb-2">
                CHI TIẾT ĐƠN HÀNG
              </span>
              <h3 className="fw-bold text-dark mt-2">Mã đơn hàng #{selectedOrder.id}</h3>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="card border-0 bg-light rounded-4 p-3 h-100">
                  <div className="small text-muted mb-2">Thông tin người nhận</div>
                  <div className="fw-semibold">{selectedOrder.receiverName || selectedOrder.user?.userName || "Đang cập nhật"}</div>
                  <div>{selectedOrder.phone || "Chưa có số điện thoại"}</div>
                  <div className="text-muted mt-2">
                    {[selectedOrder.address, selectedOrder.ward, selectedOrder.district, selectedOrder.province]
                      .filter(Boolean)
                      .join(", ") || "Chưa có địa chỉ nhận hàng"}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 bg-light rounded-4 p-3 h-100">
                  <div className="small text-muted mb-2">Thanh toán</div>
                  <div className="fw-semibold">Phương thức: {selectedOrder.paymentMethod || "COD"}</div>
                  <div>Trạng thái: {selectedOrder.paymentStatus || "PENDING"}</div>
                  <div className="mt-2">Voucher: {selectedOrder.voucherCode || "Không có"}</div>
                  <div>Ghi chú: {selectedOrder.note || "Không có"}</div>
                </div>
              </div>
            </div>

            <h5 className="fw-bold text-dark mb-3">Danh sách sản phẩm</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-center">Số lượng</th>
                    <th className="text-end">Đơn giá</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item) => (
                    <tr key={item.id || item.product?.id}>
                      <td className="fw-semibold">{item.product?.productName || "Sản phẩm đồ chơi"}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">{(item.product?.price || 0).toLocaleString("vi-VN")} VNĐ</td>
                      <td className="text-end fw-bold">
                        {((item.product?.price || 0) * item.quantity).toLocaleString("vi-VN")} VNĐ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card border-0 bg-danger text-white rounded-4 p-3 mt-4">
              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính</span>
                <span>{(((selectedOrder.total || 0) - (selectedOrder.shippingFee || 0) + (selectedOrder.discountAmount || 0))).toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Giảm giá</span>
                <span>-{(selectedOrder.discountAmount || 0).toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển</span>
                <span>{(selectedOrder.shippingFee || 0).toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                <span className="fw-bold fs-5">Tổng thanh toán</span>
                <span className="fw-extrabold fs-4">{(selectedOrder.total || 0).toLocaleString("vi-VN")} VNĐ</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}

export default OrderHistoryPage;
