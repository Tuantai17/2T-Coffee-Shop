import React from 'react';

function PaymentMethodCard({ paymentMethod, onChangePayment }) {
  return (
    <div className="card border-0 rounded-4 p-4 bg-white mb-4 shadow-sm" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <h6 className="fw-bold mb-4" style={{ color: "#2d2d2d", fontSize: "1.1rem" }}>
        6. PHƯƠNG THỨC THANH TOÁN
      </h6>
      
      <div className="row g-3 mb-4">
        {/* COD */}
        <div className="col-sm-6">
          <label 
            className={`card p-3 rounded-4 cursor-pointer h-100 transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary-subtle' : 'border'}`}
            style={{ 
              borderColor: paymentMethod === 'COD' ? '#c67c4e' : '#e8e0d8',
              backgroundColor: paymentMethod === 'COD' ? '#fdf8f4' : '#fff'
            }}
          >
            <div className="d-flex flex-column h-100 position-relative">
              <input 
                type="radio" 
                className="form-check-input position-absolute" 
                checked={paymentMethod === 'COD'} 
                onChange={() => onChangePayment('COD')}
                style={{ right: "0", top: "0", transform: "scale(1.2)" }} 
              />
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "40px", height: "40px" }}>
                  <img src="/images/cash.png" alt="COD" style={{ width: "24px", objectFit: "contain" }} onError={(e) => {e.target.src = 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png'}} />
                </div>
              </div>
              <div className="fw-bold text-dark mt-auto" style={{ fontSize: "14px" }}>Thanh toán khi nhận hàng</div>
              <div className="text-muted small">COD</div>
            </div>
          </label>
        </div>

        {/* VNPay */}
        <div className="col-sm-6">
          <label 
            className={`card p-3 rounded-4 cursor-pointer h-100 transition-all ${paymentMethod === 'VNPAY' ? 'border-primary bg-primary-subtle' : 'border'}`}
            style={{ 
              borderColor: paymentMethod === 'VNPAY' ? '#c67c4e' : '#e8e0d8',
              backgroundColor: paymentMethod === 'VNPAY' ? '#fdf8f4' : '#fff'
            }}
          >
            <div className="d-flex flex-column h-100 position-relative">
              <input 
                type="radio" 
                className="form-check-input position-absolute" 
                checked={paymentMethod === 'VNPAY'} 
                onChange={() => onChangePayment('VNPAY')}
                style={{ right: "0", top: "0", transform: "scale(1.2)" }} 
              />
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="bg-white rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: "60px", height: "40px" }}>
                  <img src="/images/vnpay.png" alt="VNPay" style={{ width: "50px", objectFit: "contain" }} onError={(e) => {e.target.src = 'https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg'}} />
                </div>
              </div>
              <div className="fw-bold text-dark mt-auto" style={{ fontSize: "14px" }}>VNPay</div>
              <div className="text-muted small">Thanh toán qua VNPay</div>
            </div>
          </label>
        </div>

        {/* Placeholders */}
        <div className="col-sm-4 col-6">
          <div className="card p-3 rounded-4 border bg-light h-100" style={{ opacity: 0.6, cursor: "not-allowed" }}>
            <div className="d-flex flex-column align-items-center text-center h-100 justify-content-center gap-2">
              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                <img src="/images/momo.png" alt="MoMo" style={{ width: "20px" }} onError={(e) => {e.target.src = 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png'}} />
              </div>
              <div>
                <div className="fw-bold text-muted" style={{ fontSize: "12px" }}>MoMo</div>
                <div className="text-muted" style={{ fontSize: "10px" }}>Sắp mở</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-4 col-6">
          <div className="card p-3 rounded-4 border bg-light h-100" style={{ opacity: 0.6, cursor: "not-allowed" }}>
            <div className="d-flex flex-column align-items-center text-center h-100 justify-content-center gap-2">
              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                <img src="/images/zalopay.png" alt="ZaloPay" style={{ width: "20px" }} onError={(e) => {e.target.src = 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay.png'}} />
              </div>
              <div>
                <div className="fw-bold text-muted" style={{ fontSize: "12px" }}>ZaloPay</div>
                <div className="text-muted" style={{ fontSize: "10px" }}>Sắp mở</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-4 col-12">
          <div className="card p-3 rounded-4 border bg-light h-100" style={{ opacity: 0.6, cursor: "not-allowed" }}>
            <div className="d-flex flex-column align-items-center text-center h-100 justify-content-center gap-2">
              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                <i className="fa-regular fa-credit-card"></i>
              </div>
              <div>
                <div className="fw-bold text-muted" style={{ fontSize: "12px" }}>Thẻ tín dụng</div>
                <div className="text-muted" style={{ fontSize: "10px" }}>Sắp mở</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Message based on Selection */}
      <div className="bg-warning-subtle p-3 rounded-3 text-dark small d-flex gap-2 align-items-center border border-warning" style={{ borderColor: "#ffeeba" }}>
        <i className="fa-solid fa-circle-check text-warning"></i>
        {paymentMethod === 'COD' 
          ? "Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng."
          : "Bạn sẽ được chuyển tới cổng thanh toán VNPay an toàn."}
      </div>

    </div>
  );
}

export default PaymentMethodCard;
