import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

function HeroSlider({ banners = [] }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="position-relative overflow-hidden w-100 placeholder-glow" style={{ height: "700px", backgroundColor: "#e9ecef" }}>
        <div className="container h-100 position-relative">
          <div className="row h-100 align-items-center">
            <div className="col-lg-6 col-md-8">
              <span className="placeholder col-8 bg-secondary mb-3 rounded" style={{ height: "60px" }}></span>
              <span className="placeholder col-5 bg-secondary mb-4 rounded" style={{ height: "40px" }}></span>
              <span className="placeholder col-10 bg-secondary mb-2 rounded" style={{ height: "20px" }}></span>
              <span className="placeholder col-8 bg-secondary mb-5 rounded" style={{ height: "20px" }}></span>
              <div className="d-flex gap-3">
                <span className="placeholder col-4 bg-secondary rounded-pill" style={{ height: "50px" }}></span>
                <span className="placeholder col-4 bg-secondary rounded-pill" style={{ height: "50px" }}></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="position-relative overflow-hidden w-100" style={{ height: "700px", backgroundColor: "var(--primary-color)" }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIdx}
          className="position-absolute top-0 start-0 w-100 h-100"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {/* Background Image with Gradient Overlay */}
          <div 
            className="w-100 h-100"
            style={{
              backgroundImage: `url(${banners[currentIdx].imgUrl || banners[currentIdx].imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Gradient Overlay */}
            <div 
              className="position-absolute top-0 start-0 w-100 h-100" 
              style={{ background: "linear-gradient(90deg, rgba(46,46,46,0.95) 0%, rgba(90,56,37,0.8) 40%, rgba(255,255,255,0) 100%)" }}
            ></div>
          </div>

          {/* Content */}
          <div className="container h-100 position-relative" style={{ zIndex: 10 }}>
            <div className="row h-100 align-items-center">
              <div className="col-lg-6 col-md-8 text-white">
                <motion.h1 
                  className="display-3 fw-bold mb-2"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)", letterSpacing: "1px" }}
                >
                  {banners[currentIdx].title}
                </motion.h1>
                <motion.h2 
                  className="display-4 fw-light mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  style={{ color: "var(--secondary-color)", fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}
                >
                  {banners[currentIdx].subtitle}
                </motion.h2>
                <motion.p 
                  className="lead mb-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  style={{ opacity: 0.9 }}
                >
                  {banners[currentIdx].desc}
                </motion.p>

                <motion.div 
                  className="d-flex gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  <Link to="/products" className="btn btn-brew-primary btn-lg px-5 rounded-pill shadow-sm">
                    {banners[currentIdx].cta1 || "Đặt ngay"}
                  </Link>
                  <Link to="/products" className="btn btn-outline-light btn-lg px-5 rounded-pill hover-scale transition-all">
                    {banners[currentIdx].cta2 || "Khám phá menu"}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar & Indicators */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex align-items-center gap-2" style={{ zIndex: 20 }}>
        {banners.map((_, idx) => (
          <div 
            key={idx}
            className="cursor-pointer transition-all"
            onClick={() => setCurrentIdx(idx)}
            style={{
              width: currentIdx === idx ? "40px" : "12px",
              height: "4px",
              backgroundColor: currentIdx === idx ? "var(--secondary-color)" : "rgba(255,255,255,0.4)",
              borderRadius: "4px"
            }}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        className="btn position-absolute top-50 start-0 translate-middle-y ms-4 rounded-circle border border-white text-white d-none d-md-flex align-items-center justify-content-center hover-scale"
        style={{ width: "45px", height: "45px", backgroundColor: "rgba(0,0,0,0.2)", zIndex: 20, backdropFilter: "blur(4px)" }}
        onClick={() => setCurrentIdx(prev => prev === 0 ? banners.length - 1 : prev - 1)}
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button 
        className="btn position-absolute top-50 end-0 translate-middle-y me-4 rounded-circle border border-white text-white d-none d-md-flex align-items-center justify-content-center hover-scale"
        style={{ width: "45px", height: "45px", backgroundColor: "rgba(0,0,0,0.2)", zIndex: 20, backdropFilter: "blur(4px)" }}
        onClick={() => setCurrentIdx(prev => prev === banners.length - 1 ? 0 : prev - 1)}
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
}

export default HeroSlider;
