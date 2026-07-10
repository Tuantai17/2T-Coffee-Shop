import React, { useState } from 'react';
import axiosClient from '../../../api/axiosClient';

const CancelOrderModal = ({ orderId, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do hủy");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      setSubmitting(true);
      await axiosClient.post(`/api/shop/admin/orders/${orderId}/cancel`, {
        reason: reason,
        performedBy: 'Admin'
      });
      alert('Đã hủy đơn hàng thành công.');
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi hủy đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header bg-danger text-white border-bottom-0">
              <h5 className="modal-title fw-bold">Hủy đơn hàng #{orderId}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Hủy đơn hàng sẽ giải phóng tồn kho cho các sản phẩm hợp lệ và chuyển trạng thái thanh toán nếu cần. Hành động này <strong>không thể hoàn tác</strong>.
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Lý do hủy <span className="text-danger">*</span></label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    placeholder="Khách hàng yêu cầu hủy, hết hàng,..." 
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer bg-light border-top-0 pt-2 pb-3 px-4 rounded-bottom">
                <button type="button" className="btn btn-light border px-4" onClick={onClose}>Thoát</button>
                <button type="submit" className="btn btn-danger px-4" disabled={submitting}>
                  {submitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CancelOrderModal;
