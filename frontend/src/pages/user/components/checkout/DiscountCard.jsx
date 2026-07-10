import "../../../../styles/voucher-loyalty.css";

function DiscountCard({
  voucherCode,
  onChangeVoucher,
  onApplyVoucher,
  appliedVoucher,
  voucherError,
  onOpenVoucherWallet,
  pointsAvailable = 0,
  pointsUsed,
  onChangePoints,
}) {
  const maxPoints = Math.min(pointsAvailable, 500);
  const discountAmount = pointsUsed * 10;

  return (
    <div className="vl-card p-4 mb-4">
      <h6 className="fw-bold mb-4" style={{ color: "#2d2d2d", fontSize: "1.1rem" }}>
        4. Voucher va diem thuong
      </h6>

      <div className="mb-4 pb-4 border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <label className="form-label small fw-semibold text-dark mb-0">Voucher checkout</label>
          <button className="btn btn-link text-decoration-none p-0 fw-semibold" style={{ color: "#8f4518" }} onClick={onOpenVoucherWallet}>
            Chon tu vi voucher
          </button>
        </div>

        <div className="d-flex gap-2 mb-2">
          <input
            type="text"
            className="form-control vl-filter-input"
            placeholder="Nhap ma voucher"
            value={voucherCode}
            onChange={(e) => onChangeVoucher(e.target.value)}
            style={{ height: "48px" }}
          />
          <button className="btn vl-primary-btn fw-bold px-4" onClick={onApplyVoucher}>
            Ap dung
          </button>
        </div>

        {voucherError && <div className="small text-danger mt-2">{voucherError}</div>}

        {appliedVoucher && (
          <div className="vl-soft-panel p-3 mt-3">
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div>
                <div className="fw-bold">{appliedVoucher.voucherName || appliedVoucher.code}</div>
                <div className="small text-muted">{appliedVoucher.discountLabel}</div>
                <div className="small text-success mt-1">Giam {Number(appliedVoucher.discountAmount || 0).toLocaleString("vi-VN")}đ</div>
              </div>
              <button className="btn btn-sm btn-outline-danger rounded-4" onClick={() => onChangeVoucher("")}>
                Bo chon
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="d-flex justify-content-between mb-3 align-items-center">
          <label className="form-label small fw-semibold text-dark mb-0">Su dung diem Loyalty</label>
          <span className="text-dark small">Ban co <strong className="text-success">{pointsAvailable.toLocaleString("vi-VN")}</strong> diem</span>
        </div>

        <input
          type="range"
          className="form-range"
          min="0"
          max={maxPoints}
          step="10"
          value={pointsUsed}
          onChange={(e) => onChangePoints(Number(e.target.value))}
          style={{ accentColor: "#8f4518" }}
        />

        <div className="d-flex align-items-center gap-3 mt-3">
          <div className="d-flex align-items-center vl-soft-panel px-3" style={{ height: "48px", flex: 1 }}>
            <input
              type="number"
              className="form-control border-0 bg-transparent text-center p-0 fw-bold"
              value={pointsUsed}
              onChange={(e) => {
                let value = Number(e.target.value);
                if (value > maxPoints) value = maxPoints;
                if (value < 0) value = 0;
                onChangePoints(value);
              }}
            />
            <span className="text-muted small ms-2">diem</span>
          </div>
          <div className="fw-bold text-success fs-5 text-end" style={{ flex: 1 }}>
            -{discountAmount.toLocaleString("vi-VN")}đ
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscountCard;
