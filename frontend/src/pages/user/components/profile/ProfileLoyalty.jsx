import React from 'react';

function ProfileLoyalty({ profile }) {
  // Use real data from profile
  const currentPoints = profile?.loyaltyPoints || 0;
  
  const nextTierPoints = currentPoints < 3000 ? 3000 : (currentPoints < 10000 ? 10000 : currentPoints);
  const pointsToNextTier = nextTierPoints > currentPoints ? nextTierPoints - currentPoints : 0;
  const progressPercent = nextTierPoints > 0 ? Math.min(100, Math.round((currentPoints / nextTierPoints) * 100)) : 100;
  
  let currentTier = "NEW MEMBER";
  let tierImage = "/images/bronze-medal.png";
  let nextTierName = "SILVER";
  if (currentPoints >= 10000) {
    currentTier = "DIAMOND";
    tierImage = "/images/diamond-medal.png";
    nextTierName = "VVIP";
  } else if (currentPoints >= 3000) {
    currentTier = "GOLD";
    tierImage = "/images/gold-medal.png";
    nextTierName = "DIAMOND";
  } else if (currentPoints >= 1000) {
    currentTier = "SILVER";
    tierImage = "/images/silver-medal.png";
    nextTierName = "GOLD";
  }

  return (
    <div className="profile-loyalty fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-uppercase" style={{ letterSpacing: "1px" }}>LOYALTY - HỘI VIÊN</h4>
          <p className="text-muted mb-0 small">Tích điểm - Lên hạng - Đổi quà cực hấp dẫn</p>
        </div>
        <button className="btn btn-outline-secondary rounded-pill btn-sm fw-medium px-3">
          <i className="fa-regular fa-circle-question me-2"></i> Quy tắc chương trình <i className="fa-solid fa-chevron-right ms-1" style={{fontSize: "10px"}}></i>
        </button>
      </div>

      {/* Hero Card - Sử dụng dữ liệu thực */}
      <div className="card border-0 rounded-4 p-4 mb-4 bg-white shadow-sm hover-lift transition-all">
        <div className="row align-items-center">
          
          <div className="col-md-4 border-end border-light px-4">
            <div className="text-muted small fw-bold mb-3 text-uppercase">Hạng thành viên hiện tại</div>
            <div className="d-flex align-items-center gap-4">
              <img src={tierImage} alt="Tier" style={{ width: "80px", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.15))" }} onError={(e) => e.target.style.display = 'none'} />
              <div>
                <div className="fw-black text-dark" style={{ fontSize: "28px", letterSpacing: "1px" }}>{currentTier}</div>
                <div className="text-muted small">Cảm ơn bạn đã đồng hành cùng <br/> <strong className="text-dark">Brew Moments</strong> <i className="fa-solid fa-heart text-danger"></i></div>
              </div>
            </div>
          </div>

          <div className="col-md-3 border-end border-light px-4 text-center">
            <div className="text-muted small fw-bold mb-2 text-uppercase">Điểm hiện có</div>
            <div className="d-flex justify-content-center align-items-center gap-2">
              <span className="fw-black text-danger" style={{ fontSize: "40px" }}>{currentPoints.toLocaleString("vi-VN")}</span>
              <span className="text-muted fw-bold">điểm</span>
              <div className="bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center border border-warning shadow-sm" style={{ width: "24px", height: "24px" }}>
                <i className="fa-solid fa-star" style={{ fontSize: "10px" }}></i>
              </div>
            </div>
          </div>

          <div className="col-md-5 px-4">
            <div className="d-flex align-items-start gap-4">
              <div className="flex-grow-1">
                <div className="text-muted small fw-bold mb-2 text-uppercase">Tiến trình lên hạng <span className="text-warning">{nextTierName}</span></div>
                
                {pointsToNextTier > 0 ? (
                  <>
                    <div className="text-dark fw-bold mb-3 small">Còn <span className="text-danger">{pointsToNextTier.toLocaleString("vi-VN")}</span> điểm nữa để lên hạng <span className="text-warning">{nextTierName}</span></div>
                    <div className="progress rounded-pill bg-light border mb-2" style={{ height: "10px" }}>
                      <div className="progress-bar rounded-pill progress-glow" style={{ width: `${progressPercent}%`, backgroundColor: "#c67c4e" }}></div>
                    </div>
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: "10px" }}>
                      <div>
                        <div className="fw-bold text-dark">{currentTier}</div>
                        <div>{currentPoints.toLocaleString("vi-VN")} điểm</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-warning">{nextTierName}</div>
                        <div>{nextTierPoints.toLocaleString("vi-VN")} điểm</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-success fw-bold mt-2">
                    <i className="fa-solid fa-medal me-2"></i>Bạn đã đạt hạng cao nhất!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Current Benefits (Thông tin tĩnh hệ thống) */}
        <div className="col-lg-5">
          <div className="card border-0 rounded-4 p-4 h-100 bg-white shadow-sm hover-lift transition-all">
            <h6 className="fw-bold mb-4 text-uppercase small">Quyền lợi hạng hiện tại</h6>
            <div className="row g-3 text-center">
              {[
                { icon: 'fa-star', text: 'Nhân đôi điểm vào thứ 3' },
                { icon: 'fa-percent', text: 'Giảm 15% đồ uống' },
                { icon: 'fa-gift', text: 'Quà tặng sinh nhật' },
                { icon: 'fa-crown', text: 'Ưu đãi riêng hội viên' },
                { icon: 'fa-ticket', text: 'Tham gia sự kiện VIP' }
              ].map((benefit, i) => (
                <div className="col-4" key={i}>
                  <div className="d-flex flex-column align-items-center">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: "48px", height: "48px", backgroundColor: "#fdf2e9", color: "#c67c4e", border: "1px solid #f5e0d3" }}>
                      <i className={`fa-solid ${benefit.icon} fs-5`}></i>
                    </div>
                    <span className="text-muted fw-medium" style={{ fontSize: "10px", lineHeight: "1.2" }}>{benefit.text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-4 text-center">
              <button className="btn btn-outline-danger btn-sm rounded-pill px-4 fw-medium">Xem chi tiết chính sách</button>
            </div>
          </div>
        </div>

        {/* All Tiers (Thông tin tĩnh hệ thống) */}
        <div className="col-lg-7">
          <div className="card border-0 rounded-4 p-4 h-100 bg-white shadow-sm hover-lift transition-all">
            <h6 className="fw-bold mb-4 text-uppercase small">Các hạng thành viên</h6>
            <div className="d-flex justify-content-between align-items-center mb-4 position-relative px-3 pt-4">
              
              <div className="position-absolute bg-light" style={{ height: "4px", width: "80%", left: "10%", top: "45%", zIndex: 0 }}></div>
              
              {[
                { name: 'SILVER', points: '0 - 2,999 điểm', benefits: '5 quyền lợi', img: '/images/silver-medal.png', active: currentTier === "SILVER" },
                { name: 'GOLD', points: '3,000 - 9,999 điểm', benefits: '8 quyền lợi', img: '/images/gold-medal.png', active: currentTier === "GOLD" },
                { name: 'PLATINUM', points: '10,000 - 14,999 điểm', benefits: '12 quyền lợi', img: '/images/platinum-medal.png', active: currentTier === "PLATINUM" },
                { name: 'DIAMOND', points: '15,000+ điểm', benefits: '15 quyền lợi', img: '/images/diamond-medal.png', active: currentTier === "DIAMOND" }
              ].map((tier, i) => (
                <div className="position-relative z-1 text-center" key={i}>
                  {tier.active && (
                    <div className="position-absolute bg-danger text-white rounded-pill px-2 py-1 shadow-sm" style={{ fontSize: "9px", top: "-25px", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
                      Bạn đang ở đây
                    </div>
                  )}
                  <div className={`card ${tier.active ? 'border-warning shadow' : 'border-light shadow-sm'} rounded-4 p-3 bg-white`} style={{ width: "120px", transform: tier.active ? "scale(1.1)" : "scale(1)", transition: "all 0.3s" }}>
                    <img src={tier.img} alt={tier.name} className="mx-auto mb-2" style={{ width: "40px" }} onError={(e) => e.target.style.display = 'none'} />
                    <div className="fw-bold text-dark mb-1" style={{ fontSize: "11px" }}>{tier.name}</div>
                    <div className="text-muted" style={{ fontSize: "9px" }}>{tier.points}</div>
                    <div className="text-primary fw-medium" style={{ fontSize: "9px" }}>{tier.benefits}</div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
      
      {/* Tính năng đang phát triển */}
      <div className="card border-0 rounded-4 p-5 mb-4 bg-white shadow-sm text-center">
        <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3" style={{ width: "60px", height: "60px" }}>
          <i className="fa-solid fa-code text-muted fs-3"></i>
        </div>
        <h5 className="fw-bold">Các tính năng đang được phát triển</h5>
        <p className="text-muted small">Cửa hàng đổi quà, Lịch sử điểm và Nhiệm vụ hàng ngày sẽ sớm được ra mắt trong phiên bản tiếp theo.</p>
      </div>

      {/* Footer Rules */}
      <div className="card border-0 rounded-4 p-4 bg-white shadow-sm d-flex flex-row justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <i className="fa-solid fa-coins text-warning fs-3"></i>
          <div>
            <div className="fw-bold text-dark small">1,000đ = 1 điểm</div>
            <div className="text-muted" style={{ fontSize: "11px" }}>100 điểm = 10.000đ</div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <i className="fa-regular fa-calendar text-primary fs-3"></i>
          <div>
            <div className="fw-bold text-dark small">Điểm tích lũy có hiệu lực</div>
            <div className="text-muted" style={{ fontSize: "11px" }}>12 tháng kể từ ngày nhận</div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <i className="fa-solid fa-gift text-danger fs-3"></i>
          <div>
            <div className="fw-bold text-dark small">Sử dụng điểm để đổi voucher</div>
            <div className="text-muted" style={{ fontSize: "11px" }}>và các phần quà hấp dẫn</div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <i className="fa-regular fa-circle-question text-secondary fs-3"></i>
          <div>
            <div className="fw-bold text-dark small">Mọi thắc mắc liên hệ</div>
            <div className="text-muted" style={{ fontSize: "11px" }}>1900 1234 (8:00 - 22:00)</div>
          </div>
        </div>
      </div>

      <style>{`
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
        }
        .fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .progress-glow {
          box-shadow: 0 0 10px rgba(198, 124, 78, 0.5);
        }
      `}</style>
    </div>
  );
}

export default ProfileLoyalty;
