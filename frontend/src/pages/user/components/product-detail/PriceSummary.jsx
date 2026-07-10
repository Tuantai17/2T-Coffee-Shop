import React from 'react';
import { formatPrice } from '../../../../utils/formatPrice';

function PriceSummary({ 
  basePrice, 
  quantity, 
  sizePrice = 0, 
  toppingsPrice = 0,
  loyaltyPoints = 0
}) {
  const subtotal = basePrice + sizePrice + toppingsPrice;
  const total = subtotal * quantity;

  return (
    <div className="mb-4 bg-light rounded-4 p-4 border border-light shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
        <h6 className="fw-bold mb-0">Tổng tiền</h6>
        <button className="btn btn-link p-0 text-muted shadow-none">
          <i className="fa-solid fa-chevron-up"></i>
        </button>
      </div>

      <div className="d-flex justify-content-between mb-2 small text-muted">
        <span>Sản phẩm cơ bản</span>
        <span>{formatPrice(basePrice)}</span>
      </div>
      
      {sizePrice > 0 && (
        <div className="d-flex justify-content-between mb-2 small text-muted">
          <span>Kích cỡ (+Size)</span>
          <span>{formatPrice(sizePrice)}</span>
        </div>
      )}

      {toppingsPrice > 0 && (
        <div className="d-flex justify-content-between mb-2 small text-muted">
          <span>Topping thêm</span>
          <span>{formatPrice(toppingsPrice)}</span>
        </div>
      )}

      <div className="d-flex justify-content-between mb-3 small text-muted border-bottom pb-3">
        <span>Số lượng</span>
        <span>x{quantity}</span>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="fw-bold fs-5">Tạm tính</span>
        <span className="text-danger fw-bold fs-4">{formatPrice(total)}</span>
      </div>

      {loyaltyPoints > 0 && (
        <div className="text-end small">
          <span className="text-muted">Bạn sẽ được cộng </span>
          <span className="fw-bold text-success">{loyaltyPoints} điểm</span>
          <span className="text-muted"> cho đơn hàng này</span>
        </div>
      )}
    </div>
  );
}

export default PriceSummary;
