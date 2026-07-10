import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function HomeNewsSection({ news = [] }) {
  return (
    <div className="container mt-5 pt-3">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-2">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "var(--primary-color)", fontSize: "1.75rem" }}>
            TIN TỨC MỚI NHẤT
          </h3>
          <div style={{ width: "60px", height: "4px", backgroundColor: "var(--secondary-color)", borderRadius: "2px" }}></div>
        </div>
        <Link to="/news" className="text-decoration-none fw-semibold hover-text-primary" style={{ color: "var(--dark-text)", fontSize: "0.95rem" }}>
          Xem tất cả <i className="fa-solid fa-chevron-right ms-1 small"></i>
        </Link>
      </div>

      <div className="row g-4">
        {news.length === 0 ? (
          // Skeleton frame
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="col-md-4 placeholder-glow">
              <div className="brew-card h-100 rounded-4 overflow-hidden border-0 bg-white d-flex flex-column" style={{ border: "1px solid #f1f5f9" }}>
                <div className="placeholder bg-secondary w-100" style={{ aspectRatio: "16/9" }}></div>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <div className="placeholder col-4 bg-secondary rounded mb-2"></div>
                  <h5 className="placeholder col-10 bg-secondary rounded mb-3" style={{ height: "24px" }}></h5>
                  <div className="placeholder col-3 bg-secondary rounded mt-auto"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          news.map((item, idx) => (
            <motion.div 
              key={item.id} 
              className="col-md-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="brew-card h-100 rounded-4 overflow-hidden border-0 bg-white d-flex flex-column" style={{ border: "1px solid #f1f5f9" }}>
                <Link to={`/news/${item.id}`} className="d-block overflow-hidden position-relative" style={{ aspectRatio: "16/9" }}>
                  <img src={item.img} className="w-100 h-100 object-fit-cover transition-all" alt={item.title} style={{ transition: "transform 0.5s ease" }} onMouseOver={e => e.target.style.transform="scale(1.1)"} onMouseOut={e => e.target.style.transform="scale(1)"} />
                  <span className="position-absolute bottom-0 start-0 bg-white text-dark fw-bold px-3 py-1 small" style={{ borderTopRightRadius: "12px" }}>
                    {item.cat}
                  </span>
                </Link>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <div className="small text-muted mb-2"><i className="fa-regular fa-calendar me-2"></i>{item.date}</div>
                  <Link to={`/news/${item.id}`} className="text-decoration-none text-dark">
                    <h5 className="fw-bold mb-3 hover-text-primary" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: "1.4" }}>{item.title}</h5>
                  </Link>
                  <Link to={`/news/${item.id}`} className="mt-auto fw-bold text-decoration-none" style={{ color: "var(--secondary-color)" }}>
                    Đọc tiếp <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default HomeNewsSection;
