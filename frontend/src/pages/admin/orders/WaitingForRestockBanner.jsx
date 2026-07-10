import React, { useState } from 'react';
import axiosClient from '../../../api/axiosClient';

const WaitingForRestockBanner = ({ order, onRestockUpdated }) => {
  if (order.status !== 'WAITING_FOR_RESTOCK') return null;

  const [expectedDate, setExpectedDate] = useState(order.expectedRestockDate || '');
  const [note, setNote] = useState(order.restockNote || '');
  const [updating, setUpdating] = useState(false);
  const [resuming, setResuming] = useState(false);

  const missingItems = order.items.filter(i => i.itemStatus === 'WAITING_FOR_RESTOCK');

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await axiosClient.put(`/api/shop/admin/orders/${order.id}/restock-info`, {
        expectedRestockDate: expectedDate,
        note: note,
        performedBy: 'Admin'
      });
      alert('Đã cập nhật thông tin chờ nhập hàng');
      if (onRestockUpdated) onRestockUpdated();
    } catch (error) {
      alert('Lỗi cập nhật');
    } finally {
      setUpdating(false);
    }
  };

  const handleResume = async () => {
    if (!window.confirm("Xác nhận đã nhập đủ hàng để tiếp tục đơn này?")) return;
    try {
      setResuming(true);
      await axiosClient.post(`/api/shop/admin/orders/${order.id}/resume-after-restock`, {
        performedBy: 'Admin'
      });
      alert('Đã tiếp tục đơn hàng');
      if (onRestockUpdated) onRestockUpdated();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi kiểm tra kho/tiếp tục đơn. Có thể tồn kho vẫn chưa đủ.');
    } finally {
      setResuming(false);
    }
  };

  return (
    <div className="card shadow-sm border-warning mb-4 rounded-4" style={{ backgroundColor: '#fffdf5' }}>
      <div className="card-header bg-transparent border-bottom-0 pt-4 pb-2 px-4 d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill text-warning fs-4 me-2"></i>
        <h6 className="fw-bold mb-0 text-dark">Đơn hàng đang chờ bổ sung hàng</h6>
      </div>
      <div className="card-body px-4 pb-4 pt-2">
        <p className="text-muted mb-4">Đơn hàng chưa thể chuyển sang giao hàng do có sản phẩm thiếu. Cần bổ sung kho.</p>
        
        <div className="bg-white border rounded-3 p-3 mb-4">
          <h6 className="fw-bold fs-7 mb-2">Sản phẩm cần bổ sung:</h6>
          <ul className="mb-0 ps-3">
            {missingItems.map(item => (
              <li key={item.id} className="text-dark">
                {item.product?.productName || item.productName} <span className="fw-bold text-danger">(Thiếu: {item.finalQuantity || item.quantity})</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold fs-7">Ngày dự kiến có hàng</label>
            <input 
              type="date" 
              className="form-control" 
              value={expectedDate} 
              onChange={e => setExpectedDate(e.target.value)} 
            />
          </div>
          <div className="col-md-5">
            <label className="form-label fw-semibold fs-7">Ghi chú nội bộ</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nhà cung cấp báo dời ngày..." 
              value={note} 
              onChange={e => setNote(e.target.value)} 
            />
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-outline-primary w-100 fw-semibold" onClick={handleUpdate} disabled={updating}>
              {updating ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </div>

        <hr className="my-4" />
        <div className="d-flex justify-content-end gap-3">
          <button className="btn btn-success fw-bold px-4 rounded-pill" onClick={handleResume} disabled={resuming}>
            <i className="bi bi-check-circle me-2"></i> {resuming ? 'Đang xử lý...' : 'Đã có đủ hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingForRestockBanner;
