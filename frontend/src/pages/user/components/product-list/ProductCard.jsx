import React from 'react';
import { Link } from 'react-router-dom';
import { applyImageFallback, DEFAULT_IMAGE_FALLBACK, resolveImageUrl } from "../../../../utils/imageFallback";

function ProductCard({ product, onAddToCart, viewMode = 'grid' }) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const isOutOfStock = product.status === "OUT_OF_STOCK" || product.availability <= 0 || product.quantity <= 0;

  if (viewMode === 'list') {
    return (
      <div className="product-list-card card border-0 mb-3 overflow-hidden neu-card-soft">
        <div className="row g-0 align-items-center p-3">
          <div className="col-md-3 col-4 position-relative overflow-hidden rounded-4">
            {isOutOfStock && (
              <span className="toy-badge-out-of-stock" style={{ top: '15px', right: '-30px', fontSize: '0.7rem', padding: '3px 30px' }}>Hết hàng</span>
            )}
            {hasDiscount && (
              <span className="product-badge discount">-{discountPercentage}%</span>
            )}
            <Link to={`/products/${product.slug || product.id}`}>
              <img
                src={resolveImageUrl(product.imageUrl, DEFAULT_IMAGE_FALLBACK)}
                className="img-fluid rounded-4 p-2 product-img"
                alt={product.name || product.productName}
                onError={(event) => applyImageFallback(event, DEFAULT_IMAGE_FALLBACK)}
              />
            </Link>
          </div>
          <div className="col-md-6 col-8 px-4">
            <div className="d-flex flex-wrap justify-content-between align-items-start mb-1 gap-1">
              <span className="product-brand text-muted text-uppercase small" style={{ fontSize: '11px' }}>{product.brand || "THƯƠNG HIỆU"}</span>
              <span className="product-sku text-muted small text-end" style={{ fontSize: '11px' }}>SKU: {product.sku || "N/A"}</span>
            </div>
            <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none">
              <h5 className="product-name fw-semibold mb-2 line-clamp-2">{product.name || product.productName}</h5>
            </Link>
            <p className="product-desc text-muted small line-clamp-2 d-none d-md-block">
              {product.shortDescription || product.discription}
            </p>
          </div>
          <div className="col-md-3 col-12 px-4 border-start-md text-md-end text-start mt-3 mt-md-0">
            <div className="product-price-wrapper mb-3">
              <div className="price-sale fw-bold fs-5 text-danger">
                {(product.price || 0).toLocaleString("vi-VN")} VND
              </div>
              {hasDiscount && (
                <div className="price-original text-muted text-decoration-line-through small">
                  {product.originalPrice.toLocaleString("vi-VN")} VND
                </div>
              )}
            </div>
            <div className="d-flex justify-content-md-end gap-2">
              <button
                className="btn btn-add-cart w-100 fw-bold"
                onClick={() => onAddToCart(product.id)}
                disabled={product.status === "OUT_OF_STOCK" || product.availability <= 0}
              >
                <i className="fa-solid fa-cart-shopping me-2"></i> 
                {product.status === "OUT_OF_STOCK" || product.availability <= 0 ? "Hết hàng" : "Thêm Giỏ Hàng"}
              </button>
              <button className="btn btn-wishlist btn-outline-danger">
                <i className="fa-regular fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="product-grid-card card h-100 border-0 bg-white position-relative overflow-hidden">
      {isOutOfStock && (
        <span className="toy-badge-out-of-stock">Hết hàng</span>
      )}
      {hasDiscount && (
        <span className="product-badge discount">-{discountPercentage}%</span>
      )}
      
      <Link to={`/products/${product.slug || product.id}`} className="product-img-wrapper p-3 d-block">
        <img
          src={resolveImageUrl(product.imageUrl, DEFAULT_IMAGE_FALLBACK)}
          className="card-img-top product-img"
          alt={product.name || product.productName}
          onError={(event) => applyImageFallback(event, DEFAULT_IMAGE_FALLBACK)}
        />
      </Link>
      
      <div className="card-body d-flex flex-column px-4 pb-4 pt-0">
        <div className="d-flex flex-wrap justify-content-between align-items-start mb-1 gap-1">
          <span className="product-brand text-muted text-uppercase small" style={{ fontSize: '11px' }}>{product.brand || "THƯƠNG HIỆU"}</span>
          <span className="product-sku text-muted small text-end" style={{ fontSize: '11px' }}>SKU: {product.sku || "N/A"}</span>
        </div>
        
        <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none mb-3">
          <h5 className="product-name line-clamp-2 text-primary-dark">{product.name || product.productName}</h5>
        </Link>
        
        <div className="mt-auto">
          <div className="d-flex gap-2 align-items-baseline mb-3">
            <span className="price-sale fw-bold fs-5 text-danger">
              {(product.price || 0).toLocaleString("vi-VN")} VND
            </span>
            {hasDiscount && (
              <span className="price-original text-muted text-decoration-line-through small">
                {product.originalPrice.toLocaleString("vi-VN")} VND
              </span>
            )}
          </div>
          
          <div className="d-flex gap-2">
            <button
              className="btn btn-add-cart w-100 fw-bold"
              onClick={() => onAddToCart(product.id)}
              disabled={product.status === "OUT_OF_STOCK" || product.availability <= 0}
            >
              <i className="fa-solid fa-cart-shopping me-2"></i>
              {product.status === "OUT_OF_STOCK" || product.availability <= 0 ? "Hết hàng" : "Thêm Vào Giỏ Hàng"}
            </button>
            <button className="btn btn-wishlist btn-outline-danger px-3">
              <i className="fa-regular fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
