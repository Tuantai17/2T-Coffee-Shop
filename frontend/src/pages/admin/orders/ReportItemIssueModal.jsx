import React, { useState } from 'react';
import axiosClient from '../../../api/axiosClient';

const ReportItemIssueModal = ({ show, onHide, orderId, item, onSuccess }) => {
  const [issueType, setIssueType] = useState('DAMAGED');
  const [damagedQuantity, setDamagedQuantity] = useState(0);
  const [missingQuantity, setMissingQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show || !item) return null;

  const activeQty = item?.finalQuantity !== null ? item?.finalQuantity : item?.quantity;
  const originalQty = item?.originalQuantity || item?.quantity || 0;
  const fulfillableQty = Math.max(0, activeQty - damagedQuantity - missingQuantity);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (damagedQuantity + missingQuantity === 0) {
      alert('Vui lòng nhập số lượng hư hoặc thiếu');
      return;
    }
    if (damagedQuantity + missingQuantity > activeQty) {
      alert('Số lượng lỗi không thể lớn hơn số lượng đặt mua');
      return;
    }
    if (reason.trim().length < 10) {
      alert('Lý do bắt buộc tối thiểu 10 ký tự');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        issueType,
        damagedQuantity,
        missingQuantity,
        fulfillableQuantity: fulfillableQty,
        reason,
        internalNote,
        performedBy: 'Admin'
      };
      
      await axiosClient.post(`/api/shop/admin/orders/${orderId}/items/${item.id}/issues`, payload);
      onSuccess();
      onHide();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi báo cáo sự cố');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-light border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-danger">
                <i className="fa-solid fa-triangle-exclamation me-2"></i>
                Báo cáo sự cố sản phẩm
              </h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                
                {/* Product Info */}
                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded mb-4 border">
                  <img src={item.imageUrl || item.product?.imageUrl || "https://placehold.co/60"} alt="product" className="rounded border" style={{ width: "60px", height: "60px", objectFit: "cover" }} />
                  <div>
                    <h6 className="fw-bold mb-1">{item.productName || item.product?.productName || "Sản phẩm không rõ"}</h6>
                    <span className="badge bg-secondary">SKU: {item.productId || item.product?.id || "N/A"}</span>
                  </div>
                </div>

                {/* 4 Stat Boxes */}
                <div className="row g-3 mb-4 text-center">
                  <div className="col-3">
                    <div className="p-3 border rounded bg-white h-100">
                      <div className="small text-muted mb-1">Số lượng đặt</div>
                      <h4 className="fw-bold mb-0 text-dark">{originalQty}</h4>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 border rounded bg-white h-100">
                      <div className="small text-muted mb-1">Đang giữ kho</div>
                      <h4 className="fw-bold mb-0 text-info">{activeQty}</h4>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 border rounded bg-white h-100">
                      <div className="small text-muted mb-1">Tồn thực tế</div>
                      <h4 className="fw-bold mb-0 text-secondary">{item.product?.stockQuantity || "?"}</h4>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 border rounded h-100" style={{ backgroundColor: "rgba(10, 179, 156, 0.1)", borderColor: "rgba(10, 179, 156, 0.2)" }}>
                      <div className="small fw-semibold mb-1" style={{ color: "#0ab39c" }}>Có thể giao</div>
                      <h4 className="fw-bold mb-0" style={{ color: "#0ab39c" }}>{fulfillableQty}</h4>
                    </div>
                  </div>
                </div>
                
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-dark">Loại sự cố <span className="text-danger">*</span></label>
                    <select className="form-select" value={issueType} onChange={e => setIssueType(e.target.value)}>
                      <option value="DAMAGED">Hàng bị hư / Lỗi NSX</option>
                      <option value="SHORTAGE">Thiếu hàng trong kho</option>
                      <option value="LOST">Thất lạc</option>
                      <option value="POOR_QUALITY">Không đạt chất lượng</option>
                      <option value="WRONG_ITEM">Sai sản phẩm</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold text-danger">SL Hư / Lỗi</label>
                    <input type="number" className="form-control" min="0" max={activeQty} value={damagedQuantity} onChange={e => setDamagedQuantity(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold text-warning text-darken">SL Thiếu</label>
                    <input type="number" className="form-control" min="0" max={activeQty} value={missingQuantity} onChange={e => setMissingQuantity(parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark">Lý do chi tiết <span className="text-danger">*</span></label>
                  <textarea className="form-control" rows={3} value={reason} onChange={e => setReason(e.target.value)} required placeholder="Mô tả tình trạng hàng hóa, nguyên nhân... (Tối thiểu 10 ký tự)"></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark">Ghi chú nội bộ</label>
                  <textarea className="form-control bg-light" rows={2} value={internalNote} onChange={e => setInternalNote(e.target.value)} placeholder="Ghi chú dành riêng cho nhân viên xử lý..."></textarea>
                </div>
                
                <div className="alert alert-warning small mb-0 d-flex align-items-center">
                  <i className="fa-solid fa-circle-info me-2 fs-5"></i>
                  <div>
                    <strong>Lưu ý:</strong> Sau khi báo cáo, đơn hàng sẽ chuyển sang trạng thái <strong>Chờ khách phản hồi</strong>. Bạn cần liên hệ khách hàng để chốt phương án xử lý.
                  </div>
                </div>
              </div>
              
              <div className="modal-footer bg-light border-top-0 pt-2 pb-3 px-4 rounded-bottom">
                <button type="button" className="btn btn-light border px-4" onClick={onHide}>Hủy</button>
                <button type="submit" className="btn btn-danger px-4" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang xử lý...</>
                  ) : (
                    <><i className="fa-solid fa-check me-2"></i> Xác nhận sự cố</>
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

export default ReportItemIssueModal;
