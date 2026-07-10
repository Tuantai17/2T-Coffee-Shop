import React from 'react';

const OrderStatusTimeline = ({ currentStatus, selectedStatus, onSelectStatus, history = [] }) => {
  const steps = [
    { status: 'PENDING_CONFIRMATION', label: 'Chờ xác nhận', icon: 'bi-check-circle' },
    { status: 'CONFIRMED', label: 'Đã xác nhận', icon: 'bi-check2-all' },
    { status: 'PREPARING', label: 'Đang chuẩn bị', icon: 'bi-box-seam' },
    { status: 'AWAITING_CUSTOMER_DECISION', label: 'Chờ phản hồi', icon: 'bi-exclamation-circle' },
    { status: 'WAITING_FOR_RESTOCK', label: 'Chờ nhập', icon: 'bi-telephone' },
    { status: 'READY_FOR_PICKUP', label: 'Chờ nhận', icon: 'bi-shop' },
    { status: 'READY_FOR_DELIVERY', label: 'Chờ giao', icon: 'bi-box' },
    { status: 'DELIVERING', label: 'Đang giao', icon: 'bi-truck' },
    { status: 'COMPLETED', label: 'Hoàn thành', icon: 'bi-check-lg' }
  ];

  if (currentStatus === 'CANCELLED' || selectedStatus === 'CANCELLED') {
    if (!steps.find(s => s.status === 'CANCELLED')) {
       steps.push({ status: 'CANCELLED', label: 'Đã hủy', icon: 'bi-x-circle' });
    }
  }

  const getStepIndex = (statusStr) => {
    return steps.findIndex(s => s.status === statusStr);
  };

  const actualIndex = getStepIndex(currentStatus);
  const selectedIndex = getStepIndex(selectedStatus);
  
  // Use selectedIndex for visual progress if it's ahead, else use actual
  const displayIndex = selectedIndex >= 0 ? selectedIndex : actualIndex;

  return (
    <div className="timeline-container py-4">
      <div className="position-relative">
        <div className="progress position-absolute" style={{ height: '4px', top: '24px', left: '5%', right: '5%', zIndex: 0 }}>
          <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${displayIndex > 0 ? (displayIndex / (steps.length - 1)) * 100 : 0}%` }}></div>
        </div>
        <div className="d-flex justify-content-between position-relative z-index-1">
          {steps.map((step, index) => {
            const isCompleted = index <= actualIndex;
            const isSelected = index === selectedIndex;
            const isFuture = index > actualIndex;
            
            // Icon styling
            let circleClass = 'bg-light text-muted border';
            if (isSelected) {
                circleClass = 'bg-primary text-white border border-primary border-4';
            } else if (isCompleted) {
                circleClass = 'bg-white text-primary border border-primary';
            }

            return (
              <div 
                key={step.status} 
                className="text-center" 
                style={{ width: '100px', cursor: 'pointer' }}
                onClick={() => onSelectStatus(step.status)}
              >
                <div 
                  className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${circleClass}`} 
                  style={{ width: '50px', height: '50px', zIndex: 1, position: 'relative', transition: 'all 0.2s' }}
                >
                  <i className={`bi ${step.icon} fs-5`}></i>
                </div>
                <div className={`fw-bold small ${isSelected ? 'text-primary' : (isCompleted ? 'text-dark' : 'text-muted')}`}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
