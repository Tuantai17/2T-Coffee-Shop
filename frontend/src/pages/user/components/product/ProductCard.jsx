import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../../utils/formatPrice';
import { applyImageFallback, resolveImageUrl } from '../../../../utils/imageFallback';

function ProductCard({ product, onAddToCart, onQuickView, viewMode }) {
  const isList = viewMode === 'list';

  // Badges (Real data)
  const badges = [];
  if (product.discount > 0) badges.push({ type: 'sale', label: `SALE -${product.discount}%` });
  else if (product.isNew) badges.push({ type: 'new', label: 'NEW' });
  else if (product.isBestSeller) badges.push({ type: 'best', label: 'BEST SELLER' });
  else if (product.isHot) badges.push({ type: 'hot', label: 'HOT' });

  // Only use real data from product (do not use Math.random)
  const rating = product.rating || null;
  const sold = product.sold || 0;
  const calories = product.calories || null;

  const getBadgeColor = (type) => {
    switch (type) {
      case 'sale': return 'bg-danger';
      case 'new': return 'bg-success';
      case 'best': return 'bg-warning text-dark';
      case 'hot': return 'bg-danger';
      default: return 'bg-primary';
    }
  };

  return (
    <div className={`brew-card bg-white rounded-4 overflow-hidden h-100 position-relative transition-all d-flex ${isList ? 'flex-row' : 'flex-column'}`}>
      
      {/* Badges */}
      <div className="position-absolute top-0 start-0 p-3 d-flex flex-column gap-2" style={{ zIndex: 10 }}>
        {badges.map((badge, idx) => (
          <span key={idx} className={`badge ${getBadgeColor(badge.type)} fw-bold px-2 py-1 shadow-sm rounded-pill`} style={{ fontSize: "0.7rem" }}>
            {badge.label}
          </span>
        ))}
      </div>

      {/* Favorite Button */}
      <button className="btn position-absolute top-0 end-0 p-3 text-muted hover-text-danger transition-all z-3 border-0 bg-transparent shadow-none" style={{ zIndex: 10 }}>
        <i className="fa-regular fa-heart fs-5"></i>
      </button>

      {/* Image Area */}
      <div className={`position-relative overflow-hidden bg-light ${isList ? 'w-25' : 'w-100'}`} style={{ aspectRatio: isList ? '1/1' : '1/1' }}>
        <Link to={`/products/${product.id}`} className="d-block w-100 h-100">
          <img 
            src={resolveImageUrl(product.imageUrl)} 
            alt={product.name}
            className="w-100 h-100 object-fit-cover transition-all duration-500 hover-zoom"
            onError={(e) => applyImageFallback(e)}
          />
        </Link>
        {/* Quick View Button overlay */}
        <div className="position-absolute bottom-0 start-0 w-100 p-2 d-none d-lg-flex justify-content-center opacity-0 quick-view-btn transition-all">
          <button 
            className="btn btn-light rounded-pill px-4 py-2 fw-bold text-dark shadow w-100 mx-2 hover-scale"
            onClick={(e) => { e.preventDefault(); onQuickView(product); }}
          >
            <i className="fa-regular fa-eye me-2"></i> Quick View
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`p-3 p-md-4 d-flex flex-column flex-grow-1 ${isList ? 'w-75' : ''}`}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Link to={`/products/${product.id}`} className="text-decoration-none">
            <h5 className="fw-bold text-dark mb-0 hover-text-primary product-title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {product.name}
            </h5>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3 mb-2 small text-muted fw-medium">
          {rating !== null && (
            <div className="d-flex align-items-center gap-1 text-warning">
              <i className="fa-solid fa-star"></i>
              <span className="text-dark">{rating}</span>
            </div>
          )}
          {sold > 0 && <div>Đã bán {sold.toLocaleString()} ly</div>}
        </div>

        {isList && (
          <p className="text-muted small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description || "Thức uống thơm ngon được pha chế từ những nguyên liệu hảo hạng nhất, mang lại trải nghiệm tuyệt vời cho bạn."}
          </p>
        )}

        {isList && calories !== null && (
          <div className="small text-muted mb-3"><i className="fa-solid fa-fire text-danger me-1"></i> {calories} kcal</div>
        )}

        <div className="mt-auto d-flex justify-content-between align-items-end">
          <div>
            {product.discount > 0 ? (
              <>
                <div className="fw-bold fs-5" style={{ color: "var(--secondary-color)" }}>
                  {formatPrice(product.price * (1 - product.discount / 100))}
                </div>
                <div className="text-muted text-decoration-line-through small">
                  {formatPrice(product.price)}
                </div>
              </>
            ) : (
              <div className="fw-bold fs-5 text-dark">
                {formatPrice(product.price)}
              </div>
            )}
          </div>
          
          <button 
            className="btn rounded-circle d-flex align-items-center justify-content-center text-white hover-scale shadow-sm"
            style={{ width: "40px", height: "40px", backgroundColor: "var(--secondary-color)" }}
            onClick={(e) => { e.preventDefault(); onAddToCart(product.id); }}
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
      <style>{`
        .hover-zoom:hover { transform: scale(1.1); }
        .brew-card:hover .quick-view-btn { opacity: 1 !important; bottom: 10px !important; }
        .product-title { transition: color 0.2s ease; }
      `}</style>
    </div>
  );
}

export default ProductCard;
