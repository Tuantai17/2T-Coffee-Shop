import React, { useState } from "react";

const getStatusBadge = (status) => {
  switch (status) {
    case "PENDING_CONFIRMATION":
      return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">Chờ xác nhận</span>;
    case "CONFIRMED":
      return <span className="badge bg-info text-white px-3 py-2 rounded-pill">Đã xác nhận</span>;
    case "PREPARING":
      return <span className="badge bg-secondary text-white px-3 py-2 rounded-pill">Đang chuẩn bị</span>;
    case "READY_FOR_PICKUP":
      return <span className="badge bg-primary text-white px-3 py-2 rounded-pill">Chờ nhận tại quầy</span>;
    case "READY_FOR_DELIVERY":
      return <span className="badge bg-primary text-white px-3 py-2 rounded-pill">Chờ giao hàng</span>;
    case "DELIVERING":
      return <span className="badge px-3 py-2 rounded-pill" style={{ backgroundColor: "var(--admin-primary)", color: "white" }}>Đang giao</span>;
    case "COMPLETED":
      return <span className="badge bg-success px-3 py-2 rounded-pill">Hoàn thành</span>;
    case "CANCELLED":
      return <span className="badge bg-danger px-3 py-2 rounded-pill">Đã hủy</span>;
    default:
      return <span className="badge bg-secondary px-3 py-2 rounded-pill">{status}</span>;
  }
};

const getPaymentBadge = (status) => {
  switch (status) {
    case "PAID": return <span className="badge bg-success bg-opacity-10 text-success border border-success">Đã thanh toán</span>;
    case "PENDING":
    case "PAYMENT_ON_DELIVERY": return <span className="badge bg-warning bg-opacity-10 text-warning border border-warning">Chưa thanh toán</span>;
    case "FAILED": return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">Thất bại</span>;
    case "CANCELLED": return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">Đã hủy</span>;
    case "REFUNDED": return <span className="badge bg-info bg-opacity-10 text-info border border-info">Đã hoàn tiền</span>;
    default: return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">{status}</span>;
  }
};

