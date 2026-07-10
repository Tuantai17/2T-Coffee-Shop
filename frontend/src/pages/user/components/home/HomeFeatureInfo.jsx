import { motion } from "framer-motion";

function HomeFeatureInfo() {
  const features = [
    { icon: "fa-solid fa-truck-fast", title: "Giao hàng nhanh", desc: "30-45 phút" },
    { icon: "fa-solid fa-leaf", title: "Nguyên liệu chọn lọc", desc: "Tươi ngon mỗi ngày" },
    { icon: "fa-solid fa-shield-halved", title: "Thanh toán an toàn", desc: "Bảo mật tuyệt đối" },
    { icon: "fa-solid fa-medal", title: "Tích điểm dễ dàng", desc: "Nhận nhiều ưu đãi" },
    { icon: "fa-solid fa-headset", title: "Hỗ trợ 24/7", desc: "Luôn sẵn sàng" },
  ];

  return (
    <div className="container mt-5 pt-3 pb-5">
      <div className="row g-4 justify-content-center">
        {features.map((f, idx) => (
          <motion.div 
            key={idx} 
            className="col-6 col-md-4 col-lg-2-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="d-flex flex-column align-items-center">
              <div className="text-white d-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm hover-scale transition-all" style={{ width: "65px", height: "65px", backgroundColor: "var(--secondary-color)", color: "var(--primary-color)" }}>
                <i className={`${f.icon} fs-3`}></i>
              </div>
              <h6 className="fw-bold text-dark mb-1">{f.title}</h6>
              <span className="small text-muted">{f.desc}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <style>{`
        .col-lg-2-4 { flex: 0 0 auto; width: 20%; }
        @media (max-width: 992px) { .col-lg-2-4 { width: auto; } }
      `}</style>
    </div>
  );
}

export default HomeFeatureInfo;
