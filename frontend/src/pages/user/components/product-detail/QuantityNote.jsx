import React from 'react';

function QuantityNote({ quantity, maxQuantity, onQuantityChange, note, onNoteChange }) {
  return (
    <div className="mb-4">
      <div className="text-muted small mb-2 text-center">Số lượng:</div>
      <div className="d-flex align-items-center">
        <button
          type="button"
          className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0 transition-all hover-scale"
          style={{ width: "36px", height: "36px" }}
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
        >
          -
        </button>
        <input
          type="number"
          className="form-control text-center border-0 bg-transparent fw-bold p-0 mx-2"
          value={quantity}
          min="1"
          max={maxQuantity}
          onChange={(event) =>
            onQuantityChange(Math.max(1, Number(event.target.value) || 1))
          }
          style={{ width: "60px", boxShadow: "none" }}
        />
        <button
          type="button"
          className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0 transition-all hover-scale"
          style={{ width: "36px", height: "36px" }}
          onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
          disabled={quantity >= maxQuantity}
        >
          +
        </button>
      </div>
      <style>{`
        .hover-scale:hover { transform: scale(1.2); }
      `}</style>
    </div>
  );
}

export default QuantityNote;
