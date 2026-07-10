import React from "react";

function AddressCard({ address, onEdit, onDelete, onSetDefault, isSettingDefault }) {
  const isDefault = address.default || address.isDefault;
  const fullAddr = [address.addressLine, address.ward, address.district, address.province].filter(Boolean).join(", ");
  
  let iconClass = "fa-house";
  if (address.label === "Công ty") iconClass = "fa-briefcase";
  else if (address.label === "Nhà người thân") iconClass = "fa-users";

  return (
    <div className={`card border-0 shadow-sm rounded-4 mb-3 ${isDefault ? "border-danger" : ""}`} style={{ border: isDefault ? "1px solid #ce1f28 !important" : "" }}>
      <div className="card-body p-4 position-relative">
        {isDefault && (
          <span className="badge text-success bg-success bg-opacity-10 position-absolute top-0 end-0 m-3 rounded-pill px-3 py-2 fw-medium border border-success border-opacity-25">
            Đã đặt làm mặc định
          </span>
        )}
        
        <div className="d-flex align-items-start gap-4">
          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: "50px", height: "50px", flexShrink: 0 }}>
            <i className={`fa-solid ${iconClass} text-danger fs-5`}></i>
          </div>
          
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2">
              {isDefault && <span className="badge bg-danger rounded-1">Mặc định</span>}
              <h6 className="mb-0 fw-bold">{address.label || "Nhà riêng"}</h6>
            </div>
            
            <div className="row g-2 mb-2 small text-dark">
              <div className="col-auto d-flex align-items-center gap-2">
                <i className="fa-regular fa-user text-muted"></i>
                <span className="fw-medium">{address.receiverName}</span>
              </div>
              <div className="col-auto text-muted">|</div>
              <div className="col-auto d-flex align-items-center gap-2">
                <i className="fa-solid fa-phone text-muted"></i>
                <span className="fw-medium">{address.phoneNumber}</span>
              </div>
            </div>
            
            <div className="d-flex align-items-start gap-2 small text-muted mb-4">
              <i className="fa-solid fa-location-dot mt-1"></i>
              <span>{fullAddr}</span>
            </div>
            
            <div className="d-flex gap-2 justify-content-end border-top pt-3">
              {!isDefault && (
                <button 
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3 d-flex align-items-center gap-2"
                  onClick={() => onSetDefault(address)}
                  disabled={isSettingDefault}
                >
                  {isSettingDefault ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-regular fa-star"></i>}
                  Đặt làm mặc định
                </button>
              )}
              <button 
                className="btn btn-outline-dark btn-sm px-3 rounded-3 d-flex align-items-center gap-2"
                onClick={() => onEdit(address)}
              >
                <i className="fa-solid fa-pen"></i> Sửa
              </button>
              <button 
                className="btn btn-outline-danger btn-sm px-3 rounded-3 d-flex align-items-center gap-2"
                onClick={() => onDelete(address.id)}
              >
                <i className="fa-regular fa-trash-can"></i> Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressCard;
