import React from 'react';

function VoucherCard() {
  const mockVouchers = [
    { id: 1, code: 'FREESHIP20', desc: 'Giảm 20% phí ship', condition: 'Đơn từ 100K' },
    { id: 2, code: 'WELCOME15', desc: 'Giảm 15K', condition: 'Đơn từ 49K' },
    { id: 3, code: 'SUMMER30', desc: 'Giảm 30K', condition: 'Đơn từ 150K' }
  ];

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0 text-uppercase">ƯU ĐÃI ÁP DỤNG</h6>
        <i className="fa-solid fa-chevron-up text-muted"></i>
      </div>
      
      <div className="d-flex flex-column gap-3">
        {mockVouchers.map(v => (
          <div key={v.id} className="border border-danger-subtle rounded-3 p-3 d-flex align-items-center justify-content-between bg-light bg-opacity-50">
            <div>
              <div className="fw-bold text-success small mb-1">{v.code}</div>
              <div className="fw-bold text-dark mb-1" style={{ fontSize: "0.9rem" }}>{v.desc}</div>
              <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{v.condition}</div>
            </div>
            <button className="btn btn-danger btn-sm px-3 fw-bold rounded-pill shadow-sm">Lưu</button>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-3">
        <button className="btn btn-link text-danger text-decoration-none small fw-bold">Xem tất cả voucher <i className="fa-solid fa-chevron-right ms-1"></i></button>
      </div>
    </div>
  );
}

export default VoucherCard;
