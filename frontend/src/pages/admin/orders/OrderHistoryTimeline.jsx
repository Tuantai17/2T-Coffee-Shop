import React from 'react';

const OrderHistoryTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="card shadow-sm border-0 mb-4 rounded-4">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-3 px-4">
          <h6 className="fw-bold mb-0"><i className="bi bi-clock-history me-2 text-primary"></i>Lịch sử xử lý đơn hàng</h6>
        </div>
        <div className="card-body p-4 text-center text-muted">
          Chưa có lịch sử xử lý đơn hàng.
        </div>
      </div>
    );
  }

  // Sort history descending by createdAt (newest first)
  const sortedHistory = [...history].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getEventStyle = (activityType) => {
    switch (activityType) {
      case 'ORDER_CREATED':
        return { icon: 'bi-cart-plus', color: 'success', bg: 'bg-success-subtle' };
      case 'STATUS_CHANGED':
        return { icon: 'bi-arrow-repeat', color: 'primary', bg: 'bg-primary-subtle' };
      case 'ITEM_ISSUE_REPORTED':
        return { icon: 'bi-exclamation-triangle', color: 'danger', bg: 'bg-danger-subtle' };
      case 'QUANTITY_ADJUSTED':
        return { icon: 'bi-sliders', color: 'info', bg: 'bg-info-subtle' };
      case 'ITEM_REMOVED':
        return { icon: 'bi-trash', color: 'danger', bg: 'bg-danger-subtle' };
      case 'WAIT_RESTOCK':
        return { icon: 'bi-box-seam', color: 'warning', bg: 'bg-warning-subtle' };
      case 'ORDER_CANCELLED':
        return { icon: 'bi-x-circle', color: 'danger', bg: 'bg-danger-subtle' };
      default:
        return { icon: 'bi-info-circle', color: 'secondary', bg: 'bg-secondary-subtle' };
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4 rounded-4">
      <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
        <h6 className="fw-bold mb-0"><i className="bi bi-clock-history me-2 text-primary"></i>Lịch sử xử lý đơn hàng</h6>
      </div>
      <div className="card-body p-4">
        <div className="position-relative ms-3">
          {/* Vertical Line */}
          <div className="position-absolute h-100 border-start border-2 border-light" style={{ left: '16px', top: '0', zIndex: 0 }}></div>
          
          {sortedHistory.map((log, index) => {
            const style = getEventStyle(log.activityType);
            const isLast = index === sortedHistory.length - 1;
            
            return (
              <div key={log.id} className={`position-relative d-flex ${isLast ? '' : 'mb-4'}`} style={{ zIndex: 1 }}>
                {/* Timeline Icon */}
                <div className={`rounded-circle d-flex align-items-center justify-content-center ${style.bg} text-${style.color} shadow-sm bg-white border border-${style.color}`} 
                     style={{ width: '34px', height: '34px', flexShrink: 0 }}>
                  <i className={`bi ${style.icon}`}></i>
                </div>
                
                {/* Timeline Content */}
                <div className="ms-3 flex-grow-1 bg-light rounded-3 p-3 border">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-1">{log.description || log.activityType}</h6>
                      <div className="small text-muted">
                        <i className="bi bi-person me-1"></i>
                        Thực hiện bởi: <span className="fw-semibold text-dark">{log.performedBy || 'Hệ thống'}</span>
                      </div>
                    </div>
                    <div className="text-muted small d-flex align-items-center">
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(log.createdAt).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  {/* Value Changes (if any) */}
                  {(log.oldValue || log.newValue) && (
                    <div className="mt-2 pt-2 border-top border-secondary-subtle small d-flex align-items-center">
                      <span className="text-muted me-2">Thay đổi:</span>
                      {log.oldValue && <span className="text-decoration-line-through text-secondary me-2">{log.oldValue}</span>}
                      {log.oldValue && log.newValue && <i className="bi bi-arrow-right text-muted me-2"></i>}
                      {log.newValue && <span className="fw-semibold text-dark">{log.newValue}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryTimeline;
