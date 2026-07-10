import React from 'react';

function RemoveConfirmModal({ show, item, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 9999 }} onClick={onCancel}>
      <div className="modal-dialog modal-dialog-centered modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg" style={{ animation: "scaleIn 0.25s ease" }}>
          <div className="text-center p-4">
            <div className="mb-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{ width: "64px", height: "64px", backgroundColor: "#fef2f2" }}
              >
                <i className="fa-regular fa-trash-can" style={{ fontSize: "28px", color: "#ef4444" }}></i>
              </div>
            </div>
            <h6 className="fw-bold mb-2" style={{ color: "#2d2d2d" }}>Xóa sản phẩm?</h6>
            <p className="text-muted mb-0" style={{ fontSize: "14px", lineHeight: "1.5" }}>
              Bạn có chắc muốn xóa <strong>{item?.productName}</strong> khỏi giỏ hàng?
            </p>
          </div>
          <div className="d-flex border-top">
            <button
              className="btn flex-grow-1 py-3 rounded-0 fw-semibold border-0 border-end"
              style={{ color: "#888", fontSize: "15px", transition: "background 0.2s" }}
              onClick={onCancel}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#f9f9f9"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              Hủy
            </button>
            <button
              className="btn flex-grow-1 py-3 rounded-0 fw-bold border-0"
              style={{ color: "#ef4444", fontSize: "15px", transition: "background 0.2s" }}
              onClick={onConfirm}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#fef2f2"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              Xóa món
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default RemoveConfirmModal;
