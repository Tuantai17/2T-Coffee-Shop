import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../../../utils/formatPrice';
import VoucherBox from './VoucherBox';
import LoyaltyPointBox from './LoyaltyPointBox';

function CartSummary({
  items = [],
  appliedVoucher,
  onApplyVoucherCode,
  onOpenVoucherModal,
  onRemoveVoucher,
  appliedPoints = 0,
  onApplyPoints,
  isCheckingOut = false,
  onCheckout,
}) {
  const navigate = useNavigate();

  const itemCount = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const subtotal = items.reduce((sum, it) => sum + (it.subTotal || it.unitPrice * it.quantity || 0), 0);

  // Mock discount calculations
  const productDiscount = 0;
  let voucherDiscount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percent') {
      voucherDiscount = Math.min(subtotal * appliedVoucher.discount / 100, 30000);
    } else if (appliedVoucher.type === 'fixed') {
      voucherDiscount = appliedVoucher.discount;
    }
  }
  const pointDiscount = appliedPoints * 10;
  const shippingFee = subtotal >= 100000 ? 0 : 20000;
  const total = Math.max(0, subtotal - productDiscount - voucherDiscount - pointDiscount + shippingFee);
  const loyaltyEarned = Math.floor(total / 1000);

  return (
    <div className="rounded-4 bg-white p-4" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f0ebe5", position: "sticky", top: "100px" }}>
      <h6 className="fw-bold mb-3 text-uppercase" style={{ color: "#2d2d2d", letterSpacing: "0.5px", fontSize: "15px" }}>
        <i className="fa-solid fa-receipt me-2" style={{ color: "#c67c4e" }}></i>Tóm tắt đơn hàng
      </h6>

      {/* Line items */}
      <div className="mb-3" style={{ fontSize: "14px" }}>
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Tạm tính ({itemCount} món)</span>
          <span className="fw-semibold">{formatPrice(subtotal)}</span>
        </div>
        {productDiscount > 0 && (
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Giảm giá sản phẩm</span>
            <span className="fw-semibold" style={{ color: "#22c55e" }}>-{formatPrice(productDiscount)}</span>
          </div>
        )}
        {voucherDiscount > 0 && (
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Voucher ({appliedVoucher.code})</span>
            <span className="fw-semibold" style={{ color: "#22c55e" }}>-{formatPrice(voucherDiscount)}</span>
          </div>
        )}
        {pointDiscount > 0 && (
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Điểm ({appliedPoints} điểm)</span>
            <span className="fw-semibold" style={{ color: "#22c55e" }}>-{formatPrice(pointDiscount)}</span>
          </div>
        )}
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted d-flex align-items-center gap-1">
            Phí giao hàng
            {shippingFee === 0 && <span className="badge bg-success rounded-pill" style={{ fontSize: "9px" }}>FREE</span>}
          </span>
          <span className="fw-semibold">{shippingFee > 0 ? formatPrice(shippingFee) : 'Miễn phí'}</span>
        </div>
      </div>

      <hr style={{ borderColor: "#f0ebe5" }} />

      {/* Voucher */}
      <VoucherBox
        appliedVoucher={appliedVoucher}
        onApplyCode={onApplyVoucherCode}
        onOpenModal={onOpenVoucherModal}
        onRemoveVoucher={onRemoveVoucher}
      />

      {/* Loyalty Points */}
      <LoyaltyPointBox onApplyPoints={onApplyPoints} />

      <hr style={{ borderColor: "#f0ebe5" }} />

      {/* Total */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="fw-bold" style={{ fontSize: "15px", color: "#2d2d2d" }}>Tổng cộng</span>
        <span className="fw-bold" style={{ fontSize: "15px" }}>{formatPrice(total)}</span>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="fw-bold text-uppercase" style={{ fontSize: "13px", letterSpacing: "0.5px", color: "#c67c4e" }}>TỔNG THANH TOÁN</span>
        <span className="fw-bold" style={{ fontSize: "1.5rem", color: "#c67c4e" }}>{formatPrice(total)}</span>
      </div>

      {/* Loyalty Earned */}
      <div className="d-flex align-items-center gap-2 mb-3 px-2 py-2 rounded-3" style={{ backgroundColor: "#fffbeb", fontSize: "12px" }}>
        <i className="fa-solid fa-coins" style={{ color: "#f59e0b" }}></i>
        <span>Bạn sẽ nhận được <strong style={{ color: "#c67c4e" }}>{loyaltyEarned} điểm</strong> Loyalty</span>
      </div>

      {/* Action Buttons */}
      <button
        className="btn w-100 rounded-pill fw-bold py-3 mb-2 text-white d-flex align-items-center justify-content-center gap-2"
        style={{
          backgroundColor: "var(--primary-color, #c67c4e)",
          border: "none",
          fontSize: "1rem",
          transition: "all 0.3s",
          boxShadow: "0 4px 15px rgba(198,124,78,0.3)"
        }}
        onClick={onCheckout}
        disabled={isCheckingOut || items.length === 0}
        onMouseEnter={(e) => { if (!e.target.disabled) { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 25px rgba(198,124,78,0.4)"; }}}
        onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 15px rgba(198,124,78,0.3)"; }}
      >
        {isCheckingOut ? (
          <span className="spinner-border spinner-border-sm"></span>
        ) : (
          <>Tiếp tục thanh toán <i className="fa-solid fa-arrow-right"></i></>
        )}
      </button>

      <button
        className="btn w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
        style={{ border: "1px solid #e8e0d8", color: "#888", fontSize: "14px", transition: "all 0.2s" }}
        onClick={() => navigate('/products')}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c67c4e"; e.currentTarget.style.color = "#c67c4e"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e8e0d8"; e.currentTarget.style.color = "#888"; }}
      >
        <i className="fa-solid fa-bolt" style={{ fontSize: "12px" }}></i>Tiếp tục mua hàng
      </button>

      {/* Trust badges */}
      <div className="d-flex justify-content-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid #f5f0eb", fontSize: "11px", color: "#aaa" }}>
        <div className="text-center">
          <i className="fa-solid fa-truck-fast d-block mb-1" style={{ fontSize: "16px", color: "#c67c4e" }}></i>
          Giao nhanh<br/>30-45 phút
        </div>
        <div className="text-center">
          <i className="fa-solid fa-coins d-block mb-1" style={{ fontSize: "16px", color: "#f59e0b" }}></i>
          Tích điểm<br/>với mỗi đơn
        </div>
        <div className="text-center">
          <i className="fa-solid fa-shield-halved d-block mb-1" style={{ fontSize: "16px", color: "#22c55e" }}></i>
          Thanh toán<br/>an toàn
        </div>
      </div>
    </div>
  );
}

export default CartSummary;
