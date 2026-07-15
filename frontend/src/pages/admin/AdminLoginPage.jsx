import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import {
  AUTH_SCOPES,
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "../../utils/authStorage";

function AdminLoginPage() {
  const navigate = useNavigate();
  const existingAdminSession = getAuthSession(AUTH_SCOPES.ADMIN);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(form);
      const { token, role, userId, username } = res.data;

      if (role !== "ROLE_ADMIN" && role !== "ROLE_STAFF") {
        clearAuthSession(AUTH_SCOPES.ADMIN);
        setError("Tai khoan nay khong co quyen truy cap trang quan tri.");
        return;
      }

      setAuthSession(AUTH_SCOPES.ADMIN, {
        token,
        role,
        userId,
        email: username || form.username,
      });

      alert("Đăng nhập admin thành công!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      clearAuthSession(AUTH_SCOPES.ADMIN);
      setError("Đăng nhập admin thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark bg-gradient px-3">
      <div className="card shadow-lg border-0 rounded-5 p-4 bg-white" style={{ maxWidth: "460px", width: "100%" }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger text-white mb-3" style={{ width: "70px", height: "70px" }}>
            <i className="fa-solid fa-user-shield fs-2"></i>
          </div>
          <h2 className="fw-bold text-dark mb-2">Admin Login</h2>
          <p className="text-muted mb-0">Chi tai khoan ROLE_ADMIN hoac ROLE_STAFF moi duoc truy cap khu quan tri.</p>
          {existingAdminSession.token && (
            <p className="small text-success mt-2 mb-0">Phien admin hien tai: {existingAdminSession.email}</p>
          )}
        </div>

        {error && <div className="alert alert-danger rounded-4">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Tên đăng nhập hoặc Email</label>
            <input
              name="username"
              type="text"
              className="form-control rounded-4 py-3"
              placeholder="Nhap tai khoan admin"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Mat khau</label>
            <input
              name="password"
              type="password"
              className="form-control rounded-4 py-3"
              placeholder="Nhap mat khau"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-danger w-100 rounded-4 py-3 fw-bold" disabled={loading}>
            {loading ? "Đang xác thực..." : "Đăng nhập admin"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-decoration-none">Quay ve trang nguoi dung</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
