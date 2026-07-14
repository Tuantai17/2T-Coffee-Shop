import React from "react";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export default function HistoryDialog({ show, onClose, history = [] }) {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header border-bottom-0">
              <h4 className="modal-title fw-bold mg-card-title mb-0">
                <i className="fa-solid fa-clock-rotate-left text-primary me-2"></i>Lịch sử chơi
              </h4>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body pt-0">
              {history.length > 0 ? (
                <div className="d-flex flex-column">
                  {history.map((item) => (
                    <div key={item.id} className="mg-history-item">
                      <div className="mg-history-icon">
                        <i className={`fa-solid ${item.result === "REWARDED" ? "fa-gift text-warning" : "fa-gamepad text-muted"}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <strong className="fs-5">{item.gameName}</strong>
                          <span className={`badge ${item.result === "REWARDED" ? "bg-success" : "bg-secondary"}`}>
                            {item.result === "REWARDED" ? "Thắng" : "Thua"}
                          </span>
                        </div>
                        <p className="text-muted small mb-2">{new Date(item.playedAt).toLocaleString("vi-VN")}</p>
                        
                        {(item.pointEarned || item.voucherId) && (
                          <div className="d-flex gap-2">
                            {item.pointEarned > 0 && <span className="badge text-bg-warning rounded-pill px-3 py-2"><i className="fa-solid fa-coins me-1"></i> {formatNumber(item.pointEarned)} điểm</span>}
                            {item.voucherId && <span className="badge text-bg-primary rounded-pill px-3 py-2"><i className="fa-solid fa-ticket me-1"></i> {item.voucherId}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="fa-regular fa-folder-open fs-1 mb-3"></i>
                  <p>Bạn chưa có lượt chơi nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
