import { useState } from "react";
import { motion } from "framer-motion";

function QuickOrder() {
  const [activeTab, setActiveTab] = useState("delivery");

  return (
    <div className="container" style={{ marginTop: "-50px", position: "relative", zIndex: 30 }}>
      <motion.div 
        className="brew-card p-0 overflow-hidden shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ borderRadius: "24px" }}
      >
        <div className="row g-0">
          {/* Delivery Tab */}
          <div 
            className="col-md-6 p-4 d-flex align-items-center cursor-pointer transition-all"
            onClick={() => setActiveTab("delivery")}
            style={{ 
              backgroundColor: activeTab === "delivery" ? "var(--light-cream)" : "#F8F5F0",
              borderRight: "1px solid #EAEAEA"
            }}
          >
            <div className="bg-white rounded-circle shadow-sm p-3 me-4 text-center d-flex align-items-center justify-content-center" style={{ width: "70px", height: "70px" }}>
              <i className="fa-solid fa-motorcycle fs-3" style={{ color: activeTab === "delivery" ? "var(--secondary-color)" : "var(--gray-text)" }}></i>
            </div>
            <div className="flex-grow-1">
              <h5 className="fw-bold mb-1" style={{ color: activeTab === "delivery" ? "var(--primary-color)" : "var(--gray-text)" }}>Giao hàng tận nơi</h5>
              <p className="text-muted small mb-3">Giao nhanh 30-45 phút</p>
              {activeTab === "delivery" && (
                <div className="d-flex gap-2">
                  <div className="position-relative flex-grow-1">
                    <i className="fa-solid fa-location-dot position-absolute top-50 start-0 translate-middle-y ms-3 text-danger"></i>
                    <input type="text" className="form-control form-brew-control ps-5" placeholder="Nhập địa chỉ giao hàng..." />
                  </div>
                  <button className="btn btn-brew-primary rounded-pill px-4">Đặt ngay</button>
                </div>
              )}
            </div>
          </div>

          {/* Pickup Tab */}
          <div 
            className="col-md-6 p-4 d-flex align-items-center cursor-pointer transition-all"
            onClick={() => setActiveTab("pickup")}
            style={{ 
              backgroundColor: activeTab === "pickup" ? "var(--light-cream)" : "#F8F5F0",
            }}
          >
            <div className="bg-white rounded-circle shadow-sm p-3 me-4 text-center d-flex align-items-center justify-content-center" style={{ width: "70px", height: "70px" }}>
              <i className="fa-solid fa-store fs-3" style={{ color: activeTab === "pickup" ? "var(--secondary-color)" : "var(--gray-text)" }}></i>
            </div>
            <div className="flex-grow-1">
              <h5 className="fw-bold mb-1" style={{ color: activeTab === "pickup" ? "var(--primary-color)" : "var(--gray-text)" }}>Nhận tại cửa hàng</h5>
              <p className="text-muted small mb-3">Brew Moments Flagship <span className="badge bg-success bg-opacity-10 text-success ms-2 border border-success border-opacity-25 rounded-pill px-2">5-10 phút</span></p>
              {activeTab === "pickup" && (
                <div className="d-flex align-items-center justify-content-between">
                  <div className="small text-muted d-flex align-items-center">
                    <i className="fa-solid fa-location-dot me-2 text-danger fs-6"></i>
                    123 Coffee Street, Q.1, TP.HCM
                  </div>
                  <button className="btn btn-outline-secondary rounded-pill px-4 hover-scale border-1 text-dark fw-semibold">Chọn ngay</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default QuickOrder;
