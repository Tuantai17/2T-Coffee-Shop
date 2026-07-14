import React from "react";
import { Link } from "react-router-dom";

const getStatusBadge = (status) => {
  switch (status) {
    case "PENDING_CONFIRMATION":
      return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: "#fef08a", color: "#854d0e" }}>Chờ xác nhận</span>;
    case "CONFIRMED":
      return <span className="badge bg-info text-white px-3 py-2 rounded-pill shadow-sm">Đã xác nhận</span>;
    case "PREPARING":
      return <span className="badge bg-secondary text-white px-3 py-2 rounded-pill shadow-sm">Đang chuẩn bị</span>;
    case "READY_FOR_PICKUP":
      return <span className="badge bg-primary text-white px-3 py-2 rounded-pill shadow-sm">Chờ nhận tại quầy</span>;
    case "READY_FOR_DELIVERY":
      return <span className="badge bg-primary text-white px-3 py-2 rounded-pill shadow-sm">Chờ giao hàng</span>;
    case "DELIVERING":
      return <span className="badge px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: "var(--admin-primary)", color: "white" }}>Đang giao</span>;
    case "COMPLETED":
      return <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm">Hoàn thành</span>;
    case "CANCELLED":
      return <span className="badge bg-danger px-3 py-2 rounded-pill shadow-sm">Đã hủy</span>;
    default:
      return <span className="badge bg-secondary px-3 py-2 rounded-pill shadow-sm">{status}</span>;
  }
};

const getPaymentBadge = (status) => {
  switch (status) {
    case "PAID":
      return <span className="text-success fw-bold" style={{ fontSize: "11px" }}>Đã thanh toán</span>;
    case "PENDING":
    case "PAYMENT_ON_DELIVERY":
      return <span className="text-warning fw-bold" style={{ fontSize: "11px" }}>Chưa thanh toán</span>;
    case "FAILED":
      return <span className="text-danger fw-bold" style={{ fontSize: "11px" }}>Thất bại</span>;
    case "CANCELLED":
      return <span className="text-secondary fw-bold" style={{ fontSize: "11px" }}>Đã hủy</span>;
    case "REFUNDED":
      return <span className="text-info fw-bold" style={{ fontSize: "11px" }}>Đã hoàn tiền</span>;
    default:
      return <span className="text-muted fw-bold" style={{ fontSize: "11px" }}>{status}</span>;
  }
};

