import React from 'react';

const OrderCancelledBanner = ({ order }) => {
  if (order.status !== 'CANCELLED') return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="card shadow-sm border-danger mb-4 rounded-4" style={{ backgroundColor: '#fff5f5' }}>
      <div className="card-header bg-transparent border-bottom-0 pt-4 pb-2 px-4 d-flex align-items-center">
        <i className="bi bi-x-octagon-fill text-danger fs-4 me-2"></i>
        <h6 className="fw-bold mb-0 text-danger">Đơn hàng đã bị hủy</h6>
      </div>
      <div className="card-body px-4 pb-4 pt-2">
        <div className="row g-3">
          <div className="col-md-4">
            <p className="mb-1 text-muted fs-7">Lý do hủy</p>
            <p className="fw-bold text-dark mb-0">{order.cancelReason || 'Không có lý do'}</p>
          </div>
          <div className="col-md-4">
            <p className="mb-1 text-muted fs-7">Thời gian hủy</p>
            <p className="fw-bold text-dark mb-0">{formatDate(order.cancelledAt)}</p>
          </div>
          <div className="col-md-4">
            <p className="mb-1 text-muted fs-7">Người thực hiện</p>
            <p className="fw-bold text-dark mb-0">{order.cancelledBy || 'Hệ thống'}</p>
          </div>
        </div>
        
        {order.paymentStatus === 'REFUND_PENDING' && (
          <div className="mt-3 p-2 bg-warning bg-opacity-25 border border-warning rounded d-flex align-items-center">
            <i className="bi bi-arrow-counterclockwise text-warning me-2"></i>
            <span className="fs-7 text-dark fw-semibold">Đơn hàng đang chờ hoàn tiền (Refund Pending)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCancelledBanner;
