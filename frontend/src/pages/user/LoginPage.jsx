import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import {
  AUTH_SCOPES,
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "../../utils/authStorage";
import AuthLayout from "../../layouts/AuthLayout";
import AuthHeaderIllustration from "../../components/AuthHeaderIllustration";

function LoginPage() {
  const navigate = useNavigate();
  const existingUserSession = getAuthSession(AUTH_SCOPES.USER);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!form.email || !form.email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Email không đúng định dạng.");
      return;
    }
    if (!form.password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const res = await login({ username: form.email.toLowerCase().trim(), password: form.password });
      const { token, role, userId, username } = res.data;

      if (role === "ROLE_ADMIN" || role === "ROLE_STAFF") {
        clearAuthSession(AUTH_SCOPES.USER);
        setError("Tài khoản quản trị vui lòng đăng nhập tại trang admin.");
        navigate("/admin/login");
        return;
      }

      setAuthSession(AUTH_SCOPES.USER, {
        token,
        role,
        userId,
        email: username || form.email,
      });

      // Navigate to home or intended page
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
         setError("Email hoặc mật khẩu không chính xác.");
      } else if (err.response && err.response.status === 403) {
         setError("Tài khoản của bạn đã bị khóa.");
      } else {
         setError("Không thể kết nối đến hệ thống. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập">
      <AuthHeaderIllustration />
      <div className="text-center mb-4">
        <h2 className="auth-title fs-3 mb-1">Đăng Nhập</h2>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 py-2 small" role="alert">
          {error}
        </div>
      )}

      {existingUserSession?.token && (
        <div className="alert alert-success rounded-3 py-2 small" role="alert">
          Đang đăng nhập với: {existingUserSession.email}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label fw-bold small text-dark mb-1">Email *</label>
          <div className="auth-input-container">
            <i className="fa-regular fa-envelope auth-input-icon"></i>
            <input
              name="email"
              type="email"
              className="form-control auth-input"
              placeholder="Nhập email của bạn"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold small text-dark mb-1">Mật khẩu *</label>
          <div className="auth-input-container">
            <i className="fa-solid fa-lock auth-input-icon"></i>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className="form-control auth-input"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              required
            />
            <i 
              className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} auth-input-icon-right`}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            ></i>
          </div>
        </div>

        <button
          type="submit"
          className="btn auth-primary-btn w-100 py-3 mb-3"
          disabled={loading}
        >
          {loading ? (
            <span><i className="fa-solid fa-circle-notch fa-spin me-2"></i>Đang đăng nhập...</span>
          ) : (
            "Đăng Nhập"
          )}
        </button>
      </form>

      <div className="text-center mb-4">
        <Link to="/forgot-password" className="auth-link-navy small">Quên mật khẩu?</Link>
      </div>

      <div className="text-center mt-3 pt-3 border-top">
        <p className="mb-0 small text-muted">
          Chưa có tài khoản? <Link to="/register" className="auth-link-primary ms-1">Đăng ký tài khoản</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
