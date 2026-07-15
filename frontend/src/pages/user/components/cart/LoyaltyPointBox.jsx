import React, { useState } from 'react';
import { formatPrice } from '../../../../utils/formatPrice';

function LoyaltyPointBox({ totalPoints = 0, maxUsable = 500, pointValue = 1, onApplyPoints }) {
  const [inputPoints, setInputPoints] = useState("");
  const [applied, setApplied] = useState(false);

  const actualMax = Math.min(maxUsable, totalPoints);
  const currentVal = inputPoints === "" ? 0 : parseInt(inputPoints, 10);
  const discountAmount = currentVal * pointValue;

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value);
    setInputPoints(val);
    setApplied(false);
  };

  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    if (rawVal === "") {
        setInputPoints("");
        setApplied(false);
        return;
    }
    let val = parseInt(rawVal) || 0;
    if (val > actualMax) val = actualMax;
    if (val < 0) val = 0;
    setInputPoints(val);
    setApplied(false);
  };

  const handleApply = () => {
    setApplied(true);
    if (onApplyPoints) onApplyPoints(currentVal);
  };

  const handleRemove = () => {
    setInputPoints("");
    setApplied(false);
    if (onApplyPoints) onApplyPoints(0);
  };

  return (
    <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: "#fdf8f4", border: "1px solid #f0e8df" }}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-coins" style={{ color: "#f59e0b", fontSize: "16px" }}></i>
          <span className="fw-bold" style={{ fontSize: "14px", color: "#2d2d2d" }}>Sử dụng điểm</span>
        </div>
        <span style={{ fontSize: "13px", color: "#888" }}>
          Bạn có <strong style={{ color: "#c67c4e" }}>{totalPoints.toLocaleString()}</strong> điểm
        </span>
      </div>

      {applied && inputPoints > 0 ? (
        <div className="d-flex align-items-center justify-content-between p-2 rounded-3" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <div>
            <span className="fw-bold" style={{ fontSize: "13px", color: "#166534" }}>
              Đã dùng {inputPoints.toLocaleString()} điểm
            </span>
            <span className="ms-2" style={{ fontSize: "12px", color: "#4ade80" }}>(-{formatPrice(discountAmount)})</span>
          </div>
          <button className="btn btn-sm p-0 border-0" onClick={handleRemove} style={{ color: "#888" }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      ) : (
        <>
          <div className="d-flex align-items-center gap-2 mb-2">
            <input
              type="number"
              className="form-control border-0 rounded-3 fw-bold text-center"
              style={{ width: "90px", height: "38px", backgroundColor: "#fff", fontSize: "15px", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)" }}
              value={inputPoints}
              onChange={handleInputChange}
              min={0}
              max={actualMax}
            />
            <span className="text-muted" style={{ fontSize: "13px" }}>điểm</span>
            <div className="flex-grow-1 text-end">
              <span className="fw-bold" style={{ color: "#ef4444", fontSize: "14px" }}>-{formatPrice(discountAmount)}</span>
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            className="form-range mb-2"
            min={0}
            max={actualMax}
            step={1}
            value={currentVal}
            onChange={handleSliderChange}
            style={{ accentColor: "#c67c4e" }}
          />

          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted" style={{ fontSize: "11px" }}>
              Tối đa {actualMax.toLocaleString()} điểm cho đơn này
            </span>
            {currentVal > 0 && (
              <button
                className="btn btn-sm rounded-pill fw-bold px-3"
                style={{ backgroundColor: "var(--primary-color, #c67c4e)", color: "#fff", border: "none", fontSize: "12px" }}
                onClick={handleApply}
              >
                Áp dụng
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default LoyaltyPointBox;