function OrderDetailDrawer({ show, order, loading, error, onRetry, onClose, onUpdateStatus, onPrint, onExport }) {
  const [updating, setUpdating] = useState(false);

  if (!show || !order) return null;

  const formatMoney = (val) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

  const formatDateTime = (dateArr) => {
    if (!dateArr) return "-";
    if (Array.isArray(dateArr)) {
      const [y, m, d] = dateArr;
      return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    }
    const date = new Date(dateArr);
    return date.toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleUpdate = async (status) => {
    setUpdating(true);
    await onUpdateStatus([order.id], status);
    setUpdating(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="offcanvas-backdrop fade show" onClick={onClose} style={{ zIndex: 1040 }}></div>
      
      {/* Drawer */}
      <div 
        className="offcanvas offcanvas-end show shadow-lg border-0" 
        style={{ width: "100%", maxWidth: "1000px", zIndex: 1050, backgroundColor: "var(--admin-bg)" }} 
        tabIndex="-1"
      >
        <div className="offcanvas-header bg-white border-bottom px-4 py-3 shadow-sm z-1">
          <div>
            <h5 className="offcanvas-title fw-bold text-dark mb-1">Chi tiết đơn hàng #{String(order.id).padStart(6, '0')}</h5>
            <div className="d-flex align-items-center gap-3 small text-muted">
              <span><i className="fa-regular fa-calendar me-1"></i> {formatDateTime(order.orderedDate)}</span>
              <span>{getStatusBadge(order.status)}</span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm rounded-circle" style={{ width: "36px", height: "36px" }} onClick={() => onPrint([order.id])} title="In đơn">
              <i className="fa-solid fa-print"></i>
            </button>
            <button className="btn btn-outline-success btn-sm rounded-circle" style={{ width: "36px", height: "36px" }} onClick={() => onExport(order)} title="Xuất Excel">
              <i className="fa-solid fa-file-excel"></i>
            </button>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
        </div>
        
        <div className="offcanvas-body p-4 position-relative" style={{ overflowY: "auto" }}>
          {loading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-2">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <i className="fa-solid fa-triangle-exclamation me-2"></i>
              <div>
                Lỗi khi tải dữ liệu chi tiết! 
                <button className="btn btn-link btn-sm text-danger text-decoration-none ms-2 p-0 fw-bold" onClick={onRetry}>
                  Thử lại
                </button>
              </div>
            </div>
          )}

          <div className="row g-4">
            
            {/* Customer & Shipping Info */}
            <div className="col-md-6">
              <div className="neu-card p-4 h-100">
                <h6 className="fw-bold mb-3 border-bottom pb-2"><i className="fa-regular fa-user me-2 text-primary"></i> Khách hàng</h6>
                <div className="d-flex mb-2">
                  <span className="text-muted w-25">Họ tên:</span>
                  <span className="fw-semibold">{order.receiverName || order.user?.userName || "Khách vãng lai"}</span>
                </div>
                <div className="d-flex mb-2">
                  <span className="text-muted w-25">SĐT:</span>
                  <span className="fw-semibold">{order.phone || "Không có"}</span>
                </div>
                <div className="d-flex">
                  <span className="text-muted w-25">User ID:</span>
                  <span>{order.user?.id || "-"}</span>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="neu-card p-4 h-100">
                <h6 className="fw-bold mb-3 border-bottom pb-2"><i className="fa-solid fa-truck-fast me-2 text-primary"></i> Giao hàng</h6>
                <div className="d-flex mb-2">
                  <span className="text-muted w-25">Địa chỉ:</span>
                  <span className="fw-semibold w-75">
                    {order.address}<br/>
                    {[order.ward, order.district, order.province].filter(Boolean).join(", ")}
                  </span>
                </div>
                <div className="d-flex">
                  <span className="text-muted w-25">Ghi chú:</span>
                  <span className="fst-italic text-danger w-75">{order.note || "Không có ghi chú"}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="col-12">
              <div className="neu-card overflow-hidden">
                <div className="bg-light px-4 py-3 border-bottom">
                  <h6 className="fw-bold mb-0"><i className="fa-solid fa-box-open me-2 text-primary"></i> Sản phẩm đã mua ({order.items?.length || 0})</h6>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-2 small text-muted">Sản phẩm</th>
                        <th className="py-2 small text-muted text-center">Đơn giá</th>
                        <th className="py-2 small text-muted text-center">SL</th>
                        <th className="py-2 px-4 small text-muted text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <img src={item.imageUrl || item.product?.imageUrl || "https://placehold.co/50"} alt="product" className="rounded" style={{ width: "48px", height: "48px", objectFit: "cover" }} />
                              <div>
                                <div className="fw-semibold" style={{ fontSize: "14px" }}>{item.productName || item.product?.productName || "Sản phẩm không rõ"}</div>
                                <div className="small text-muted mb-1">SKU: {item.productId || item.product?.id || "N/A"}</div>
                                {(item.variantName || item.options || item.toppings || item.note) && (
                                  <div className="small p-2 bg-light rounded border border-light" style={{ fontSize: "12px" }}>
                                    {item.variantName && <div className="mb-1"><span className="fw-semibold">Size:</span> {item.variantName}</div>}
                                    {item.options && item.options.length > 0 && (
                                      <div className="mb-1"><span className="fw-semibold">Tùy chọn:</span> {Array.isArray(item.options) ? item.options.join(", ") : item.options}</div>
                                    )}
                                    {item.toppings && item.toppings.length > 0 && (
                                      <div className="mb-1"><span className="fw-semibold">Topping:</span> {Array.isArray(item.toppings) ? item.toppings.join(", ") : item.toppings}</div>
                                    )}
                                    {item.note && (
                                      <div><span className="fw-semibold">Ghi chú:</span> <span className="fst-italic">{item.note}</span></div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-center">{formatMoney(item.unitPrice)}</td>
                          <td className="py-3 text-center fw-semibold">x{item.quantity}</td>
                          <td className="py-3 px-4 text-end fw-bold text-dark">{formatMoney((item.unitPrice || 0) * (item.quantity || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="col-md-6">
              <div className="neu-card p-4 h-100">
                <h6 className="fw-bold mb-3 border-bottom pb-2"><i className="fa-regular fa-credit-card me-2 text-primary"></i> Thanh toán</h6>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Phương thức:</span>
                  <span className="fw-bold">{order.paymentMethod || "COD"}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Trạng thái TT:</span>
                  {getPaymentBadge(order.paymentStatus)}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="neu-card p-4 h-100">
                <h6 className="fw-bold mb-3 border-bottom pb-2"><i className="fa-solid fa-receipt me-2 text-primary"></i> Tổng kết tiền</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tạm tính:</span>
                  <span>{formatMoney(order.total - (order.shippingFee || 0) + (order.discountAmount || 0))}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 text-danger">
                  <span className="text-muted">Giảm giá {order.voucherCode ? `(${order.voucherCode})` : ""}:</span>
                  <span>- {formatMoney(order.discountAmount || 0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                  <span className="text-muted">Phí vận chuyển:</span>
                  <span>+ {formatMoney(order.shippingFee || 0)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="fw-bold fs-5">Tổng thanh toán:</span>
                  <span className="fw-bold fs-5 text-primary">{formatMoney(order.total)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="offcanvas-footer bg-white border-top p-4">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold text-muted">Cập nhật trạng thái nhanh:</span>
            <div className="d-flex gap-2 flex-wrap justify-content-end">
              {order.status === "PENDING_CONFIRMATION" && <button className="btn btn-outline-info rounded-pill" disabled={updating} onClick={() => handleUpdate("CONFIRMED")}>Xác nhận</button>}
              {order.status === "CONFIRMED" && <button className="btn btn-outline-secondary rounded-pill" disabled={updating} onClick={() => handleUpdate("PREPARING")}>Chuẩn bị</button>}
              {order.status === "PREPARING" && <button className="btn btn-outline-warning rounded-pill" disabled={updating} onClick={() => handleUpdate("READY_FOR_PICKUP")}>Chờ nhận (Tại quầy)</button>}
              {order.status === "PREPARING" && <button className="btn btn-outline-warning rounded-pill" disabled={updating} onClick={() => handleUpdate("READY_FOR_DELIVERY")}>Chờ giao (Delivery)</button>}
              {order.status === "READY_FOR_DELIVERY" && <button className="btn btn-outline-primary rounded-pill" disabled={updating} onClick={() => handleUpdate("DELIVERING")}>Đang giao</button>}
              {(order.status === "DELIVERING" || order.status === "READY_FOR_PICKUP") && <button className="btn btn-success rounded-pill text-white" disabled={updating} onClick={() => handleUpdate("COMPLETED")}>Hoàn thành</button>}
              <a href={`/admin/orders/${order.id}/edit`} className="btn btn-primary px-4 rounded-pill">
                <i className="fa-solid fa-pen-to-square me-2"></i>
                Quản lý Đơn hàng
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderDetailDrawer;
