import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { motion } from 'framer-motion';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

function CheckInMissionsPage() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMission, setEditMission] = useState({
    name: '',
    description: '',
    icon: 'fa-check',
    eventType: 'DAILY_CHECKIN',
    targetValue: 1,
    cycle: 'DAILY',
    rewardPoints: 10,
    rewardVoucherId: '',
    displayOrder: 1
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/check-ins/missions');
      setMissions(res);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách nhiệm vụ');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/api/admin/check-ins/missions/${id}/status`, { status });
      toast.success('Cập nhật trạng thái thành công');
      fetchMissions();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const deleteMission = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) {
      try {
        await axiosClient.delete(`/api/admin/check-ins/missions/${id}`);
        toast.success('Xóa nhiệm vụ thành công');
        fetchMissions();
      } catch (error) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const openModal = (mission = null) => {
    if (mission) {
      setEditMission(mission);
    } else {
      setEditMission({
        name: '',
        description: '',
        icon: 'fa-check',
        eventType: 'DAILY_CHECKIN',
        targetValue: 1,
        cycle: 'DAILY',
        rewardPoints: 10,
        rewardVoucherId: '',
        displayOrder: missions.length + 1
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveMission = async (e) => {
    e.preventDefault();
    try {
      if (editMission.id) {
        await axiosClient.put(`/api/admin/check-ins/missions/${editMission.id}`, editMission);
      } else {
        await axiosClient.post('/api/admin/check-ins/missions', editMission);
      }
      toast.success('Lưu nhiệm vụ thành công');
      fetchMissions();
      closeModal();
    } catch (error) {
      toast.error('Lưu thất bại');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE': return <span className="badge bg-success">Đang hoạt động</span>;
      case 'INACTIVE': return <span className="badge bg-secondary">Tạm dừng</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Nhiệm vụ Gamification</h3>
            <p className="text-muted mb-0">Quản lý các nhiệm vụ để người dùng kiếm thêm điểm thưởng</p>
          </div>
          <button className="btn btn-primary rounded-pill px-4" onClick={() => openModal()}>
            <i className="fa-solid fa-plus me-2"></i> Tạo nhiệm vụ mới
          </button>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : missions.length === 0 ? (
              <div className="text-center p-5 text-muted">
                <i className="fa-solid fa-tasks fs-1 mb-3"></i>
                <h5>Chưa có nhiệm vụ nào</h5>
                <p>Hãy tạo một nhiệm vụ mới để tăng tương tác.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Tên nhiệm vụ</th>
                      <th>Loại sự kiện</th>
                      <th>Mục tiêu</th>
                      <th>Chu kỳ</th>
                      <th>Phần thưởng</th>
                      <th>Trạng thái</th>
                      <th className="text-end pe-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions.map(mission => (
                      <tr key={mission.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded p-2 me-3 text-primary">
                              <i className={`fa-solid ${mission.icon}`}></i>
                            </div>
                            <div>
                              <div className="fw-bold">{mission.name}</div>
                              <div className="text-muted small">{mission.description}</div>
                            </div>
                          </div>
                        </td>
                        <td>{mission.eventType}</td>
                        <td>{mission.targetValue}</td>
                        <td>{mission.cycle === 'DAILY' ? 'Hàng ngày' : mission.cycle === 'WEEKLY' ? 'Hàng tuần' : 'Một lần'}</td>
                        <td>
                          {mission.rewardPoints > 0 && <span className="text-warning fw-bold"><i className="fa-solid fa-coins me-1"></i>{mission.rewardPoints}</span>}
                          {mission.rewardVoucherId && <span className="text-danger fw-bold ms-2"><i className="fa-solid fa-ticket me-1"></i>Voucher</span>}
                        </td>
                        <td>{getStatusBadge(mission.status)}</td>
                        <td className="text-end pe-4">
                          <div className="dropdown">
                            <button className="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown">
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                              <li><button className="dropdown-item" onClick={() => openModal(mission)}><i className="fa-solid fa-pen me-2 text-muted"></i>Chỉnh sửa</button></li>
                              {mission.status === 'INACTIVE' ? (
                                <li><button className="dropdown-item" onClick={() => updateStatus(mission.id, 'ACTIVE')}><i className="fa-solid fa-play me-2 text-success"></i>Kích hoạt</button></li>
                              ) : (
                                <li><button className="dropdown-item" onClick={() => updateStatus(mission.id, 'INACTIVE')}><i className="fa-solid fa-pause me-2 text-warning"></i>Tạm dừng</button></li>
                              )}
                              <li><hr className="dropdown-divider" /></li>
                              <li><button className="dropdown-item text-danger" onClick={() => deleteMission(mission.id)}><i className="fa-solid fa-trash me-2"></i>Xóa</button></li>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">{editMission.id ? 'Chỉnh sửa nhiệm vụ' : 'Tạo nhiệm vụ mới'}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-4">
                <form id="missionForm" onSubmit={handleSaveMission}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-bold">Tên nhiệm vụ <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" value={editMission.name} onChange={(e) => setEditMission({...editMission, name: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Icon (FontAwesome)</label>
                      <input type="text" className="form-control" value={editMission.icon} onChange={(e) => setEditMission({...editMission, icon: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Mô tả nhiệm vụ</label>
                      <textarea className="form-control" rows="2" value={editMission.description} onChange={(e) => setEditMission({...editMission, description: e.target.value})}></textarea>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Loại sự kiện (Trigger)</label>
                      <select className="form-select" value={editMission.eventType} onChange={(e) => setEditMission({...editMission, eventType: e.target.value})}>
                        <option value="DAILY_CHECKIN">Điểm danh</option>
                        <option value="PLACE_ORDER">Đặt đơn hàng mới</option>
                        <option value="COMPLETE_ORDER">Hoàn thành đơn hàng</option>
                        <option value="PLAY_MINIGAME">Chơi Mini Game</option>
                        <option value="REVIEW_PRODUCT">Đánh giá sản phẩm</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Chu kỳ reset</label>
                      <select className="form-select" value={editMission.cycle} onChange={(e) => setEditMission({...editMission, cycle: e.target.value})}>
                        <option value="DAILY">Hàng ngày</option>
                        <option value="WEEKLY">Hàng tuần</option>
                        <option value="MONTHLY">Hàng tháng</option>
                        <option value="ONE_TIME">Một lần duy nhất</option>
                      </select>
                    </div>
                    
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Mục tiêu (Số lần)</label>
                      <input type="number" className="form-control" value={editMission.targetValue} onChange={(e) => setEditMission({...editMission, targetValue: parseInt(e.target.value)})} min="1" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Điểm thưởng</label>
                      <input type="number" className="form-control" value={editMission.rewardPoints} onChange={(e) => setEditMission({...editMission, rewardPoints: parseInt(e.target.value)})} min="0" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Thứ tự hiển thị</label>
                      <input type="number" className="form-control" value={editMission.displayOrder} onChange={(e) => setEditMission({...editMission, displayOrder: parseInt(e.target.value)})} min="1" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4 border" onClick={closeModal}>Hủy</button>
                <button type="submit" form="missionForm" className="btn btn-primary rounded-pill px-4">Lưu nhiệm vụ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default CheckInMissionsPage;
