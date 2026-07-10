import React, { useState } from 'react';

function VoucherBox({ appliedVoucher, onApplyCode, onOpenModal, onRemoveVoucher }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleApply = () => {
    if (!code.trim()) {
      setError('Vui lòng nhập mã giảm giá');
      return;
    }
    setError('');
    if (onApplyCode) onApplyCode(code.trim());
    setCode('');
  };

  return (
    <div className="mb-3">
      {appliedVoucher ? (
        <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-ticket-simple" style={{ color: "#22c55e", fontSize: "18px" }}></i>
            <div>
              <div className="fw-bold" style={{ fontSize: "13px", color: "#166534" }}>{appliedVoucher.code}</div>
              <div style={{ fontSize: "11px", color: "#4ade80" }}>{appliedVoucher.description}</div>
            </div>
          </div>
          <button className="btn btn-sm p-0 border-0" onClick={onRemoveVoucher} style={{ color: "#888" }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      ) : (
        <>
          <div className="d-flex gap-2 mb-2">
            <div className="position-relative flex-grow-1">
              <i className="fa-solid fa-tag position-absolute top-50 translate-middle-y" style={{ left: "14px", color: "#c67c4e", fontSize: "13px" }}></i>
              <input
                type="text"
                className="form-control border-0 rounded-pill fw-medium"
                style={{ backgroundColor: "#f9f5f1", paddingLeft: "38px", height: "42px", fontSize: "14px" }}
                placeholder="Nhập mã giảm giá"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              />
            </div>
            <button
              className="btn fw-bold rounded-pill px-4 text-white flex-shrink-0"
              style={{ backgroundColor: "var(--primary-color, #c67c4e)", border: "none", height: "42px", fontSize: "14px", transition: "all 0.2s" }}
              onClick={handleApply}
            >
              Áp dụng
            </button>
          </div>
          {error && <div className="text-danger small ps-2 mb-2"><i className="fa-solid fa-circle-exclamation me-1"></i>{error}</div>}
          <button
            className="btn btn-sm w-100 d-flex align-items-center justify-content-between rounded-3 fw-medium"
            style={{ border: "1px dashed #e0d6cc", color: "#c67c4e", padding: "10px 14px", fontSize: "13px", transition: "all 0.2s" }}
            onClick={onOpenModal}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c67c4e"; e.currentTarget.style.backgroundColor = "#fdf8f4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0d6cc"; e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <span><i className="fa-solid fa-wallet me-2"></i>Chọn voucher</span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: "11px" }}></i>
          </button>
        </>
      )}
    </div>
  );
}

export default VoucherBox;
