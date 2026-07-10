import React from 'react';

function DeliveryMethodCard({ 
  deliveryMethod, 
  onChangeMethod, 
  selectedAddress, 
  onOpenAddressSelector, 
  onOpenAddressForm,
  form,
  onChangeForm,
  getFullAddressString
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
                  <div className="text-muted" style={{ fontSize: "12px" }}>Nhận tại cửa hàng Brew Moments</div>
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

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Họ và tên</label>
                  <input 
                    type="text" 
                    name="receiverName"
                    value={form.receiverName}
                    onChange={onChangeForm}
                    className="form-control rounded-3" 
                    placeholder="Nguyễn Văn A" 
                    style={{ height: "48px" }}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Số điện thoại</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={form.phone}
                    onChange={onChangeForm}
                    className="form-control rounded-3" 
                    placeholder="0901 234 567" 
                    style={{ height: "48px" }}
                  />
                </div>
              </div>

              <div className="mt-auto">
                <label className="form-label small fw-semibold text-muted mb-1">Ghi chú giao hàng</label>
                <input 
                  type="text" 
                  name="note"
                  value={form.note}
                  onChange={onChangeForm}
                  className="form-control rounded-3 border-0 bg-light" 
                  placeholder="Giao giờ hành chính, gọi trước khi giao. Cảm ơn!"
                  style={{ height: "48px" }}
                />
              </div>
            </div>
          ) : (
            <div className="h-100 d-flex flex-column justify-content-center border rounded-4 p-4 bg-light text-center position-relative overflow-hidden">
              <i className="fa-solid fa-store text-muted opacity-25 position-absolute" style={{ fontSize: "100px", right: "-10px", bottom: "-10px" }}></i>
              <h5 className="fw-bold mb-2">Brew Moments Flagship</h5>
              <p className="text-muted small mb-3">123 Đường Điện Biên Phủ, Phường Đa Kao, Quận 1, TP.HCM</p>
              <div className="d-flex justify-content-center gap-3 mb-3">
                <span className="badge bg-white text-dark border px-3 py-2 rounded-pill"><i className="fa-solid fa-location-dot text-danger me-1"></i> 1.2 km</span>
                <span className="badge bg-white text-dark border px-3 py-2 rounded-pill"><i className="fa-regular fa-clock text-primary me-1"></i> 15 phút</span>
              </div>
              <button className="btn btn-outline-dark rounded-pill fw-medium btn-sm mx-auto" style={{ width: "fit-content" }}>
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
