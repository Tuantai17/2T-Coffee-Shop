import React, { useMemo } from "react";

function UserSummaryCards({ users, loading }) {
  const stats = useMemo(() => {
    let total = 0;
    let customers = 0;
    let staffsAndAdmins = 0;
    let locked = 0;

    if (users && users.length > 0) {
      total = users.length;
      users.forEach((u) => {
        if (u.role?.roleName === "ROLE_USER") {
          customers++;
        } else if (u.role?.roleName === "ROLE_ADMIN" || u.role?.roleName === "ROLE_STAFF") {
          staffsAndAdmins++;
        }
        
        if (u.active === 0) {
          locked++;
        }
      });
    }

    return { total, customers, staffsAndAdmins, locked };
  }, [users]);

  if (loading) {
    return (
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div className="col-12 col-md-6 col-xl-3" key={i}>
            <div className="neu-card p-3 placeholder-glow">
              <div className="d-flex align-items-center mb-2">
                <span className="placeholder rounded-circle" style={{ width: "32px", height: "32px" }}></span>
                <span className="placeholder rounded ms-2 col-6"></span>
              </div>
              <h3 className="placeholder rounded col-8 mb-2"></h3>
              <p className="placeholder rounded col-10 mb-0" style={{ height: "12px" }}></p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="row g-3 mb-4">
      {/* Total Users */}
      <div className="col-12 col-md-6 col-xl-3">
        <div className="neu-card p-4 h-100">
          <div className="d-flex align-items-center mb-2 text-primary">
            <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
              <i className="fa-solid fa-users fs-5"></i>
            </div>
            <span className="ms-3 fw-bold text-muted">Tổng người dùng</span>
          </div>
          <h2 className="fw-bold text-dark mt-3 mb-2">{stats.total.toLocaleString("vi-VN")}</h2>
          <div className="d-flex align-items-center small">
            <span className="text-muted" style={{ fontSize: "12px" }}>So với 30 ngày trước</span>
            <span className="text-success fw-bold ms-auto" style={{ fontSize: "12px" }}>
              <i className="fa-solid fa-arrow-up me-1"></i>12.6%
            </span>
          </div>
        </div>
      </div>

      {/* Customers */}
      <div className="col-12 col-md-6 col-xl-3">
        <div className="neu-card p-4 h-100">
          <div className="d-flex align-items-center mb-2 text-success">
            <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
              <i className="fa-regular fa-user fs-5"></i>
            </div>
            <span className="ms-3 fw-bold text-muted">Khách hàng</span>
          </div>
          <h2 className="fw-bold text-dark mt-3 mb-2">{stats.customers.toLocaleString("vi-VN")}</h2>
          <div className="d-flex align-items-center small">
            <span className="text-muted" style={{ fontSize: "12px" }}>So với 30 ngày trước</span>
            <span className="text-success fw-bold ms-auto" style={{ fontSize: "12px" }}>
              <i className="fa-solid fa-arrow-up me-1"></i>8.4%
            </span>
          </div>
        </div>
      </div>

      {/* Staffs & Admins */}
      <div className="col-12 col-md-6 col-xl-3">
        <div className="neu-card p-4 h-100">
          <div className="d-flex align-items-center mb-2" style={{ color: "var(--admin-purple)" }}>
            <div className="rounded-circle bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px", backgroundColor: "rgba(124, 58, 237, 0.1)" }}>
              <i className="fa-solid fa-user-tie fs-5"></i>
            </div>
            <span className="ms-3 fw-bold text-muted">Nhân viên & Quản trị</span>
          </div>
          <h2 className="fw-bold text-dark mt-3 mb-2">{stats.staffsAndAdmins.toLocaleString("vi-VN")}</h2>
          <div className="d-flex align-items-center small">
            <span className="text-muted" style={{ fontSize: "12px" }}>So với 30 ngày trước</span>
            <span className="text-success fw-bold ms-auto" style={{ fontSize: "12px" }}>
              <i className="fa-solid fa-arrow-up me-1"></i>9.7%
            </span>
          </div>
        </div>
      </div>

      {/* Locked Accounts */}
      <div className="col-12 col-md-6 col-xl-3">
        <div className="neu-card p-4 h-100">
          <div className="d-flex align-items-center mb-2 text-danger">
            <div className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
              <i className="fa-solid fa-lock fs-5"></i>
            </div>
            <span className="ms-3 fw-bold text-muted">Tài khoản bị khóa</span>
          </div>
          <h2 className="fw-bold text-dark mt-3 mb-2">{stats.locked.toLocaleString("vi-VN")}</h2>
          <div className="d-flex align-items-center small">
            <span className="text-muted" style={{ fontSize: "12px" }}>So với 30 ngày trước</span>
            <span className="text-danger fw-bold ms-auto" style={{ fontSize: "12px" }}>
              <i className="fa-solid fa-arrow-down me-1"></i>6.2%
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default UserSummaryCards;
