import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import checkinApi from "../../../../api/checkinApi";
import { useNavigate } from "react-router-dom";
import { getAuthSession, AUTH_SCOPES } from "../../../../utils/authStorage";

function DailyCheckInSummary() {
  const days = [1, 2, 3, 4, 5, 6, 7];
  const [checkInData, setCheckInData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { token } = getAuthSession(AUTH_SCOPES.USER);
    if (!token) {
      setLoading(false);
      return;
    }

    checkinApi.getCheckinStatus()
      .then(res => {
        setCheckInData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu điểm danh:", err);
        setLoading(false);
      });
  }, []);

  const handleCheckIn = () => {
    if (!checkInData || !checkInData.program) return;
    checkinApi.performCheckin(checkInData.program.id)
      .then(res => {
        setCheckInData(prev => ({
          ...prev,
          currentStreak: (prev?.currentStreak || 0) + 1,
          checkedInToday: true
        }));
      })
      .catch(err => console.error("Lỗi điểm danh:", err));
  };

  return (
    <div className="container mt-5 pt-3">
      <div className="brew-card rounded-4 p-4 p-md-5">
        <div className="text-center mb-4">
          <h4 className="fw-bold text-dark mb-2">ĐIỂM DANH HẰNG NGÀY</h4>
          <p className="text-muted">Điểm danh đủ 7 ngày nhận quà đặc biệt!</p>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4 overflow-auto pb-2 hide-scrollbar placeholder-glow">
          {!checkInData ? (
            // Skeleton Frame
            days.map(day => (
              <div key={day} className="text-center px-2 d-flex flex-column align-items-center" style={{ minWidth: "80px" }}>
                <div className="placeholder col-8 bg-secondary rounded mb-2"></div>
                <div className="placeholder bg-secondary rounded-circle mb-2" style={{ width: "50px", height: "50px" }}></div>
                <div className="placeholder col-6 bg-secondary rounded"></div>
              </div>
            ))
          ) : (
            // Dữ liệu thật sẽ render ở đây
            days.map(day => {
              const isChecked = day <= checkInData.currentStreak;
              const isToday = day === checkInData.currentStreak + (checkInData.checkedInToday ? 0 : 1);
              return (
              <div key={day} className="text-center px-2 d-flex flex-column align-items-center" style={{ minWidth: "80px" }}>
                <div className="text-muted small fw-bold mb-2">Ngày {day}</div>
                <div className={`rounded-circle mb-2 d-flex align-items-center justify-content-center ${isChecked ? 'bg-success text-white' : 'bg-light border'}`} style={{ width: "50px", height: "50px" }}>
                  {isChecked ? <i className="fa-solid fa-check"></i> : <span className="text-muted">{day === 7 ? <i className="fa-solid fa-gift text-danger"></i> : '+10'}</span>}
                </div>
                {isToday && <div className="badge bg-warning text-dark">Hôm nay</div>}
              </div>
            )})
          )}
        </div>

        <div className="text-center mt-4">
          {loading ? (
            <button className="btn btn-secondary disabled rounded-pill px-5 fw-bold py-3 placeholder col-4 border-0"></button>
          ) : checkInData?.checkedInToday ? (
             <button onClick={() => navigate("/profile")} className="btn btn-success rounded-pill px-5 fw-bold shadow-sm py-2">
               <i className="fa-solid fa-check me-2"></i> Đã điểm danh
             </button>
          ) : (
            <button onClick={handleCheckIn} className="btn btn-warning rounded-pill px-5 fw-bold text-white shadow-sm py-2" style={{ backgroundColor: "#FF8E53", borderColor: "#FF8E53" }}>
              Điểm danh hôm nay
            </button>
          )}
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default DailyCheckInSummary;
