import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

function CheckInHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/check-ins/history');
      setHistory(res);
    } catch (error) {
      toast.error('Lỗi khi tải Lịch sử điểm danh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Lịch sử Điểm danh</h3>
            <p className="text-muted mb-0">Theo dõi chi tiết các lượt điểm danh của người dùng</p>
          </div>
          <button className="btn btn-outline-primary rounded-pill px-4">
            <i className="fa-solid fa-download me-2"></i> Xuất Excel
          </button>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center p-5 text-muted">
                <i className="fa-solid fa-clock-rotate-left fs-1 mb-3"></i>
                <h5>Chưa có lịch sử nào</h5>
                <p>Dữ liệu điểm danh sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Thời gian</th>
                      <th>Người dùng</th>
                      <th>Loại</th>
                      <th>Ngày trong chuỗi</th>
                      <th>Điểm nhận được</th>
                      <th>Ghi chú / Quà tặng</th>
                      <th>IP / Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(record => (
                      <tr key={record.id}>
                        <td className="ps-4">
                          <div className="fw-bold">{new Date(record.checkinTime).toLocaleDateString('vi-VN')}</div>
                          <div className="text-muted small">{new Date(record.checkinTime).toLocaleTimeString('vi-VN')}</div>
                        </td>
                        <td className="fw-bold">User #{record.userId}</td>
                        <td>
                          {record.isRecovery ? (
                            <span className="badge bg-warning text-dark"><i className="fa-solid fa-clock-rotate-left me-1"></i>Điểm danh bù</span>
                          ) : (
                            <span className="badge bg-success"><i className="fa-solid fa-check me-1"></i>Hàng ngày</span>
                          )}
                        </td>
                        <td>Ngày {record.streakDay}</td>
                        <td><span className="text-warning fw-bold">+{record.pointsEarned}</span></td>
                        <td>
                          {record.note ? <span className="small">{record.note}</span> : '-'}
                        </td>
                        <td>
                          <span className="badge bg-success">Thành công</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default CheckInHistoryPage;
