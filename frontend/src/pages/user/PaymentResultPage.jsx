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
      setMessage("Thanh toan thanh cong. Don hang cua ban da duoc ghi nhan.");
    };

    const markFailure = (backendStatus) => {
      if (backendStatus === "CANCELLED") {
        setStatus("failed");
        setMessage("Giao dich VNPay da bi huy.");
        return;
      }

      setStatus("failed");
      setMessage("Thanh toan that bai hoac chua duoc he thong xac nhan.");
    };

    const checkPaymentStatus = async (attempt = 1) => {
      if (!txnRef) {
        setStatus("failed");
        setMessage("Khong tim thay thong tin giao dich VNPay.");
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
          setMessage("He thong chua dong bo duoc trang thai thanh toan. Vui long mo lai chi tiet don hang de kiem tra.");
          return;
        }

        setStatus("processing");
        setMessage(`He thong dang dong bo trang thai thanh toan. Dang thu lan ${attempt}/${MAX_STATUS_CHECK_ATTEMPTS}...`);
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
          setMessage("Da xay ra loi khi kiem tra trang thai thanh toan.");
          return;
        }

        setStatus("processing");
        setMessage(`Dang thu ket noi lai de dong bo giao dich (${attempt}/${MAX_STATUS_CHECK_ATTEMPTS})...`);
        retryTimeoutId = window.setTimeout(() => {
          checkPaymentStatus(attempt + 1);
        }, STATUS_CHECK_INTERVAL_MS);
      }
    };

    const verifyPaymentResult = async () => {
      if (!txnRef) {
        setStatus("failed");
        setMessage("Khong tim thay thong tin giao dich VNPay.");
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
        setMessage("Backend dang xac minh va dong bo giao dich VNPay...");
        await checkPaymentStatus(1);
      } catch (error) {
        console.error("Error verifying VNPay return:", error);

        if (cancelled) {
          return;
        }

        setStatus("processing");
        setMessage("Dang thu dong bo giao dich tu backend...");
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
                    <span className="visually-hidden">Dang xu ly...</span>
                  </div>
                  <h4 className="card-title fw-bold">Dang xu ly ket qua thanh toan</h4>
                  <p className="card-text text-muted">{message || "Vui long doi trong giay lat..."}</p>
                </>
              )}

              {status === "success" && (
                <>
                  <i className="fa-solid fa-circle-check text-success mb-3" style={{ fontSize: "5rem" }}></i>
                  <h4 className="card-title text-success fw-bold">Thanh Toan Thanh Cong</h4>
                  <div className="alert alert-success mt-3">{message}</div>
                  <button
                    className="btn btn-primary mt-4 w-100 py-2 rounded-pill shadow-sm fw-bold"
                    onClick={() => navigate(orderId ? `/order-success/${orderId}` : "/profile/orders")}
                  >
                    Xem Don Hang
                  </button>
                </>
              )}

              {status === "failed" && (
                <>
                  <i className="fa-solid fa-circle-xmark text-danger mb-3" style={{ fontSize: "5rem" }}></i>
                  <h4 className="card-title text-danger fw-bold">Thanh Toan That Bai</h4>
                  <div className="alert alert-danger mt-3">{message}</div>
                  <button
                    className="btn btn-secondary mt-4 w-100 py-2 rounded-pill shadow-sm fw-bold"
                    onClick={() => navigate("/cart")}
                  >
                    Quay Lai Gio Hang
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
