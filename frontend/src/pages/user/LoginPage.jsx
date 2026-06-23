import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import {
  AUTH_SCOPES,
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "../../utils/authStorage";

function LoginPage() {
  const navigate = useNavigate();
  const existingUserSession = getAuthSession(AUTH_SCOPES.USER);
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
        email: username || form.username,
      });

      alert("Dang nhap thanh cong!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Dang nhap that bai. Vui long kiem tra lai tai khoan va mat khau!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow-sm border-0 rounded-5 p-4 bg-white text-left">
        <div className="text-center mb-4">
          <h2 className="fw-extrabold text-danger mb-1" style={{ letterSpacing: "-1px" }}>MYKINGDOM LOGIN</h2>
          <p className="text-muted">Dang nhap tai khoan phu huynh de mua sam do choi cho be</p>
          {existingUserSession.token && (
            <p className="small text-success mb-0">Phien nguoi dung hien tai: {existingUserSession.email}</p>
          )}
        </div>

        {error && <div className="alert alert-danger rounded-3" role="alert">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-bold text-dark">Ten dang nhap hoac Email</label>
            <input
              name="username"
              type="text"
              className="form-control form-toy-control rounded-3"
              placeholder="Nhap ten dang nhap hoac email cua ban"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold text-dark">Mat khau</label>
            <input
              name="password"
              type="password"
              className="form-control form-toy-control rounded-3"
              placeholder="........"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-toy-primary w-100 py-3 rounded-pill fw-bold text-white mb-3"
            disabled={loading}
          >
            {loading ? "Dang xac thuc..." : "DANG NHAP NGAY"}
          </button>
        </form>

        <div className="text-center">
          <p className="mb-0 text-muted">
            Chua co tai khoan phu huynh? <Link to="/register" className="text-danger fw-bold text-decoration-none">Dang ky thanh vien</Link>
          </p>
          <p className="mt-2 mb-0">
            <Link to="/admin/login" className="text-decoration-none fw-semibold">Loi vao danh cho admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
