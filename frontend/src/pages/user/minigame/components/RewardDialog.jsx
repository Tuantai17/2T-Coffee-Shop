import React from "react";
import { Link } from "react-router-dom";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export default function RewardDialog({ show, result, onPlayAgain, onBackToHome, onShowHistory }) {
  if (!show || !result) return null;

  const isWin = result.reward || result.pointEarned > 0 || result.voucherId;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1060 }}></div>
      <div className="modal fade show d-block mg-reward-modal" tabIndex="-1" style={{ zIndex: 1065 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center p-4">
            <div className="modal-body position-relative">
              {isWin ? (
                <>
                  <div className="mg-reward-icon">
                    <i className="fa-solid fa-gift"></i>
                  </div>
                  <h2 className="fw-bold mb-2 text-white">TUYỆT VỜI!</h2>
                  <p className="text-white-50 mb-4">Bạn đã hoàn thành trò chơi và nhận được phần thưởng</p>
                  
                  <div className="mg-reward-box">
                    <h3 className="mg-reward-title">{result.reward ? result.reward.rewardName : "Phần thưởng"}</h3>
                    {result.pointEarned > 0 && <div className="text-white fw-bold fs-5 mb-1">+{formatNumber(result.pointEarned)} điểm</div>}
                    {result.voucherId && <div className="text-white fw-bold fs-5 mb-1">Mã: {result.voucherId}</div>}
                  </div>
                  
                  {result.summary && (
                    <div className="d-flex justify-content-between text-white-50 small mb-4 px-3">
                      <div>
                        <span className="d-block mb-1">Thời gian</span>
                        <strong className="text-white">{result.summary.durationSeconds}s</strong>
                      </div>
                      <div>
                        <span className="d-block mb-1">Điểm Game</span>
                        <strong className="text-white">{formatNumber(result.summary.score)}</strong>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="mg-reward-icon">
                    <i className="fa-regular fa-face-frown text-white-50"></i>
                  </div>
                  <h2 className="fw-bold mb-2 text-white">RẤT TIẾC!</h2>
                  <p className="text-white-50 mb-4">Lượt chơi đã kết thúc, chúc bạn may mắn lần sau.</p>
                </>
              )}
              
              <div className="d-flex flex-column gap-3 mt-4">
                <button className="btn btn-warning rounded-pill py-3 fw-bold fs-5" onClick={onPlayAgain}>
                  Chơi Lại
                </button>
                <div className="d-flex gap-3">
                  <button className="btn btn-outline-light rounded-pill py-2 flex-grow-1" onClick={onBackToHome}>
                    Game Center
                  </button>
                  <button className="btn btn-outline-light rounded-pill py-2 flex-grow-1" onClick={onShowHistory}>
                    Xem lịch sử
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