function OrderList({
  orders,
  loading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onViewDetail,
  onUpdateStatus,
  onPrint,
  onExportSingle
}) {
  const isAllSelected = orders.length > 0 && orders.every((o) => selectedIds.includes(o.id));
  const isIndeterminate = !isAllSelected && orders.some((o) => selectedIds.includes(o.id));

  const formatMoney = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  const formatDate = (dateArr) => {
    if (!dateArr) return "-";
    if (Array.isArray(dateArr)) {
      // Backend returns LocalDate as array [year, month, day]
      const [y, m, d] = dateArr;
      return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    }
    // String ISO
    const date = new Date(dateArr);
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateArr) => {
    if (!dateArr) return { date: "-", time: "-" };
    if (Array.isArray(dateArr)) {
      const [y, m, d] = dateArr;
      return { 
        date: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
        time: "00:00" // Not available in LocalDate
      };
    }
    const date = new Date(dateArr);
    return {
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="neu-card overflow-hidden mb-4">
      {selectedIds.length > 0 && (
        <div className="bg-light px-4 py-3 d-flex align-items-center justify-content-between border-bottom">
          <div className="fw-bold text-primary">
            <i className="fa-regular fa-square-check me-2"></i>
            Đã chọn {selectedIds.length} đơn hàng
          </div>
          <div className="d-flex gap-2">
            <div className="dropdown">
              <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold dropdown-toggle" data-bs-toggle="dropdown">
                Cập nhật trạng thái
              </button>
              <ul className="dropdown-menu shadow-sm rounded-3">
                <li><button className="dropdown-item small text-info" onClick={() => onUpdateStatus(selectedIds, "CONFIRMED")}>Xác nhận đơn (CONFIRMED)</button></li>
                <li><button className="dropdown-item small text-secondary" onClick={() => onUpdateStatus(selectedIds, "PREPARING")}>Đang chuẩn bị (PREPARING)</button></li>
                <li><button className="dropdown-item small text-warning" onClick={() => onUpdateStatus(selectedIds, "READY_FOR_PICKUP")}>Chờ nhận tại quầy (READY_FOR_PICKUP)</button></li>
                <li><button className="dropdown-item small text-warning" onClick={() => onUpdateStatus(selectedIds, "READY_FOR_DELIVERY")}>Chờ giao hàng (READY_FOR_DELIVERY)</button></li>
                <li><button className="dropdown-item small text-primary" onClick={() => onUpdateStatus(selectedIds, "DELIVERING")}>Đang giao (DELIVERING)</button></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item small text-success" onClick={() => onUpdateStatus(selectedIds, "COMPLETED")}>Hoàn thành (COMPLETED)</button></li>
                <li><button className="dropdown-item small text-danger" onClick={() => onUpdateStatus(selectedIds, "CANCELLED")}>Hủy đơn (CANCELLED)</button></li>
              </ul>
            </div>
            <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold" onClick={onPrint}>
              <i className="fa-solid fa-print me-1"></i> In đơn đã chọn
            </button>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ minWidth: "1100px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface)", borderBottom: "2px solid rgba(0,0,0,0.05)" }}>
              <th className="px-4 py-3" style={{ width: "40px" }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  style={{ cursor: "pointer" }}
                  checked={isAllSelected}
                  ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
                  onChange={(e) => onSelectAll(e.target.checked, orders)}
                />
              </th>
              <th className="py-3 text-muted small fw-bold">Mã đơn hàng</th>
              <th className="py-3 text-muted small fw-bold">Khách hàng</th>
              <th className="py-3 text-muted small fw-bold">Ngày đặt</th>
              <th className="py-3 text-muted small fw-bold" style={{ width: "200px" }}>Sản phẩm</th>
              <th className="py-3 text-muted small fw-bold text-end">Tổng tiền</th>
              <th className="py-3 text-muted small fw-bold px-4">Thanh toán</th>
              <th className="py-3 text-muted small fw-bold text-center">Trạng thái</th>
              <th className="py-3 text-muted small fw-bold">Cập nhật</th>
              <th className="py-3 text-muted small fw-bold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan="10" className="px-4 py-3">
                    <div className="placeholder-glow d-flex gap-3 align-items-center">
                      <span className="placeholder rounded" style={{ width: "80px" }}></span>
                      <span className="placeholder rounded col-2"></span>
                      <span className="placeholder rounded col-3"></span>
                      <span className="placeholder rounded col-2"></span>
                    </div>
                  </td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-5 text-muted">
                  <i className="fa-solid fa-box-open fs-1 mb-3"></i>
                  <p className="mb-0">Không tìm thấy đơn hàng nào.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const { date, time } = formatDateTime(order.orderedDate);
                const itemsCount = order.items?.length || 0;
                
                return (
                  <tr key={order.id} style={{ borderBottom: "1px dashed rgba(0,0,0,0.05)" }}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        style={{ cursor: "pointer" }}
                        checked={selectedIds.includes(order.id)}
                        onChange={(e) => onSelectOne(order.id, e.target.checked)}
                      />
                    </td>
                    <td className="py-3">
                      <button 
                        className="btn btn-link p-0 text-primary fw-bold text-decoration-none" 
                        onClick={() => onViewDetail(order)}
                      >
                        #MKD-{String(order.id).padStart(6, '0')}
                      </button>
                    </td>
                    <td className="py-3">
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: "150px" }}>
                        {order.receiverName || order.user?.userName || "Khách vãng lai"}
                      </div>
                      <div className="small text-muted">{order.phone || "Không có SĐT"}</div>
                    </td>
                    <td className="py-3 text-muted small">
                      <div className="fw-semibold">{date}</div>
                      <div className="text-black-50">{time}</div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        {/* Display up to 3 thumbnails */}
                        <div className="d-flex">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <img 
                              key={idx} 
                              src={item.imageUrl || item.product?.imageUrl || "https://placehold.co/100?text=No+Img"} 
                              alt="product" 
                              className="rounded bg-white border border-light shadow-sm object-fit-cover" 
                              style={{ width: "32px", height: "32px", marginLeft: idx > 0 ? "-10px" : "0", zIndex: 10 - idx }}
                            />
                          ))}
                        </div>
                        <div className="small text-muted lh-1">
                          {itemsCount > 3 ? <div>+{itemsCount - 3} sản phẩm</div> : ""}
                          <div style={{ fontSize: "10px" }}>({itemsCount} sản phẩm)</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-end fw-bold text-dark">
                      {formatMoney(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="fw-semibold text-dark small">{order.paymentMethod || "COD"}</div>
                      <div>{getPaymentBadge(order.paymentStatus)}</div>
                    </td>
                    <td className="py-3 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3 text-muted small">
                      <div className="fw-semibold">{date}</div>
                      <div className="text-black-50">{time}</div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="dropdown">
                        <button className="btn btn-sm btn-light text-secondary rounded-circle shadow-sm" style={{ width: "32px", height: "32px" }} data-bs-toggle="dropdown" data-bs-boundary="window" data-bs-display="static">
                          <i className="fa-solid fa-ellipsis"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-sm rounded-3">
                          <li>
                            <button className="dropdown-item small" onClick={() => onViewDetail(order)}>
                              <i className="fa-regular fa-eye w-20px me-2 text-secondary"></i> Xem chi tiết
                            </button>
                          </li>
                          <li>
                            <Link to={`/admin/orders/${order.id}/edit`} className={`dropdown-item small ${order.status === 'COMPLETED' || order.status === 'CANCELLED' ? 'disabled' : ''}`}>
                              <i className="fa-solid fa-pen-to-square w-20px me-2 text-primary"></i> Chỉnh sửa đơn hàng
                            </Link>
                          </li>
                          <li>
                            <button className="dropdown-item small" onClick={() => onPrint([order.id])}>
                              <i className="fa-solid fa-print w-20px me-2 text-secondary"></i> In đơn hàng
                            </button>
                          </li>
                          <li>
                            <Link to={`/admin/orders/${order.id}/edit`} className="dropdown-item small">
                              <i className="fa-solid fa-clock-rotate-left w-20px me-2 text-info"></i> Xem lịch sử xử lý
                            </Link>
                          </li>
                          <li>
                            <Link to={`/admin/orders/${order.id}/edit`} className="dropdown-item small">
                              <i className="fa-solid fa-headset w-20px me-2 text-warning"></i> Ghi nhận liên hệ
                            </Link>
                          </li>
                          {order.status !== 'SHIPPING' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                            <>
                              <li>
                                <button className="dropdown-item small text-danger fw-bold" onClick={() => {
                                  if (onCancel) onCancel(order.id);
                                }}>
                                  <i className="fa-solid fa-xmark w-20px me-2"></i> Hủy đơn hàng
                                </button>
                              </li>
                            </>
                          )}
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button className="dropdown-item small" onClick={() => onExportSingle(order)}>
                              <i className="fa-solid fa-file-excel w-20px me-2 text-success"></i> Xuất Excel
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderList;
