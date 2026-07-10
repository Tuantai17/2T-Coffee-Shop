import React from 'react';

function SecurityCard() {
  return (
    <div className="mt-3 px-2">
      <h6 className="small text-muted fw-bold mb-3 text-uppercase" style={{ fontSize: "10px", letterSpacing: "1px" }}>THANH TOÁN AN TOÀN</h6>
      <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
        <div className="d-flex align-items-center gap-1 text-muted small" style={{ fontSize: "11px" }}>
          <i className="fa-solid fa-lock text-success"></i> SSL Secure
        </div>
        <div className="d-flex align-items-center gap-1 text-muted small" style={{ fontSize: "11px" }}>
          <i className="fa-brands fa-cc-visa text-primary" style={{ fontSize: "14px" }}></i> 
          <i className="fa-brands fa-cc-mastercard text-danger" style={{ fontSize: "14px" }}></i>
        </div>
        <div className="d-flex align-items-center gap-1 text-muted small" style={{ fontSize: "11px" }}>
          <i className="fa-solid fa-shield-halved text-warning"></i> Bảo mật 100%
        </div>
      </div>
    </div>
  );
}

export default SecurityCard;
