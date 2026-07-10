import { motion } from "framer-motion";

function DailyCheckInSummary({ checkInData }) {
  const days = [1, 2, 3, 4, 5, 6, 7];

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
            <div></div>
          )}
        </div>

        <div className="text-center mt-4 placeholder-glow">
          {!checkInData ? (
            <button className="btn btn-secondary disabled rounded-pill px-5 fw-bold py-3 placeholder col-4 border-0"></button>
          ) : (
            <button className="btn btn-brew-primary rounded-pill px-5 fw-bold hover-scale shadow-sm py-2">
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
