import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function FlashSale({ flashSaleData }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!flashSaleData) return;
    // Bắt đầu đếm ngược nếu có dữ liệu thật
    setTimeLeft({ hours: 2, minutes: 15, seconds: 35 });
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [flashSaleData]);

  return (
    <div className="container mt-5 pt-3">
      <div className="brew-card p-4 rounded-4" style={{ background: "linear-gradient(135deg, #FFFDF9 0%, #FFF5F5 100%)", border: "1px solid #FFE4E4" }}>
        <div className="row align-items-center">
          <div className="col-md-5 col-lg-4 mb-4 mb-md-0 text-center text-md-start">
            <h3 className="fw-bold text-danger mb-3 d-flex align-items-center justify-content-center justify-content-md-start" style={{ fontSize: "1.75rem" }}>
              <i className="fa-solid fa-bolt me-2"></i> FLASH SALE
            </h3>
            <p className="text-muted mb-3">Kết thúc sau:</p>
            <div className="d-flex gap-2 justify-content-center justify-content-md-start">
              <div className="bg-danger text-white rounded-3 px-3 py-2 text-center shadow-sm">
                <span className="fs-3 fw-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                <div style={{ fontSize: "0.7rem" }}>Giờ</div>
              </div>
              <div className="fs-3 fw-bold text-danger pt-2">:</div>
              <div className="bg-danger text-white rounded-3 px-3 py-2 text-center shadow-sm">
                <span className="fs-3 fw-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <div style={{ fontSize: "0.7rem" }}>Phút</div>
              </div>
              <div className="fs-3 fw-bold text-danger pt-2">:</div>
              <div className="bg-danger text-white rounded-3 px-3 py-2 text-center shadow-sm">
                <span className="fs-3 fw-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <div style={{ fontSize: "0.7rem" }}>Giây</div>
              </div>
            </div>
          </div>
          
          <div className="col-md-7 col-lg-8">
            {!flashSaleData ? (
              // Skeleton Frame
              <div className="bg-white rounded-4 p-3 shadow-sm d-flex flex-column flex-sm-row align-items-center gap-4 placeholder-glow">
                <div className="placeholder bg-secondary rounded-4" style={{ width: "160px", height: "160px", minWidth: "160px" }}></div>
                <div className="flex-grow-1 w-100">
                  <div className="placeholder col-8 bg-secondary rounded mb-3" style={{ height: "24px" }}></div>
                  <div className="placeholder col-4 bg-secondary rounded mb-4" style={{ height: "30px" }}></div>
                  <div className="placeholder col-12 bg-secondary rounded mb-3" style={{ height: "10px" }}></div>
                  <div className="placeholder col-12 bg-secondary rounded-pill" style={{ height: "40px" }}></div>
                </div>
              </div>
            ) : (
              <motion.div 
                className="bg-white rounded-4 p-3 shadow-sm d-flex flex-column flex-sm-row align-items-center gap-4 transition-all"
                whileHover={{ y: -5, boxShadow: "var(--shadow-hover)" }}
              >
                {/* Dữ liệu thật sẽ render ở đây */}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlashSale;
