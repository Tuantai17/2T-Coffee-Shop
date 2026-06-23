import React, { useState, useEffect } from "react";
import { getOrdersByUser } from "../../../services/orderService";

const getRoleBadge = (roleName) => {
  switch (roleName) {
    case "ROLE_ADMIN":
      return <span className="badge bg-primary text-white"><i className="fa-solid fa-shield-halved me-1"></i> Quản trị viên</span>;
    case "ROLE_STAFF":
      return <span className="badge text-white" style={{ backgroundColor: "var(--admin-purple)" }}><i className="fa-solid fa-user-tie me-1"></i> Nhân viên</span>;
    case "ROLE_USER":
    default:
      return <span className="badge bg-secondary text-white"><i className="fa-regular fa-user me-1"></i> Khách hàng</span>;
  }
};

const getStatusBadge = (active) => {
  if (active === 1) {
    return <span className="badge bg-success bg-opacity-10 text-success border border-success">Hoạt động</span>;
  } else {
    return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">Bị khóa</span>;
  }
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getRandomColor = (name) => {
  const colors = ["#ef5350", "#ec407a", "#ab47bc", "#7e57c2", "#5c6bc0", "#42a5f5", "#29b6f6", "#26c6da", "#26a69a", "#66bb6a", "#9ccc65", "#d4e157", "#ffee58", "#ffca28", "#ffa726", "#ff7043", "#8d6e63"];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function UserDetailDrawer({ show, user, onClose, onToggleLock, onRoleChange, currentUser }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (show && user && activeTab === "orders") {
      fetchOrders();
    }
  }, [show, user, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await getOrdersByUser(user.id);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!show || !user) return null;

  const fullName = user.userDetails ? `${user.userDetails.firstName} ${user.userDetails.lastName}` : "Chưa cập nhật";
  const isCurrentUser = currentUser?.userName === user.userName;

  const handleToggleLock = () => {
    onToggleLock([user.id], user.active === 1 ? 0 : 1);
  };

  const handleRoleChange = (e) => {
    onRoleChange(user, e.target.value);
  };

  const formatMoney = (val) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={onClose} style={{ zIndex: 1040 }}></div>
      <div className="offcanvas offcanvas-end show shadow-lg border-0" style={{ width: "100%", maxWidth: "800px", zIndex: 1050, backgroundColor: "var(--admin-bg)" }} tabIndex="-1">
        
        {/* Header */}
        <div className="offcanvas-header bg-white border-bottom px-4 py-3 shadow-sm z-1">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{ width: "50px", height: "50px", backgroundColor: getRandomColor(fullName), fontSize: "20px" }}
            >
              {getInitials(fullName)}
            </div>
            <div>
              <h5 className="offcanvas-title fw-bold text-dark mb-1">
                {fullName} 
                {isCurrentUser && <span className="badge bg-secondary ms-2" style={{ fontSize: "11px", verticalAlign: "middle" }}>Tài khoản của bạn</span>}
              </h5>
              <div className="d-flex align-items-center gap-2 small text-muted">
                <span>@{user.userName}</span>
                <span className="mx-1">•</span>
                <span>{getStatusBadge(user.active)}</span>
                <span className="mx-1">•</span>
                <span>{getRoleBadge(user.role?.roleName)}</span>
              </div>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        
        {/* Nav Tabs */}
        <div className="bg-white px-4 pt-3 border-bottom shadow-sm z-1 position-relative">
          <ul className="nav nav-tabs border-0" style={{ marginBottom: "-1px" }}>
            <li className="nav-item">
              <button className={`nav-link fw-semibold border-0 ${activeTab === "overview" ? "active text-primary border-bottom border-2 border-primary" : "text-muted"}`} onClick={() => setActiveTab("overview")}>
                Tổng quan & Hồ sơ
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link fw-semibold border-0 ${activeTab === "orders" ? "active text-primary border-bottom border-2 border-primary" : "text-muted"}`} onClick={() => setActiveTab("orders")}>
                Lịch sử Đơn hàng
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link fw-semibold border-0 ${activeTab === "security" ? "active text-primary border-bottom border-2 border-primary" : "text-muted"}`} onClick={() => setActiveTab("security")}>
                Phân quyền & Bảo mật
              </button>
            </li>
          </ul>
        </div>

        {/* Body */}
        <div className="offcanvas-body p-4" style={{ overflowY: "auto" }}>
          
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="row g-4">
              <div className="col-12">
                <div className="neu-card p-4">
                  <h6 className="fw-bold mb-4 border-bottom pb-2"><i className="fa-regular fa-address-card me-2 text-primary"></i> Thông tin cá nhân</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="text-muted small mb-1">ID Hệ thống</div>
                      <div className="fw-semibold">#{user.id}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small mb-1">Tên đăng nhập</div>
                      <div className="fw-semibold">@{user.userName}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small mb-1">Họ và Tên</div>
                      <div className="fw-semibold">{fullName}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small mb-1">Email</div>
                      <div className="fw-semibold">{user.userDetails?.email || "Chưa có"}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small mb-1">Số điện thoại</div>
                      <div className="fw-semibold">{user.userDetails?.phoneNumber || "Chưa có"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === "orders" && (
            <div className="neu-card overflow-hidden">
              <div className="bg-light px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0"><i className="fa-solid fa-box-open me-2 text-primary"></i> Đơn hàng đã đặt ({orders.length})</h6>
              </div>
              <div className="table-responsive" style={{ maxHeight: "400px" }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th className="px-4 py-2 small text-muted">Mã ĐH</th>
                      <th className="py-2 small text-muted">Ngày đặt</th>
                      <th className="py-2 small text-muted text-end">Tổng tiền</th>
                      <th className="py-2 px-4 small text-muted text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingOrders ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm text-primary"></div>
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">Khách hàng chưa có đơn hàng nào.</td>
                      </tr>
                    ) : (
                      orders.map(o => (
                        <tr key={o.id}>
                          <td className="px-4 py-3 fw-semibold">#MKD-{String(o.id).padStart(6, '0')}</td>
                          <td className="py-3">{new Date(Array.isArray(o.orderedDate) ? new Date(o.orderedDate[0], o.orderedDate[1]-1, o.orderedDate[2]) : o.orderedDate).toLocaleDateString('vi-VN')}</td>
                          <td className="py-3 text-end fw-bold text-dark">{formatMoney(o.total)}</td>
                          <td className="py-3 px-4 text-center">
                            {o.status === "COMPLETED" ? <span className="badge bg-success">Hoàn thành</span> : 
                             o.status === "CANCELLED" ? <span className="badge bg-danger">Đã hủy</span> : 
                             <span className="badge bg-info">{o.status}</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {orders.length > 0 && (
                <div className="bg-light p-3 border-top text-end">
                  <span className="text-muted me-2">Tổng chi tiêu:</span>
                  <span className="fw-bold text-success fs-5">
                    {formatMoney(orders.filter(o => o.status === "COMPLETED").reduce((sum, o) => sum + (o.total || 0), 0))}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB: SECURITY & ROLE */}
          {activeTab === "security" && (
            <div className="row g-4">
              <div className="col-12">
                <div className="neu-card p-4 border border-danger-subtle bg-danger bg-opacity-10">
                  <h6 className="fw-bold mb-3 text-danger"><i className="fa-solid fa-lock me-2"></i> Trạng thái tài khoản</h6>
                  <p className="small text-dark mb-3">Tài khoản bị khóa sẽ không thể đăng nhập vào hệ thống hoặc ứng dụng.</p>
                  <div className="d-flex align-items-center justify-content-between bg-white p-3 rounded shadow-sm border">
                    <div>
                      <div className="fw-bold">{user.active === 1 ? "Tài khoản đang hoạt động bình thường" : "Tài khoản hiện đang bị vô hiệu hóa"}</div>
                    </div>
                    <button 
                      className={`btn ${user.active === 1 ? "btn-outline-danger" : "btn-success"} fw-bold px-4`}
                      disabled={isCurrentUser}
                      onClick={handleToggleLock}
                    >
                      {user.active === 1 ? "Khóa tài khoản" : "Mở khóa"}
                    </button>
                  </div>
                  {isCurrentUser && <div className="text-danger small mt-2">* Bạn không thể tự khóa tài khoản của chính mình.</div>}
                </div>
              </div>

              <div className="col-12">
                <div className="neu-card p-4">
                  <h6 className="fw-bold mb-3"><i className="fa-solid fa-user-shield me-2 text-primary"></i> Vai trò & Phân quyền</h6>
                  <p className="small text-muted mb-3">Lưu ý: Thay đổi quyền sẽ ảnh hưởng trực tiếp đến khả năng truy cập của tài khoản vào khu vực Admin. Cần cẩn trọng khi nâng cấp quyền cho khách hàng.</p>
                  
                  <div className="bg-light p-3 rounded border">
                    <label className="form-label fw-semibold small">Vai trò hiện tại</label>
                    <select 
                      className="form-select form-select-lg fw-bold text-primary shadow-sm"
                      value={user.role?.roleName || "ROLE_USER"}
                      onChange={handleRoleChange}
                      disabled={isCurrentUser || user.userName === "admin"} // disable changing self or super admin
                    >
                      <option value="ROLE_ADMIN">Quản trị viên (Full Access)</option>
                      <option value="ROLE_STAFF">Nhân viên (Limited Access)</option>
                      <option value="ROLE_USER">Khách hàng (No Admin Access)</option>
                    </select>
                    {(isCurrentUser || user.userName === "admin") && (
                      <div className="text-muted small mt-2">
                        <i className="fa-solid fa-circle-info me-1"></i> Không thể thay đổi vai trò của tài khoản này vì lý do bảo mật.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserDetailDrawer;
