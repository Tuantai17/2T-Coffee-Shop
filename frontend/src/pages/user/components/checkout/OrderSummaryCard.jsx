import React from 'react';
import { formatPrice } from '../../../../utils/formatPrice';
import { resolveImageUrl, applyImageFallback, DEFAULT_IMAGE_FALLBACK } from '../../../../utils/imageFallback';
import { Link } from 'react-router-dom';
import VoucherBox from '../cart/VoucherBox';
import LoyaltyPointBox from '../cart/LoyaltyPointBox';

function OrderSummaryCard({ 
  cart, 
  subTotal, 
  shippingFee, 
  discount, 
  pointDiscount, 
  grandTotal, 
  loadingSubmit, 
  onSubmit, 
  loyaltyPointsEarned,
  appliedVoucher,
  onApplyVoucherCode,
  onOpenVoucherModal,
  onRemoveVoucher,
  totalPoints = 0,
  onApplyPoints
}) {
  return (
    <div className="card shadow-sm border-0 rounded-4 p-0 bg-white sticky-top mb-4" style={{ top: "80px", zIndex: 1, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <div className="p-4 border-bottom">
        <h5 className="fw-bold text-dark text-uppercase mb-0">TÓM TẮT ĐƠN HÀNG</h5>
      </div>
      
      <div className="p-4 bg-light border-bottom overflow-auto" style={{ maxHeight: "300px" }}>
        {cart.length === 0 ? (
          <div className="text-center text-muted py-4">Giỏ hàng trống</div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {cart.map((item) => {
              const product = item.product || {};
              const imageUrl = item.productImageUrl || product.imageUrl;
              const cartItemKey = item.cartItemId || item.id || `${item.productId || product.id}-${item.variantId || "no-variant"}-${item.optionsSnapshot || ""}-${item.toppingsSnapshot || ""}`;
              return (
                <div key={cartItemKey} className="d-flex gap-3 align-items-start">
                  <div className="rounded-3 overflow-hidden border bg-white flex-shrink-0" style={{ width: "60px", height: "60px" }}>
                    <img 
                      src={resolveImageUrl(imageUrl, DEFAULT_IMAGE_FALLBACK)} 
                      alt={product.productName || item.productName} 
                      className="w-100 h-100 object-fit-cover" 
                      onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <div className="fw-bold text-dark small pe-2" style={{ lineHeight: "1.2" }}>{item.productName || product.productName}</div>
                      <div className="fw-medium text-dark small text-end" style={{ whiteSpace: "nowrap" }}>x{item.quantity}</div>
                    </div>
                    <div className="text-muted" style={{ fontSize: "11px", marginTop: "2px" }}>
                      {item.variantName && `Size ${item.variantName}`}
                      {item.optionsSnapshot && ` · ${item.optionsSnapshot.replace(/, /g, ' · ')}`}
                    </div>
                    {item.toppingsSnapshot && (
                      <div className="text-muted mt-1" style={{ fontSize: "11px" }}>
                        Topping: <span className="text-dark">{item.toppingsSnapshot}</span>
                      </div>
                    )}
                  </div>
                  <div className="fw-bold text-dark small text-end flex-shrink-0">
                    {formatPrice(item.subTotal || ((product.price || 0) * item.quantity))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="d-flex justify-content-between mb-2 small">
          <span className="text-muted">Tạm tính ({cart.length} món)</span>
          <span className="fw-medium text-dark">{formatPrice(subTotal)}</span>
        </div>
        
        {discount > 0 && (
          <div className="d-flex justify-content-between mb-2 small text-danger">
            <span>Giảm giá Voucher ({appliedVoucher?.voucherCode || appliedVoucher?.code})</span>
            <span className="fw-medium">-{formatPrice(discount)}</span>
          </div>
        )}
        
        {pointDiscount > 0 && (
          <div className="d-flex justify-content-between mb-2 small text-success">
            <span>Sử dụng điểm Loyalty</span>
            <span className="fw-medium">-{formatPrice(pointDiscount)}</span>
          </div>
        )}

        <hr style={{ borderColor: "#f0ebe5" }} />

        {/* Voucher */}
        <VoucherBox
          appliedVoucher={appliedVoucher}
          onApplyCode={onApplyVoucherCode}
          onOpenModal={onOpenVoucherModal}
          onRemoveVoucher={onRemoveVoucher}
        />

        {/* Loyalty Points */}
        <LoyaltyPointBox totalPoints={totalPoints} onApplyPoints={onApplyPoints} />

        <hr style={{ borderColor: "#f0ebe5" }} />

        <div className="d-flex justify-content-between mb-3 small pb-3 border-bottom">
          <span className="text-muted flex-grow-1">Phí giao hàng</span>
          {shippingFee > 0 ? (
            <span className="fw-medium text-dark">{formatPrice(shippingFee)}</span>
          ) : (
            <span className="fw-bold text-success bg-success-subtle px-2 py-1 rounded-pill" style={{ fontSize: "10px" }}>Miễn phí</span>
          )}
        </div>
        
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div className="d-flex flex-column">
            <span className="fw-bold text-dark fs-6">Tổng cộng</span>
            <span className="text-muted" style={{ fontSize: "10px" }}>Đã bao gồm VAT</span>
          </div>
          <span className="fw-extrabold text-danger fs-3 lh-1" style={{ transition: "all 0.3s" }}>{formatPrice(grandTotal)}</span>
        </div>

        {loyaltyPointsEarned > 0 && (
          <div className="bg-warning-subtle rounded-3 p-3 mb-4 d-flex align-items-center gap-3 border border-warning" style={{ borderColor: "#ffeeba" }}>
            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: "40px", height: "40px" }}>
              <i className="fa-solid fa-crown text-warning fs-5"></i>
            </div>
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>Bạn sẽ nhận được <span className="text-danger">{loyaltyPointsEarned} điểm Loyalty</span></div>
              <div className="text-muted" style={{ fontSize: "11px" }}>sau khi hoàn tất đơn hàng.</div>
            </div>
          </div>
        )}

        <button 
          onClick={onSubmit}
          className="btn w-100 py-3 rounded-pill fw-bold fs-5 text-white shadow" 
          disabled={loadingSubmit || cart.length === 0}
          style={{ backgroundColor: "#4a3b32", borderColor: "#4a3b32", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#352922"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#4a3b32"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {loadingSubmit ? (
            <><i className="fa-solid fa-spinner fa-spin me-2"></i> Đang xử lý...</>
          ) : (
            <><i className="fa-solid fa-lock me-2 small"></i> Đặt hàng</>
          )}
        </button>

        <div className="text-center mt-3">
          <Link to="/cart" className="btn btn-link text-muted fw-medium text-decoration-none small d-flex align-items-center justify-content-center gap-1">
            <i className="fa-solid fa-arrow-left"></i> Quay lại giỏ hàng
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSummaryCard;
