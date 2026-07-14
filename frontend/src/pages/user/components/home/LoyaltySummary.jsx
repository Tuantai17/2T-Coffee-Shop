import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import loyaltyApi from "../../../../api/loyaltyApi";
import { getAuthSession, AUTH_SCOPES } from "../../../../utils/authStorage";

function LoyaltySummary() {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { token } = getAuthSession(AUTH_SCOPES.USER);
    if (!token) {
      setLoading(false);
      return;
    }

    loyaltyApi.getMyLoyaltyAccount()
      .then(res => {
        setLoyaltyData(res.data);
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu loyalty:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getTierImage = (code) => {
    const c = (code || '').toUpperCase();
    if (c === 'DIAMOND') return '/images/diamond-medal.png';
    if (c === 'PLATINUM') return '/images/platinum-medal.png';
    if (c === 'GOLD') return '/images/gold-medal.png';
    return '/images/silver-medal.png';
  };

  return (
    <div className="container mt-5 pt-3">
      <div 
        className="brew-card rounded-4 p-4 p-md-5 position-relative overflow-hidden"
        style={{ borderLeft: "6px solid var(--accent-green)", backgroundColor: "#FAFFF9" }}
      >
        <div className="position-absolute top-0 end-0 opacity-10 p-4" style={{ transform: "scale(1.5) translate(10%, -10%)" }}>
          <i className="fa-solid fa-ranking-star text-success" style={{ fontSize: "15rem" }}></i>
        </div>

        <div className="row position-relative z-1 align-items-center">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <h4 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "var(--accent-green)", letterSpacing: "1px" }}>
              LOYALTY CỦA BẠN
            </h4>
            
            {loading ? (
              // Skeleton Frame
              <div className="placeholder-glow">
                <div className="placeholder col-3 bg-secondary rounded mb-3"></div>
                <div className="placeholder col-6 bg-secondary rounded mb-4" style={{ height: "50px" }}></div>
                <div className="placeholder col-10 bg-secondary rounded-pill mb-2" style={{ height: "10px" }}></div>
                <div className="placeholder col-5 bg-secondary rounded"></div>
              </div>
            ) : loyaltyData ? (
              <div className="pe-md-4">
                <div className="d-flex align-items-center mb-3">
                  <img 
                    src={getTierImage(loyaltyData.currentTierCode)} 
                    alt={loyaltyData.currentTierName} 
                    style={{ width: "60px", marginRight: "15px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }} 
                    onError={(e) => e.target.style.display = 'none'} 
                  />
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">Hạng hiện tại</div>
                    <h5 className="fw-black mb-0" style={{ color: loyaltyData.currentTierColor || "#c67c4e", letterSpacing: "1px" }}>
                      {loyaltyData.currentTierName?.toUpperCase() || "THÀNH VIÊN"}
                    </h5>
                  </div>
                </div>

                <div className="d-flex align-items-end gap-2 mb-3">
                  <span className="fw-black text-danger" style={{ fontSize: "36px", lineHeight: "1" }}>
                    {(loyaltyData.availablePoints || 0).toLocaleString("vi-VN")}
                  </span>
                  <span className="text-muted fw-bold pb-1">điểm</span>
                </div>
                
                {loyaltyData.nextTierCode ? (
                  <div>
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Tiến trình lên hạng <strong style={{ color: loyaltyData.nextTierColor || "#DAA520" }}>{loyaltyData.nextTierName}</strong></span>
                    </div>
                    <div className="progress rounded-pill bg-light border" style={{ height: "8px" }}>
                      <div 
                        className="progress-bar rounded-pill" 
                        style={{ 
                          width: `${Math.min(100, Math.round(((loyaltyData.availablePoints || 0) / Math.max(1, Math.ceil(loyaltyData.nextTierMinSpending / 1000))) * 100))}%`, 
                          backgroundColor: loyaltyData.currentTierColor || "#c67c4e" 
                        }}
                      ></div>
                    </div>
                    <div className="text-muted mt-2" style={{ fontSize: "12px" }}>
                      Còn <strong className="text-danger">{Math.max(0, Math.ceil((loyaltyData.nextTierMinSpending || 0) / 1000) - (loyaltyData.availablePoints || 0)).toLocaleString("vi-VN")}</strong> điểm nữa để thăng hạng
                    </div>
                  </div>
                ) : (
                  <div className="text-success fw-bold small mt-2">
                    <i className="fa-solid fa-medal me-2"></i>Bạn đã đạt hạng cao nhất!
                  </div>
                )}
              </div>
            ) : (
              <div className="py-3">
                <p className="text-muted mb-3">Đăng nhập để xem điểm tích lũy và hạng thành viên của bạn.</p>
                <Link to="/login" className="btn btn-outline-success rounded-pill px-4 fw-bold">Đăng nhập ngay</Link>
              </div>
            )}
          </div>

          <div className="col-lg-6 d-flex flex-column justify-content-center">
            {loading ? (
              // Skeleton Frame
              <div className="row g-3 mb-4 placeholder-glow">
                <div className="col-6">
                  <div className="bg-white rounded-4 p-3 text-center border border-success border-opacity-25 h-100 shadow-sm d-flex flex-column align-items-center">
                    <div className="placeholder bg-secondary rounded-circle mb-3" style={{ width: "50px", height: "50px" }}></div>
                    <div className="placeholder col-8 bg-secondary rounded mb-2"></div>
                    <div className="placeholder col-6 bg-secondary rounded"></div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white rounded-4 p-3 text-center border border-warning border-opacity-25 h-100 shadow-sm d-flex flex-column align-items-center">
                    <div className="placeholder bg-secondary rounded-circle mb-3" style={{ width: "50px", height: "50px" }}></div>
                    <div className="placeholder col-8 bg-secondary rounded mb-2"></div>
                    <div className="placeholder col-6 bg-secondary rounded"></div>
                  </div>
                </div>
              </div>
            ) : loyaltyData ? (
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <button onClick={() => navigate('/loyalty/rewards')} className="btn w-100 bg-white rounded-4 p-3 text-center border border-success border-opacity-25 h-100 shadow-sm d-flex flex-column align-items-center hover-lift transition-all">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: "50px", height: "50px", backgroundColor: "#e8f5e9", color: "#4caf50" }}>
                      <i className="fa-solid fa-gift fs-4"></i>
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>Đổi thưởng</div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>Dùng điểm đổi ưu đãi</div>
                  </button>
                </div>
                <div className="col-6">
                  <button onClick={() => navigate('/profile/vouchers')} className="btn w-100 bg-white rounded-4 p-3 text-center border border-warning border-opacity-25 h-100 shadow-sm d-flex flex-column align-items-center hover-lift transition-all">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: "50px", height: "50px", backgroundColor: "#fff8e1", color: "#ffb300" }}>
                      <i className="fa-solid fa-ticket fs-4"></i>
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>Kho Voucher</div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>Xem voucher của bạn</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-3 mb-4 opacity-50">
                <div className="col-6">
                  <div className="bg-white rounded-4 p-3 text-center border border-success border-opacity-25 h-100 shadow-sm d-flex flex-column align-items-center">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: "50px", height: "50px", backgroundColor: "#e8f5e9", color: "#4caf50" }}>
                      <i className="fa-solid fa-gift fs-4"></i>
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>Đổi thưởng</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white rounded-4 p-3 text-center border border-warning border-opacity-25 h-100 shadow-sm d-flex flex-column align-items-center">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: "50px", height: "50px", backgroundColor: "#fff8e1", color: "#ffb300" }}>
                      <i className="fa-solid fa-ticket fs-4"></i>
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>Kho Voucher</div>
                  </div>
                </div>
              </div>
            )}
            
            <Link to="/profile?tab=loyalty" className={`btn btn-outline-success rounded-pill w-100 fw-bold py-2 text-uppercase ${!loyaltyData ? 'disabled' : ''}`}>
              Xem chi tiết Loyalty
            </Link>
          </div>
        </div>
      </div>
      
      <style>{`
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
        }
      `}</style>
    </div>
  );
}

export default LoyaltySummary;
