import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl, applyImageFallback, DEFAULT_IMAGE_FALLBACK } from '../../../../utils/imageFallback';
import { formatPrice } from '../../../../utils/formatPrice';

function CartItemCard({ item, isUpdating, onUpdateQuantity, onRemove, onEdit, index, globalToppings = [] }) {
  if (!item) return null;

  return (
    <div
      className="bg-white rounded-4 p-3 p-md-4 mb-3 position-relative cart-item-card"
      style={{
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        border: "1px solid #f0ebe5",
        transition: "all 0.3s ease",
        animation: `fadeInUp 0.4s ease ${index * 0.08}s both`,
      }}
    >
      <div className="d-flex gap-3">
        {/* Product Image & Quantity */}
        <div className="d-flex flex-column align-items-center flex-shrink-0 gap-2">
          <Link to={`/products/${item.productId}`}>
            <div
              className="rounded-4 overflow-hidden bg-light"
              style={{ width: "100px", height: "100px", border: "1px solid #f0ebe5" }}
            >
              <img
                src={resolveImageUrl(item.productImageUrl, DEFAULT_IMAGE_FALLBACK)}
                alt={item.productName}
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
                onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)}
              />
            </div>
          </Link>
          <div className="badge rounded-pill text-dark fw-medium" style={{ backgroundColor: "#f0ebe5", fontSize: "12px", padding: "4px 12px" }}>
            Số lượng: {item.quantity}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          {/* Header Row: Name + Delete */}
          <div className="d-flex justify-content-between align-items-start mb-1">
            <Link to={`/products/${item.productId}`} className="text-decoration-none">
              <h6 className="fw-bold mb-0 lh-sm" style={{ color: "#2d2d2d", fontSize: "1rem" }}>
                {item.productName}
              </h6>
            </Link>
            <button
              className="btn btn-link text-muted p-0 ms-2 flex-shrink-0"
              onClick={() => onRemove(item)}
              disabled={isUpdating}
              title="Xóa sản phẩm"
              style={{ transition: "color 0.2s" }}
              onMouseEnter={(e) => e.target.style.color = "#e74c3c"}
              onMouseLeave={(e) => e.target.style.color = ""}
            >
              <i className="fa-regular fa-trash-can" style={{ fontSize: "16px" }}></i>
            </button>
          </div>

          {/* Customization Tags */}
          <div className="d-flex flex-wrap gap-1 mb-2" style={{ fontSize: "12px" }}>
            {item.variantName && (
              <span className="badge rounded-pill fw-medium" style={{ backgroundColor: "#fdf2e9", color: "#c67c4e", padding: "4px 10px" }}>
                <i className="fa-solid fa-ruler me-1" style={{ fontSize: "9px" }}></i>Size {item.variantName}
                {item.variantPrice > 0 && ` (+${formatPrice(item.variantPrice)})`}
              </span>
            )}
            {item.optionsSnapshot && item.optionsSnapshot.split(', ').map((opt, i) => (
              <span key={i} className="badge rounded-pill fw-medium" style={{ backgroundColor: "#eef6ff", color: "#3b82f6", padding: "4px 10px" }}>
                {opt}
              </span>
            ))}
          </div>

          {/* Topping */}
          {item.toppingIds && item.toppingIds.length > 0 && globalToppings && globalToppings.length > 0 ? (
            <div className="mb-2">
              {item.toppingIds && item.toppingIds.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {(() => {
                    const groupedToppings = item.toppingIds.reduce((acc, tId) => {
                      acc[tId] = (acc[tId] || 0) + 1;
                      return acc;
                    }, {});
                    
                    return Object.entries(groupedToppings).map(([tId, count]) => {
                      const toppingId = Number(tId);
                      const topping = globalToppings.find(t => t.id === toppingId);
                      
                      if (!topping) return null;
                      
                      return (
                        <div key={toppingId} className="d-flex align-items-center bg-white border rounded-pill overflow-hidden shadow-sm" style={{ padding: "2px 8px 2px 2px", gap: "6px" }}>
                          <div className="rounded-circle overflow-hidden bg-light" style={{ width: "22px", height: "22px", flexShrink: 0 }}>
                            {topping.imageUrl ? (
                              <img src={resolveImageUrl(topping.imageUrl)} className="w-100 h-100 object-fit-cover" alt={topping.name} onError={(e) => applyImageFallback(e)} />
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-danger-subtle text-danger" style={{ fontSize: "10px" }}><i className="fa-solid fa-star"></i></div>
                            )}
                          </div>
                          <div className="d-flex flex-column" style={{ lineHeight: "1.1" }}>
                            <span className="fw-medium text-dark" style={{ fontSize: "11px" }}>{topping.name} {count > 1 && <span className="text-danger fw-bold">(x{count})</span>}</span>
                            <span className="text-muted" style={{ fontSize: "9px" }}>+{formatPrice((topping.price || 0) * count)}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          ) : item.toppingsSnapshot ? (
            <div className="mb-2" style={{ fontSize: "12px", color: "#888" }}>
              <i className="fa-solid fa-cookie-bite me-1" style={{ color: "#c67c4e", fontSize: "10px" }}></i>
              Topping: {item.toppingsSnapshot}
            </div>
          ) : null}

          {/* Note */}
          {item.note && (
            <div className="mb-2 fst-italic" style={{ fontSize: "12px", color: "#aaa" }}>
              <i className="fa-regular fa-note-sticky me-1" style={{ fontSize: "10px" }}></i>
              {item.note}
            </div>
          )}

          {/* Bottom Row: Price + Quantity + Line Total */}
          <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              {/* Unit Price */}
              <span className="fw-bold" style={{ color: "#c67c4e", fontSize: "1rem" }}>
                {formatPrice(item.unitPrice)}
              </span>
            </div>

            {/* Line Total */}
            <div className="text-end d-flex flex-column align-items-end mt-2 mt-sm-0">
              {(item.quantity > 1 || (item.toppingTotal && item.toppingTotal > 0)) ? (
                <div className="rounded-3 p-2 d-flex flex-column gap-1" style={{ fontSize: "12px", minWidth: "180px", backgroundColor: "#faf8f5", border: "1px dashed #e8e0d8" }}>
                  <div className="d-flex justify-content-between text-muted">
                    <span>Sản phẩm (x{item.quantity}):</span>
                    <span className="fw-medium" style={{ color: "#2d2d2d" }}>{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                  {item.toppingTotal > 0 && (
                    <div className="d-flex justify-content-between text-muted">
                      <span>Topping:</span>
                      <span className="fw-medium" style={{ color: "#2d2d2d" }}>{formatPrice(item.toppingTotal)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center mt-1 pt-2" style={{ borderTop: "1px dashed #e8e0d8" }}>
                    <span className="fw-bold text-muted" style={{ fontSize: "10px" }}>TỔNG CỘNG</span>
                    <span className="fw-bold" style={{ color: "#c67c4e", fontSize: "1.15rem", lineHeight: "1" }}>
                      {formatPrice(item.subTotal || item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="fw-bold" style={{ color: "#c67c4e", fontSize: "1.15rem", lineHeight: "1" }}>
                  {formatPrice(item.subTotal || item.unitPrice * item.quantity)}
                </div>
              )}
            </div>
          </div>

          {/* Edit button */}
          <button
            className="btn btn-sm mt-2 rounded-pill fw-medium d-flex align-items-center gap-1"
            style={{ border: "1px solid #e8e0d8", color: "#888", fontSize: "12px", padding: "4px 14px", transition: "all 0.2s" }}
            onClick={() => onEdit && onEdit(item)}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c67c4e"; e.currentTarget.style.color = "#c67c4e"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e8e0d8"; e.currentTarget.style.color = "#888"; }}
          >
            <i className="fa-solid fa-pen" style={{ fontSize: "10px" }}></i>
            Sửa tùy chọn
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cart-item-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
          border-color: #e8ddd3 !important;
        }
      `}</style>
    </div>
  );
}

export default CartItemCard;
