import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../../../layouts/AdminLayout";
import adminLoyaltyApi from "../../../api/adminLoyaltyApi";
import "../../../styles/voucher-loyalty.css";

function AdminLoyaltyRewards() {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [rewardRes, historyRes] = await Promise.all([
          adminLoyaltyApi.getRewards(),
          adminLoyaltyApi.getRedeemHistory(),
        ]);
        setRewards(Array.isArray(rewardRes?.data) ? rewardRes.data : []);
        setHistory(Array.isArray(historyRes?.data) ? historyRes.data : []);
      } catch (error) { console.error(error);
        toast.error("Khong tai duoc du lieu doi thuong");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredRewards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rewards.filter((reward) => !q || [reward.name, reward.voucherCode, reward.discountLabel].some((value) => String(value || "").toLowerCase().includes(q)));
  }, [rewards, search]);

  const stats = {
    total: rewards.length,
    active: rewards.filter((reward) => reward.active).length,
    totalRedeems: rewards.reduce((sum, reward) => sum + Number(reward.claimed || 0), 0),
    limited: rewards.filter((reward) => reward.remaining != null && Number(reward.remaining) <= 10).length,
  };

  return (
    <AdminLayout>
      <div className="voucher-loyalty-shell">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <div className="small text-muted mb-2">Trang chu / Loyalty / Doi thuong</div>
            <h2 className="mb-1" style={{ color: "#3f281b", fontWeight: 800 }}>Quan ly Doi thuong Loyalty</h2>
            <div className="text-muted">Reward cards, bang lich su doi thuong va drawer chi tiet giao dich/reward.</div>
          </div>
          <button className="btn vl-primary-btn px-4 py-3" onClick={() => navigate("/admin/loyalty/rewards/create")}>
            <i className="fa-solid fa-plus me-2"></i>Them phan thuong
          </button>
        </div>

        <div className="row g-3 mb-4">
          <StatCard label="Tong phan thuong" value={stats.total} />
          <StatCard label="Dang hoat dong" value={stats.active} />
          <StatCard label="Tong luot doi" value={stats.totalRedeems} />
          <StatCard label="Sap het hang" value={stats.limited} />
        </div>

        <div className="vl-card p-4 mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-lg-6">
              <input className="form-control vl-filter-input" placeholder="Tim reward, voucher code..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="col-lg-6 text-lg-end text-muted small">
              Cap nhat tu API loyalty-service, khong con du lieu mock.
            </div>
          </div>
        </div>

        <div className="row g-3 mb-4">
          {loading ? (
            <div className="col-12">
              <div className="vl-card vl-empty-state">Dang tai reward cards...</div>
            </div>
          ) : filteredRewards.length === 0 ? (
            <div className="col-12">
              <div className="vl-card vl-empty-state">Khong co reward nao phu hop.</div>
            </div>
          ) : (
            filteredRewards.map((reward) => (
              <div className="col-md-6 col-xl-3" key={reward.id}>
                <div className="vl-reward-card p-3 h-100 vl-hover-rise">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <img src={reward.image} alt={reward.name} width="58" height="58" style={{ borderRadius: 18, background: "#f9f2ea", padding: 10 }} />
                    <span className={`vl-chip ${reward.active ? "success" : "muted"}`}>{reward.active ? "Dang hoat dong" : "Tam an"}</span>
                  </div>
                  <div className="fw-bold mb-1">{reward.name}</div>
                  <div className="text-muted small mb-2">{reward.discountLabel}</div>
                  <div className="small mb-1">Ma voucher: <strong>{reward.voucherCode}</strong></div>
                  <div className="small mb-1">Diem doi: <strong>{Number(reward.pointsRequired || 0).toLocaleString("vi-VN")}</strong></div>
                  <div className="small mb-1">Hang ap dung: <strong>{reward.tier}</strong></div>
                  <div className="small mb-3">Hieu luc: {reward.validRange}</div>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="small text-muted">Da doi {reward.claimed}</span>
                    <button className="btn btn-sm vl-secondary-btn" onClick={() => setSelectedReward(reward)}>Chi tiet</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="vl-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="vl-section-title">Lich su doi thuong</div>
            <div className="small text-muted">{history.length} giao dich</div>
          </div>
          <div className="table-responsive">
            <table className="table vl-admin-table mb-0">
              <thead>
                <tr>
                  <th className="ps-3">Thanh vien</th>
                  <th>Reward</th>
                  <th>Diem dung</th>
                  <th>Ngay doi</th>
                  <th>Voucher cap</th>
                  <th>Trang thai</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="vl-empty-state">Dang tai lich su...</td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="vl-empty-state">Chua co giao dich doi thuong nao.</td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center gap-2">
                          <img src={item.avatar} alt={item.memberName} width="32" height="32" className="rounded-circle" />
                          <div>
                            <div className="fw-semibold">{item.memberName}</div>
                            <div className="small text-muted">{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{item.reward}</td>
                      <td>{Number(item.pointsUsed || 0).toLocaleString("vi-VN")}</td>
                      <td>{item.date}</td>
                      <td>{item.voucherCode || "--"}</td>
                      <td>
                        <span className={`vl-chip ${item.status === "SUCCESS" ? "success" : "danger"}`}>
                          {item.status === "SUCCESS" ? "Thanh cong" : "That bai"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedReward && (
          <>
            <div className="modal-backdrop fade show" onClick={() => setSelectedReward(null)}></div>
            <div className="position-fixed top-0 end-0 h-100 vl-drawer-responsive" style={{ width: 480, zIndex: 1055 }}>
              <div className="vl-card h-100 rounded-0 rounded-start-5 p-4 overflow-auto">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <div className="small text-muted mb-1">Chi tiet reward</div>
                    <h4 className="mb-0" style={{ fontWeight: 800 }}>{selectedReward.name}</h4>
                  </div>
                  <button className="btn-close" onClick={() => setSelectedReward(null)}></button>
                </div>
                <div className="vl-soft-panel p-3 mb-3">
                  <div className="small text-muted mb-1">Voucher duoc cap</div>
                  <div className="fw-bold">{selectedReward.voucherCode}</div>
                  <div className="small text-muted">{selectedReward.discountLabel}</div>
                </div>
                <div className="row g-3 mb-3">
                  <Metric label="Diem doi" value={selectedReward.pointsRequired} />
                  <Metric label="Da doi" value={selectedReward.claimed} />
                  <Metric label="Con lai" value={selectedReward.remaining ?? "∞"} />
                  <Metric label="Tier" value={selectedReward.tier} />
                </div>
                <div className="vl-soft-panel p-3">
                  <div className="small text-muted mb-2">Thoi gian</div>
                  <div>{selectedReward.validRange}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="col-6 col-md-6 col-xl-3">
      <div className="vl-kpi-card p-3">
        <div className="small text-muted mb-2">{label}</div>
        <div style={{ fontWeight: 800, fontSize: 30, color: "#422b1b" }}>{value}</div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="col-6">
      <div className="vl-soft-panel p-3 h-100">
        <div className="small text-muted">{label}</div>
        <div className="fw-bold">{value}</div>
      </div>
    </div>
  );
}

export default AdminLoyaltyRewards;
