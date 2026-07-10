import React from 'react';

function QuantityControl({ quantity, onDecrease, onIncrease, onInputChange, isUpdating, min = 1 }) {
  return (
    <div className="d-flex align-items-center" style={{ height: "36px" }}>
      <button
        type="button"
        className="btn d-flex align-items-center justify-content-center border-0 text-dark fw-bold"
        style={{ width: "36px", height: "36px", backgroundColor: "#f5f0eb", borderRadius: "10px", transition: "all 0.2s" }}
        disabled={isUpdating || quantity <= min}
        onClick={onDecrease}
      >
        <i className="fa-solid fa-minus" style={{ fontSize: "11px" }}></i>
      </button>

      {isUpdating ? (
        <span className="d-flex justify-content-center align-items-center" style={{ minWidth: "44px" }}>
          <span className="spinner-border spinner-border-sm" style={{ width: "16px", height: "16px", borderWidth: "2px", color: "var(--primary-color, #c67c4e)" }}></span>
        </span>
      ) : (
        <input
          type="text"
          className="form-control border-0 text-center fw-bold p-0 bg-transparent"
          style={{ width: "44px", fontSize: "15px", boxShadow: "none", color: "#2d2d2d" }}
          value={quantity}
          onChange={onInputChange}
          readOnly
        />
      )}

      <button
        type="button"
        className="btn d-flex align-items-center justify-content-center border-0 text-white fw-bold"
        style={{ width: "36px", height: "36px", backgroundColor: "var(--primary-color, #c67c4e)", borderRadius: "10px", transition: "all 0.2s" }}
        disabled={isUpdating}
        onClick={onIncrease}
      >
        <i className="fa-solid fa-plus" style={{ fontSize: "11px" }}></i>
      </button>
    </div>
  );
}

export default QuantityControl;
