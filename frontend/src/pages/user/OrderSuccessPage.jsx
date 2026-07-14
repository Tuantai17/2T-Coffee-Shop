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
        console.error("Loi lay thong tin don hang:", err);
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
          <h4 className="text-muted">Dang tai thong tin don hang...</h4>
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
          <h3 className="fw-bold mb-3">Khong tim thay don hang</h3>
          <p className="text-muted mb-4">Xin loi, chung toi khong the tim thay thong tin cho don hang nay.</p>
          <Link to="/profile/orders" className="btn btn-primary rounded-pill px-4 py-2 fw-bold">
            Ve Lich Su Don Hang
          </Link>
        </div>
      </UserLayout>
    );
  }

  const orderDate = new Date(order.orderDate || order.createdAt || Date.now());
  const formattedDate = `${orderDate.getDate().toString().padStart(2, "0")}/${(orderDate.getMonth() + 1).toString().padStart(2, "0")}/${orderDate.getFullYear()} ${orderDate.getHours().toString().padStart(2, "0")}:${orderDate.getMinutes().toString().padStart(2, "0")}:${orderDate.getSeconds().toString().padStart(2, "0")}`;

  let paymentMethodStr = "Thanh toan khi nhan hang (COD)";
  if (order.paymentMethod === "BANKING") paymentMethodStr = "Chuyen khoan ngan hang";
  if (order.paymentMethod === "VNPAY") paymentMethodStr = "Thanh toan qua VNPay";

  return (
    <UserLayout>
      <div className="container py-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-4 shadow" style={{ width: "90px", height: "90px" }}>
                <i className="fa-solid fa-check fs-1" aria-label="Thanh cong"></i>
              </div>
              <h1 className="fw-extrabold text-dark mb-2">Dat hang thanh cong!</h1>
              <p className="text-muted fs-5">Cam on ban da mua sam tai MyKingdom.</p>
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
                  <span className="text-muted fw-medium">Ma don hang</span>
                  <span className="fw-bold text-dark">{order.orderCode || `MKD-${order.id.toString().padStart(6, "0")}`}</span>
                </div>
              </div>

              <div className="d-flex align-items-center mb-4">
                <div className="bg-light rounded p-2 me-3 text-secondary">
                  <i className="fa-regular fa-clock fs-5"></i>
                </div>
                <div className="flex-grow-1 d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="text-muted fw-medium">Ngay dat hang</span>
                  <span className="fw-bold text-dark">{formattedDate}</span>
                </div>
              </div>

              <div className="d-flex align-items-center mb-4">
                <div className="bg-light rounded p-2 me-3 text-secondary">
                  <i className="fa-solid fa-wallet fs-5"></i>
                </div>
                <div className="flex-grow-1 d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="text-muted fw-medium">Phuong thuc thanh toan</span>
                  <span className="fw-bold text-dark">{paymentMethodStr}</span>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="bg-light rounded p-2 me-3 text-secondary">
                  <i className="fa-solid fa-money-bill-wave fs-5"></i>
                </div>
                <div className="flex-grow-1 d-flex justify-content-between align-items-center pb-2">
                  <span className="text-muted fw-medium">Tong thanh toan</span>
                  <span className="fw-extrabold text-danger fs-4">{(order.total || order.totalAmount || order.totalPrice || 0).toLocaleString("vi-VN")}d</span>
                </div>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-3">
              <button
                className="btn btn-danger flex-grow-1 py-3 rounded-pill fw-bold"
                onClick={() => navigate("/profile/orders", { state: { openOrder: order.id } })}
              >
                XEM CHI TIET DON HANG
              </button>
              <button
                className="btn btn-outline-secondary flex-grow-1 py-3 rounded-pill fw-bold bg-white"
                onClick={() => navigate("/products")}
              >
                TIEP TUC MUA SAM
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default OrderSuccessPage;
