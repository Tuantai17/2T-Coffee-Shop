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

    const identifier = form.email.trim();
    if (!identifier) {
      setError("Vui long nhap email hoac ten dang nhap.");
      return;
    }

    if (!form.password) {
      setError("Vui long nhap mat khau.");
      return;
    }

    setLoading(true);

    try {
      const res = await login({
        username: identifier.toLowerCase(),
        password: form.password,
      });
      const { token, role, userId, username } = res.data;

      if (role === "ROLE_ADMIN" || role === "ROLE_STAFF") {
        clearAuthSession(AUTH_SCOPES.USER);
        setError("Tai khoan quan tri vui long dang nhap tai trang admin.");
        navigate("/admin/login");
        return;
      }

      setAuthSession(AUTH_SCOPES.USER, {
        token,
        role,
        userId,
        email: username || identifier,
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError("Thong tin dang nhap khong chinh xac.");
      } else if (err.response && err.response.status === 403) {
        setError("Tai khoan cua ban da bi khoa.");
      } else {
        setError("Khong the ket noi den he thong. Vui long thu lai.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Dang nhap">
      <AuthHeaderIllustration />
      <div className="text-center mb-4">
        <h2 className="auth-title fs-3 mb-1">Dang Nhap</h2>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 py-2 small" role="alert">
          {error}
        </div>
      )}

      {existingUserSession?.token && (
        <div className="alert alert-success rounded-3 py-2 small" role="alert">
          Dang dang nhap voi: {existingUserSession.email}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label fw-bold small text-dark mb-1">
            Email hoac ten dang nhap *
          </label>
          <div className="auth-input-container">
            <i className="fa-regular fa-envelope auth-input-icon"></i>
            <input
              name="email"
              type="text"
              className="form-control auth-input"
              placeholder="Nhap email hoac ten dang nhap"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold small text-dark mb-1">
            Mat khau *
          </label>
          <div className="auth-input-container">
            <i className="fa-solid fa-lock auth-input-icon"></i>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className="form-control auth-input"
              placeholder="Nhap mat khau"
              value={form.password}
              onChange={handleChange}
              required
            />
            <i
              className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} auth-input-icon-right`}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "An mat khau" : "Hien mat khau"}
            ></i>
          </div>
        </div>

        <button
          type="submit"
          className="btn auth-primary-btn w-100 py-3 mb-3"
          disabled={loading}
        >
          {loading ? (
            <span>
              <i className="fa-solid fa-circle-notch fa-spin me-2"></i>
              Dang dang nhap...
            </span>
          ) : (
            "Dang Nhap"
          )}
        </button>
      </form>

      <div className="text-center mb-4">
        <Link to="/forgot-password" className="auth-link-navy small">
          Quen mat khau?
        </Link>
      </div>

      <div className="text-center mt-3 pt-3 border-top">
        <p className="mb-0 small text-muted">
          Chua co tai khoan?{" "}
          <Link to="/register" className="auth-link-primary ms-1">
            Dang ky tai khoan
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
