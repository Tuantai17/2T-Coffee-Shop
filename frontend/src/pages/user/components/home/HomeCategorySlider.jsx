import { Link } from "react-router-dom";
import { applyImageFallback, resolveImageUrl } from "../../../../utils/imageFallback";
import { motion } from "framer-motion";

function HomeCategorySlider({ categories }) {
  const displayCategories = categories && categories.length > 0 
    ? categories.filter(cat => !cat.parentId) 
    : [];

  return (
    <div className="container mt-5 pt-4">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "var(--primary-color)", fontSize: "1.75rem" }}>Danh Mục Nổi Bật</h3>
        </div>
        <Link to="/products" className="text-decoration-none fw-semibold d-none d-md-block" style={{ color: "var(--secondary-color)", fontSize: "0.95rem" }}>
          Xem tất cả <i className="fa-solid fa-chevron-right ms-1 small"></i>
        </Link>
      </div>
      
      <div className="position-relative">
        <div className="d-flex gap-4 overflow-auto pb-4 hide-scrollbar px-2" style={{ scrollSnapType: "x mandatory" }}>
          {displayCategories.length === 0 ? (
            // Skeleton Frame
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="placeholder-glow" style={{ minWidth: "160px", scrollSnapAlign: "start" }}>
                <div className="d-block brew-card text-center p-3 h-100" style={{ borderRadius: "20px" }}>
                  <div className="mx-auto rounded-circle mb-3 placeholder bg-secondary" style={{ width: "110px", height: "110px" }}></div>
                  <h6 className="placeholder col-8 bg-secondary rounded mx-auto" style={{ height: "15px" }}></h6>
                </div>
              </div>
            ))
          ) : (
            displayCategories.map((cat, idx) => (
              <motion.div
                key={cat.id || idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                style={{ minWidth: "160px", scrollSnapAlign: "start" }}
              >
                <Link
                  to={`/products?category=${cat.id}`}
                  className="text-decoration-none d-block brew-card text-center p-3 h-100"
                  style={{ borderRadius: "20px" }}
                >
                  <div 
                    className="mx-auto rounded-circle overflow-hidden mb-3 shadow-sm transition-all"
                    style={{ width: "110px", height: "110px", border: "4px solid #fff" }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={resolveImageUrl(cat.imageUrl)}
                      alt={cat.name}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                      onError={(event) => applyImageFallback(event)}
                    />
                  </div>
                  <h6 className="fw-bold text-dark mb-0">{cat.name}</h6>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default HomeCategorySlider;
