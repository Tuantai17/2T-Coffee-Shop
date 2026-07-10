import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../../utils/formatPrice';
import { applyImageFallback, resolveImageUrl } from '../../../../utils/imageFallback';

function RecentlyViewed({ recentProducts = [] }) {
  // If no data, show skeleton frames
  if (!recentProducts || recentProducts.length === 0) {
    return (
      <div className="brew-card rounded-4 p-4 shadow-sm h-100">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0 text-dark text-uppercase">BẠN ĐÃ XEM</h6>
          <span className="small text-muted fw-medium">Xem tất cả</span>
        </div>
        
        <div className="d-flex gap-3 overflow-hidden pb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="placeholder-glow" style={{ width: "90px", minWidth: "90px" }}>
              <div className="placeholder rounded-3 mb-2" style={{ width: "100%", aspectRatio: "1/1", backgroundColor: "#e9ecef" }}></div>
              <div className="placeholder rounded mb-1 w-75" style={{ height: "12px", backgroundColor: "#e9ecef" }}></div>
              <div className="placeholder rounded w-50" style={{ height: "12px", backgroundColor: "#e9ecef" }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="brew-card rounded-4 p-4 shadow-sm h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0 text-dark text-uppercase">BẠN ĐÃ XEM</h6>
        <Link to="#" className="small text-danger text-decoration-none fw-medium hover-text-primary">Xem tất cả</Link>
      </div>
      
      <div className="d-flex gap-3 overflow-auto hide-scrollbar pb-2" style={{ scrollSnapType: "x mandatory" }}>
        {recentProducts.map(prod => (
          <Link key={prod.id} to={`/products/${prod.id}`} className="text-decoration-none text-dark d-block" style={{ width: "90px", minWidth: "90px", scrollSnapAlign: "start" }}>
            <div className="rounded-3 overflow-hidden mb-2 shadow-sm border" style={{ width: "100%", aspectRatio: "1/1" }}>
              <img src={resolveImageUrl(prod.imageUrl || prod.img)} onError={applyImageFallback} alt={prod.name} className="w-100 h-100 object-fit-cover transition-all hover-zoom" />
            </div>
            <h6 className="small fw-medium mb-1 text-truncate" style={{ fontSize: "0.75rem" }}>{prod.name}</h6>
            <div className="fw-bold text-danger" style={{ fontSize: "0.8rem" }}>{formatPrice(prod.price)}</div>
          </Link>
        ))}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hover-zoom:hover { transform: scale(1.1); }
      `}</style>
    </div>
  );
}

export default RecentlyViewed;
