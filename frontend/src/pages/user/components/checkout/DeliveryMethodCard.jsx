import React from 'react';

function DeliveryMethodCard({ 
  deliveryMethod, 
  onChangeMethod, 
  selectedAddress, 
  onOpenAddressSelector, 
  onOpenAddressForm,
  form,
  onChangeForm,
  getFullAddressString,
  storeInfo
}) {
  return (
    <div className="card border-0 rounded-4 p-4 bg-white mb-4 shadow-sm" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <h6 className="fw-bold mb-4" style={{ color: "#2d2d2d", fontSize: "1.1rem" }}>
        1. PHƯƠNG THỨC NHẬN HÀNG
      </h6>
      
      <div className="row g-4">
        {/* Left Side: Method Selector */}
        <div className="col-md-5 d-flex flex-column gap-3">
          <label 
            className={`card p-3 rounded-4 cursor-pointer transition-all ${deliveryMethod === 'DELIVERY' ? 'border-primary bg-primary-subtle' : 'border'}`}
            style={{ 
              borderColor: deliveryMethod === 'DELIVERY' ? '#c67c4e' : '#e8e0d8',
              backgroundColor: deliveryMethod === 'DELIVERY' ? '#fdf8f4' : '#fff'
            }}
          >
            <div className="d-flex align-items-center">
              <input 
                type="radio" 
                className="form-check-input m-0 me-3" 
                checked={deliveryMethod === 'DELIVERY'} 
                onChange={() => onChangeMethod('DELIVERY')}
                style={{ transform: "scale(1.2)" }} 
              />
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "40px", height: "40px" }}>
                  <img src="/images/delivery-bike.png" alt="Delivery" style={{ width: "24px", objectFit: "contain" }} onError={(e) => {e.target.src = 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png'}} />
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: "15px" }}>Giao tận nơi</div>
                  <div className="text-muted" style={{ fontSize: "12px" }}>Giao hàng đến địa chỉ của bạn</div>
                </div>
              </div>
            </div>
          </label>

          <label 
            className={`card p-3 rounded-4 cursor-pointer transition-all ${deliveryMethod === 'PICKUP' ? 'border-primary bg-primary-subtle' : 'border'}`}
            style={{ 
              borderColor: deliveryMethod === 'PICKUP' ? '#c67c4e' : '#e8e0d8',
              backgroundColor: deliveryMethod === 'PICKUP' ? '#fdf8f4' : '#fff'
            }}
          >
            <div className="d-flex align-items-center">
              <input 
                type="radio" 
                className="form-check-input m-0 me-3" 
                checked={deliveryMethod === 'PICKUP'} 
                onChange={() => onChangeMethod('PICKUP')}
                style={{ transform: "scale(1.2)" }} 
              />
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "40px", height: "40px" }}>
                  <img src="/images/store.png" alt="Pickup" style={{ width: "24px", objectFit: "contain" }} onError={(e) => {e.target.src = 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png'}} />
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: "15px" }}>Nhận tại cửa hàng</div>
                  <div className="text-muted" style={{ fontSize: "12px" }}>Nhận tại cửa hàng 2T Coffee Shop</div>
                </div>
              </div>
            </div>
          </label>
        </div>

        {/* Right Side: Details */}
        <div className="col-md-7">
          {deliveryMethod === 'DELIVERY' ? (
            <div className="h-100 d-flex flex-column">
              {/* Address Form / Info */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Địa chỉ đã lưu</label>
                <div 
                  className="form-control rounded-3 d-flex justify-content-between align-items-center cursor-pointer" 
                  onClick={onOpenAddressSelector}
                  style={{ backgroundColor: "#fcfcfc", height: "48px" }}
                >
                  <span className="text-dark text-truncate pe-3">
                    {selectedAddress ? getFullAddressString(selectedAddress) : "Chọn địa chỉ giao hàng..."}
                  </span>
                  <i className="fa-solid fa-chevron-down text-muted"></i>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-100 d-flex flex-column justify-content-center border rounded-4 p-4 bg-light text-center position-relative overflow-hidden">
              <i className="fa-solid fa-store text-muted opacity-25 position-absolute" style={{ fontSize: "100px", right: "-10px", bottom: "-10px" }}></i>
              <h5 className="fw-bold mb-2">2T Coffee Shop Flagship</h5>
              <p className="text-muted small mb-3">
                {storeInfo?.address || "123 Đường Điện Biên Phủ, Phường Đa Kao, Quận 1, TP.HCM"}
              </p>
              {storeInfo?.phone && (
                <p className="text-muted small fw-bold mb-3">SĐT: {storeInfo.phone}</p>
              )}
              <button 
                className="btn btn-outline-dark rounded-pill fw-medium btn-sm mx-auto" 
                style={{ width: "fit-content" }}
                onClick={() => {
                  if (storeInfo?.googleMapsUrl) {
                    const tempElement = document.createElement('div');
                    tempElement.innerHTML = storeInfo.googleMapsUrl;
                    const iframe = tempElement.querySelector('iframe');
                    const src = iframe ? iframe.src : storeInfo.googleMapsUrl;
                    window.open(src, '_blank');
                  } else {
                    window.open("https://maps.google.com/?q=" + encodeURIComponent(storeInfo?.address || "2T Coffee Shop"), "_blank");
                  }
                }}
              >
                <i className="fa-solid fa-map-location-dot me-1"></i> Xem bản đồ
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}

export default DeliveryMethodCard;
