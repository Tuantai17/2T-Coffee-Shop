import React, { useMemo } from "react";

function OrderSummaryCards({ statistics, loading }) {
  const stats = useMemo(() => {
    if (statistics) {
      return {
        total: statistics.totalOrders || 0,
        pending: statistics.pendingConfirmation || 0,
        shipping: statistics.shipping || 0,
        completed: statistics.completed || 0,
        cancelled: statistics.cancelled || 0,
        revenue: statistics.totalRevenue || 0
      };
    }
    return { total: 0, pending: 0, shipping: 0, completed: 0, cancelled: 0, revenue: 0 };
  }, [statistics]);

  const formatMoney = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  if (loading) {
    return (
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div className="col-6 col-md-4 col-xl-2" key={i}>
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
      {/* Total Orders */}
      <div className="col-6 col-md-4 col-xl-2">
        <div className="neu-card p-3 h-100">
          <div className="d-flex align-items-center mb-2 text-primary">
            <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
              <i className="fa-solid fa-shield"></i>
            </div>
            <span className="ms-2 fw-semibold small text-muted">Tổng đơn hàng</span>
          </div>
          <h3 className="fw-bold text-dark mb-2">{stats.total.toLocaleString("vi-VN")}</h3>
          <div className="d-flex align-items-center small">
            <span className="text-muted" style={{ fontSize: "11px" }}>So với 7 ngày trước</span>
            <span className="text-success fw-bold ms-auto" style={{ fontSize: "11px" }}>
              <i className="fa-solid fa-arrow-up me-1"></i>0.0%
            </span>
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="col-6 col-md-4 col-xl-2">
        <div className="neu-card p-3 h-100">
          <div className="d-flex align-items-center mb-2 text-warning">
            <div className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
              <i className="fa-regular fa-clock"></i>
            </div>
            <span className="ms-2 fw-semibold small text-muted">Chờ xác nhận</span>
          </div>
          <h3 className="fw-bold text-dark mb-2">{stats.pending.toLocaleString("vi-VN")}</h3>
          <div className="d-flex align-items-center small">
            <span className="text-muted" style={{ fontSize: "11px" }}>So với 7 ngày trước</span>
            <span className="text-success fw-bold ms-auto" style={{ fontSize: "11px" }}>
              <i className="fa-solid fa-arrow-up me-1"></i>0.0%
            </span>
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="col-6 col-md-4 col-xl-2">
        <div className="neu-card p-3 h-100">
          <div className="d-flex align-items-center mb-2" style={{ color: "var(--admin-purple)" }}>
            <div className="rounded-circle bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px", backgroundColor: "rgba(124, 58, 237, 0.1)" }}>
              <i className="fa-solid fa-truck-fast"></i>
            </div>
            <span className="ms-2 fw-semibold small text-muted">Đang giao</span>
          </div>
          <h3 className="fw-bold text-dark mb-2">{stats.shipping.toLocaleString("vi-VN")}</h3>
          <div className="d-flex align-items-center small">
            <span className="text-muted" style={{ fontSize: "11px" }}>So với 7 ngày trước</span>
            <span className="text-success fw-bold ms-auto" style={{ fontSize: "11px" }}>
              <i className="fa-solid fa-arrow-up me-1"></i>0.0%
            </span>
          </div>
        </div>
      </div>

      {/* Completed */}
      <div className="col-6 col-md-4 col-xl-2">
        <div className="neu-card p-3 h-100">
          <div className="d-flex align-items-center mb-2 text-success">
            <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
              <i className="fa-solid fa-check"></i>
            </div>
            <span className="ms-2 fw-semibold small text-muted">Hoàn thành</span>
          </div>
          <h3 className="fw-bold text-dark mb-2">{stats.completed.toLocaleString("vi-VN")}</h3>
          <div className="d-flex align-items-center small">
            <span className="text-muted" style={{ fontSize: "11px" }}>So với 7 ngày trước</span>
            <span className="text-success fw-bold ms-auto" style={{ fontSize: "11px" }}>
              <i className="fa-solid fa-arrow-up me-1"></i>0.0%
            </span>
          </div>
        </div>
      </div>

      {/* Cancelled */}
      <div className="col-6 col-md-4 col-xl-2">
        <div className="neu-card p-3 h-100">
          <div className="d-flex align-items-center mb-2 text-danger">
            <div className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
              <i className="fa-regular fa-circle-xmark"></i>
            </div>
            <span className="ms-2 fw-semibold small text-muted">Đã hủy</span>
          </div>
          <h3 className="fw-bold text-dark mb-2">{stats.cancelled.toLocaleString("vi-VN")}</h3>
          <div className="d-flex align-items-center small">
            <span className="text-muted" style={{ fontSize: "11px" }}>So với 7 ngày trước</span>
            <span className="text-danger fw-bold ms-auto" style={{ fontSize: "11px" }}>
              <i className="fa-solid fa-arrow-down me-1"></i>0.0%
            </span>
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="col-6 col-md-4 col-xl-2">
        <div className="neu-card p-3 h-100">
          <div className="d-flex align-items-center mb-2 text-success">
            <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
              <i className="fa-solid fa-money-bill-wave"></i>
            </div>
            <span className="ms-2 fw-semibold small text-muted">Doanh thu</span>
          </div>
          <h4 className="fw-bold text-dark mb-2 text-truncate" title={formatMoney(stats.revenue)}>
            {formatMoney(stats.revenue)}
          </h4>
          <div className="d-flex align-items-center small">
            <span className="text-muted" style={{ fontSize: "11px" }}>So với 7 ngày trước</span>
            <span className="text-success fw-bold ms-auto" style={{ fontSize: "11px" }}>
              <i className="fa-solid fa-arrow-up me-1"></i>0.0%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSummaryCards;
