import React from 'react';

const ORDER_STEPS = [
  { status: 'PENDING_CONFIRMATION', label: 'Chờ duyệt', icon: 'fa-hourglass-half' },
  { status: 'CONFIRMED', label: 'Đã xác nhận', icon: 'fa-check' },
  { status: 'PREPARING', label: 'Đang chuẩn bị', icon: 'fa-box-open' },
  { status: 'READY_FOR_DELIVERY', label: 'Chờ giao hàng', icon: 'fa-truck-ramp-box' },
  { status: 'DELIVERING', label: 'Đang giao hàng', icon: 'fa-truck-fast' },
  { status: 'COMPLETED', label: 'Hoàn thành', icon: 'fa-check-double' }
];

function statusText(status) {
  switch (status) {
    case "COMPLETED": return "Hoàn thành";
    case "DELIVERING":
    case "SHIPPING": return "Đang giao hàng";
    case "READY_FOR_DELIVERY": return "Chờ giao hàng";
    case "CANCELLED": return "Đã hủy";
    case "PREPARING":
    case "PACKING": return "Đang chuẩn bị";
    case "CONFIRMED": return "Đã xác nhận";
    case "PENDING_CONFIRMATION":
    case "PENDING": return "Chờ duyệt";
    case "WAITING_FOR_RESTOCK": return "Chờ nhập hàng";
    case "AWAITING_CUSTOMER_DECISION": return "Chờ khách phản hồi";
    default: return status;
  }
}

function getPaymentStatusLabel(status) {
  switch (String(status || "").toUpperCase()) {
    case "PAID":
      return "Đã thanh toán";
    case "PAYMENT_ON_DELIVERY":
    case "PENDING":
      return "Chưa thanh toán";
    case "FAILED":
      return "Thất bại";
    case "CANCELLED":
      return "Đã hủy";
    case "REFUNDED":
      return "Đã hoàn tiền";
    default:
      return status || "Chưa thanh toán";
  }
}

