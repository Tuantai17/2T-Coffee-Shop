import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loyaltyApi from '../../../../api/loyaltyApi';

function ProfileLoyalty() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [claimStatus, setClaimStatus] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    if (transactions.length === 0) {
      try {
        setLoadingTransactions(true);
        const res = await loyaltyApi.getMyTransactions();
        setTransactions(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load transactions", error);
      } finally {
        setLoadingTransactions(false);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [accountRes, tiersRes, claimRes] = await Promise.all([
          loyaltyApi.getMyLoyaltyAccount(),
          loyaltyApi.getTiers(),
          loyaltyApi.getClaimStatus()
        ]);
        setAccount(accountRes?.data || null);
        setTiers(Array.isArray(tiersRes?.data) ? tiersRes.data : []);
        setClaimStatus(claimRes?.data?.claimedThisMonth || false);
      } catch (error) {
        console.error("Failed to load loyalty data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleClaimBenefits = async () => {
    if (claiming) return;
    try {
      setClaiming(true);
      await loyaltyApi.claimBenefits();
      setClaimStatus(true);
      alert("Nhận quyền lợi tháng thành công! Các voucher đã được thêm vào Kho Voucher của bạn.");
    } catch (error) {
      alert(error?.response?.data?.error || "Có lỗi xảy ra khi nhận quyền lợi");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loyalty fade-in text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Đang tải thông tin hội viên...</p>
      </div>
    );
  }

  // Data from API
  const currentPoints = account?.availablePoints || 0;
  const currentTierCode = account?.currentTierCode || "SILVER";
  const currentTierName = account?.currentTierName || currentTierCode;
  const currentTierColor = account?.currentTierColor || "#C0C0C0";
  const nextTierCode = account?.nextTierCode || null;
  const nextTierName = account?.nextTierName || null;
  const nextTierColor = account?.nextTierColor || null;
  const nextTierMinSpending = account?.nextTierMinSpending || 0;
  const lifetimeEarned = account?.lifetimeEarnedPoints || 0;

  // Progress calculation: 1 point = 1,000đ spending, so nextTierMinSpending in VND
  // Points needed = nextTierMinSpending / 1000 (convert spending to points)
  const nextTierPointsNeeded = nextTierMinSpending > 0 ? Math.ceil(nextTierMinSpending / 1000) : 0;
  const pointsToNextTier = nextTierCode ? Math.max(0, nextTierPointsNeeded - currentPoints) : 0;
  const progressPercent = nextTierPointsNeeded > 0
    ? Math.min(100, Math.round((currentPoints / nextTierPointsNeeded) * 100))
    : 100;

  // Find current tier in tiers list for benefits
  const currentTierData = tiers.find(t => t.code?.toUpperCase() === currentTierCode?.toUpperCase());
  const currentBenefits = currentTierData?.benefits || [];

  // Map benefit icons
  const benefitIconMap = {
    'Điểm danh': 'fa-calendar-check',
    'Quay thưởng': 'fa-dice',
    'Voucher lên hạng': 'fa-arrow-up',
    'Voucher sinh nhật': 'fa-gift',
    'Freeship': 'fa-truck',
    'Hỗ trợ ưu tiên': 'fa-headset',
  };

  const getBenefitIcon = (text) => {
    for (const [key, icon] of Object.entries(benefitIconMap)) {
      if (text.includes(key)) return icon;
    }
    return 'fa-star';
  };

  // Tier medal images
  const getTierImage = (code) => {
    const c = (code || '').toUpperCase();
    if (c === 'DIAMOND') return '/images/diamond-medal.png';
    if (c === 'PLATINUM') return '/images/platinum-medal.png';
    if (c === 'GOLD') return '/images/gold-medal.png';
    return '/images/silver-medal.png';
  };

  return (
    <div className="profile-loyalty fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1 text-uppercase" style={{ letterSpacing: "1px" }}>LOYALTY - HỘI VIÊN</h4>
          <p className="text-muted mb-0 small">Tích điểm - Lên hạng - Đổi quà cực hấp dẫn</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary rounded-pill btn-sm fw-medium px-3"
            onClick={() => setShowRulesModal(true)}
          >
            <i className="fa-regular fa-circle-question me-2"></i> Quy tắc chương trình
          </button>
          <button
            className="btn btn-outline-danger rounded-pill btn-sm fw-medium px-3"
            onClick={() => navigate('/loyalty/rewards')}
          >
            <i className="fa-solid fa-gift me-2"></i> Đổi thưởng <i className="fa-solid fa-chevron-right ms-1" style={{fontSize: "10px"}}></i>
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="card border-0 rounded-4 p-4 mb-4 bg-white shadow-sm hover-lift transition-all">
        <div className="row align-items-center">
          
          {/* Current Tier */}
          <div className="col-md-4 border-end border-light px-4">
            <div className="text-muted small fw-bold mb-3 text-uppercase">Hạng thành viên hiện tại</div>
            <div className="d-flex align-items-center gap-4">
              <img 
                src={getTierImage(currentTierCode)} 
                alt={currentTierName} 
                style={{ width: "80px", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.15))" }} 
                onError={(e) => e.target.style.display = 'none'} 
              />
              <div>
                <div className="fw-black text-dark" style={{ fontSize: "28px", letterSpacing: "1px", color: currentTierColor }}>
                  {currentTierName?.toUpperCase()}
                </div>
                <div className="text-muted small">
                  Cảm ơn bạn đã đồng hành cùng <br/> 
                  <strong className="text-dark">Brew Moments</strong> <i className="fa-solid fa-heart text-danger"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Available Points */}
          <div className="col-md-3 border-end border-light px-4 text-center">
            <div className="text-muted small fw-bold mb-2 text-uppercase">Điểm hiện có</div>
            <div className="d-flex justify-content-center align-items-center gap-2">
              <span className="fw-black text-danger" style={{ fontSize: "40px" }}>
                {currentPoints.toLocaleString("vi-VN")}
              </span>
              <span className="text-muted fw-bold">điểm</span>
              <div className="bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center border border-warning shadow-sm" style={{ width: "24px", height: "24px" }}>
                <i className="fa-solid fa-star" style={{ fontSize: "10px" }}></i>
              </div>
            </div>
            <div className="text-muted mt-1" style={{ fontSize: "11px" }}>
              ≈ {currentPoints.toLocaleString("vi-VN")}đ giá trị
            </div>
          </div>

          {/* Progress to Next Tier */}
          <div className="col-md-5 px-4">
            <div className="d-flex align-items-start gap-4">
              <div className="flex-grow-1">
                {nextTierCode ? (
                  <>
                    <div className="text-muted small fw-bold mb-2 text-uppercase">
                      Tiến trình lên hạng <span style={{ color: nextTierColor || "#DAA520" }}>{nextTierName?.toUpperCase()}</span>
                    </div>
                    <div className="text-dark fw-bold mb-3 small">
                      Còn <span className="text-danger">{pointsToNextTier.toLocaleString("vi-VN")}</span> điểm nữa để lên hạng{' '}
                      <span style={{ color: nextTierColor || "#DAA520" }}>{nextTierName?.toUpperCase()}</span>
                    </div>
                    <div className="progress rounded-pill bg-light border mb-2" style={{ height: "10px" }}>
                      <div 
                        className="progress-bar rounded-pill progress-glow" 
                        style={{ width: `${progressPercent}%`, backgroundColor: currentTierColor || "#c67c4e" }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: "10px" }}>
                      <div>
                        <div className="fw-bold text-dark">{currentTierName?.toUpperCase()}</div>
                        <div>{currentPoints.toLocaleString("vi-VN")} điểm</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold" style={{ color: nextTierColor || "#DAA520" }}>{nextTierName?.toUpperCase()}</div>
                        <div>{nextTierPointsNeeded.toLocaleString("vi-VN")} điểm</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-3">
                    <div className="text-muted small fw-bold mb-2 text-uppercase">Tiến trình lên hạng</div>
                    <div className="text-success fw-bold mt-2">
                      <i className="fa-solid fa-medal me-2"></i>Bạn đã đạt hạng cao nhất!
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Current Tier Benefits - from API */}
        <div className="col-lg-5">
          <div className="card border-0 rounded-4 p-4 h-100 bg-white shadow-sm hover-lift transition-all">
            <h6 className="fw-bold mb-4 text-uppercase small">
              Quyền lợi hạng {currentTierName?.toUpperCase() || "hiện tại"}
            </h6>
            {currentBenefits.length > 0 ? (
              <div className="row g-3 text-center">
                {currentBenefits.map((benefit, i) => (
                  <div className="col-4" key={i}>
                    <div className="d-flex flex-column align-items-center">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center mb-2" 
                        style={{ 
                          width: "48px", height: "48px", 
                          backgroundColor: (currentTierColor || "#c67c4e") + "15",
                          color: currentTierColor || "#c67c4e",
                          border: `1px solid ${(currentTierColor || "#c67c4e")}30`
                        }}
                      >
                        <i className={`fa-solid ${getBenefitIcon(benefit)} fs-5`}></i>
                      </div>
                      <span className="text-muted fw-medium" style={{ fontSize: "10px", lineHeight: "1.2" }}>
                        {benefit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted py-4">
                <i className="fa-solid fa-info-circle me-2"></i>
                Chưa có thông tin quyền lợi
              </div>
            )}
            
            <div className="mt-4 pt-3 border-top text-center">
              <button 
                className={`btn rounded-pill px-4 py-2 fw-bold ${claimStatus ? 'btn-secondary' : 'btn-danger'}`}
                onClick={handleClaimBenefits}
                disabled={claimStatus || claiming}
                style={{
                  backgroundColor: claimStatus ? '#6c757d' : (currentTierColor || '#dc3545'),
                  borderColor: claimStatus ? '#6c757d' : (currentTierColor || '#dc3545')
                }}
              >
                {claiming ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xử lý...</>
                ) : claimStatus ? (
                  <><i className="fa-solid fa-check-circle me-2"></i> Đã nhận quyền lợi tháng này</>
                ) : (
                  <><i className="fa-solid fa-gift me-2"></i> Nhận quyền lợi tháng này</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* All Tiers - from API */}
        <div className="col-lg-7">
          <div className="card border-0 rounded-4 p-4 h-100 bg-white shadow-sm hover-lift transition-all">
            <h6 className="fw-bold mb-4 text-uppercase small">Các hạng thành viên</h6>
            {tiers.length > 0 ? (
              <div className="d-flex justify-content-between align-items-center mb-4 position-relative px-3 pt-4">
                {/* Connecting line */}
                <div className="position-absolute bg-light" style={{ height: "4px", width: "80%", left: "10%", top: "45%", zIndex: 0 }}></div>
                
                {tiers.map((tier, i) => {
                  const isActive = tier.code?.toUpperCase() === currentTierCode?.toUpperCase();
                  const tierColor = tier.color || "#cccccc";
                  const minSpending = tier.minimumEligibleSpending || 0;
                  const pointsEquivalent = Math.ceil(minSpending / 1000);
                  
                  return (
                    <div className="position-relative z-1 text-center" key={i}>
                      {isActive && (
                        <div 
                          className="position-absolute text-white rounded-pill px-2 py-1 shadow-sm" 
                          style={{ 
                            fontSize: "9px", top: "-25px", left: "50%", 
                            transform: "translateX(-50%)", whiteSpace: "nowrap",
                            backgroundColor: tierColor
                          }}
                        >
                          Bạn đang ở đây
                        </div>
                      )}
                      <div 
                        className={`card ${isActive ? 'shadow' : 'border-light shadow-sm'} rounded-4 p-3 bg-white`} 
                        style={{ 
                          width: "120px", 
                          transform: isActive ? "scale(1.1)" : "scale(1)", 
                          transition: "all 0.3s",
                          borderColor: isActive ? tierColor : undefined,
                          borderWidth: isActive ? "2px" : "1px",
                          borderStyle: "solid"
                        }}
                      >
                        <img 
                          src={getTierImage(tier.code)} 
                          alt={tier.name} 
                          className="mx-auto mb-2" 
                          style={{ width: "40px" }} 
                          onError={(e) => e.target.style.display = 'none'} 
                        />
                        <div className="fw-bold text-dark mb-1" style={{ fontSize: "11px", color: tierColor }}>
                          {tier.name?.toUpperCase()}
                        </div>
                        <div className="text-muted" style={{ fontSize: "9px" }}>
                          Từ {pointsEquivalent.toLocaleString("vi-VN")} điểm
                        </div>
                        <div className="fw-medium" style={{ fontSize: "9px", color: tierColor }}>
                          {tier.benefits?.length || 0} quyền lợi
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted py-4">
                <i className="fa-solid fa-info-circle me-2"></i>
                Chưa có thông tin hạng thành viên
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <button 
            className="btn w-100 border-0 rounded-4 p-4 h-100 bg-white shadow-sm hover-lift transition-all text-start"
            onClick={() => navigate('/loyalty/rewards')}
          >
            <div className="d-flex flex-column gap-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                style={{ width: "40px", height: "40px", backgroundColor: "#fdf2e9", color: "#c67c4e" }}>
                <i className="fa-solid fa-gift fs-5"></i>
              </div>
              <div>
                <div className="fw-bold text-dark">Đổi thưởng</div>
                <div className="text-muted" style={{ fontSize: "11px" }}>Dùng điểm đổi ưu đãi</div>
              </div>
            </div>
          </button>
        </div>
        <div className="col-md-4">
          <button 
            className="btn w-100 border-0 rounded-4 p-4 h-100 bg-white shadow-sm hover-lift transition-all text-start"
            onClick={() => navigate('/profile/vouchers')}
          >
            <div className="d-flex flex-column gap-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                style={{ width: "40px", height: "40px", backgroundColor: "#e8f5e9", color: "#4caf50" }}>
                <i className="fa-solid fa-ticket fs-5"></i>
              </div>
              <div>
                <div className="fw-bold text-dark">Voucher của tôi</div>
                <div className="text-muted" style={{ fontSize: "11px" }}>Xem voucher đã đổi</div>
              </div>
            </div>
          </button>
        </div>
        <div className="col-md-4">
          <button 
            className="btn w-100 border-0 rounded-4 p-4 h-100 bg-white shadow-sm hover-lift transition-all text-start"
            onClick={handleOpenHistory}
          >
            <div className="d-flex flex-column gap-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                style={{ width: "40px", height: "40px", backgroundColor: "#e3f2fd", color: "#2196f3" }}>
                <i className="fa-solid fa-clock-rotate-left fs-5"></i>
              </div>
              <div>
                <div className="fw-bold text-dark">Lịch sử điểm</div>
                <div className="text-muted" style={{ fontSize: "11px" }}>Xem biến động điểm</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Rules */}
      <div className="card border-0 rounded-4 p-4 bg-white shadow-sm d-flex flex-row justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <i className="fa-solid fa-coins text-warning fs-3"></i>
          <div>
            <div className="fw-bold text-dark small">1.000 điểm = 1.000đ</div>
            <div className="text-muted" style={{ fontSize: "11px" }}>Quy đổi 1:1 giá trị</div>
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

      {/* History Modal */}
      {showHistoryModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowHistoryModal(false)}></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="fw-bold mb-0 text-dark">Lịch sử điểm</h5>
                  <button type="button" className="btn-close" onClick={() => setShowHistoryModal(false)}></button>
                </div>
                <div className="modal-body py-4">
                  {loadingTransactions ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-warning" role="status"></div>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <div className="mb-3"><i className="fa-solid fa-clock-rotate-left fs-1 opacity-25"></i></div>
                      <p>Bạn chưa có giao dịch điểm nào.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {transactions.map(tx => {
                        const isEarn = tx.type === 'EARN';
                        const isRedeem = tx.type === 'REDEEM' || tx.type === 'USE';
                        const isReverse = tx.type === 'REVERSE';
                        
                        // Force negative for REVERSE if backend saved it as positive
                        const displayPoints = isReverse && tx.points > 0 ? -tx.points : tx.points;
                        
                        const sign = displayPoints > 0 ? '+' : ''; 
                        const amountColor = displayPoints > 0 ? 'text-success' : (displayPoints < 0 ? 'text-danger' : 'text-muted');
                        
                        return (
                          <div key={tx.id} className="d-flex align-items-center justify-content-between border-bottom pb-3 last-no-border">
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-circle d-flex align-items-center justify-content-center bg-light flex-shrink-0" style={{ width: "40px", height: "40px" }}>
                                {isEarn && <i className="fa-solid fa-arrow-turn-up text-success"></i>}
                                {(isRedeem || isReverse) && <i className="fa-solid fa-arrow-turn-down text-danger"></i>}
                                {!isEarn && !isRedeem && !isReverse && <i className="fa-solid fa-pen-to-square text-primary"></i>}
                              </div>
                              <div>
                                <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>
                                  {tx.description || (isEarn ? 'Tích điểm' : isRedeem ? 'Đổi điểm' : isReverse ? 'Thu hồi điểm' : 'Điều chỉnh điểm')}
                                </div>
                                <div className="text-muted" style={{ fontSize: "11px" }}>
                                  {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : ''}
                                </div>
                              </div>
                            </div>
                            <div className="text-end flex-shrink-0">
                              <div className={`fw-bold ${amountColor}`} style={{ fontSize: "15px" }}>
                                {sign}{displayPoints.toLocaleString('vi-VN')}
                              </div>
                              <div className="text-muted" style={{ fontSize: "11px" }}>
                                Dư: {tx.balanceAfter != null ? tx.balanceAfter.toLocaleString('vi-VN') : '--'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowRulesModal(false)}></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header bg-light border-bottom-0">
                  <h5 className="fw-bold mb-0 text-dark">
                    <i className="fa-regular fa-circle-question me-2 text-warning"></i> 
                    Quy tắc Loyalty - Hội viên
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowRulesModal(false)}></button>
                </div>
                <div className="modal-body py-4 px-4">
                  <div className="mb-4">
                    <h6 className="fw-bold text-danger mb-2"><i className="fa-solid fa-coins me-2"></i>1. Quy định tích điểm</h6>
                    <ul className="text-muted small" style={{ lineHeight: "1.6" }}>
                      <li>Khách hàng được tích điểm cho mọi đơn hàng thành công (sau khi trừ chiết khấu và phí vận chuyển).</li>
                      <li>Tỷ lệ quy đổi tiêu chuẩn: <strong>1.000 VNĐ = 1 điểm</strong>.</li>
                      <li>Điểm được cộng vào tài khoản sau khi đơn hàng chuyển sang trạng thái "Đã hoàn thành".</li>
                      <li>Không giới hạn số điểm tối đa có thể tích lũy.</li>
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="fw-bold text-danger mb-2"><i className="fa-solid fa-gift me-2"></i>2. Sử dụng điểm</h6>
                    <ul className="text-muted small" style={{ lineHeight: "1.6" }}>
                      <li>Điểm Loyalty có giá trị quy đổi: <strong>1 điểm = 1 VNĐ</strong> (khi quy ra giá trị voucher).</li>
                      <li>Điểm có thể dùng để đổi các Voucher giảm giá, quà tặng, hoặc freeship trong Cửa hàng đổi thưởng.</li>
                      <li>Không thể quy đổi điểm thành tiền mặt hoặc chuyển nhượng cho tài khoản khác.</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold text-danger mb-2"><i className="fa-solid fa-medal me-2"></i>3. Lên hạng thành viên</h6>
                    <ul className="text-muted small" style={{ lineHeight: "1.6" }}>
                      <li>Hạng thành viên được xét duyệt dựa trên tổng số điểm tích lũy trong khoảng thời gian 12 tháng gần nhất.</li>
                      <li>Hệ thống sẽ tự động nâng hạng ngay lập tức khi bạn đạt đủ điểm yêu cầu.</li>
                      <li>Chu kỳ duy trì hạng là 12 tháng kể từ ngày lên hạng. Nếu không đủ điều kiện duy trì, hạng sẽ bị giảm vào kỳ xét duyệt kế tiếp.</li>
                    </ul>
                  </div>

                  <div>
                    <h6 className="fw-bold text-danger mb-2"><i className="fa-regular fa-calendar-xmark me-2"></i>4. Hạn sử dụng điểm</h6>
                    <ul className="text-muted small" style={{ lineHeight: "1.6" }}>
                      <li>Điểm tích lũy có thời hạn sử dụng là <strong>12 tháng</strong> kể từ tháng được cộng.</li>
                      <li>Vào ngày cuối cùng của mỗi tháng, hệ thống sẽ tự động thu hồi số điểm đã quá hạn 1 năm chưa được sử dụng.</li>
                    </ul>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-secondary rounded-pill w-100" onClick={() => setShowRulesModal(false)}>
                    Đã hiểu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .last-no-border:last-child {
          border-bottom: none !important;
          padding-bottom: 0 !important;
        }
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
      `}
      </style>
    </div>
  );
}

export default ProfileLoyalty;
