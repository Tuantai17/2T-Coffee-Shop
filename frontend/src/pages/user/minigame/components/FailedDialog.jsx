import React from "react";

export default function FailedDialog({ show, result, onPlayAgain, onGameCenter }) {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ zIndex: 1055 }}
        onClick={(e) => {
          if (e.target.classList.contains('modal')) onGameCenter();
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
            <div className="modal-header border-0 pb-0 justify-content-center pt-4">
              <h4 className="modal-title fw-bold text-danger text-center w-100">
                <i className="bi bi-x-circle-fill me-2"></i>GAME OVER
              </h4>
            </div>
            
            <div className="modal-body text-center p-4">
              <p className="text-muted mb-4">
                {result?.message || "Bạn chưa hoàn thành trò chơi. Hãy thử lại ở lần tiếp theo!"}
              </p>

              <div className="bg-light rounded-4 p-3 mb-4 text-start">
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span className="text-secondary fw-semibold">Ghép đúng</span>
                  <span className="fw-bold fs-5 text-dark">
                    {result?.matchedPairs || 0} / {result?.playData?.totalPairs || (result?.matchedPairs || 0)}
                  </span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span className="text-secondary fw-semibold">Điểm</span>
                  <span className="fw-bold fs-5 text-warning">{result?.score || 0}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span className="text-secondary fw-semibold">Thời gian</span>
                  <span className="fw-bold fs-5 text-dark">{result?.duration || 0} giây</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-secondary fw-semibold">Số lượt lật</span>
                  <span className="fw-bold fs-5 text-dark">{result?.attempts || 0}</span>
                </div>
              </div>

              <div className="d-grid gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-warning btn-lg fw-bold rounded-pill text-white shadow-sm"
                  onClick={onPlayAgain}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>Chơi lại
                </button>
                <button
                  type="button"
                  className="btn btn-light btn-lg fw-bold rounded-pill text-secondary mt-2"
                  onClick={onGameCenter}
                >
                  Quay lại Game Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
