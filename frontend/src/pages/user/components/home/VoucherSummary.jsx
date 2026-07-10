import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function VoucherSummary({ vouchers = [] }) {
  return (
    <div className="container mt-5 pt-3">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-2">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "var(--primary-color)", fontSize: "1.75rem" }}>
            VOUCHER NỔI BẬT
          </h3>
          <div style={{ width: "60px", height: "4px", backgroundColor: "var(--secondary-color)", borderRadius: "2px" }}></div>
        </div>
        <Link to="/profile/vouchers" className="text-decoration-none fw-semibold hover-text-primary" style={{ color: "var(--dark-text)", fontSize: "0.95rem" }}>
          Xem tất cả <i className="fa-solid fa-chevron-right ms-1 small"></i>
        </Link>
      </div>

      <div className="row g-4 flex-nowrap overflow-auto hide-scrollbar pb-3 px-2">
        {vouchers.length === 0 ? (
          // Skeleton frame
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="col-11 col-sm-6 col-md-4 placeholder-glow">
              <div className="brew-card rounded-4 d-flex overflow-hidden h-100 position-relative shadow-sm" style={{ border: "1px solid #f1f5f9", minHeight: "140px" }}>
                <div className="p-3 text-center" style={{ width: "30%", borderRight: "2px dashed #ddd", backgroundColor: "#f8f9fa" }}></div>
                <div className="p-3 flex-grow-1 d-flex flex-column bg-white">
                  <h6 className="placeholder col-8 bg-secondary rounded mb-2"></h6>
                  <div className="placeholder col-5 bg-secondary rounded mb-3"></div>
                  <div className="placeholder col-4 bg-secondary rounded mt-auto"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          vouchers.map((v, idx) => (
            <motion.div 
              key={v.id}
              className="col-11 col-sm-6 col-md-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="brew-card rounded-4 d-flex overflow-hidden h-100 position-relative shadow-sm hover-scale transition-all" style={{ border: "1px solid #f1f5f9" }}>
                {/* Notch for ticket look */}
                <div className="position-absolute bg-light rounded-circle" style={{ width: "20px", height: "20px", top: "-10px", left: "28%" }}></div>
                <div className="position-absolute bg-light rounded-circle" style={{ width: "20px", height: "20px", bottom: "-10px", left: "28%" }}></div>

                <div 
                  className="d-flex flex-column justify-content-center align-items-center text-white p-3 text-center"
                  style={{ width: "30%", backgroundColor: v.type === "shipping" ? "var(--secondary-color)" : "var(--primary-color)", borderRight: "2px dashed rgba(255,255,255,0.5)" }}
                >
                  <h5 className="fw-bold mb-0 text-uppercase" style={{ fontSize: "1.2rem", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                    {v.title}
                  </h5>
                </div>
                <div className="p-3 flex-grow-1 d-flex flex-column bg-white ps-4">
                  <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: "1.1rem" }}>{v.desc}</h6>
                  <div className="small text-muted mb-2 fw-semibold">{v.cond}</div>
                  <div className="small text-muted mb-3 d-flex align-items-center gap-1">
                    <i className="fa-regular fa-clock"></i> HSD: {v.exp}
                  </div>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill mt-auto fw-bold w-50" style={{ border: "1px solid var(--secondary-color)", color: "var(--secondary-color)" }}>
                    Lưu
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default VoucherSummary;
