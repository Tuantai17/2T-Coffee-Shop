import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import UserLayout from "../../layouts/UserLayout";
import loyaltyApi from "../../api/loyaltyApi";
import "../../styles/voucher-loyalty.css";

const getTypeLabel = (type) => {
  switch (type) {
    case "FIXED_AMOUNT": return "Giảm tiền";
    case "PERCENTAGE": return "Giảm %";
    case "FREE_SHIPPING": return "Freeship";
    case "FREE_ITEM": return "Quà tặng";
    default: return type;
  }
};

const getVoucherImage = (reward) => {
  if (reward.imageUrl) return reward.imageUrl;
  if (reward.type === "FREE_SHIPPING") return "/vouchers/freeship.jpg";
  if (reward.pointsRequired === 0) return "/vouchers/coupon.png";
  return "/vouchers/voucher.png";
};

function LoyaltyRewardsPage() {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [preview, setPreview] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [rewardRes, accountRes] = await Promise.all([
          loyaltyApi.getRewards(),
          loyaltyApi.getMyLoyaltyAccount(),
        ]);
        setRewards(Array.isArray(rewardRes?.data) ? rewardRes.data : []);
        setAccount(accountRes?.data || null);
      } catch (error) { console.error(error);
        toast.error("Không tải được dữ liệu đổi thưởng");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openPreview = async (reward) => {
    try {
      const response = await loyaltyApi.previewReward(reward.id);
      setPreview({ ...response.data, card: reward });
    } catch (error) { console.error(error);
      toast.error(error?.response?.data?.message || "Không xem trước được reward");
    }
  };

  const handleRedeem = async () => {
    if (!preview) return;
    try {
      setRedeeming(true);
      const response = await loyaltyApi.redeemReward(preview.rewardId);
      navigate("/loyalty/rewards/success", {
        state: {
          reward: preview.card,
          voucher: response?.data,
        },
      });
    } catch (error) { console.error(error);
      toast.error(error?.response?.data?.message || "Đổi thưởng thất bại");
    } finally {
      setRedeeming(false);
    }
  };

  const visibleRewards = rewards.filter((reward) => {
    const q = search.trim().toLowerCase();
    const hitSearch = !q || [reward.name, reward.code, reward.description].some((value) => String(value || "").toLowerCase().includes(q));
    const hitType = !typeFilter || reward.type === typeFilter;
    return hitSearch && hitType;
  });

  return (
    <UserLayout>
      <div style={{ background: "#faf8f4", minHeight: "100vh", padding: "24px 0 56px" }}>
        <div className="container">
          <div className="vl-card p-3 p-md-4 mb-4 vl-reward-hero">
            <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
              <div>
                <div className="text-uppercase small text-muted mb-2">Ưu đãi Loyalty</div>
                <h2 className="mb-1" style={{ fontWeight: 800, color: "#3f281b" }}>Đổi thưởng</h2>
                <div className="text-muted">Đổi điểm lấy voucher và ưu đãi phù hợp với hạng thành viên của bạn.</div>
              </div>
              <div className="d-flex gap-3 flex-wrap">
                <RewardPill label="Điểm hiện tại" value={`${Number(account?.availablePoints || 0).toLocaleString("vi-VN")} điểm`} />
                <RewardPill label="Hạng" value={account?.currentTierCode || "MEMBER"} />
              </div>
            </div>
          </div>

          <div className="vl-card p-3 p-md-4 mb-4">
            <div className="row g-3">
              <div className="col-lg-6">
                <input className="form-control vl-filter-input" placeholder="Tìm reward, mã ưu đãi..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="col-lg-3">
                <select className="form-select vl-filter-select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">Tất cả loại</option>
                  <option value="FIXED_AMOUNT">Giảm tiền</option>
                  <option value="PERCENTAGE">Giảm %</option>
                  <option value="FREE_SHIPPING">Freeship</option>
                  <option value="FREE_ITEM">Quà tặng</option>
                </select>
              </div>
              <div className="col-lg-3 d-flex align-items-center justify-content-lg-end text-muted small">
                <strong>{visibleRewards.length}</strong> &nbsp;reward khả dụng
              </div>
            </div>
          </div>

          <div className="row g-4">
            {loading ? (
              <div className="col-12">
                <div className="vl-card vl-empty-state">Đang tải reward...</div>
              </div>
            ) : visibleRewards.length === 0 ? (
              <div className="col-12">
                <div className="vl-card vl-empty-state">Chưa có reward phù hợp với bộ lọc hiện tại.</div>
              </div>
            ) : (
              <>
                {visibleRewards.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((reward) => (
                  <div className="col-md-6 col-lg-4 col-xl-3" key={reward.id}>
                    <div className="vl-ticket p-3 h-100 d-flex flex-column vl-hover-rise">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`vl-chip ${reward.tag === "HOT" ? "danger" : reward.tag === "LIMITED" ? "warning" : "success"}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                        {reward.tag || "NEW"}
                      </span>
                      <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '11px' }}>{getTypeLabel(reward.type)}</div>
                    </div>
                    <div className="text-center mb-2">
                      <div className="mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(148,108,76,0.1)' }}>
                        <img src={getVoucherImage(reward)} alt={reward.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="fw-bold mb-1" style={{ fontSize: '1rem' }}>{reward.name}</div>
                      <div className="text-muted vl-text-truncate-2" style={{ fontSize: '12px', minHeight: "36px" }}>{reward.description}</div>
                    </div>
                    
                    <div className="border-top border-dashed my-2 opacity-25" style={{ borderTopStyle: 'dashed' }}></div>
                    
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                      <span className="text-muted">Cần:</span>
                      <strong style={{ color: "#a65d2a" }}>{Number(reward.pointsRequired || 0).toLocaleString("vi-VN")} điểm</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                      <span className="text-muted">Đơn tối thiểu:</span>
                      <strong>{Number(reward.minOrderValue || 0).toLocaleString("vi-VN")}đ</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-3" style={{ fontSize: '13px' }}>
                      <span className="text-muted">HSD:</span>
                      <strong>{String(reward.validTo || "").slice(0, 10) || "--"}</strong>
                    </div>
                    <button className="btn vl-primary-btn mt-auto py-1 w-100 text-uppercase" style={{ fontSize: '13px', minHeight: '36px' }} disabled={!reward.canRedeem} onClick={() => openPreview(reward)}>
                      {reward.canRedeem 
                        ? (reward.pointsRequired === 0 ? "Lưu mã" : "Đổi ngay") 
                        : (reward.tierEligible === false 
                            ? "Chưa đủ hạng " + (reward.requiredTierCode || "") 
                            : "Không đủ điểm")}
                      </button>
                    </div>
                  </div>
                ))}
                
                {Math.ceil(visibleRewards.length / ITEMS_PER_PAGE) > 1 && (
                  <div className="col-12 mt-4 d-flex justify-content-center">
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-outline-secondary rounded-pill px-4" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                      >
                        Trước
                      </button>
                      <div className="d-flex align-items-center fw-bold" style={{ color: "#a65d2a" }}>
                        Trang {currentPage} / {Math.ceil(visibleRewards.length / ITEMS_PER_PAGE)}
                      </div>
                      <button 
                        className="btn btn-outline-secondary rounded-pill px-4" 
                        disabled={currentPage === Math.ceil(visibleRewards.length / ITEMS_PER_PAGE)}
                        onClick={() => setCurrentPage(p => p + 1)}
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {preview && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setPreview(null)}></div>
          <div className="modal fade show d-block vl-bottom-sheet-mobile" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered vl-bottom-sheet-mobile">
              <div className="modal-content border-0 vl-card p-3 vl-confirm-sheet">
                <div className="modal-body">
                  <div className="text-center mb-4">
                    <div className="small text-muted mb-2 text-uppercase fw-bold">Xác nhận đổi thưởng</div>
                    <h4 className="mb-2" style={{ fontWeight: 800, color: "#3f281b" }}>{preview.rewardName}</h4>
                    <div className="text-muted">{preview.discountLabel}</div>
                  </div>
                  <div className="vl-soft-panel p-3 mb-3">
                    <div className="d-flex justify-content-between small mb-2"><span className="text-muted">Điểm hiện tại</span><strong>{Number(preview.currentPoints || 0).toLocaleString("vi-VN")} điểm</strong></div>
                    <div className="d-flex justify-content-between small mb-2"><span className="text-muted">Điểm sử dụng</span><strong style={{ color: "#d64545" }}>{Number(preview.requiredPoints || 0).toLocaleString("vi-VN")} điểm</strong></div>
                    <div className="border-top border-dashed my-2 opacity-25" style={{ borderTopStyle: 'dashed' }}></div>
                    <div className="d-flex justify-content-between small"><span className="text-muted">Điểm còn lại</span><strong style={{ color: "#2d9b59" }}>{Number(preview.remainingPoints || 0).toLocaleString("vi-VN")} điểm</strong></div>
                  </div>
                  <div className="small text-muted mb-4 text-center">
                    Voucher sẽ được cấp vào ví của bạn sau khi xác nhận thành công.
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn vl-secondary-btn flex-grow-1 py-3 text-uppercase" onClick={() => setPreview(null)}>Hủy</button>
                    <button className="btn vl-primary-btn flex-grow-1 py-3 text-uppercase" disabled={redeeming} onClick={handleRedeem}>
                      {redeeming ? "Đang xử lý..." : "Xác nhận đổi"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </UserLayout>
  );
}

function RewardPill({ label, value }) {
  return (
    <div className="vl-soft-panel px-3 py-2">
      <div className="small text-muted">{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

export default LoyaltyRewardsPage;
