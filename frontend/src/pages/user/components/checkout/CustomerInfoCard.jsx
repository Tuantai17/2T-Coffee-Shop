import React from 'react';

function CustomerInfoCard({ form, onChangeForm }) {
  return (
    <div className="card border-0 rounded-4 p-4 bg-white mb-4 shadow-sm" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <h6 className="fw-bold mb-4" style={{ color: "#2d2d2d", fontSize: "1.1rem" }}>
        3. THÔNG TIN BỔ SUNG
      </h6>
      
      <div className="mb-3">
        <label className="form-label small fw-semibold text-muted mb-1">Email</label>
        <input 
          type="email" 
          name="email"
          value={form.email}
          onChange={onChangeForm}
          className="form-control rounded-3" 
          placeholder="minhanh@gmail.com" 
          style={{ height: "48px" }}
        />
      </div>

      <div className="form-check mt-3 mb-0">
        <input type="checkbox" className="form-check-input" id="saveInfo" defaultChecked />
        <label className="form-check-label small text-dark fw-medium" htmlFor="saveInfo">
          Lưu thông tin vào sổ địa chỉ
        </label>
      </div>
    </div>
  );
}

export default CustomerInfoCard;
