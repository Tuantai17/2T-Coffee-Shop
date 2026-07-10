import React from 'react';
import { useNavigate } from 'react-router-dom';

function EmptyCart() {
  const navigate = useNavigate();

  return (
    <div className="text-center py-5 px-4">
      <div className="mb-4" style={{ fontSize: "6rem", opacity: 0.15 }}>
        <i className="fa-solid fa-basket-shopping"></i>
      </div>
      <h4 className="fw-bold mb-2" style={{ color: "#2d2d2d" }}>Giỏ hàng của bạn đang trống</h4>
      <p className="text-muted mb-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
        Hãy chọn món yêu thích và thêm vào giỏ hàng. Chúng tôi có rất nhiều đồ uống ngon đang chờ bạn!
      </p>
      <button
        className="btn fw-bold rounded-pill px-5 py-3 text-white shadow-sm"
        style={{ backgroundColor: "var(--primary-color, #c67c4e)", border: "none", fontSize: "1rem", transition: "all 0.3s" }}
        onClick={() => navigate("/products")}
        onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 25px rgba(198,124,78,0.35)"; }}
        onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
      >
        <i className="fa-solid fa-mug-hot me-2"></i>Khám phá menu
      </button>
    </div>
  );
}

export default EmptyCart;
