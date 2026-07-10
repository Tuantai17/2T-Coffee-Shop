import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function ComboBanner() {
  return (
    <div className="container mt-5 pt-4">
      <motion.div 
        className="rounded-4 overflow-hidden position-relative shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ height: "300px", backgroundColor: "var(--primary-color)" }}
      >
        <div 
          className="w-100 h-100 position-absolute top-0 start-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1498603536246-15572faa57dc?q=80&w=1200&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.6
          }}
        ></div>
        
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "linear-gradient(90deg, rgba(46,46,46,0.9) 0%, rgba(0,0,0,0.1) 100%)" }}></div>

        <div className="position-relative h-100 d-flex flex-column justify-content-center p-5 text-white" style={{ maxWidth: "500px" }}>
          <span className="badge bg-warning text-dark mb-3 px-3 py-2 fs-6 align-self-start rounded-pill">COMBO SIÊU TIẾT KIỆM</span>
          <h2 className="fw-bold display-6 mb-3">Tiết kiệm đến 30%</h2>
          <p className="mb-4">Thưởng thức trọn vẹn hương vị với combo bánh và nước hoàn hảo cho buổi chiều năng động.</p>
          <Link to="/promotions" className="btn btn-brew-primary btn-lg rounded-pill px-5 align-self-start shadow">
            Mua combo ngay
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default ComboBanner;
