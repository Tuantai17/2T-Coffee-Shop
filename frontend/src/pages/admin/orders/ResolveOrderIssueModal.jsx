import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';

const ResolveOrderIssueModal = ({ show, onHide, orderId, issue, item, orderTotal, onSuccess }) => {
  const [customerDecision, setCustomerDecision] = useState('ACCEPT_PARTIAL');
  const [agreedQuantity, setAgreedQuantity] = useState(issue?.fulfillableQuantity || 0);
  const [restockDate, setRestockDate] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [contactMethod, setContactMethod] = useState('PHONE');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (show && issue) {
      setAgreedQuantity(issue.fulfillableQuantity || 0);
      setCustomerDecision('ACCEPT_PARTIAL');
      setCustomerNote('');
      setRestockDate('');
    }
  }, [show, issue]);

  useEffect(() => {
    if (show && issue) {
      fetchPreview();
    }
  }, [show, issue, customerDecision, agreedQuantity]);

  const fetchPreview = async () => {
    try {
      setPreviewLoading(true);
      const params = {
        customerDecision,
        ...(customerDecision === 'ACCEPT_PARTIAL' ? { agreedQuantity } : {})
      };
      const res = await axiosClient.get(`/api/shop/admin/orders/${orderId}/issues/${issue.id}/resolution-preview`, { params });
      setPreview(res.data);
    } catch (error) {
      console.error("Lỗi khi xem trước thay đổi tổng tiền", error);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (!show || !issue || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (customerDecision === 'WAIT_RESTOCK' && !restockDate) {
      alert('Vui lòng nhập ngày dự kiến có hàng');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        customerDecision,
        agreedQuantity: customerDecision === 'ACCEPT_PARTIAL' ? agreedQuantity : 0,
        restockDate,
        customerNote,
        contactMethod,
        performedBy: 'Admin'
      };
      
      await axiosClient.post(`/api/shop/admin/orders/${orderId}/issues/${issue.id}/resolve`, payload);
      onSuccess();
      onHide();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi ghi nhận xử lý');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-light border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-primary">
                <i className="fa-solid fa-headset me-2"></i>
                Ghi nhận phản hồi khách hàng
              </h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                
                {/* Product Info */}
                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded mb-3 border">
                  <img src={item.imageUrl || item.product?.imageUrl || "https://placehold.co/60"} alt="product" className="rounded border" style={{ width: "60px", height: "60px", objectFit: "cover" }} />
                  <div>
                    <h6 className="fw-bold mb-1">{item.productName || item.product?.productName || "Sản phẩm không rõ"}</h6>
                    <div className="small text-muted">SKU: {item.productId || item.product?.id || "N/A"} | Số lượng: {item.quantity} | Giá: {formatMoney(item.unitPrice)}</div>
                  </div>
                </div>

                {/* Issue Info */}
                <div className="row g-3 mb-4 text-center">
                  <div className="col-3">
                    <div className="p-3 border rounded bg-white h-100">
                      <div className="small text-muted mb-1">Số lượng đặt</div>
                      <h5 className="fw-bold mb-0">{issue.orderedQuantity}</h5>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 border rounded bg-white h-100">
                      <div className="small text-success mb-1">Có thể giao</div>
                      <h5 className="fw-bold mb-0 text-success">{issue.fulfillableQuantity}</h5>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 border rounded h-100" style={{ backgroundColor: "rgba(240, 101, 72, 0.1)", borderColor: "rgba(240, 101, 72, 0.2)" }}>
                      <div className="small text-danger mb-1">Hư hỏng</div>
                      <h5 className="fw-bold mb-0 text-danger">{issue.damagedQuantity}</h5>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 border rounded h-100" style={{ backgroundColor: "rgba(241, 150, 61, 0.1)", borderColor: "rgba(241, 150, 61, 0.2)" }}>
                      <div className="small text-warning text-darken mb-1">Thiếu hàng</div>
                      <h5 className="fw-bold mb-0 text-warning text-darken">{issue.missingQuantity}</h5>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark mb-3">Phương án của khách hàng <span className="text-danger">*</span></label>
                  
                  <div className="form-check mb-3 p-3 border rounded bg-white" style={customerDecision === 'ACCEPT_PARTIAL' ? { borderColor: '#0ab39c', backgroundColor: 'rgba(10, 179, 156, 0.05)' } : {}}>
                    <input className="form-check-input ms-0 mt-1 me-2" type="radio" name="decision" id="opt1" value="ACCEPT_PARTIAL" checked={customerDecision === 'ACCEPT_PARTIAL'} onChange={e => setCustomerDecision(e.target.value)} />
                    <label className="form-check-label w-100" htmlFor="opt1">
                      <span className="fw-bold d-block">Đồng ý nhận số lượng còn lại</span>
                      <span className="text-muted small">Khách đồng ý nhận phần hàng không bị lỗi.</span>
                      {customerDecision === 'ACCEPT_PARTIAL' && (
                        <div className="mt-2 row align-items-center">
                          <div className="col-auto">
                            <span className="small fw-semibold">Số lượng nhận:</span>
                          </div>
                          <div className="col-4">
                            <input type="number" className="form-control form-control-sm" min="1" max={issue.fulfillableQuantity} value={agreedQuantity} onChange={e => setAgreedQuantity(parseInt(e.target.value) || 0)} />
                          </div>
                          <div className="col-auto">
                            <span className="small text-muted">/ Tối đa {issue.fulfillableQuantity}</span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="form-check mb-3 p-3 border rounded bg-white" style={customerDecision === 'REMOVE_ITEM' ? { borderColor: '#f06548', backgroundColor: 'rgba(240, 101, 72, 0.05)' } : {}}>
                    <input className="form-check-input ms-0 mt-1 me-2" type="radio" name="decision" id="opt2" value="REMOVE_ITEM" checked={customerDecision === 'REMOVE_ITEM'} onChange={e => setCustomerDecision(e.target.value)} />
                    <label className="form-check-label w-100" htmlFor="opt2">
                      <span className="fw-bold d-block text-danger">Loại sản phẩm khỏi đơn</span>
                      <span className="text-muted small">Khách không nhận sản phẩm này nữa. Các sản phẩm khác trong đơn vẫn giao bình thường.</span>
                    </label>
                  </div>

                  <div className="form-check mb-3 p-3 border rounded bg-white" style={customerDecision === 'WAIT_RESTOCK' ? { borderColor: '#f1963d', backgroundColor: 'rgba(241, 150, 61, 0.05)' } : {}}>
                    <input className="form-check-input ms-0 mt-1 me-2" type="radio" name="decision" id="opt3" value="WAIT_RESTOCK" checked={customerDecision === 'WAIT_RESTOCK'} onChange={e => setCustomerDecision(e.target.value)} />
                    <label className="form-check-label w-100" htmlFor="opt3">
                      <span className="fw-bold d-block text-warning text-darken">Chờ bổ sung hàng</span>
                      <span className="text-muted small">Khách đồng ý chờ kho nhập thêm hàng. Đơn hàng sẽ bị tạm giữ.</span>
                      {customerDecision === 'WAIT_RESTOCK' && (
                        <div className="mt-2 row align-items-center">
                          <div className="col-auto">
                            <span className="small fw-semibold">Ngày dự kiến có hàng:</span>
                          </div>
                          <div className="col-6">
                            <input type="date" className="form-control form-control-sm" value={restockDate} onChange={e => setRestockDate(e.target.value)} required />
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="form-check mb-3 p-3 border rounded bg-white" style={customerDecision === 'CANCEL_ORDER' ? { borderColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.05)' } : {}}>
                    <input className="form-check-input ms-0 mt-1 me-2" type="radio" name="decision" id="opt4" value="CANCEL_ORDER" checked={customerDecision === 'CANCEL_ORDER'} onChange={e => setCustomerDecision(e.target.value)} />
                    <label className="form-check-label w-100" htmlFor="opt4">
                      <span className="fw-bold d-block text-danger">Hủy toàn bộ đơn hàng</span>
                      <span className="text-muted small">Hủy toàn bộ đơn. Nếu đã thanh toán, sẽ chuyển sang chờ hoàn tiền.</span>
                    </label>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-dark">Hình thức liên hệ</label>
                    <select className="form-select" value={contactMethod} onChange={e => setContactMethod(e.target.value)}>
                      <option value="PHONE">Gọi điện thoại</option>
                      <option value="ZALO">Nhắn tin Zalo</option>
                      <option value="EMAIL">Gửi Email</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label fw-semibold text-dark">Ghi chú phản hồi của khách</label>
                    <input type="text" className="form-control" value={customerNote} onChange={e => setCustomerNote(e.target.value)} placeholder="Ví dụ: Khách đồng ý nhận phần còn lại, thái độ vui vẻ..." />
                  </div>
                </div>

                {/* Financial Preview */}
                <div className="p-3 bg-light border rounded">
                  <h6 className="fw-bold mb-3"><i className="fa-solid fa-calculator me-2"></i>Dự kiến thay đổi thanh toán</h6>
                  {previewLoading ? (
                    <div className="text-center py-2"><span className="spinner-border spinner-border-sm text-primary"></span> Đang tính toán...</div>
                  ) : preview ? (
                    <div className="row text-center">
                      <div className="col-4 border-end">
                        <div className="small text-muted">Tổng tiền cũ</div>
                        <div className="fw-bold text-secondary text-decoration-line-through">{formatMoney(preview.oldTotal)}</div>
                      </div>
                      <div className="col-4 border-end">
                        <div className="small text-muted">Tổng tiền mới</div>
                        <div className="fw-bold text-success fs-5">{formatMoney(preview.newTotal)}</div>
                      </div>
                      <div className="col-4">
                        <div className="small text-muted">Chênh lệch</div>
                        <div className={`fw-bold ${preview.difference < 0 ? 'text-danger' : 'text-success'}`}>
                          {preview.difference < 0 ? '-' : '+'}{formatMoney(Math.abs(preview.difference))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted small">Không có dữ liệu dự kiến.</div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer bg-light border-top-0 pt-2 pb-3 px-4 rounded-bottom">
                <button type="button" className="btn btn-light border px-4" onClick={onHide}>Đóng</button>
                <button type="submit" className="btn btn-primary px-4" disabled={loading || previewLoading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang xử lý...</>
                  ) : (
                    <><i className="fa-solid fa-save me-2"></i> Lưu phương án</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResolveOrderIssueModal;
