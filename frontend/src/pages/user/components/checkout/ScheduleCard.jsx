import React from 'react';

function ScheduleCard({ scheduleType, onChangeType, form, onChangeForm, deliveryMethod }) {
  // Get today's date in YYYY-MM-DD format for the min attribute of date input
  const today = new Date().toISOString().split('T')[0];
  return (
    <div className="card border-0 rounded-4 p-4 bg-white mb-4 shadow-sm" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <h6 className="fw-bold mb-4" style={{ color: "#2d2d2d", fontSize: "1.1rem" }}>
        2. THỜI GIAN NHẬN HÀNG
      </h6>
      
      <div className="d-flex flex-column gap-3 mb-4">
        {deliveryMethod !== 'PICKUP' && (
          <label 
            className={`card p-3 rounded-4 cursor-pointer transition-all ${scheduleType === 'NOW' ? 'border-primary bg-primary-subtle' : 'border'}`}
            style={{ 
              borderColor: scheduleType === 'NOW' ? '#c67c4e' : '#e8e0d8',
              backgroundColor: scheduleType === 'NOW' ? '#fdf8f4' : '#fff'
            }}
          >
            <div className="d-flex align-items-center">
              <input 
                type="radio" 
                className="form-check-input m-0 me-3" 
                checked={scheduleType === 'NOW'} 
                onChange={() => onChangeType('NOW')}
                style={{ transform: "scale(1.2)" }} 
              />
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "40px", height: "40px" }}>
                  <i className="fa-solid fa-bolt text-warning fs-5"></i>
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: "15px" }}>Giao ngay</div>
                  <div className="text-muted" style={{ fontSize: "12px" }}>Dự kiến giao: 30 - 45 phút</div>
                </div>
              </div>
            </div>
          </label>
        )}

        <label 
          className={`card p-3 rounded-4 cursor-pointer transition-all ${scheduleType === 'LATER' ? 'border-primary bg-primary-subtle' : 'border'}`}
          style={{ 
            borderColor: scheduleType === 'LATER' ? '#c67c4e' : '#e8e0d8',
            backgroundColor: scheduleType === 'LATER' ? '#fdf8f4' : '#fff'
          }}
        >
          <div className="d-flex align-items-center">
            <input 
              type="radio" 
              className="form-check-input m-0 me-3" 
              checked={scheduleType === 'LATER'} 
              onChange={() => onChangeType('LATER')}
              style={{ transform: "scale(1.2)" }} 
            />
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "40px", height: "40px" }}>
                <i className="fa-regular fa-calendar-days text-primary fs-5"></i>
              </div>
              <div>
                <div className="fw-bold text-dark" style={{ fontSize: "15px" }}>Đặt trước</div>
                <div className="text-muted" style={{ fontSize: "12px" }}>Chọn thời gian giao hàng mong muốn</div>
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* Date & Time Picker */}
      {scheduleType === 'LATER' && (
        <div className="bg-light p-3 rounded-4 border">
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted mb-1">Chọn ngày</label>
            <input 
              type="date" 
              name="deliveryDate"
              value={form?.deliveryDate || ''}
              onChange={onChangeForm}
              min={today}
              className="form-control rounded-3" 
              style={{ height: "48px", backgroundColor: "#fff" }}
            />
          </div>
          <div>
            <label className="form-label small fw-semibold text-muted mb-2">Chọn giờ nhận</label>
            <input 
              type="time" 
              name="deliveryTime"
              value={form?.deliveryTime || ''}
              onChange={onChangeForm}
              className="form-control rounded-3" 
              style={{ height: "48px", backgroundColor: "#fff" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleCard;
