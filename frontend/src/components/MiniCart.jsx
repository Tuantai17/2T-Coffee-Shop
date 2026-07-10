import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { removeCartItem, updateCartItemQuantity } from "../services/cartService";
import { applyImageFallback, DEFAULT_IMAGE_FALLBACK, resolveImageUrl } from "../utils/imageFallback";
import { getAuthSession, AUTH_SCOPES } from "../utils/authStorage";

function MiniCart({ cart, loadCart, closeCart }) {
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);
  const { token } = getAuthSession(AUTH_SCOPES.USER);

  // Nhấn ESC để đóng
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeCart]);

  const handleUpdateQuantity = async (productId, nextQuantity) => {
    if (!productId || nextQuantity < 1) return;
    setUpdatingId(productId);
    try {
      await updateCartItemQuantity(productId, nextQuantity);
      await loadCart();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    if (!productId) return;
    setUpdatingId(productId);
    try {
      await removeCartItem(productId);
      await loadCart();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const calculateTotal = () => {
    if (!cart || !Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => total + (item.unitPrice || 0) * (item.quantity || 0), 0);
  };

  const cartTotalAmount = calculateTotal();
  const items = Array.isArray(cart) ? cart : [];

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    closeCart();
    navigate("/checkout");
  };

  return (
    <div 
      className="position-absolute shadow-lg bg-white rounded-4 border" 
      style={{
        top: "100%",
        right: "0",
        width: "420px",
        zIndex: 1050,
        marginTop: "12px",
        cursor: "default"
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3">
        {/* Guest Banner */}
        {!token && (
          <div className="text-center small mb-3 text-dark">
            <Link to="/login" className="text-danger fw-semibold text-decoration-none" onClick={closeCart}>Đăng nhập</Link> hoặc <Link to="/register" className="text-danger fw-semibold text-decoration-none" onClick={closeCart}>Đăng ký</Link> để hưởng giá ưu đãi dành riêng cho thành viên.
          </div>
        )}

        {/* Freeship Banner */}
        <div className="d-flex align-items-center justify-content-center py-2 mb-3 rounded" style={{ backgroundColor: "#e8fdf5", color: "#00b27b", fontWeight: "600", fontSize: "14px" }}>
          🎉 Bạn đã được FREESHIP
        </div>

        {/* Item List */}
        {items.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="fa-solid fa-basket-shopping fs-1 mb-3 text-light"></i>
            <h6 className="fw-bold mb-1">Giỏ hàng của bạn đang trống</h6>
            <p className="small mb-3">Hãy khám phá các sản phẩm phù hợp dành cho bé.</p>
            <button className="btn btn-outline-danger btn-sm rounded-pill px-4 fw-bold" onClick={() => { closeCart(); navigate("/products"); }}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div style={{ maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }} className="mini-cart-items custom-scrollbar mb-3">
            {items.map((item) => {
              const isUpdating = updatingId === item.cartItemId;

              return (
                <div key={item.cartItemId} className="d-flex py-2 border-bottom align-items-center position-relative">
                  {/* Ảnh */}
                  <div className="me-3" style={{ width: "64px", height: "64px", flexShrink: 0 }}>
                    <img 
                      src={resolveImageUrl(item.productImageUrl, DEFAULT_IMAGE_FALLBACK)} 
                      alt={item.productName} 
                      className="img-fluid rounded border h-100 w-100" 
                      style={{ objectFit: "contain" }}
                      onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <Link to={`/products/${item.productId}`} className="text-decoration-none" onClick={closeCart}>
                      <div className="text-primary-dark fw-semibold small line-clamp-2 lh-sm mb-1" title={item.productName}>
                        {item.productName}
                      </div>
                    </Link>
                    {/* Options & Toppings info */}
                    {(item.variantName || item.optionsSnapshot || item.toppingsSnapshot) && (
                      <div className="text-muted" style={{ fontSize: "11px", lineHeight: "1.3" }}>
                        {item.variantName && <span>Size: {item.variantName}</span>}
                        {item.optionsSnapshot && <span>{item.variantName ? ' | ' : ''}{item.optionsSnapshot}</span>}
                        {item.toppingsSnapshot && <span>{(item.variantName || item.optionsSnapshot) ? ' | ' : ''}Topping: {item.toppingsSnapshot}</span>}
                      </div>
                    )}
                    
                    {/* Controls & Price */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="d-flex align-items-center border rounded-pill px-1" style={{ height: "28px" }}>
                        <button 
                          className="btn btn-sm btn-link text-danger text-decoration-none p-0 px-2 d-flex align-items-center justify-content-center"
                          disabled={isUpdating || item.quantity <= 1}
                          onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        >
                          <i className="fa-solid fa-minus" style={{ fontSize: "10px" }}></i>
                        </button>
                        {isUpdating ? (
                          <span className="d-flex justify-content-center align-items-center" style={{ minWidth: "30px" }}>
                            <span className="spinner-border spinner-border-sm text-danger" style={{ width: "12px", height: "12px", borderWidth: "2px" }}></span>
                          </span>
                        ) : (
                          <input
                            type="text"
                            className="form-control form-control-sm border-0 text-center fw-bold p-0 text-dark bg-transparent"
                            style={{ width: "30px", fontSize: "12px", boxShadow: "none" }}
                            defaultValue={item.quantity}
                            key={item.quantity}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val > 0 && val !== item.quantity) {
                                handleUpdateQuantity(item.cartItemId, val);
                              } else {
                                e.target.value = item.quantity;
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            }}
                          />
                        )}
                        <button 
                          className="btn btn-sm btn-link text-danger text-decoration-none p-0 px-2 d-flex align-items-center justify-content-center"
                          disabled={isUpdating}
                          onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        >
                          <i className="fa-solid fa-plus" style={{ fontSize: "10px" }}></i>
                        </button>
                      </div>
                      <div className="fw-bold text-danger small">
                        {(item.unitPrice || 0).toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button 
                    className="btn btn-link text-danger p-1 ms-2"
                    onClick={() => handleRemove(item.cartItemId)}
                    disabled={isUpdating}
                    title="Xóa sản phẩm"
                  >
                    <i className="fa-regular fa-trash-can fs-6"></i>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="mt-2">
            <div className="d-flex justify-content-between align-items-center mb-3 border-top pt-3">
              <span className="text-danger fw-normal" style={{ fontSize: "15px" }}>Tổng cộng</span>
              <span className="fw-bold text-danger fs-5">{cartTotalAmount.toLocaleString("vi-VN")} VND</span>
            </div>
            
            {/* Checkboxes terms */}
            <div className="mb-3 ps-1">
              <div className="form-check small mb-1">
                <input className="form-check-input" type="checkbox" id="agreeAll" defaultChecked />
                <label className="form-check-label text-muted" htmlFor="agreeAll" style={{ fontSize: "12px" }}>
                  Tôi đã đọc và đồng ý với tất cả điều khoản bên dưới
                </label>
              </div>
            </div>

            <div className="row g-2">
              <div className="col-6">
                <button 
                  className="btn btn-outline-danger w-100 rounded-pill fw-bold"
                  onClick={() => { closeCart(); navigate("/cart"); }}
                >
                  <i className="fa-solid fa-basket-shopping me-2"></i>Xem giỏ hàng
                </button>
              </div>
              <div className="col-6">
                <button 
                  className="btn btn-danger w-100 rounded-pill fw-bold"
                  style={{ backgroundColor: "#ee5c69", borderColor: "#ee5c69" }}
                  onClick={handleCheckoutClick}
                >
                  Thanh toán ngay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #999; 
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default MiniCart;
