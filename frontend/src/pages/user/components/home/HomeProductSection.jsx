import { useState } from "react";
import { Link } from "react-router-dom";
import { applyImageFallback, DEFAULT_IMAGE_FALLBACK, resolveImageUrl } from "../../../../utils/imageFallback";
import { motion } from "framer-motion";

function HomeProductSection({ title, type, products, loading, viewAllLink, onAddToCart, iconClass }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 5; 
  const totalPages = Math.ceil((products?.length || 0) / itemsPerPage);

  const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 0));
  const handleNextPage = () => setPage(prev => Math.min(prev + 1, totalPages - 1));

  const currentProducts = products ? products.slice(page * itemsPerPage, (page + 1) * itemsPerPage) : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="container mt-5 pt-3">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-2">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "var(--primary-color)", fontSize: "1.75rem" }}>
            {title}
          </h3>
          <div style={{ width: "60px", height: "4px", backgroundColor: "var(--secondary-color)", borderRadius: "2px" }}></div>
        </div>
        <Link to={viewAllLink} className="text-decoration-none fw-semibold hover-text-primary" style={{ color: "var(--dark-text)", fontSize: "0.95rem" }}>
          Xem tất cả <i className="fa-solid fa-chevron-right ms-1 small"></i>
        </Link>
      </div>

      <div className="position-relative">
        {products?.length > itemsPerPage && (
          <button
            className="btn rounded-circle shadow-sm position-absolute start-0 top-50 translate-middle-y d-none d-md-flex align-items-center justify-content-center"
            style={{ width: "45px", height: "45px", zIndex: 10, opacity: page === 0 ? 0 : 1, cursor: page === 0 ? "default" : "pointer", marginLeft: "-22px", backgroundColor: "#fff", border: "1px solid #eaeaea", color: "var(--primary-color)", transition: "all 0.3s" }}
            onClick={handlePrevPage}
            disabled={page === 0}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
        )}

        {loading ? (
          <div className="text-center my-5 py-5">
            <div className="spinner-border" style={{ color: "var(--secondary-color)" }} role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-5 text-muted bg-light rounded-4">Không có sản phẩm nào.</div>
        ) : (
          <motion.div 
            key={page}
            className="row g-4 flex-nowrap flex-lg-wrap overflow-auto hide-scrollbar pb-3 px-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {currentProducts.map((p) => {
              const hasDiscount = p.originalPrice && p.originalPrice > p.price;
              const discountPercentage = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
              const isOutOfStock = p.status === "OUT_OF_STOCK" || p.availability <= 0 || p.quantity <= 0;
              
              return (
                <motion.div 
                  variants={itemVariants}
                  className="col-10 col-sm-6 col-md-4 col-lg-2-4" 
                  style={{ width: window.innerWidth > 992 ? "20%" : "auto", minWidth: "250px" }} 
                  key={p.id}
                >
                  <div className="brew-card h-100 position-relative p-3 d-flex flex-column" style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                    {/* Badges */}
                    {isOutOfStock ? (
                      <span className="brew-badge bg-secondary">Hết hàng</span>
                    ) : hasDiscount ? (
                      <span className="brew-badge">-{discountPercentage}%</span>
                    ) : type === 'new' ? (
                      <span className="brew-badge" style={{ backgroundColor: "var(--accent-gold)", color: "#fff" }}>NEW</span>
                    ) : type === 'hot' ? (
                      <span className="brew-badge" style={{ backgroundColor: "var(--accent-red)", color: "#fff" }}>HOT</span>
                    ) : null}

                    {/* Favorite btn */}
                    <button className="btn position-absolute border-0 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center text-muted hover-text-primary" style={{ top: "15px", right: "15px", width: "32px", height: "32px", zIndex: 10 }}>
                      <i className="fa-regular fa-heart"></i>
                    </button>

                    {/* Image */}
                    <Link to={`/products/${p.id}`} className="position-relative overflow-hidden rounded-3 mb-3 d-block" style={{ aspectRatio: "1/1", backgroundColor: "#f8f9fa" }}>
                      <img
                        src={resolveImageUrl(p.imageUrl, "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=500")}
                        className="w-100 h-100 object-fit-cover transition-all"
                        alt={p.name}
                        style={{ transition: "transform 0.5s ease" }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        onError={(event) => applyImageFallback(event, DEFAULT_IMAGE_FALLBACK)}
                      />
                    </Link>

                    {/* Info */}
                    <div className="d-flex flex-column flex-grow-1">
                      {/* Rating Mock */}
                      <div className="d-flex align-items-center mb-1 gap-1" style={{ fontSize: "0.8rem", color: "var(--accent-gold)" }}>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star-half-stroke"></i>
                        <span className="text-muted ms-1" style={{ fontSize: "0.75rem" }}>(4.8)</span>
                        <span className="text-muted ms-auto" style={{ fontSize: "0.7rem" }}>Đã bán {p.soldCount > 1000 ? (p.soldCount / 1000).toFixed(1) + 'k' : (p.soldCount || 0)}</span>
                      </div>
                      
                      <Link to={`/products/${p.id}`} className="text-decoration-none">
                        <h6 className="fw-bold mb-2 text-dark" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: "1rem", lineHeight: "1.4" }} onMouseOver={e => e.target.style.color="var(--secondary-color)"} onMouseOut={e => e.target.style.color="var(--dark-text)"}>
                          {p.name}
                        </h6>
                      </Link>
                      
                      <div className="mt-auto pt-2 d-flex align-items-end justify-content-between">
                        <div>
                          <div className="fw-bold fs-6" style={{ color: "var(--primary-color)" }}>
                            {p.price.toLocaleString("vi-VN")}đ
                          </div>
                          {hasDiscount && (
                            <div className="text-muted text-decoration-line-through" style={{ fontSize: "0.8rem" }}>
                              {p.originalPrice.toLocaleString("vi-VN")}đ
                            </div>
                          )}
                        </div>
                        
                        <button 
                          className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm hover-scale" 
                          style={{ width: "36px", height: "36px", backgroundColor: "var(--secondary-color)", color: "#fff", border: "none" }}
                          onClick={() => onAddToCart(p.id)}
                          disabled={isOutOfStock}
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {products?.length > itemsPerPage && (
          <button
            className="btn rounded-circle shadow-sm position-absolute end-0 top-50 translate-middle-y d-none d-md-flex align-items-center justify-content-center"
            style={{ width: "45px", height: "45px", zIndex: 10, opacity: page === totalPages - 1 ? 0 : 1, cursor: page === totalPages - 1 ? "default" : "pointer", marginRight: "-22px", backgroundColor: "#fff", border: "1px solid #eaeaea", color: "var(--primary-color)", transition: "all 0.3s" }}
            onClick={handleNextPage}
            disabled={page === totalPages - 1}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        )}
      </div>

      {/* Page indicator */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
          <button 
            className="btn btn-sm border-0 text-muted" 
            onClick={handlePrevPage} 
            disabled={page === 0}
            style={{ opacity: page === 0 ? 0.3 : 1 }}
          >
            <i className="fa-solid fa-chevron-left small"></i>
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className="btn btn-sm border-0 rounded-circle p-0"
              style={{
                width: page === i ? "24px" : "8px",
                height: "8px",
                borderRadius: page === i ? "4px" : "50%",
                backgroundColor: page === i ? "var(--primary-color)" : "#d1d5db",
                transition: "all 0.3s ease",
                cursor: "pointer",
                minWidth: "8px"
              }}
              onClick={() => setPage(i)}
            />
          ))}
          <button 
            className="btn btn-sm border-0 text-muted" 
            onClick={handleNextPage} 
            disabled={page === totalPages - 1}
            style={{ opacity: page === totalPages - 1 ? 0.3 : 1 }}
          >
            <i className="fa-solid fa-chevron-right small"></i>
          </button>
          <span className="text-muted small ms-2">{page + 1} / {totalPages}</span>
        </div>
      )}
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .col-lg-2-4 { flex: 0 0 auto; width: 20%; }
        @media (max-width: 992px) { .col-lg-2-4 { width: auto; } }
      `}</style>
    </div>
  );
}

export default HomeProductSection;
