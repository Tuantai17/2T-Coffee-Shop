import React from "react";

const getRoleBadge = (roleName) => {
  switch (roleName) {
    case "ROLE_ADMIN":
      return <span className="badge px-3 py-2 rounded-pill shadow-sm bg-primary text-white"><i className="fa-solid fa-shield-halved me-1"></i> Quản trị viên</span>;
    case "ROLE_STAFF":
      return <span className="badge px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: "var(--admin-purple)", color: "white" }}><i className="fa-solid fa-user-tie me-1"></i> Nhân viên</span>;
    case "ROLE_USER":
    default:
      return <span className="badge px-3 py-2 rounded-pill shadow-sm bg-secondary text-white"><i className="fa-regular fa-user me-1"></i> Khách hàng</span>;
  }
};

const getStatusBadge = (active) => {
  if (active === 1) {
    return <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2 rounded-pill">Hoạt động</span>;
  } else {
    return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2 rounded-pill">Bị khóa</span>;
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

function UserList({
  users,
  loading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onViewDetail,
  onToggleLock,
  onExportSingle,
  currentUser
}) {
  const isAllSelected = users.length > 0 && users.every((u) => selectedIds.includes(u.id));
  const isIndeterminate = !isAllSelected && users.some((u) => selectedIds.includes(u.id));

  return (
    <div className="neu-card overflow-hidden mb-4">
      {/* Bulk Actions Header */}
      {selectedIds.length > 0 && (
        <div className="bg-light px-4 py-3 d-flex align-items-center justify-content-between border-bottom">
          <div className="fw-bold text-primary">
            <i className="fa-regular fa-square-check me-2"></i>
            Đã chọn {selectedIds.length} người dùng
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold" onClick={() => onToggleLock(selectedIds, 0)}>
              <i className="fa-solid fa-lock me-1"></i> Khóa tài khoản
            </button>
            <button className="btn btn-sm btn-outline-success rounded-pill px-3 fw-semibold" onClick={() => onToggleLock(selectedIds, 1)}>
              <i className="fa-solid fa-lock-open me-1"></i> Mở khóa
            </button>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ minWidth: "1000px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface)", borderBottom: "2px solid rgba(0,0,0,0.05)" }}>
              <th className="px-4 py-3" style={{ width: "40px" }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  style={{ cursor: "pointer" }}
                  checked={isAllSelected}
                  ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
                  onChange={(e) => onSelectAll(e.target.checked, users)}
                />
              </th>
              <th className="py-3 text-muted small fw-bold">Người dùng</th>
              <th className="py-3 text-muted small fw-bold">Liên hệ</th>
              <th className="py-3 text-muted small fw-bold text-center">Vai trò</th>
              <th className="py-3 text-muted small fw-bold text-center">Trạng thái</th>
              <th className="py-3 text-muted small fw-bold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan="6" className="px-4 py-3">
                    <div className="placeholder-glow d-flex gap-3 align-items-center">
                      <span className="placeholder rounded-circle" style={{ width: "40px", height: "40px" }}></span>
                      <span className="placeholder rounded col-3"></span>
                      <span className="placeholder rounded col-4"></span>
                    </div>
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  <i className="fa-solid fa-users-slash fs-1 mb-3"></i>
                  <p className="mb-0">Không tìm thấy người dùng nào.</p>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const fullName = user.userDetails ? `${user.userDetails.firstName} ${user.userDetails.lastName}` : "Chưa cập nhật";
                const isCurrentUser = currentUser?.userName === user.userName;

                return (
                  <tr key={user.id} style={{ borderBottom: "1px dashed rgba(0,0,0,0.05)" }}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        style={{ cursor: "pointer" }}
                        checked={selectedIds.includes(user.id)}
                        onChange={(e) => onSelectOne(user.id, e.target.checked)}
                        disabled={isCurrentUser || user.role?.roleName === "ROLE_ADMIN"} // Cannot select admin for bulk lock usually, but allow it if handled in bulk logic. For safety, disable self.
                      />
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-3">
                        {user.userDetails?.avatarUrl ? (
                          <img 
                            src={user.userDetails.avatarUrl} 
                            alt="Avatar" 
                            className="rounded-circle shadow-sm" 
                            style={{ width: "40px", height: "40px", objectFit: "cover", border: "2px solid white" }}
                          />
                        ) : (
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                            style={{ width: "40px", height: "40px", backgroundColor: getRandomColor(fullName) }}
                          >
                            {getInitials(fullName)}
                          </div>
                        )}
                        <div>
                          <div className="fw-bold text-dark d-flex align-items-center gap-2">
                            {fullName} 
                            {isCurrentUser && <span className="badge bg-secondary" style={{ fontSize: "10px" }}>Bạn</span>}
                          </div>
                          <div className="small text-muted">@{user.userName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="small mb-1"><i className="fa-regular fa-envelope text-muted me-2"></i>{user.userDetails?.email || "Chưa có"}</div>
                      <div className="small"><i className="fa-solid fa-phone text-muted me-2"></i>{user.userDetails?.phoneNumber || "Chưa có"}</div>
                    </td>
                    <td className="py-3 text-center">
                      {getRoleBadge(user.role?.roleName)}
                    </td>
                    <td className="py-3 text-center">
                      {getStatusBadge(user.active)}
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-sm btn-light text-secondary rounded-circle shadow-sm" style={{ width: "32px", height: "32px" }} title="Xem chi tiết" onClick={() => onViewDetail(user)}>
                          <i className="fa-regular fa-eye"></i>
                        </button>
                        <div className="dropdown">
                          <button className="btn btn-sm btn-light text-secondary rounded-circle shadow-sm" style={{ width: "32px", height: "32px" }} data-bs-toggle="dropdown">
                            <i className="fa-solid fa-ellipsis"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow-sm rounded-3">
                            <li><button className="dropdown-item small fw-semibold" onClick={() => onViewDetail(user)}><i className="fa-regular fa-address-card w-20px me-2 text-primary"></i> Xem hồ sơ</button></li>
                            {!isCurrentUser && (
                              <>
                                <li><hr className="dropdown-divider" /></li>
                                {user.active === 1 ? (
                                  <li><button className="dropdown-item small text-danger fw-semibold" onClick={() => onToggleLock([user.id], 0)}><i className="fa-solid fa-lock w-20px me-2 text-danger"></i> Khóa tài khoản</button></li>
                                ) : (
                                  <li><button className="dropdown-item small text-success fw-semibold" onClick={() => onToggleLock([user.id], 1)}><i className="fa-solid fa-lock-open w-20px me-2 text-success"></i> Mở khóa</button></li>
                                )}
                              </>
                            )}
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item small text-success fw-semibold" onClick={() => onExportSingle(user)}><i className="fa-solid fa-file-excel w-20px me-2 text-success"></i> Xuất dữ liệu Excel</button></li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserList;
