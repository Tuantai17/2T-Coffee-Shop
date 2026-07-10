import React from 'react';
import { formatPrice } from '../../../../utils/formatPrice';

function ProductHeader({ product, getCategoryName }) {
  if (!product) return null;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="mb-4 pb-4 border-bottom">
      <div className="d-flex flex-wrap gap-2 mb-3">
        <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-bold">
          {getCategoryName(product.categoryId)}
        </span>
        {product.brand && (
          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">
            {product.brand}
          </span>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-start mb-2">
        <h1 className="fw-bold text-dark text-uppercase mb-0" style={{ fontSize: "2rem", lineHeight: "1.2" }}>
          {product.name}
        </h1>
        <button className="btn btn-light rounded-circle shadow-sm border" style={{ width: "42px", height: "42px" }}>
          <i className="fa-regular fa-heart text-danger"></i>
        </button>
      </div>

      <div className="d-flex align-items-center gap-3 mb-3 small fw-medium">
        {product.rating && (
          <div className="d-flex align-items-center gap-1 text-warning">
            <i className="fa-solid fa-star"></i>
            <span className="text-dark fw-bold">{product.rating}</span>
            <span className="text-muted fw-normal">({product.reviews || 0} đánh giá)</span>
          </div>
        )}
        {(product.rating && product.sold) && <span className="text-muted">|</span>}
        {product.sold > 0 && <div className="text-muted">Đã bán {product.sold.toLocaleString()} ly</div>}
      </div>

      <div className="d-flex align-items-center mb-4 text-muted small">
        Tình trạng: <span className="text-dark fw-medium ms-1">{product.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span> 
        <span className="mx-2">|</span> 
        Mã SKU: <span className="text-dark fw-medium ms-1">{product.sku || 'N/A'}</span>
      </div>

      <div className="d-flex align-items-end gap-3">
        <div className="text-danger fw-bold display-5 mb-0" style={{ lineHeight: "1" }}>
          {formatPrice(product.price)}
        </div>
        {hasDiscount && (
          <>
            <div className="text-muted text-decoration-line-through fs-5 mb-1">
              {formatPrice(product.originalPrice)}
            </div>
            <div className="badge bg-danger px-2 py-1 rounded mb-1">
              Tiết kiệm {formatPrice(product.originalPrice - product.price)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductHeader;
