import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/authService";
import AuthLayout from "../../layouts/AuthLayout";
import AuthHeaderIllustration from "../../components/AuthHeaderIllustration";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear specific field error when typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
    setError("");
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {};

    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errors.fullName = "Họ tên phải có ít nhất 2 ký tự.";
      isValid = false;
    }

    if (!form.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại.";
      isValid = false;
    } else if (!/^[0-9+]{9,15}$/.test(form.phone.replace(/\s+/g, ''))) {
      errors.phone = "Số điện thoại không hợp lệ.";
      isValid = false;
    }

    if (!form.email.trim()) {
      errors.email = "Vui lòng nhập email.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Email không đúng định dạng.";
      isValid = false;
    }

    if (!form.password) {
      errors.password = "Vui lòng nhập mật khẩu.";
      isValid = false;
    } else if (form.password.length < 8) {
      errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
      isValid = false;
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
      isValid = false;
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Mật khẩu nhập lại không khớp.";
      isValid = false;
    }

    if (!form.agreed) {
      errors.agreed = "Bạn cần đồng ý với các điều khoản để tiếp tục.";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      await register({
        fullName: form.fullName.trim(),
        phone: form.phone.replace(/\s+/g, ''),
        email: form.email.toLowerCase().trim(),
        password: form.password
      });
      alert("Đăng ký thành công. Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
          setError("Email hoặc số điện thoại đã được sử dụng.");
      } else {
          setError(
            err?.response?.data?.message ||
            "Đăng ký thất bại. Email hoặc số điện thoại có thể đã tồn tại!"
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng ký thành viên">
      <AuthHeaderIllustration />
      <div className="text-center mb-4">
        <h2 className="auth-title fs-3 mb-1">Đăng ký thành viên</h2>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 py-2 small" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister}>
        {/* Họ tên */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-dark mb-1">Họ Tên</label>
          <div className="auth-input-container">
            <i className="fa-regular fa-user auth-input-icon"></i>
            <input
              name="fullName"
              type="text"
              className={`form-control auth-input ${fieldErrors.fullName ? 'is-invalid' : ''}`}
              placeholder="Nhập họ và tên của bạn"
              value={form.fullName}
              onChange={handleChange}
              aria-invalid={!!fieldErrors.fullName}
            />
          </div>
          {fieldErrors.fullName && <div className="text-danger small mt-1">{fieldErrors.fullName}</div>}
        </div>

        {/* Số điện thoại */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-dark mb-1">Số điện thoại *</label>
          <div className="auth-input-container">
            <i className="fa-solid fa-phone auth-input-icon"></i>
            <input
              name="phone"
              type="tel"
              className={`form-control auth-input ${fieldErrors.phone ? 'is-invalid' : ''}`}
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onChange={handleChange}
              aria-invalid={!!fieldErrors.phone}
            />
          </div>
          {fieldErrors.phone && <div className="text-danger small mt-1">{fieldErrors.phone}</div>}
          <div className="small text-danger mt-1 opacity-75" style={{ fontSize: '0.8rem' }}>
            Số điện thoại này dùng để nhận OTP khi đổi điểm tích luỹ, sử dụng code sinh nhật
          </div>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-dark mb-1">Email *</label>
          <div className="auth-input-container">
            <i className="fa-regular fa-envelope auth-input-icon"></i>
            <input
              name="email"
              type="email"
              className={`form-control auth-input ${fieldErrors.email ? 'is-invalid' : ''}`}
              placeholder="Nhập email của bạn"
              value={form.email}
              onChange={handleChange}
              aria-invalid={!!fieldErrors.email}
            />
          </div>
          {fieldErrors.email && <div className="text-danger small mt-1">{fieldErrors.email}</div>}
        </div>

        {/* Mật khẩu */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-dark mb-1">Mật khẩu *</label>
          <div className="auth-input-container">
            <i className="fa-solid fa-lock auth-input-icon"></i>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className={`form-control auth-input ${fieldErrors.password ? 'is-invalid' : ''}`}
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              aria-invalid={!!fieldErrors.password}
            />
            <i 
              className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} auth-input-icon-right`}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            ></i>
          </div>
          {fieldErrors.password && <div className="text-danger small mt-1">{fieldErrors.password}</div>}
        </div>

        {/* Nhập lại mật khẩu */}
        <div className="mb-4">
          <label className="form-label fw-bold small text-dark mb-1">Nhập lại mật khẩu *</label>
          <div className="auth-input-container">
            <i className="fa-solid fa-lock auth-input-icon"></i>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className={`form-control auth-input ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              aria-invalid={!!fieldErrors.confirmPassword}
            />
            <i 
              className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} auth-input-icon-right`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            ></i>
          </div>
          {fieldErrors.confirmPassword && <div className="text-danger small mt-1">{fieldErrors.confirmPassword}</div>}
        </div>

        {/* Đồng ý */}
        <div className="mb-4 form-check">
          <input
            type="checkbox"
            className={`form-check-input ${fieldErrors.agreed ? 'is-invalid' : ''}`}
            id="agreeTerms"
            name="agreed"
            checked={form.agreed}
            onChange={handleChange}
            aria-label="Tôi đồng ý tất cả"
          />
          <label className="form-check-label small" htmlFor="agreeTerms">
            Tôi đồng ý tất cả
          </label>
          {fieldErrors.agreed && <div className="text-danger small mt-1">{fieldErrors.agreed}</div>}
        </div>

        <button
          type="submit"
          className="btn auth-primary-btn w-100 py-3 mb-3 text-uppercase"
          disabled={loading}
        >
          {loading ? (
            <span><i className="fa-solid fa-circle-notch fa-spin me-2"></i>Đang đăng ký...</span>
          ) : (
            "Đăng Ký"
          )}
        </button>
      </form>

      <div className="text-center mt-3 pt-3 border-top">
        <p className="mb-0 small text-muted">
          Đã có tài khoản? <Link to="/login" className="auth-link-primary ms-1">Đăng nhập</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;
