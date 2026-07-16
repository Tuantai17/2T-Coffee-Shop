import React from 'react';

const OrderItemsTable = ({ items = [], onReportIssue, issues = [], onResolveIssue, orderStatus }) => {
  
  const getIssueForItem = (itemId) => {
    return issues.find(i => i.orderItemId === itemId);
  };

  const getStatusBadge = (itemStatus, issue) => {
    if (itemStatus === 'REMOVED' || itemStatus === 'CANCELLED') {
      return <span className="badge bg-danger">Đã loại khỏi đơn</span>;
    }
    if (itemStatus === 'WAITING_FOR_RESTOCK') {
      return <span className="badge bg-secondary">Chờ nhập hàng</span>;
    }
    if (issue && issue.issueStatus === 'OPEN') {
      return <span className="badge bg-warning text-dark">Chờ khách phản hồi</span>;
    }
    if (itemStatus === 'QUANTITY_ADJUSTED') {
      return <span className="badge bg-info">Đã điều chỉnh SL</span>;
    }
    return <span className="badge bg-success">Bình thường</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Calculate total
  const calculatedTotal = items.reduce((sum, item) => {
    if (item.itemStatus === 'REMOVED' || item.itemStatus === 'CANCELLED') {
      return sum;
    }
    const finalQty = item.finalQuantity !== null && item.finalQuantity !== undefined ? item.finalQuantity : (item.quantity || 1);
    const originalQty = item.quantity || 1;
    const price = item.unitPrice || item.product?.price || 0;
    const itemSubTotal = item.subTotal || (price * originalQty);
    const perItemPrice = itemSubTotal / originalQty;
    return sum + (perItemPrice * finalQty);
  }, 0);

  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0" style={{ fontSize: '13px' }}>
        <thead className="bg-light">
          <tr>
            <th className="text-center" style={{ width: '40px' }}>STT</th>
            <th style={{ width: '60px' }}>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>SKU</th>
            <th className="text-center">SL đặt</th>
            <th className="text-center text-success">Có thể giao</th>
            <th className="text-center text-danger">SL hư</th>
            <th className="text-center text-warning text-darken">SL thiếu</th>
            <th className="text-center text-primary">SL cuối cùng</th>
            <th className="text-end">Đơn giá</th>
            <th className="text-end">Thành tiền</th>
            <th className="text-center">Trạng thái SP</th>
            <th className="text-center" style={{ width: '120px' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const issue = getIssueForItem(item.id);
            
            // Logic for quantities
            const originalQty = item.originalQuantity || item.quantity;
            let fulfillableQty = originalQty;
            let damagedQty = 0;
            let missingQty = 0;
            
            if (issue) {
              fulfillableQty = issue.fulfillableQuantity;
              damagedQty = issue.damagedQuantity;
              missingQty = issue.missingQuantity;
            }

            const finalQty = item.finalQuantity !== null && item.finalQuantity !== undefined ? item.finalQuantity : originalQty;
            const unitPrice = item.unitPrice || item.product?.price || 0;
            const itemSubTotal = item.subTotal || (unitPrice * originalQty);
            const perItemPrice = itemSubTotal / originalQty;
            const currentSubTotal = perItemPrice * finalQty;
            const isRemoved = item.itemStatus === 'REMOVED' || item.itemStatus === 'CANCELLED';
            const rowClass = isRemoved ? "opacity-50 bg-light" : "";

            return (
              <tr key={item.id} className={rowClass}>
                <td className="text-center fw-semibold text-muted">{index + 1}</td>
                <td>
                  <img src={item.product?.imageUrl || item.imageUrl || "https://placehold.co/40"} alt="" className="rounded" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                </td>
                <td>
                  <div className={`fw-semibold ${isRemoved ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                    {item.product?.productName || item.productName || "Sản phẩm"}
                  </div>
                  {(item.variantName || item.optionsSnapshot || item.toppingsSnapshot || item.note) && (
                    <div className="mt-1" style={{ fontSize: "11px", color: "#666" }}>
                      {item.variantName && <div><span className="fw-semibold">Size:</span> {item.variantName}</div>}
                      {item.optionsSnapshot && <div><span className="fw-semibold">Tùy chọn:</span> {item.optionsSnapshot}</div>}
                      {item.toppingsSnapshot && (
                        <div><span className="fw-semibold">Topping:</span> {Object.entries(item.toppingsSnapshot.split(', ').reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {})).map(([name, count]) => count > 1 ? `${name} (x${count})` : name).join(', ')}</div>
                      )}
                      {item.note && <div className="fst-italic"><span className="fw-semibold">Ghi chú:</span> {item.note}</div>}
                    </div>
                  )}
                </td>
                <td className="text-muted">{item.product?.id || item.productId || "N/A"}</td>
                <td className="text-center fw-bold">{originalQty}</td>
                <td className="text-center fw-semibold text-success">{issue ? fulfillableQty : "-"}</td>
                <td className="text-center fw-semibold text-danger">{issue && damagedQty > 0 ? damagedQty : "-"}</td>
                <td className="text-center fw-semibold text-warning text-darken">{issue && missingQty > 0 ? missingQty : "-"}</td>
                <td className="text-center fw-bold fs-6 text-primary">{finalQty}</td>
                <td className="text-end text-muted">{formatCurrency(unitPrice)}</td>
                <td className="text-end fw-bold text-dark">
                  {isRemoved ? <span className="text-muted">0 ₫</span> : formatCurrency(currentSubTotal)}
                </td>
                <td className="text-center">
                  {getStatusBadge(item.itemStatus, issue)}
                </td>
                <td className="text-center">
                  {!issue && (orderStatus === 'PENDING_CONFIRMATION' || orderStatus === 'PREPARING') && !isRemoved && (
                    <button 
                      className="btn btn-sm btn-outline-danger py-0 px-2"
                      style={{ fontSize: '11px' }}
                      onClick={() => onReportIssue(item)}
                      title="Báo sự cố (Thiếu/Hư)"
                    >
                      Báo lỗi
                    </button>
                  )}
                  {issue && issue.issueStatus === 'OPEN' && (
                    <button 
                      className="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-3 py-1"
                      style={{ fontSize: '11px', boxShadow: '0 2px 4px rgba(241, 150, 61, 0.2)' }}
                      onClick={() => onResolveIssue(issue)}
                    >
                      Xử lý
                    </button>
                  )}
                  {issue && issue.issueStatus === 'RESOLVED' && (
                    <button 
                      className="btn btn-sm btn-light border py-0 px-2 text-muted"
                      style={{ fontSize: '11px' }}
                      title="Đã xử lý xong"
                      disabled
                    >
                      <i className="fa-solid fa-check me-1"></i>Đã xử lý
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-light">
          <tr>
            <td colSpan="10" className="text-end fw-bold text-dark py-3">TỔNG TIỀN SẢN PHẨM (SAU XỬ LÝ):</td>
            <td colSpan="3" className="text-start fw-bold text-danger fs-5 py-3 ps-4">
              {formatCurrency(calculatedTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default OrderItemsTable;
