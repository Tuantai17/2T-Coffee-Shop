import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthHeaderIllustration from "../../components/AuthHeaderIllustration";
import AuthLayout from "../../layouts/AuthLayout";
import { sendForgotPasswordOtp, verifyForgotPasswordOtp } from "../../services/authService";

const RESET_TOKEN_STORAGE_KEY = "forgotPasswordResetSession";

function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const email = useMemo(() => {
    const stateEmail = location.state?.email;
    const queryEmail = searchParams.get("email");
    return (stateEmail || queryEmail || "").trim().toLowerCase();
  }, [location.state, searchParams]);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.infoMessage || "");
  const [devOtp, setDevOtp] = useState(location.state?.devOtp || "");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");

    if (!email) {
      setError("Không tìm thấy email cần xác thực. Vui lòng nhập lại email.");
      return;
    }

    const normalizedOtp = otp.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError("OTP phải gồm đúng 6 chữ số.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyForgotPasswordOtp({
        email,
        otp: normalizedOtp,
      });
      const resetToken = response?.data?.resetToken || "";
      sessionStorage.setItem(RESET_TOKEN_STORAGE_KEY, JSON.stringify({ email, resetToken }));
      navigate(`/reset-password?email=${encodeURIComponent(email)}`, {
        state: { email, resetToken },
      });
    } catch (err) {
      if (err?.response?.status === 503) {
        setError("Dịch vụ tài khoản hiện chưa sẵn sàng. Hãy kiểm tra user-service, api-gateway và eureka.");
      } else {
        setError(err?.response?.data?.message || "Xác thực OTP thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Không tìm thấy email để gửi lại OTP.");
      return;
    }

    setResending(true);
    try {
      const response = await sendForgotPasswordOtp({ email });
      setSuccess(response?.data?.message || "Mã OTP mới đã được gửi.");
      setDevOtp(response?.data?.devOtp || "");
    } catch (err) {
      if (err?.response?.status === 503) {
        setError("Dịch vụ tài khoản hiện chưa sẵn sàng. Hãy kiểm tra user-service, api-gateway và eureka.");
      } else {
        setError(err?.response?.data?.message || "Không thể gửi lại OTP. Vui lòng thử lại.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Xác thực OTP">
      <AuthHeaderIllustration />
      <div className="text-center mb-4">
        <h2 className="auth-title fs-3 mb-1">Xác Thực OTP</h2>
        <p className="text-muted mb-0 small">
          Nhập mã OTP đã được gửi tới email <strong>{email || "của bạn"}</strong>.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 py-2 small" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success rounded-3 py-2 small" role="alert">
          {success}
        </div>
      )}

      {devOtp && (
        <div className="alert alert-warning rounded-3 py-2 small" role="alert">
          Môi trường local chưa cấu hình gửi mail thật. Mã OTP test hiện tại là: <strong>{devOtp}</strong>
        </div>
      )}

      <form onSubmit={handleVerify}>
        <div className="mb-3">
          <label className="form-label fw-bold small text-dark mb-1">Mã OTP *</label>
          <div className="auth-input-container">
            <i className="fa-solid fa-shield-halved auth-input-icon"></i>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="form-control auth-input auth-input-code"
              placeholder="Nhập 6 chữ số"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn auth-primary-btn w-100 py-3 mb-3"
          disabled={loading}
        >
          {loading ? (
            <span><i className="fa-solid fa-circle-notch fa-spin me-2"></i>Đang xác thực...</span>
          ) : (
            "Xác thực OTP"
          )}
        </button>
      </form>

      <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <button
          type="button"
          className="btn btn-link auth-link-primary p-0"
          onClick={handleResendOtp}
          disabled={resending}
        >
          {resending ? "Đang gửi lại..." : "Gửi lại OTP"}
        </button>
        <Link to="/forgot-password" className="auth-link-navy small">
          Đổi email khác
        </Link>
      </div>
    </AuthLayout>
  );
}

export default VerifyOtpPage;
