import "../../../../styles/voucher-loyalty.css";

const fallbackVouchers = [
  {
    id: 1,
    code: "FREESHIP",
    name: "Mien phi giao hang",
    description: "Mien phi giao hang don tu 50K",
    discountLabel: "Freeship",
    discount: 0,
    type: "freeship",
    minOrderValue: 50000,
    canApply: true,
    status: "AVAILABLE",
    expiringSoon: false,
  },
];

function VoucherModal({ show, onClose, onSelect, vouchers = [] }) {
  if (!show) return null;

  const items = vouchers.length > 0 ? vouchers : fallbackVouchers;

  return (
    <div className="modal show d-block vl-bottom-sheet-mobile" style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 9999 }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable vl-bottom-sheet-mobile" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 vl-card overflow-hidden vl-sheet-modal">
          <div className="modal-header border-0 pb-0" style={{ padding: "20px 24px 12px" }}>
            <div>
              <h5 className="fw-bold mb-1" style={{ color: "#2d2d2d" }}>Chon voucher</h5>
              <p className="text-muted mb-0" style={{ fontSize: "13px" }}>Voucher kha dung se duoc preview lai voi tong don hien tai.</p>
            </div>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body" style={{ padding: "16px 24px 24px" }}>
            {items.map((voucher) => (
              <div key={voucher.id} className="vl-sheet-row mb-3">
                <div className="vl-sheet-amount">{voucher.discountLabel || voucher.description}</div>
                <div className="vl-sheet-content">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="fw-bold">{voucher.name || voucher.code}</div>
                      <div className="small text-muted vl-text-truncate-2">{voucher.description || voucher.code}</div>
                    </div>
                    <span className={`vl-chip ${voucher.canApply ? "success" : "muted"}`}>{voucher.canApply ? "Kha dung" : "Khong dung duoc"}</span>
                  </div>
                  <div className="small text-muted mt-2">Don toi thieu: {Number(voucher.minOrderValue || 0).toLocaleString("vi-VN")}d</div>
                  {voucher.expiringSoon && <div className="vl-countdown mt-2"><i className="fa-regular fa-clock"></i>Sap het han</div>}
                  <div className="d-flex justify-content-end mt-3">
                    <button className="btn btn-sm vl-primary-btn px-3" disabled={!voucher.canApply} onClick={() => { onSelect(voucher); onClose(); }}>
                      Ap dung
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoucherModal;
