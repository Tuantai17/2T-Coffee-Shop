import { Navigate } from "react-router-dom";
import { AUTH_SCOPES, getAuthSession } from "../utils/authStorage";

function ProtectedRoute({ children, adminOnly = false }) {
  const scope = adminOnly ? AUTH_SCOPES.ADMIN : AUTH_SCOPES.USER;
  const { token, role } = getAuthSession(scope);

  if (!token) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
  }

  if (adminOnly && role !== "ROLE_ADMIN" && role !== "ROLE_STAFF") {
    alert("Bạn không có quyền truy cập trang quản trị!");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
