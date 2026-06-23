import React from "react";

// For CSS printing, we should inject some styles into the document or use CSS classes.
// In index.css:
// @media print {
//   body * { visibility: hidden; }
//   #print-section, #print-section * { visibility: visible; }
//   #print-section { position: absolute; left: 0; top: 0; width: 100%; }
//   .no-print { display: none !important; }
// }

function OrderPrintView({ ordersToPrint }) {
  if (!ordersToPrint || ordersToPrint.length === 0) return null;

  const formatMoney = (val) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

  const formatDateTime = (dateArr) => {
    if (!dateArr) return "-";
    if (Array.isArray(dateArr)) {
      const [y, m, d] = dateArr;
      return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    }
    const date = new Date(dateArr);
    return date.toLocaleString("vi-VN");
  };

  return (
    <div id="print-section" className="bg-white text-dark" style={{ position: "absolute", top: "-9999px", left: "-9999px", width: "100%" }}>
      {ordersToPrint.map((order, index) => (
        <div 
          key={order.id} 
          style={{ 
            pageBreakAfter: index < ordersToPrint.length - 1 ? "always" : "auto",
            padding: "20px",
            fontFamily: "Arial, sans-serif"
          }}
        >
          <div className="text-center mb-4 pb-3 border-bottom border-dark">
            <h1 className="fw-bold mb-1">CỬA HÀNG ĐỒ CHƠI MYKINGDOM</h1>
            <p className="mb-0">Website: www.mykingdom.clone</p>
            <h2 className="fw-bold mt-4">PHIẾU ĐƠN HÀNG</h2>
            <p className="mb-0">Mã đơn: <strong>#MKD-{String(order.id).padStart(6, '0')}</strong></p>
            <p className="small">Ngày đặt: {formatDateTime(order.orderedDate)}</p>
          </div>

          <div className="row mb-4">
            <div className="col-6">
              <h5 className="fw-bold border-bottom pb-1">Thông tin khách hàng</h5>
              <p className="mb-1">Họ tên: {order.receiverName || order.user?.userName}</p>
              <p className="mb-1">SĐT: {order.phone}</p>
            </div>
            <div className="col-6">
              <h5 className="fw-bold border-bottom pb-1">Thông tin giao hàng</h5>
              <p className="mb-1">Địa chỉ: {order.address}</p>
              <p className="mb-1">{[order.ward, order.district, order.province].filter(Boolean).join(", ")}</p>
              <p className="mb-1">Ghi chú: {order.note}</p>
            </div>
          </div>

          <table className="table table-bordered border-dark mb-4">
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{ width: "50px" }}>STT</th>
                <th>Sản phẩm</th>
                <th className="text-center">SKU</th>
                <th className="text-end">Đơn giá</th>
                <th className="text-center" style={{ width: "80px" }}>SL</th>
                <th className="text-end">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={i}>
                  <td className="text-center">{i + 1}</td>
                  <td>{item.product?.productName}</td>
                  <td className="text-center">{item.product?.id}</td>
                  <td className="text-end">{formatMoney(item.price)}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">{formatMoney((item.price || 0) * (item.quantity || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="row">
            <div className="col-6">
              <h5 className="fw-bold border-bottom pb-1">Thanh toán</h5>
              <p className="mb-1">Phương thức: {order.paymentMethod || "COD"}</p>
              <p className="mb-1">Trạng thái TT: {order.paymentStatus === "PAID" ? "Đã thanh toán" : order.paymentStatus}</p>
            </div>
            <div className="col-6">
              <table className="table table-borderless table-sm text-end">
                <tbody>
                  <tr>
                    <td>Tạm tính:</td>
                    <td>{formatMoney(order.total - (order.shippingFee || 0) + (order.discountAmount || 0))}</td>
                  </tr>
                  <tr>
                    <td>Giảm giá:</td>
                    <td>- {formatMoney(order.discountAmount || 0)}</td>
                  </tr>
                  <tr>
                    <td>Phí vận chuyển:</td>
                    <td>+ {formatMoney(order.shippingFee || 0)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold fs-5">TỔNG CỘNG:</td>
                    <td className="fw-bold fs-5">{formatMoney(order.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="row mt-5 pt-5 text-center">
            <div className="col-6">
              <p className="fw-bold mb-5">Người giao hàng</p>
              <p className="text-muted small">(Ký và ghi rõ họ tên)</p>
            </div>
            <div className="col-6">
              <p className="fw-bold mb-5">Người nhận hàng</p>
              <p className="text-muted small">(Ký và ghi rõ họ tên)</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderPrintView;
