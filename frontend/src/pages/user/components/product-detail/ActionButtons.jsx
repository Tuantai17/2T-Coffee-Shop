import React from 'react';

function ActionButtons({ onAddToCart, onBuyNow, isOutOfStock }) {
  return (
    <div className="d-flex flex-row gap-3 mb-4 w-100">
      <button 
        className="btn btn-danger btn-lg rounded-pill fw-bold py-3 shadow-sm d-flex align-items-center justify-content-center gap-2 hover-lift w-50"
        onClick={onAddToCart}
        disabled={isOutOfStock}
      >
        <i className="fa-solid fa-cart-plus"></i>
        <span className="d-none d-sm-inline">{isOutOfStock ? 'TẠM HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}</span>
        <span className="d-inline d-sm-none">{isOutOfStock ? 'HẾT HÀNG' : 'THÊM GIỎ HÀNG'}</span>
      </button>
      <button 
        className="btn btn-outline-danger btn-lg rounded-pill fw-bold py-3 hover-lift bg-white w-50"
        onClick={onBuyNow}
        disabled={isOutOfStock}
      >
        MUA NGAY
      </button>
      <style>{`
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
      `}</style>
    </div>
  );
}

export default ActionButtons;
