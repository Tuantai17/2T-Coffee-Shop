import { useEffect, useState } from "react";
import { getUsers, updateUser } from "../../services/authService";
import AdminLayout from "../../layouts/AdminLayout";

function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newActive = user.active === 1 ? 0 : 1;
    const actionName = newActive === 1 ? "mở khóa" : "khóa";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản này?`)) return;

    try {
      await updateUser(user.id, {
        ...user,
        active: newActive,
      });
      alert(`Đã ${newActive === 1 ? "mở khóa" : "khóa"} tài khoản thành công!`);
      loadUsers();
    } catch (error) {
      console.error(error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const handleRoleChange = async (user, newRoleName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thay đổi vai trò của tài khoản này sang ${newRoleName === 'ROLE_ADMIN' ? 'Quản trị viên' : newRoleName === 'ROLE_STAFF' ? 'Nhân viên' : 'Khách hàng'}?`)) {
      loadUsers(); // Reset dropdown về vai trò cũ
      return;
    }

    try {
      await updateUser(user.id, {
        ...user,
        role: {
          roleName: newRoleName,
        },
      });
      alert(`Đã chuyển vai trò tài khoản sang ${newRoleName} thành công!`);
      loadUsers();
    } catch (error) {
      console.error(error);
      alert("Cập nhật vai trò thất bại!");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="container mt-4 mb-5">
        <h2 className="fw-bold mb-4">Quản Lý Người Dùng & Phân Quyền</h2>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center my-4 py-4 text-muted">Chưa có người dùng nào đăng ký trên hệ thống.</div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3" style={{ width: "80px" }}>ID</th>
                  <th className="py-3">Tên đăng nhập</th>
                  <th className="py-3">Họ và Tên</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Số điện thoại</th>
                  <th className="py-3" style={{ width: "180px" }}>Vai trò</th>
                  <th className="py-3" style={{ width: "150px" }}>Trạng thái</th>
                  <th className="py-3 text-center" style={{ width: "150px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const fullName = u.userDetails
                    ? `${u.userDetails.firstName} ${u.userDetails.lastName}`
                    : "Chưa cập nhật";
                  const email = u.userDetails ? u.userDetails.email : "N/A";
                  const phone = u.userDetails ? (u.userDetails.phoneNumber || "N/A") : "N/A";
                  const roleName = u.role ? u.role.roleName : "ROLE_USER";

                  return (
                    <tr key={u.id}>
                      <td className="px-4 py-3 fw-bold">#{u.id}</td>
                      <td className="py-3 fw-semibold">{u.userName}</td>
                      <td className="py-3">{fullName}</td>
                      <td className="py-3 text-muted">{email}</td>
                      <td className="py-3">{phone}</td>
                      <td className="py-3">
                        <select
                          className="form-select form-select-sm rounded-3 fw-semibold border-secondary-subtle"
                          style={{ width: "140px" }}
                          value={roleName}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                        >
                          <option value="ROLE_USER">Khách hàng</option>
                          <option value="ROLE_STAFF">Nhân viên</option>
                          <option value="ROLE_ADMIN">Quản trị viên</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <span className={`badge ${u.active === 1 ? 'bg-success' : 'bg-danger'} px-3 py-1.5 rounded-pill`}>
                          {u.active === 1 ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          className={`btn btn-sm rounded-3 px-3 fw-bold ${
                            u.active === 1 ? "btn-outline-danger" : "btn-success text-white"
                          }`}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.active === 1 ? (
                            <>
                              <i className="fa-solid fa-lock me-1"></i> Khóa
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-lock-open me-1"></i> Mở
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminUserPage;
