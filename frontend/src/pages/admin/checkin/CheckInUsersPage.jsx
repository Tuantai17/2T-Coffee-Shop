import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function CheckInUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/check-ins/users');
      setUsers(res);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Người dùng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Quản lý Người dùng</h3>
            <p className="text-muted mb-0">Thống kê điểm danh và điểm thưởng của người dùng</p>
          </div>
          <div className="d-flex gap-2">
            <input type="text" className="form-control rounded-pill" placeholder="Tìm kiếm người dùng..." style={{ width: '250px' }} />
            <button className="btn btn-primary rounded-pill px-4">
              <i className="fa-solid fa-search"></i>
            </button>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center p-5 text-muted">
                <i className="fa-solid fa-users fs-1 mb-3"></i>
                <h5>Chưa có người dùng nào</h5>
                <p>Chưa có dữ liệu điểm danh từ người dùng.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">ID Người dùng</th>
                      <th>Chuỗi hiện tại (Streak)</th>
                      <th>Chuỗi kỷ lục (Best)</th>
                      <th>Tổng lượt điểm danh</th>
                      <th>Tổng điểm tích lũy</th>
                      <th>Tổng Voucher nhận</th>
                      <th>Lần điểm danh cuối</th>
                      <th className="text-end pe-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.userId}>
                        <td className="ps-4 fw-bold">#{user.userId}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="fa-solid fa-fire text-danger me-2"></i>
                            <span className="fw-bold">{user.currentStreak} ngày</span>
                          </div>
                        </td>
                        <td>{user.bestStreak} ngày</td>
                        <td>{user.totalCheckins} lần</td>
                        <td><span className="text-warning fw-bold"><i className="fa-solid fa-coins me-1"></i>{user.totalPoints}</span></td>
                        <td><span className="text-danger fw-bold"><i className="fa-solid fa-ticket me-1"></i>{user.totalVouchers}</span></td>
                        <td>{user.lastCheckinDate ? new Date(user.lastCheckinDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                        <td className="text-end pe-4">
                          <button className="btn btn-light btn-sm rounded-circle" title="Xem chi tiết">
                            <i className="fa-solid fa-eye text-primary"></i>
                          </button>
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

export default CheckInUsersPage;
