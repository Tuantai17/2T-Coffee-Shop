import { motion } from "framer-motion";

function AppDownload() {
  return (
    <div className="container mt-5 pt-3 mb-5 pb-5">
      <motion.div 
        className="rounded-4 overflow-hidden position-relative shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ backgroundColor: "var(--light-beige)" }}
      >
        <div className="row align-items-center">
          <div className="col-md-6 p-4 p-md-5">
            <h2 className="fw-bold mb-3" style={{ color: "var(--primary-color)", fontSize: "2.5rem" }}>Trải nghiệm <br/> Brew Moments App</h2>
            <p className="text-muted mb-4 fs-5" style={{ maxWidth: "400px" }}>
              Đặt hàng nhanh chóng, tích điểm dễ dàng và nhận vô vàn ưu đãi độc quyền chỉ có trên ứng dụng.
            </p>
            <div className="d-flex align-items-center gap-4">
              <div className="bg-white p-2 rounded-3 shadow-sm" style={{ width: "120px", height: "120px" }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" className="w-100 h-100" />
              </div>
              <div className="d-flex flex-column gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="hover-scale transition-all" style={{ height: "45px", cursor: "pointer" }} />
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="hover-scale transition-all" style={{ height: "45px", cursor: "pointer" }} />
              </div>
            </div>
          </div>
          <div className="col-md-6 d-none d-md-block position-relative" style={{ height: "450px" }}>
            <div className="position-absolute bottom-0 end-0 me-5" style={{ width: "350px", height: "100%" }}>
              {/* Mock App Image */}
              <div className="w-100 h-100 bg-white rounded-top-5 shadow-lg border border-5 border-bottom-0 border-white overflow-hidden position-relative" style={{ borderTopLeftRadius: "40px", borderTopRightRadius: "40px" }}>
                <div className="bg-dark w-50 mx-auto" style={{ height: "20px", borderBottomLeftRadius: "15px", borderBottomRightRadius: "15px" }}></div>
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600" alt="App Preview" className="w-100 mt-2 object-fit-cover" style={{ height: "100%", objectPosition: "top" }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AppDownload;
