import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import loyaltyApi from "../../../../api/loyaltyApi";
import "../../../../styles/voucher-loyalty.css";

const tabs = [
  { key: "ALL", label: "Tat ca" },
  { key: "AVAILABLE", label: "Co hieu luc" },
  { key: "EXPIRING", label: "Sap het han" },
  { key: "USED", label: "Da su dung" },
  { key: "EXPIRED", label: "Da het han" },
  { key: "REDEEMED", label: "Doi thuong" },
];

function ProfileVoucher() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [summaryRes, voucherRes, accountRes] = await Promise.all([
          loyaltyApi.getMyVoucherSummary(),
          loyaltyApi.getMyVouchers(),
          loyaltyApi.getMyLoyaltyAccount(),
        ]);
        setSummary(summaryRes?.data || null);
        setVouchers(Array.isArray(voucherRes?.data) ? voucherRes.data : []);
        setAccount(accountRes?.data || null);
      } catch (error) { console.error(error);
        toast.error("Khong tai duoc vi voucher");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return vouchers.filter((voucher) => {
      const q = search.trim().toLowerCase();
      const hitSearch = !q || [voucher.name, voucher.code, voucher.discountLabel].some((value) => String(value || "").toLowerCase().includes(q));
      const hitTab = activeTab === "ALL"
        || (activeTab === "EXPIRING" && voucher.expiringSoon)
        || (activeTab === "REDEEMED" && voucher.source === "REDEEMED")
        || voucher.status === activeTab;
      return hitSearch && hitTab;
    });
  }, [activeTab, search, vouchers]);

  return (
    <div className="voucher-loyalty-shell">
      <div className="vl-card p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
          <div>
            <div className="small text-muted mb-2">Kho uu dai ca nhan</div>
            <h3 className="mb-1" style={{ color: "#3f281b", fontWeight: 800 }}>Vi voucher cua toi</h3>
            <div className="text-muted">Quan ly voucher da cap, sap het han, voucher doi tu loyalty va ap dung nhanh tai checkout.</div>
          </div>
          <button className="btn vl-primary-btn px-4 py-2" onClick={() => navigate("/loyalty/rewards")}>
            Doi them reward
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <SummaryCard label="Tong voucher" value={summary?.total || 0} />
        <SummaryCard label="Co hieu luc" value={summary?.available || 0} />
        <SummaryCard label="Sap het han" value={summary?.expiringSoon || 0} />
        <SummaryCard label="Da su dung" value={summary?.used || 0} />
      </div>

      <div className="vl-card p-3 p-lg-4 mb-4">
        <div className="d-flex flex-wrap gap-2 mb-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`btn btn-sm rounded-pill px-3 ${activeTab === tab.key ? "vl-primary-btn" : "vl-secondary-btn"}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="row g-3">
          <div className="col-lg-7">
            <input className="form-control vl-filter-input" placeholder="Tim voucher..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="col-lg-5 d-flex align-items-center justify-content-lg-end text-muted small">
            Diem loyalty hien tai: <strong className="ms-2">{Number(account?.availablePoints || 0).toLocaleString("vi-VN")} diem</strong>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column gap-3">
        {loading ? (
          <div className="vl-card vl-empty-state">Dang tai voucher...</div>
        ) : filtered.length === 0 ? (
          <div className="vl-card vl-empty-state">Chua co voucher nao trong nhom nay.</div>
        ) : (
          filtered.map((voucher) => (
            <div className="vl-wallet-row" key={voucher.id}>
              <div className="vl-wallet-amount">
                <div className="small opacity-75">Uu dai</div>
                <div className="fw-bold">{voucher.discountLabel}</div>
              </div>
              <div className="vl-wallet-content">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <div className="fw-bold">{voucher.name}</div>
                    <div className="small text-muted">{voucher.code}</div>
                  </div>
                  <span className={`vl-chip ${voucher.status === "AVAILABLE" ? "success" : voucher.status === "USED" ? "muted" : "danger"}`}>
                    {voucher.status === "AVAILABLE" ? "Co hieu luc" : voucher.status === "USED" ? "Da su dung" : voucher.status}
                  </span>
                </div>
                <div className="small text-muted mb-1">Don toi thieu: {Number(voucher.minOrderValue || 0).toLocaleString("vi-VN")}d</div>
                <div className="small text-muted mb-2 vl-text-truncate-2">{voucher.description}</div>
                <div className="small text-muted mb-2">HSD: {voucher.expiresAt || "--"}</div>
                {voucher.expiringSoon && <div className="vl-countdown mb-3"><i className="fa-regular fa-clock"></i>Sap het han</div>}
                <div className="d-flex gap-2 mt-auto">
                  <button className="btn vl-secondary-btn btn-sm px-3" onClick={() => setSelectedVoucher(voucher)}>Chi tiet</button>
                  <button className="btn vl-primary-btn btn-sm px-3" disabled={!voucher.canApply} onClick={() => navigate("/checkout", { state: { voucherCode: voucher.code } })}>
                    Ap dung
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedVoucher && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setSelectedVoucher(null)}></div>
          <div className="position-fixed top-0 end-0 h-100 vl-drawer-responsive" style={{ width: 420, zIndex: 1055 }}>
            <div className="vl-card h-100 rounded-0 rounded-start-5 p-4 overflow-auto">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <div className="small text-muted mb-1">Thong tin voucher</div>
                  <h4 className="mb-0" style={{ fontWeight: 800 }}>{selectedVoucher.name}</h4>
                </div>
                <button className="btn-close" onClick={() => setSelectedVoucher(null)}></button>
              </div>

              <div className="vl-soft-panel p-3 mb-3">
                <div className="small text-muted mb-1">Ma voucher</div>
                <div className="fw-bold mb-2">{selectedVoucher.code}</div>
                <button
                  className="btn btn-sm vl-secondary-btn"
                  onClick={async () => {
                    await navigator.clipboard.writeText(selectedVoucher.code);
                    toast.success("Da sao chep ma voucher");
                  }}
                >
                  Sao chep ma
                </button>
              </div>

              <div className="row g-3 mb-3">
                <DetailBox label="Gia tri" value={selectedVoucher.discountLabel} />
                <DetailBox label="Trang thai" value={selectedVoucher.status} />
                <DetailBox label="Don toi thieu" value={`${Number(selectedVoucher.minOrderValue || 0).toLocaleString("vi-VN")}d`} />
                <DetailBox label="Nguon" value={selectedVoucher.source === "REDEEMED" ? "Doi thuong" : "Cap phat"} />
              </div>

              <div className="vl-soft-panel p-3 mb-4">
                <div className="small text-muted mb-2">Thoi gian</div>
                <div>Nhan luc: {selectedVoucher.acquiredAt || "--"}</div>
                <div>Het han: {selectedVoucher.expiresAt || "--"}</div>
                {selectedVoucher.usedAt && <div>Da dung: {selectedVoucher.usedAt}</div>}
              </div>

              <button className="btn vl-primary-btn w-100 py-3" disabled={!selectedVoucher.canApply} onClick={() => navigate("/checkout", { state: { voucherCode: selectedVoucher.code } })}>
                Ap dung tai checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="col-md-6 col-xl-3">
      <div className="vl-kpi-card p-3">
        <div className="small text-muted mb-2">{label}</div>
        <div style={{ fontWeight: 800, fontSize: 30, color: "#422b1b" }}>{value}</div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="col-6">
      <div className="vl-soft-panel p-3 h-100">
        <div className="small text-muted">{label}</div>
        <div className="fw-bold">{value}</div>
      </div>
    </div>
  );
}

export default ProfileVoucher;
