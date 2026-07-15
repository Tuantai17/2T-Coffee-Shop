import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { clearCart } from "../../services/cartService";
import { getPaymentStatusByTxnRef, verifyVNPayReturn } from "../../services/paymentService";

const MAX_STATUS_CHECK_ATTEMPTS = 4;
const STATUS_CHECK_INTERVAL_MS = 2000;

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let retryTimeoutId = null;

    const txnRef = searchParams.get("vnp_TxnRef");
    const returnPayload = Object.fromEntries(searchParams.entries());

    const markSuccess = async (resolvedOrderId) => {
      await clearCart().catch(() => null);
      sessionStorage.removeItem("pendingPaymentOrderId");

      if (cancelled) {
        return;
      }

      setOrderId(resolvedOrderId || null);
      setStatus("success");
      setMessage("Thanh toán thành công. Đơn hàng của bạn đã được ghi nhận.");
    };

    const markFailure = (backendStatus) => {
      if (backendStatus === "CANCELLED") {
        setStatus("failed");
        setMessage("Giao dịch VNPay đã bị hủy.");
        return;
      }

      setStatus("failed");
      setMessage("Thanh toán thất bại hoặc chưa được hệ thống xác nhận.");
    };

    const checkPaymentStatus = async (attempt = 1) => {
      if (!txnRef) {
        setStatus("failed");
        setMessage("Không tìm thấy thông tin giao dịch VNPay.");
        return;
      }

      try {
        const response = await getPaymentStatusByTxnRef(txnRef);
        const payment = response?.data;
        const backendStatus = String(payment?.status || "").toUpperCase();
        const resolvedOrderId = payment?.orderId || null;

        if (cancelled) {
          return;
        }

        setOrderId(resolvedOrderId);

        if (backendStatus === "SUCCESS") {
          await markSuccess(resolvedOrderId);
          return;
        }

        if (["FAILED", "CANCELLED", "REFUNDED"].includes(backendStatus)) {
          markFailure(backendStatus);
          return;
        }

        if (attempt >= MAX_STATUS_CHECK_ATTEMPTS) {
          setStatus("failed");
          setMessage("Hệ thống chưa đồng bộ được trạng thái thanh toán. Vui lòng mở lại chi tiết đơn hàng để kiểm tra.");
          return;
        }

        setStatus("processing");
        setMessage(`Hệ thống đang đồng bộ trạng thái thanh toán. Đang thử lần ${attempt}/${MAX_STATUS_CHECK_ATTEMPTS}...`);
        retryTimeoutId = window.setTimeout(() => {
          checkPaymentStatus(attempt + 1);
        }, STATUS_CHECK_INTERVAL_MS);
      } catch (error) {
        console.error("Error fetching payment status:", error);

        if (cancelled) {
          return;
        }

        if (attempt >= MAX_STATUS_CHECK_ATTEMPTS) {
          setStatus("failed");
          setMessage("Đã xảy ra lỗi khi kiểm tra trạng thái thanh toán.");
          return;
        }

        setStatus("processing");
        setMessage(`Đang thử kết nối lại để đồng bộ giao dịch (${attempt}/${MAX_STATUS_CHECK_ATTEMPTS})...`);
        retryTimeoutId = window.setTimeout(() => {
          checkPaymentStatus(attempt + 1);
        }, STATUS_CHECK_INTERVAL_MS);
      }
    };

    const verifyPaymentResult = async () => {
      if (!txnRef) {
        setStatus("failed");
        setMessage("Không tìm thấy thông tin giao dịch VNPay.");
        return;
      }

      try {
        const response = await verifyVNPayReturn(returnPayload);
        const payment = response?.data;
        const backendStatus = String(payment?.status || "").toUpperCase();
        const resolvedOrderId = payment?.orderId || null;

        if (cancelled) {
          return;
        }

        setOrderId(resolvedOrderId);

        if (backendStatus === "SUCCESS") {
          await markSuccess(resolvedOrderId);
          return;
        }

        if (["FAILED", "CANCELLED", "REFUNDED"].includes(backendStatus)) {
          markFailure(backendStatus);
          return;
        }

        setStatus("processing");
        setMessage("Hệ thống đang xác minh và đồng bộ giao dịch VNPay...");
        await checkPaymentStatus(1);
      } catch (error) {
        console.error("Error verifying VNPay return:", error);

        if (cancelled) {
          return;
        }

        setStatus("processing");
        setMessage("Đang thử đồng bộ giao dịch từ hệ thống...");
        await checkPaymentStatus(1);
      }
    };

    verifyPaymentResult();

    return () => {
      cancelled = true;
      if (retryTimeoutId) {
        window.clearTimeout(retryTimeoutId);
      }
    };
  }, [searchParams]);

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm text-center p-4" style={{ borderRadius: "12px", border: "none" }}>
            <div className="card-body">
              {status === "processing" && (
                <>
                  <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                    <span className="visually-hidden">Đang xử lý...</span>
                  </div>
                  <h4 className="card-title fw-bold">Đang xử lý kết quả thanh toán</h4>
                  <p className="card-text text-muted">{message || "Vui lòng đợi trong giây lát..."}</p>
                </>
              )}

              {status === "success" && (
                <>
                  <i className="fa-solid fa-circle-check text-success mb-3" style={{ fontSize: "5rem" }}></i>
                  <h4 className="card-title text-success fw-bold">Thanh Toán Thành Công</h4>
                  <div className="alert alert-success mt-3">{message}</div>
                  <button
                    className="btn btn-primary mt-4 w-100 py-2 rounded-pill shadow-sm fw-bold"
                    onClick={() => navigate(orderId ? `/order-success/${orderId}` : "/profile/orders")}
                  >
                    Xem Đơn Hàng
                  </button>
                </>
              )}

              {status === "failed" && (
                <>
                  <i className="fa-solid fa-circle-xmark text-danger mb-3" style={{ fontSize: "5rem" }}></i>
                  <h4 className="card-title text-danger fw-bold">Thanh Toán Thất Bại</h4>
                  <div className="alert alert-danger mt-3">{message}</div>
                  <button
                    className="btn btn-secondary mt-4 w-100 py-2 rounded-pill shadow-sm fw-bold"
                    onClick={() => navigate("/cart")}
                  >
                    Quay Lại Giỏ Hàng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
