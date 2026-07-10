import React from 'react';

function ScheduleCard({ scheduleType, onChangeType }) {
  return (
    <div className="card border-0 rounded-4 p-4 bg-white mb-4 shadow-sm" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <h6 className="fw-bold mb-4" style={{ color: "#2d2d2d", fontSize: "1.1rem" }}>
        2. THỜI GIAN NHẬN HÀNG
      </h6>
      
      <div className="d-flex flex-column gap-3 mb-4">
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

      {/* Date & Time Picker Mockup */}
      {scheduleType === 'LATER' && (
        <div className="bg-light p-3 rounded-4 border">
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted mb-1">Chọn ngày</label>
            <div className="form-control rounded-3 d-flex justify-content-between align-items-center" style={{ height: "48px", backgroundColor: "#fff" }}>
              <span>{new Date().toLocaleDateString('vi-VN')}</span>
              <i className="fa-regular fa-calendar text-muted"></i>
            </div>
          </div>
          <div>
            <label className="form-label small fw-semibold text-muted mb-2">Chọn giờ nhận</label>
            <div className="d-flex flex-wrap gap-2">
              {['08:00', '08:30', '09:00', '09:30', '10:00'].map(time => (
                <div 
                  key={time} 
                  className={`btn btn-sm rounded-pill px-3 py-2 ${time === '08:30' ? 'btn-outline-primary fw-bold bg-white' : 'btn-outline-secondary bg-white'}`}
                  style={{ borderColor: time === '08:30' ? '#c67c4e' : '#dee2e6', color: time === '08:30' ? '#c67c4e' : '#6c757d' }}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleCard;
