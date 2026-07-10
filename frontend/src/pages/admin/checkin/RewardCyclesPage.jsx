import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { Link } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

function RewardCyclesPage() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/check-ins/reward-cycles');
      setCycles(res);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách chu kỳ');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/api/admin/check-ins/reward-cycles/${id}/status`, { status });
      toast.success('Cập nhật trạng thái thành công');
      fetchCycles();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const deleteCycle = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chu kỳ này?')) {
      try {
        await axiosClient.delete(`/api/admin/check-ins/reward-cycles/${id}`);
        toast.success('Xóa chu kỳ thành công');
        fetchCycles();
      } catch (error) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE': return <span className="badge bg-success">Đang chạy</span>;
      case 'DRAFT': return <span className="badge bg-secondary">Bản nháp</span>;
      case 'PAUSED': return <span className="badge bg-warning text-dark">Tạm dừng</span>;
      case 'ENDED': return <span className="badge bg-danger">Đã kết thúc</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Chu kỳ phần thưởng</h3>
            <p className="text-muted mb-0">Quản lý các mốc phần thưởng điểm danh</p>
          </div>
          <Link to="/admin/check-in/reward-cycles/new" className="btn btn-primary rounded-pill px-4">
            <i className="fa-solid fa-plus me-2"></i> Tạo chu kỳ mới
          </Link>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : cycles.length === 0 ? (
              <div className="text-center p-5 text-muted">
                <i className="fa-solid fa-box-open fs-1 mb-3"></i>
                <h5>Chưa có chu kỳ nào</h5>
                <p>Hãy tạo một chu kỳ phần thưởng mới để bắt đầu.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Tên chu kỳ</th>
                      <th>Loại</th>
                      <th>Số ngày</th>
                      <th>Thời gian áp dụng</th>
                      <th>Trạng thái</th>
                      <th className="text-end pe-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cycles.map(cycle => (
                      <tr key={cycle.id}>
                        <td className="ps-4 fw-bold">{cycle.name}</td>
                        <td>{cycle.cycleType === 'MONTHLY' ? 'Hàng tháng' : 'Tuần hoàn'}</td>
                        <td>{cycle.days} ngày</td>
                        <td>
                          {cycle.startDate ? new Date(cycle.startDate).toLocaleDateString('vi-VN') : 'Không giới hạn'} 
                          {cycle.endDate ? ` - ${new Date(cycle.endDate).toLocaleDateString('vi-VN')}` : ''}
                        </td>
                        <td>{getStatusBadge(cycle.status)}</td>
                        <td className="text-end pe-4">
                          <div className="dropdown">
                            <button className="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown">
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                              <li><Link className="dropdown-item" to={`/admin/check-in/reward-cycles/${cycle.id}`}><i className="fa-solid fa-pen me-2 text-muted"></i>Chỉnh sửa</Link></li>
                              {cycle.status === 'DRAFT' || cycle.status === 'PAUSED' ? (
                                <li><button className="dropdown-item" onClick={() => updateStatus(cycle.id, 'ACTIVE')}><i className="fa-solid fa-play me-2 text-success"></i>Kích hoạt</button></li>
                              ) : cycle.status === 'ACTIVE' ? (
                                <li><button className="dropdown-item" onClick={() => updateStatus(cycle.id, 'PAUSED')}><i className="fa-solid fa-pause me-2 text-warning"></i>Tạm dừng</button></li>
                              ) : null}
                              <li><hr className="dropdown-divider" /></li>
                              <li><button className="dropdown-item text-danger" onClick={() => deleteCycle(cycle.id)}><i className="fa-solid fa-trash me-2"></i>Xóa</button></li>
                            </ul>
                          </div>
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

export default RewardCyclesPage;
