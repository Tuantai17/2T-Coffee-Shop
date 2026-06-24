import React from "react";

function AuthBenefitBar() {
  return (
    <div className="auth-benefit-bar mt-4">
      <div className="container py-3">
        <div className="row text-center g-3">
          <div className="col-6 col-md-3 d-flex flex-column align-items-center">
            <i className="fa-solid fa-shield-halved fs-3 mb-2 auth-benefit-icon"></i>
            <span className="auth-benefit-item small">100% hàng chính hãng</span>
          </div>
          <div className="col-6 col-md-3 d-flex flex-column align-items-center">
            <i className="fa-solid fa-arrows-rotate fs-3 mb-2 auth-benefit-icon"></i>
            <span className="auth-benefit-item small">Đổi trả dễ dàng</span>
          </div>
          <div className="col-6 col-md-3 d-flex flex-column align-items-center">
            <i className="fa-solid fa-lock fs-3 mb-2 auth-benefit-icon"></i>
            <span className="auth-benefit-item small">Thanh toán an toàn</span>
          </div>
          <div className="col-6 col-md-3 d-flex flex-column align-items-center">
            <i className="fa-solid fa-headset fs-3 mb-2 auth-benefit-icon"></i>
            <span className="auth-benefit-item small">Tư vấn tận tâm</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthBenefitBar;
