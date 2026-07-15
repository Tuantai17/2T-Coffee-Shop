import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicRewards } from '../../../../services/loyaltyService';

function VoucherCard() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const res = await getPublicRewards();
        // Assuming the API returns a list of reward maps in res.data
        if (res.data && Array.isArray(res.data)) {
          setVouchers(res.data.slice(0, 3)); // Only show top 3 for brevity
        }
      } catch (err) {
        console.error("Error fetching vouchers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0 text-uppercase">ƯU ĐÃI ÁP DỤNG</h6>
        <i className="fa-solid fa-chevron-up text-muted"></i>
      </div>
      
      <div className="d-flex flex-column gap-3">
        {loading ? (
          <div className="text-center text-muted small py-3">Đang tải ưu đãi...</div>
        ) : vouchers.length > 0 ? (
          vouchers.map(v => (
            <div key={v.id} className="border border-danger-subtle rounded-3 p-3 d-flex align-items-center justify-content-between bg-light bg-opacity-50">
              <div>
                <div className="fw-bold text-success small mb-1">{v.code}</div>
                <div className="fw-bold text-dark mb-1" style={{ fontSize: "0.9rem" }}>{v.discountLabel || v.name}</div>
                <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                  {v.minOrderValue > 0 ? `Đơn từ ${v.minOrderValue.toLocaleString()}đ` : 'Áp dụng mọi đơn hàng'}
                </div>
              </div>
              <button className="btn btn-danger btn-sm px-3 fw-bold rounded-pill shadow-sm">Lưu</button>
            </div>
          ))
        ) : (
          <div className="text-center text-muted small py-3">Hiện chưa có ưu đãi nào</div>
        )}
      </div>
      
      <div className="text-center mt-3">
        <Link to="/voucher" className="btn btn-link text-danger text-decoration-none small fw-bold">
          Xem tất cả voucher <i className="fa-solid fa-chevron-right ms-1"></i>
        </Link>
      </div>
    </div>
  );
}

export default VoucherCard;