const OrderDetailModal = ({ order, profile, onClose, claimedOrders = {}, onClaimPoints, claimingOrderId }) => {
  if (!order) return null;

  const formattedCode = `MKD${String(order.id).padStart(8, "0")}`;
  
  // Xử lý ngày giờ
  const orderDateObj = new Date(order.orderedDate || Date.now());
  const orderDate = orderDateObj.toLocaleDateString("vi-VN");
  let orderTime = "";
  if (Array.isArray(order.orderedDate) && order.orderedDate.length > 3) {
      orderTime = `${String(order.orderedDate[3]).padStart(2, '0')}:${String(order.orderedDate[4]).padStart(2, '0')}`;
  } else if (!Array.isArray(order.orderedDate) && String(order.orderedDate).includes("T")) {
      orderTime = orderDateObj.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
  }

  // Xác định bước hiện tại trong timeline
  let currentStepIndex = ORDER_STEPS.findIndex(s => s.status === order.status);
  
  // Nếu trạng thái là các trạng thái đặc biệt, ta vẫn có thể match tương đối
  if (currentStepIndex === -1) {
    if (order.status === 'PENDING') currentStepIndex = 0;
    if (order.status === 'WAITING_FOR_RESTOCK' || order.status === 'AWAITING_CUSTOMER_DECISION') currentStepIndex = 2; // Nằm ở giai đoạn chuẩn bị
  }

  const isCancelled = order.status === 'CANCELLED';

  const displayEmail = order.email || order.userEmail || order.user?.email || profile?.userDetails?.email || profile?.email || profile?.userName || "N/A";

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ 
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
        backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(6px)", zIndex: 1050,
        padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg position-relative d-flex flex-column"
        style={{ 
          width: "100%", maxWidth: "1200px", maxHeight: "95vh", 
          overflow: "hidden", fontFamily: "Inter, sans-serif" 
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom bg-light rounded-top-4">
          <div>
            <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <i className="fa-solid fa-receipt text-danger"></i>
              Chi tiết đơn hàng #{formattedCode}
            </h4>
            <div className="text-muted small d-flex gap-3">
              <span><i className="fa-regular fa-clock me-1"></i> {orderTime} {orderDate}</span>
              {isCancelled ? (
                <span className="badge bg-secondary">Đã hủy</span>
              ) : (
                <span className="badge bg-warning text-dark border">{statusText(order.status)}</span>
              )}
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary rounded-circle" style={{ width: "40px", height: "40px" }} onClick={() => window.print()} title="In đơn hàng">
              <i className="fa-solid fa-print"></i>
            </button>
            <button
              className="btn btn-light border rounded-circle"
              style={{ width: "40px", height: "40px" }}
              onClick={onClose}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-auto" style={{ backgroundColor: "#f8f9fa" }}>
          
          {/* Timeline */}
          <div className="card shadow-sm border-0 mb-4 rounded-4 overflow-hidden">
            <div className="card-body p-4">
              {isCancelled ? (
                <div className="text-center py-3">
                  <div className="mb-3">
                    <i className="fa-solid fa-circle-xmark text-danger" style={{ fontSize: "3rem" }}></i>
                  </div>
                  <h5 className="fw-bold text-danger">Đơn hàng đã bị hủy</h5>
                  <p className="text-muted mb-0">{order.cancelReason || "Người dùng yêu cầu hủy đơn hàng."}</p>
                </div>
              ) : (
                <div className="position-relative d-flex justify-content-between align-items-center w-100 px-3 px-md-5 py-2">
                  <div className="position-absolute top-50 start-0 w-100 translate-middle-y" style={{ height: "4px", backgroundColor: "#e9ecef", zIndex: 1, padding: "0 40px" }}>
                     <div 
                        style={{ 
                          height: "100%", 
                          backgroundColor: "#198754", 
                          width: `${Math.max(0, currentStepIndex) * (100 / (ORDER_STEPS.length - 1))}%`,
                          transition: "width 0.5s ease"
                        }} 
                      ></div>
                  </div>
                  
                  {ORDER_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isActive = index === currentStepIndex;
                    
                    return (
                      <div key={step.status} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 2 }}>
                        <div 
                          className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm border border-3 ${isCompleted ? 'bg-success text-white border-success' : 'bg-white text-muted border-light'}`}
                          style={{ 
                            width: isActive ? "50px" : "40px", 
                            height: isActive ? "50px" : "40px",
                            transition: "all 0.3s ease"
                          }}
                        >
                          <i className={`fa-solid ${step.icon} ${isActive ? 'fs-5' : 'small'}`}></i>
                        </div>
                        <div className={`mt-2 fw-medium text-center ${isCompleted ? 'text-dark' : 'text-muted'}`} style={{ fontSize: "0.8rem", maxWidth: "80px" }}>
                          {step.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Loyalty Points Reward */}
          {order.status === "COMPLETED" && (
            claimedOrders[String(order.id)] ? (
              <div className="alert alert-success d-flex align-items-center mb-4 rounded-4 shadow-sm border-success-subtle py-3" role="alert">
                <i className="fa-solid fa-circle-check fs-3 me-3 text-success"></i>
                <div>
                  <h6 className="alert-heading fw-bold mb-1">Đã nhận điểm thưởng!</h6>
                  <p className="mb-0">Bạn đã nhận được <strong className="text-success">+{claimedOrders[String(order.id)]} điểm thưởng</strong> Loyalty từ đơn hàng này.</p>
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-between mb-4 rounded-4 shadow-sm py-3 px-4" style={{ background: 'linear-gradient(135deg, #fff7e6 0%, #ffe8cc 100%)', border: '1.5px solid #ffc107' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)', color: 'white' }}>
                    <i className="fa-solid fa-gift fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Phần thưởng đơn hàng</h6>
                    <p className="mb-0 small text-muted">Bạn có <strong className="text-warning">+{Math.floor((order.total || 0) / 1000)} điểm thưởng</strong> chờ nhận từ đơn hàng này!</p>
                  </div>
                </div>
                <button
                  className="btn btn-warning btn-sm rounded-pill px-4 py-2 fw-bold shadow d-flex align-items-center gap-2"
                  style={{ fontSize: '0.9rem', minWidth: '150px', justifyContent: 'center' }}
                  disabled={claimingOrderId === order.id}
                  onClick={() => onClaimPoints && onClaimPoints(order)}
                >
                  {claimingOrderId === order.id ? (
                    <><span className="spinner-border spinner-border-sm"></span> Đang nhận...</>
                  ) : (
                    <><i className="fa-solid fa-hand-holding-heart"></i> Nhận điểm thưởng</>
                  )}
                </button>
              </div>
            )
          )}

          {/* 3 Columns Grid */}
          <div className="row g-4 mb-4">
            {/* Customer Info */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 h-100 rounded-4">
                <div className="card-header bg-white border-bottom pt-3 pb-2 px-4 d-flex align-items-center">
                  <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: "36px", height: "36px"}}>
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <h6 className="fw-bold mb-0">Khách hàng</h6>
                </div>
                <div className="card-body p-4">
                  <div className="row mb-2">
                    <div className="col-4 text-muted small">Họ tên:</div>
                    <div className="col-8 fw-semibold">{order.receiverName || order.user?.userName || order.userName || "N/A"}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 text-muted small">Điện thoại:</div>
                    <div className="col-8 fw-semibold">{order.phone || "N/A"}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 text-muted small">Email:</div>
                    <div className="col-8 fw-semibold text-truncate" title={displayEmail}>{displayEmail}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 h-100 rounded-4">
                <div className="card-header bg-white border-bottom pt-3 pb-2 px-4 d-flex align-items-center">
                  <div className="bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: "36px", height: "36px"}}>
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <h6 className="fw-bold mb-0">Giao hàng</h6>
                </div>
                <div className="card-body p-4">
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Địa chỉ nhận hàng:</div>
                    <div className="fw-semibold lh-sm">
                      {[order.address, order.ward, order.district, order.province].filter(Boolean).join(", ") || "Chưa có địa chỉ"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted small mb-1">Ghi chú:</div>
                    <div className="fst-italic text-dark">{order.note || <span className="text-muted">Không có ghi chú</span>}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 h-100 rounded-4">
                <div className="card-header bg-white border-bottom pt-3 pb-2 px-4 d-flex align-items-center">
                  <div className="bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: "36px", height: "36px"}}>
                    <i className="fa-solid fa-wallet"></i>
                  </div>
                  <h6 className="fw-bold mb-0">Thanh toán</h6>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Phương thức:</span>
                    <span className="fw-semibold text-end">{order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : (order.paymentMethod || "COD")}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Trạng thái:</span>
                    <span className="badge bg-light border text-dark">{getPaymentStatusLabel(order.paymentStatus)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="card shadow-sm border-0 mb-4 rounded-4">
            <div className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex align-items-center">
              <div className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: "36px", height: "36px"}}>
                <i className="fa-solid fa-box-open"></i>
              </div>
              <h6 className="fw-bold mb-0">Sản phẩm đã mua ({order.items?.length || 0})</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle table-hover mb-0">
                  <thead className="table-light text-muted small">
                    <tr>
                      <th className="px-4 py-3 border-0">Sản phẩm</th>
                      <th className="text-end py-3 border-0">Đơn giá</th>
                      <th className="text-center py-3 border-0">SL</th>
                      <th className="text-end px-4 py-3 border-0">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                      {order.items?.map((item) => {
                        const finalQty = item.finalQuantity !== null && item.finalQuantity !== undefined ? item.finalQuantity : item.quantity;
                        const isRemoved = item.itemStatus === 'REMOVED' || item.itemStatus === 'CANCELLED';
                        const productPrice = item.unitPrice || item.product?.price || 0;
                        const productCost = productPrice * finalQty;
                        const itemSubTotal = item.subTotal || productCost;
                        const toppingCost = Math.max(0, itemSubTotal - productCost);
                        
                        return (
                          <tr key={item.id || item.product?.id} className={isRemoved ? "opacity-50" : ""}>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center gap-3">
                                {item.product?.imageUrl ? (
                                  <img 
                                    src={item.product.imageUrl} 
                                    alt="Product" 
                                    className="rounded-3 border" 
                                    style={{ width: "60px", height: "60px", objectFit: "cover" }} 
                                  />
                                ) : (
                                  <div className="bg-light rounded-3 border d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}>
                                    <i className="fa-solid fa-image text-muted"></i>
                                  </div>
                                )}
                                <div>
                                  <div className="fw-semibold text-dark text-wrap" style={{ maxWidth: "350px", fontSize: "0.95rem" }}>
                                    {item.productName || item.product?.productName || "Sản phẩm đồ chơi"}
                                  </div>
                                  <div className="small text-muted mt-1">
                                    SKU: {item.productId || item.product?.id || "N/A"}
                                    {isRemoved && <span className="badge bg-danger ms-2">Đã hủy/Loại bỏ</span>}
                                  </div>
                                  {(item.variantName || item.optionsSnapshot || item.toppingsSnapshot || item.note) && (
                                    <div className="mt-2" style={{ fontSize: "0.85rem", color: "#666" }}>
                                      {item.variantName && <div className="mb-1"><i className="fa-solid fa-ruler me-1" style={{ fontSize: "9px" }}></i>Size {item.variantName}</div>}
                                      {item.optionsSnapshot && <div className="mb-1"><i className="fa-solid fa-sliders me-1" style={{ fontSize: "9px" }}></i>Tuỳ chọn: {item.optionsSnapshot}</div>}
                                      {item.toppingsSnapshot && <div className="mb-1"><i className="fa-solid fa-ice-cream me-1" style={{ fontSize: "9px" }}></i>Topping: {Object.entries(item.toppingsSnapshot.split(', ').reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {})).map(([name, count]) => count > 1 ? `${name} (x${count})` : name).join(', ')}</div>}
                                      {item.note && <div className="mb-1 fst-italic"><i className="fa-regular fa-comment-dots me-1" style={{ fontSize: "9px" }}></i>Ghi chú: {item.note}</div>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-end py-3 fw-medium text-dark">{productPrice.toLocaleString("vi-VN")} đ</td>
                            <td className="text-center py-3 fw-medium">x{finalQty}</td>
                            <td className="text-end px-4 py-3 text-dark">
                              {toppingCost > 0 ? (
                                <div className="d-flex flex-column align-items-end" style={{ fontSize: "0.85rem" }}>
                                  <div className="d-flex justify-content-between mb-1 text-muted" style={{ width: "130px" }}>
                                    <span>Sản phẩm:</span>
                                    <span>{productCost.toLocaleString("vi-VN")} đ</span>
                                  </div>
                                  <div className="d-flex justify-content-between mb-1 text-muted" style={{ width: "130px" }}>
                                    <span>Topping:</span>
                                    <span>{toppingCost.toLocaleString("vi-VN")} đ</span>
                                  </div>
                                  <div className="d-flex justify-content-between pt-1 mt-1 border-top" style={{ width: "130px" }}>
                                    <span className="fw-semibold">Tổng:</span>
                                    <span className="fw-bold text-dark">{itemSubTotal.toLocaleString("vi-VN")} đ</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="fw-bold">{itemSubTotal.toLocaleString("vi-VN")} đ</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Order Totals Footer */}
            <div className="card-footer bg-white border-top p-4 rounded-bottom-4">
              <div className="row justify-content-end">
                <div className="col-md-5 col-lg-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tạm tính:</span>
                    <span className="fw-semibold">{(((order.total || 0) - (order.shippingFee || 0) + (order.discountAmount || 0))).toLocaleString("vi-VN")} đ</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Giảm giá:</span>
                    <span className="fw-semibold text-danger">-{order.discountAmount?.toLocaleString("vi-VN") || 0} đ</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Phí vận chuyển:</span>
                    <span className="fw-semibold">{order.shippingFee?.toLocaleString("vi-VN") || 0} đ</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top border-2 border-danger-subtle">
                    <span className="fw-bold fs-5 text-dark">Tổng thanh toán:</span>
                    <span className="fw-extrabold fs-3 text-danger">{(order.total || 0).toLocaleString("vi-VN")} đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
