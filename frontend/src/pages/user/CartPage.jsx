import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { getCart, removeCartItem, updateCartItemQuantity } from "../../services/cartService";
import { getToppings, getProductById } from "../../services/productService";
import CartItemCard from "./components/cart/CartItemCard";
import CartSummary from "./components/cart/CartSummary";
import CartSkeleton from "./components/cart/CartSkeleton";
import EmptyCart from "./components/cart/EmptyCart";
import RemoveConfirmModal from "./components/cart/RemoveConfirmModal";
import RecommendedProducts from "./components/cart/RecommendedProducts";
import EditCartItemModal from "./components/cart/EditCartItemModal";

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Remove confirm
  const [removeItem, setRemoveItem] = useState(null);

  // Edit item
  const [editingItem, setEditingItem] = useState(null);

  // Checkout
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Global Toppings
  const [globalToppings, setGlobalToppings] = useState([]);

  const loadCart = useCallback(async () => {
    try {
      const [cartRes, topRes] = await Promise.all([
        getCart(),
        getToppings()
      ]);
      let cartItems = Array.isArray(cartRes.data) ? cartRes.data : [];
      
      // Khắc phục: Lấy giá size cho các item cũ trong giỏ hàng chưa có variantPrice
      for (let item of cartItems) {
        if (item.variantId && item.variantPrice == null) {
          try {
            const prodRes = await getProductById(item.productId);
            if (prodRes.data && prodRes.data.variants) {
              const variant = prodRes.data.variants.find(v => v.id === item.variantId);
              if (variant) {
                item.variantPrice = variant.priceAdjustment || 0;
              }
            }
          } catch (e) {
            console.error("Lỗi lấy thông tin size:", e);
          }
        }
      }

      setCart(cartItems);
      setGlobalToppings(topRes.data || []);
      setError(null);
    } catch (err) {
      console.error("Lỗi tải giỏ hàng:", err);
      setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleUpdateQuantity = async (cartItemId, nextQuantity) => {
    if (!cartItemId || nextQuantity < 1) return;
    setUpdatingId(cartItemId);
    try {
      await updateCartItemQuantity(cartItemId, nextQuantity);
      await loadCart();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400 && err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Số lượng vượt quá tồn kho hoặc có lỗi xảy ra.");
      }
      await loadCart();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveRequest = (item) => {
    setRemoveItem(item);
  };

  const handleRemoveConfirm = async () => {
    if (!removeItem) return;
    setUpdatingId(removeItem.cartItemId);
    try {
      await removeCartItem(removeItem.cartItemId);
      setRemoveItem(null);
      await loadCart();
    } catch (err) {
      console.error(err);
      alert("Xóa sản phẩm thất bại!");
    } finally {
      setUpdatingId(null);
    }
  };



  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      navigate("/checkout");
    }, 800);
  };

  const items = Array.isArray(cart) ? cart : [];
  const itemCount = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const subtotal = items.reduce((sum, it) => sum + (it.subTotal || it.unitPrice * it.quantity || 0), 0);

  return (
    <UserLayout>
      <div className="container py-4" style={{ maxWidth: "1200px" }}>

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb mb-0" style={{ fontSize: "14px" }}>
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none" style={{ color: "#c67c4e" }}>
                <i className="fa-solid fa-house me-1" style={{ fontSize: "12px" }}></i>Trang chủ
              </Link>
            </li>
            <li className="breadcrumb-item active text-muted">Giỏ hàng</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: "#2d2d2d", letterSpacing: "-0.5px" }}>
              GIỎ HÀNG CỦA BẠN
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
              Kiểm tra món đã chọn trước khi thanh toán.
            </p>
          </div>
          {items.length > 0 && (
            <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill" style={{ backgroundColor: "#fef3c7", fontSize: "13px", color: "#92400e" }}>
              <i className="fa-solid fa-clock"></i>
              <span>Sản phẩm trong giỏ sẽ được giữ trong <strong>30 phút</strong></span>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="row g-4">
            <div className="col-lg-8"><CartSkeleton /></div>
            <div className="col-lg-4">
              <div className="bg-white rounded-4 p-4 placeholder-glow" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                {[1,2,3,4,5].map(i => <span key={i} className="placeholder col-12 mb-3 d-block rounded-pill" style={{ height: "18px", backgroundColor: "#f0e8df" }}></span>)}
                <span className="placeholder col-12 d-block rounded-pill" style={{ height: "48px", backgroundColor: "#f0e8df" }}></span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <div className="mb-3" style={{ fontSize: "4rem", opacity: 0.15 }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h5 className="fw-bold mb-2">{error}</h5>
            <button className="btn rounded-pill px-4 py-2 fw-semibold" style={{ border: "1px solid #c67c4e", color: "#c67c4e" }} onClick={loadCart}>
              <i className="fa-solid fa-rotate-right me-2"></i>Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <>
            <EmptyCart />
            <RecommendedProducts />
          </>
        ) : (
          <>
            <div className="row g-4">
              {/* Left: Cart Items */}
              <div className="col-lg-8">
                {items.map((item, index) => (
                  <CartItemCard
                    key={item.cartItemId}
                    item={item}
                    index={index}
                    isUpdating={updatingId === item.cartItemId}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveRequest}
                    onEdit={setEditingItem}
                    globalToppings={globalToppings}
                  />
                ))}

                {/* Continue Shopping */}
                <button
                  className="btn w-100 rounded-3 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  style={{ border: "1px dashed #e0d6cc", color: "#888", fontSize: "14px", transition: "all 0.2s" }}
                  onClick={() => navigate("/products")}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c67c4e"; e.currentTarget.style.color = "#c67c4e"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0d6cc"; e.currentTarget.style.color = "#888"; }}
                >
                  <i className="fa-solid fa-arrow-left"></i> Tiếp tục mua hàng
                </button>
              </div>

              {/* Right: Summary */}
              <div className="col-lg-4">
                <CartSummary
                  items={items}
                  isCheckingOut={isCheckingOut}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>

            {/* Recommendation */}
            <RecommendedProducts />

            {/* Mobile Sticky Bar */}
            <div
              className="d-lg-none position-fixed start-0 end-0 bg-white px-3 py-3 shadow-lg"
              style={{ bottom: 0, zIndex: 1040, borderTop: "1px solid #f0ebe5" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <span className="text-muted" style={{ fontSize: "12px" }}>{itemCount} món trong giỏ hàng</span>
                  <div className="fw-bold" style={{ color: "#c67c4e", fontSize: "1.2rem" }}>
                    Tổng cộng: {new Intl.NumberFormat('vi-VN').format(subtotal)}đ
                  </div>
                </div>
              </div>
              <button
                className="btn w-100 rounded-pill fw-bold py-3 text-white d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: "var(--primary-color, #c67c4e)", border: "none", fontSize: "1rem" }}
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <>Tiếp tục thanh toán <i className="fa-solid fa-arrow-right"></i></>
                )}
              </button>
            </div>
            {/* Spacer for mobile sticky bar */}
            <div className="d-lg-none" style={{ height: "120px" }}></div>
          </>
        )}
      </div>

      {/* Modals */}
      <RemoveConfirmModal
        show={!!removeItem}
        item={removeItem}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setRemoveItem(null)}
      />
      <EditCartItemModal
        show={!!editingItem}
        item={editingItem}
        globalToppings={globalToppings}
        onClose={() => setEditingItem(null)}
        onCartUpdated={loadCart}
      />
    </UserLayout>
  );
}

export default CartPage;
