import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';

const CustomerContactCard = ({ orderId, customerName, customerPhone, customerEmail, onLogSuccess }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState('PHONE');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [orderId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/api/shop/admin/orders/${orderId}/contact-logs`);
      setLogs(res.data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử liên hệ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`Đã sao chép ${type}: ${text}`);
  };

  const openLogModal = (defaultMethod) => {
    setMethod(defaultMethod);
    setSubject('');
    setNotes('');
    setShowModal(true);
  };

  const handleCall = () => {
    if (customerPhone) {
      window.open(`tel:${customerPhone}`);
      openLogModal('PHONE');
    }
  };

  const handleEmail = () => {
    if (customerEmail) {
      window.open(`mailto:${customerEmail}`);
      openLogModal('EMAIL');
    }
  };

  const submitLog = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axiosClient.post(`/api/shop/admin/orders/${orderId}/contact-logs`, {
        method,
        subject,
        notes,
        performedBy: 'Admin'
      });
      setShowModal(false);
      fetchLogs();
      if (onLogSuccess) onLogSuccess();
    } catch (error) {
      alert("Lỗi ghi nhận liên hệ");
    } finally {
      setSubmitting(false);
    }
  };

  const getMethodIcon = (m) => {
    switch (m) {
      case 'PHONE': return <i className="bi bi-telephone text-primary"></i>;
      case 'EMAIL': return <i className="bi bi-envelope text-warning"></i>;
      case 'ZALO': return <i className="bi bi-chat-dots text-info"></i>;
      default: return <i className="bi bi-info-circle text-secondary"></i>;
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      <div className="card shadow-sm border-0 mb-4 rounded-4">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0"><i className="bi bi-person-lines-fill me-2 text-primary"></i>Thông tin & Liên hệ Khách hàng</h6>
          <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={() => openLogModal('OTHER')}>
            <i className="bi bi-pencil-square me-1"></i> Ghi nhận
          </button>
        </div>
        <div className="card-body p-4 pt-0">
          
          {/* Customer Info Box */}
          <div className="bg-light p-3 rounded mb-4">
            <h6 className="fw-bold mb-3">{customerName || 'Khách hàng'}</h6>
            <div className="row g-2">
              <div className="col-12 col-md-6 d-flex align-items-center justify-content-between">
                <div>
                  <i className="bi bi-telephone me-2 text-muted"></i>
                  <span className="fw-semibold">{customerPhone || 'Chưa có SĐT'}</span>
                </div>
                <div>
                  {customerPhone && (
                    <>
                      <button className="btn btn-sm btn-link p-0 text-decoration-none me-3" onClick={() => handleCopy(customerPhone, 'SĐT')} title="Sao chép SĐT"><i className="bi bi-copy"></i></button>
                      <button className="btn btn-sm btn-success rounded-pill px-3" onClick={handleCall}><i className="bi bi-telephone-outbound me-1"></i> Gọi ngay</button>
                    </>
                  )}
                </div>
              </div>
              <div className="col-12 col-md-6 d-flex align-items-center justify-content-between border-start ps-3">
                <div className="text-truncate" style={{ maxWidth: '200px' }}>
                  <i className="bi bi-envelope me-2 text-muted"></i>
                  <span>{customerEmail || 'Chưa có Email'}</span>
                </div>
                <div>
                  {customerEmail && (
                    <>
                      <button className="btn btn-sm btn-link p-0 text-decoration-none me-3" onClick={() => handleCopy(customerEmail, 'Email')} title="Sao chép Email"><i className="bi bi-copy"></i></button>
                      <button className="btn btn-sm btn-warning rounded-pill px-3 text-dark" onClick={handleEmail}><i className="bi bi-envelope-at me-1"></i> Gửi email</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Logs Table */}
          <h6 className="fw-bold mb-3">Lịch sử liên hệ</h6>
          {loading ? (
            <div className="text-center py-3"><span className="spinner-border spinner-border-sm text-primary"></span> Đang tải...</div>
          ) : logs.length === 0 ? (
            <div className="text-center text-muted py-3 bg-light rounded">Chưa có lịch sử liên hệ.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle" style={{ fontSize: '13px' }}>
                <thead className="table-light">
                  <tr>
                    <th>Thời gian</th>
                    <th className="text-center">Phương thức</th>
                    <th>Nội dung</th>
                    <th>Nhân viên</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className="text-muted">{formatDate(log.contactedAt)}</td>
                      <td className="text-center">{getMethodIcon(log.method)} {log.method}</td>
                      <td>
                        {log.subject && <div className="fw-bold">{log.subject}</div>}
                        <div className="text-muted">{log.note}</div>
                      </td>
                      <td>{log.contactedBy || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Log Contact Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-light border-bottom-0">
                  <h5 className="modal-title fw-bold text-primary">Ghi nhận liên hệ khách hàng</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={submitLog}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Phương thức <span className="text-danger">*</span></label>
                      <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)} required>
                        <option value="PHONE">Gọi điện thoại</option>
                        <option value="EMAIL">Gửi Email</option>
                        <option value="ZALO">Nhắn tin Zalo</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Tiêu đề / Mục đích</label>
                      <input type="text" className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ví dụ: Gọi thông báo thiếu hàng" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Ghi chú kết quả <span className="text-danger">*</span></label>
                      <textarea className="form-control" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Khách nghe máy, đồng ý chờ..." required></textarea>
                    </div>
                  </div>
                  <div className="modal-footer bg-light border-top-0 pt-2 pb-3 px-4 rounded-bottom">
                    <button type="button" className="btn btn-light border px-4" onClick={() => setShowModal(false)}>Hủy</button>
                    <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                      {submitting ? 'Đang lưu...' : 'Lưu ghi nhận'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CustomerContactCard;
