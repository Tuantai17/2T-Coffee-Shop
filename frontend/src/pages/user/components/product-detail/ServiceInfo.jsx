import React from 'react';

function ServiceInfo() {
  return (
    <div className="d-flex flex-wrap gap-4 justify-content-around w-100 align-items-center">
      <div className="d-flex align-items-center gap-2 small text-muted">
        <i className="fa-solid fa-motorcycle text-danger fs-5"></i>
        <div>
          <div className="fw-bold text-dark" style={{ fontSize: "0.8rem" }}>Giao hàng nhanh</div>
          <div style={{ fontSize: "0.75rem" }}>30-45 phút</div>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2 small text-muted">
        <i className="fa-solid fa-store text-danger fs-5"></i>
        <div>
          <div className="fw-bold text-dark" style={{ fontSize: "0.8rem" }}>Nhận tại cửa hàng</div>
          <div style={{ fontSize: "0.75rem" }}>5-10 phút</div>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2 small text-muted">
        <i className="fa-solid fa-gem text-success fs-5"></i>
        <div>
          <div className="fw-bold text-dark" style={{ fontSize: "0.8rem" }}>Tích điểm Loyalty</div>
          <div style={{ fontSize: "0.75rem" }}>Cho mọi đơn hàng</div>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2 small text-muted">
        <i className="fa-solid fa-ticket text-warning fs-5"></i>
        <div>
          <div className="fw-bold text-dark" style={{ fontSize: "0.8rem" }}>Voucher áp dụng</div>
          <div style={{ fontSize: "0.75rem" }}>Nhiều ưu đãi hấp dẫn</div>
        </div>
      </div>
    </div>
  );
}

export default ServiceInfo;
