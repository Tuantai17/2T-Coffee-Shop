import { useState } from "react";
import { Link } from "react-router-dom";
import { resolveImageUrl, applyImageFallback, DEFAULT_IMAGE_FALLBACK } from "../../../../utils/imageFallback";
import { motion } from "framer-motion";

function HomeToppingSection({ toppings, loading }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil((toppings?.length || 0) / itemsPerPage);

  const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 0));
  const handleNextPage = () => setPage(prev => Math.min(prev + 1, totalPages - 1));

  const currentToppings = toppings ? toppings.slice(page * itemsPerPage, (page + 1) * itemsPerPage) : [];

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
            TOPPING
          </h3>
          <div style={{ width: "60px", height: "4px", backgroundColor: "var(--secondary-color)", borderRadius: "2px" }}></div>
        </div>
      </div>

      <div className="position-relative">
        {toppings?.length > itemsPerPage && (
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
        ) : toppings?.length === 0 ? (
          <div className="text-center py-5 text-muted bg-light rounded-4">Không có topping nào.</div>
        ) : (
          <motion.div 
            key={page}
            className="row g-4 flex-nowrap flex-lg-wrap overflow-auto hide-scrollbar pb-3 px-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {currentToppings.map((topping) => (
              <motion.div 
                variants={itemVariants}
                className="col-10 col-sm-6 col-md-4 col-lg-2-4" 
                style={{ width: window.innerWidth > 992 ? "20%" : "auto", minWidth: "250px" }} 
                key={topping.id}
              >
                <div className="brew-card h-100 position-relative p-3 d-flex flex-column align-items-center text-center" style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                  {/* Image */}
                  <div className="position-relative overflow-hidden rounded-3 mb-3" style={{ width: "120px", height: "120px", backgroundColor: "#f8f9fa" }}>
                    <img
                      src={resolveImageUrl(topping.imageUrl, "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=300")}
                      className="w-100 h-100 object-fit-cover transition-all"
                      alt={topping.name}
                      style={{ transition: "transform 0.5s ease", borderRadius: "12px" }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      onError={(event) => applyImageFallback(event, DEFAULT_IMAGE_FALLBACK)}
                    />
                  </div>

                  {/* Info */}
                  <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: "1rem", lineHeight: "1.4" }}>
                    {topping.name}
                  </h6>
                  
                  {topping.description && (
                    <p className="text-muted small mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: "0.85rem" }}>
                      {topping.description}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-2">
                    <div className="fw-bold fs-6" style={{ color: "var(--primary-color)" }}>
                      {(topping.price || 0).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {toppings?.length > itemsPerPage && (
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

export default HomeToppingSection;
