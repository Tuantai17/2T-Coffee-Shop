import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthHeaderIllustration from "../../components/AuthHeaderIllustration";
import AuthLayout from "../../layouts/AuthLayout";
import { resetForgotPassword } from "../../services/authService";

const RESET_TOKEN_STORAGE_KEY = "forgotPasswordResetSession";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const recoverySession = useMemo(() => {
    const queryEmail = (searchParams.get("email") || "").trim().toLowerCase();
    const stateEmail = (location.state?.email || "").trim().toLowerCase();
    const stateResetToken = location.state?.resetToken || "";

    if (stateEmail && stateResetToken) {
      return { email: stateEmail, resetToken: stateResetToken };
    }

    const rawStoredSession = sessionStorage.getItem(RESET_TOKEN_STORAGE_KEY);
    if (!rawStoredSession) {
      return { email: queryEmail, resetToken: "" };
    }

    try {
      const parsed = JSON.parse(rawStoredSession);
      const storedEmail = (parsed?.email || "").trim().toLowerCase();
      if (queryEmail && storedEmail && queryEmail !== storedEmail) {
        return { email: queryEmail, resetToken: "" };
      }
      return {
        email: storedEmail || queryEmail,
        resetToken: parsed?.resetToken || "",
      };
    } catch {
      return { email: queryEmail, resetToken: "" };
    }
  }, [location.state, searchParams]);

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!recoverySession.email || !recoverySession.resetToken) {
      setError("Phiên đặt lại mật khẩu không hợp lệ. Vui lòng xác thực OTP lại.");
      return;
    }
    if (!form.newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      const response = await resetForgotPassword({
        email: recoverySession.email,
        resetToken: recoverySession.resetToken,
        newPassword: form.newPassword,
      });
      setSuccess(response?.data?.message || "Đặt lại mật khẩu thành công.");
      sessionStorage.removeItem(RESET_TOKEN_STORAGE_KEY);
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      if (err?.response?.status === 503) {
        setError("Dịch vụ tài khoản hiện chưa sẵn sàng. Hãy kiểm tra user-service, api-gateway và eureka.");
      } else {
        setError(err?.response?.data?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đặt lại mật khẩu">
      <AuthHeaderIllustration />
      <div className="text-center mb-4">
        <h2 className="auth-title fs-3 mb-1">Đặt Lại Mật Khẩu</h2>
        <p className="text-muted mb-0 small">
          Tạo mật khẩu mới cho email <strong>{recoverySession.email || "của bạn"}</strong>.
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

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold small text-dark mb-1">Mật khẩu mới *</label>
          <div className="auth-input-container">
            <i className="fa-solid fa-lock auth-input-icon"></i>
            <input
              name="newPassword"
              type={showPasswords ? "text" : "password"}
              className="form-control auth-input"
              placeholder="Nhập mật khẩu mới"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold small text-dark mb-1">Xác nhận mật khẩu *</label>
          <div className="auth-input-container">
            <i className="fa-solid fa-lock auth-input-icon"></i>
            <input
              name="confirmPassword"
              type={showPasswords ? "text" : "password"}
              className="form-control auth-input"
              placeholder="Nhập lại mật khẩu mới"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <i
              className={`fa-regular ${showPasswords ? "fa-eye-slash" : "fa-eye"} auth-input-icon-right`}
              onClick={() => setShowPasswords((current) => !current)}
              aria-label={showPasswords ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            ></i>
          </div>
        </div>

        <button
          type="submit"
          className="btn auth-primary-btn w-100 py-3 mb-3"
          disabled={loading}
        >
          {loading ? (
            <span><i className="fa-solid fa-circle-notch fa-spin me-2"></i>Đang cập nhật...</span>
          ) : (
            "Cập nhật mật khẩu"
          )}
        </button>
      </form>

      <div className="text-center">
        <Link
          to={recoverySession.email ? `/verify-otp?email=${encodeURIComponent(recoverySession.email)}` : "/verify-otp"}
          className="auth-link-navy small"
        >
          Quay lại bước nhập OTP
        </Link>
      </div>
    </AuthLayout>
  );
}

export default ResetPasswordPage;
