import React from 'react';
import { Link } from 'react-router-dom';

function ComboSuggestion() {
  return (
    <div className="h-100 position-relative overflow-hidden hover-scale transition-all"
      style={{ background: "linear-gradient(135deg, #4A2E1E 0%, #2E1810 100%)", color: "white" }}
    >
      <div className="position-absolute end-0 top-0 h-100 w-50 opacity-50" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1498603536246-15572faa57dc?q=80&w=400')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        maskImage: "linear-gradient(to right, transparent, black)"
      }}></div>
      
      <div className="position-relative z-1 w-75">
        <h6 className="fw-bold text-warning mb-1 text-uppercase">COMBO PHÙ HỢP</h6>
        <div className="fw-bold mb-2 fs-5">Combo Buổi Sáng</div>
        <p className="small text-light mb-3 opacity-75">1 Phin Sữa Đá + 1 Croissant</p>
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="text-warning fw-bold fs-4">49.000đ</span>
          <span className="text-muted text-decoration-line-through small">55.000đ</span>
          <span className="badge bg-danger rounded-pill">-11%</span>
        </div>
        <button className="btn btn-warning rounded-pill px-4 fw-bold">Mua combo ngay</button>
      </div>
      <style>{`
        .hover-scale:hover { transform: scale(1.02); }
      `}</style>
    </div>
  );
}

export default ComboSuggestion;
