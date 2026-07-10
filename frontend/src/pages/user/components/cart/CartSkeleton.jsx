import React from 'react';

function CartSkeleton() {
  return (
    <div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-4 p-4 mb-3 shadow-sm">
          <div className="d-flex gap-3">
            <div className="placeholder-glow" style={{ width: "100px", height: "100px", borderRadius: "16px", flexShrink: 0 }}>
              <span className="placeholder w-100 h-100 d-block rounded-4" style={{ backgroundColor: "#f0e8df" }}></span>
            </div>
            <div className="flex-grow-1 placeholder-glow">
              <span className="placeholder col-6 mb-2 d-block rounded-pill" style={{ height: "20px", backgroundColor: "#f0e8df" }}></span>
              <span className="placeholder col-8 mb-2 d-block rounded-pill" style={{ height: "14px", backgroundColor: "#f5f0eb" }}></span>
              <span className="placeholder col-4 mb-3 d-block rounded-pill" style={{ height: "14px", backgroundColor: "#f5f0eb" }}></span>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="placeholder rounded-pill" style={{ width: "120px", height: "36px", backgroundColor: "#f0e8df" }}></span>
                <span className="placeholder rounded-pill" style={{ width: "90px", height: "24px", backgroundColor: "#f0e8df" }}></span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CartSkeleton;
