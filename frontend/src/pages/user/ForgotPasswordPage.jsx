import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthHeaderIllustration from "../../components/AuthHeaderIllustration";
import AuthLayout from "../../layouts/AuthLayout";
import { sendForgotPasswordOtp } from "../../services/authService";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setDevOtp("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Vui lòng nhập email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError("Email không đúng định dạng.");
      return;
    }

    setLoading(true);

    try {
      const response = await sendForgotPasswordOtp({ email: normalizedEmail });
      const message = response?.data?.message || "Mã OTP đã được gửi nếu email tồn tại trong hệ thống.";
      const previewOtp = response?.data?.devOtp || "";
      setSuccess(message);
      setDevOtp(previewOtp);
      navigate(`/verify-otp?email=${encodeURIComponent(normalizedEmail)}`, {
        state: { email: normalizedEmail, infoMessage: message, devOtp: previewOtp },
      });
    } catch (err) {
      if (err?.response?.status === 503) {
        setError("Dịch vụ tài khoản hiện chưa sẵn sàng. Hãy kiểm tra user-service, api-gateway và eureka đã chạy đầy đủ.");
      } else {
        setError(err?.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Quên mật khẩu">
      <AuthHeaderIllustration />
      <div className="text-center mb-4">
        <h2 className="auth-title fs-3 mb-1">Quên Mật Khẩu</h2>
        <p className="text-muted mb-0 small">
          Nhập email để nhận mã OTP xác thực đặt lại mật khẩu.
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
          Môi trường local chưa cấu hình gửi mail thật. Mã OTP test của bạn là: <strong>{devOtp}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label fw-bold small text-dark mb-1">Email *</label>
          <div className="auth-input-container">
            <i className="fa-regular fa-envelope auth-input-icon"></i>
            <input
              type="email"
              className="form-control auth-input"
              placeholder="Nhập email đã đăng ký"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
            <span><i className="fa-solid fa-circle-notch fa-spin me-2"></i>Đang gửi OTP...</span>
          ) : (
            "Gửi mã OTP"
          )}
        </button>
      </form>

      <div className="text-center">
        <Link to="/login" className="auth-link-navy small">
          Quay lại đăng nhập
        </Link>
      </div>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
