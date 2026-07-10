import { useLocation, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import "../../styles/voucher-loyalty.css";

function LoyaltyRewardSuccessPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const reward = state?.reward;
  const voucher = state?.voucher;

  return (
    <UserLayout>
      <div style={{ background: "#faf8f4", minHeight: "100vh", padding: "40px 0" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="vl-card p-4 p-md-5 text-center vl-success-shell">
            <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" style={{ width: 96, height: 96, border: "4px solid #32b15f", color: "#32b15f", fontSize: 40 }}>
              <i className="fa-solid fa-check"></i>
            </div>
            <h2 className="mb-3" style={{ fontWeight: 800, color: "#382317" }}>Doi thuong thanh cong!</h2>
            <div className="text-muted mb-2">Ban da doi thanh cong voucher moi</div>
            <div className="fw-bold mb-3">{reward?.name || voucher?.name}</div>
            <div className="vl-soft-panel p-3 mb-4">
              <div className="small text-muted mb-1">Ma voucher</div>
              <div style={{ fontWeight: 800, fontSize: 20, wordBreak: "break-all" }}>{voucher?.code || "--"}</div>
              <div className="small text-muted mt-2">{voucher?.discountLabel || reward?.discountLabel}</div>
              <div className="small text-muted">Het han: {voucher?.expiresAt || "--"}</div>
            </div>
            <div className="d-flex gap-2 flex-column flex-md-row">
              <button className="btn vl-secondary-btn flex-grow-1 py-3" onClick={() => navigate("/profile/vouchers")}>Xem vi voucher</button>
              <button className="btn vl-primary-btn flex-grow-1 py-3" onClick={() => navigate("/products")}>Tiep tuc mua sam</button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default LoyaltyRewardSuccessPage;
