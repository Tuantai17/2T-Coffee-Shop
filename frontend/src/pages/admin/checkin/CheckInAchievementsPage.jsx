import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

function CheckInAchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAchievement, setEditAchievement] = useState({
    name: '',
    description: '',
    icon: 'fa-trophy',
    badgeColor: '#FFD700',
    requirementType: 'TOTAL_CHECKINS',
    requirementValue: 30,
    rewardPoints: 100,
    rewardVoucherId: '',
    displayOrder: 1
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/check-ins/achievements');
      setAchievements(res);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Thành tích');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/api/admin/check-ins/achievements/${id}/status`, { status });
      toast.success('Cập nhật trạng thái thành công');
      fetchAchievements();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const deleteAchievement = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Thành tích này?')) {
      try {
        await axiosClient.delete(`/api/admin/check-ins/achievements/${id}`);
        toast.success('Xóa Thành tích thành công');
        fetchAchievements();
      } catch (error) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const openModal = (achievement = null) => {
    if (achievement) {
      setEditAchievement(achievement);
    } else {
      setEditAchievement({
        name: '',
        description: '',
        icon: 'fa-trophy',
        badgeColor: '#FFD700',
        requirementType: 'TOTAL_CHECKINS',
        requirementValue: 30,
        rewardPoints: 100,
        rewardVoucherId: '',
        displayOrder: achievements.length + 1
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveAchievement = async (e) => {
    e.preventDefault();
    try {
      if (editAchievement.id) {
        await axiosClient.put(`/api/admin/check-ins/achievements/${editAchievement.id}`, editAchievement);
      } else {
        await axiosClient.post('/api/admin/check-ins/achievements', editAchievement);
      }
      toast.success('Lưu thành tích thành công');
      fetchAchievements();
      closeModal();
    } catch (error) {
      toast.error('Lưu thất bại');
    }
  };

  const getRequirementText = (type, value) => {
    switch(type) {
      case 'TOTAL_CHECKINS': return `Điểm danh tổng cộng ${value} lần`;
      case 'MAX_STREAK': return `Chuỗi điểm danh ${value} ngày liên tiếp`;
      case 'TOTAL_MISSIONS': return `Hoàn thành ${value} nhiệm vụ`;
      default: return `${type} = ${value}`;
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Hệ thống Thành tích</h3>
            <p className="text-muted mb-0">Quản lý các huy hiệu và mốc thưởng dài hạn</p>
          </div>
          <button className="btn btn-primary rounded-pill px-4" onClick={() => openModal()}>
            <i className="fa-solid fa-plus me-2"></i> Tạo Thành tích mới
          </button>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center p-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center p-5 text-muted bg-white rounded-4 shadow-sm">
            <i className="fa-solid fa-medal fs-1 mb-3"></i>
            <h5>Chưa có thành tích nào</h5>
            <p>Hãy tạo một thành tích mới để vinh danh người dùng.</p>
          </div>
        ) : (
          <div className="row g-4">
            {achievements.map(achievement => (
              <div key={achievement.id} className="col-lg-4 col-md-6">
                <div className={`card border-0 shadow-sm h-100 ${achievement.status === 'INACTIVE' ? 'opacity-75' : ''}`} style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4 text-center position-relative">
                    <div className="dropdown position-absolute" style={{ top: '15px', right: '15px' }}>
                      <button className="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                        <li><button className="dropdown-item" onClick={() => openModal(achievement)}><i className="fa-solid fa-pen me-2 text-muted"></i>Chỉnh sửa</button></li>
                        {achievement.status === 'INACTIVE' ? (
                          <li><button className="dropdown-item" onClick={() => updateStatus(achievement.id, 'ACTIVE')}><i className="fa-solid fa-play me-2 text-success"></i>Kích hoạt</button></li>
                        ) : (
                          <li><button className="dropdown-item" onClick={() => updateStatus(achievement.id, 'INACTIVE')}><i className="fa-solid fa-pause me-2 text-warning"></i>Tạm dừng</button></li>
                        )}
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item text-danger" onClick={() => deleteAchievement(achievement.id)}><i className="fa-solid fa-trash me-2"></i>Xóa</button></li>
                      </ul>
                    </div>

                    <div 
                      className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3 shadow-sm"
                      style={{ 
                        width: '80px', height: '80px', 
                        backgroundColor: achievement.badgeColor, 
                        color: '#fff', fontSize: '32px'
                      }}
                    >
                      <i className={`fa-solid ${achievement.icon}`}></i>
                    </div>
                    
                    <h5 className="fw-bold mb-1">{achievement.name}</h5>
                    <p className="text-muted small mb-3">{achievement.description}</p>
                    
                    <div className="bg-light rounded p-2 mb-3 text-sm">
                      <i className="fa-solid fa-bullseye text-primary me-2"></i>
                      {getRequirementText(achievement.requirementType, achievement.requirementValue)}
                    </div>
                    
                    <div className="d-flex justify-content-center gap-3 border-top pt-3 mt-3">
                      <div>
                        <div className="text-muted small">Phần thưởng</div>
                        <div className="fw-bold text-warning"><i className="fa-solid fa-coins me-1"></i>{achievement.rewardPoints}</div>
                      </div>
                      <div className="border-start"></div>
                      <div>
                        <div className="text-muted small">Người đạt</div>
                        <div className="fw-bold">{achievement.totalAchieved?.toLocaleString() || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">{editAchievement.id ? 'Chỉnh sửa Thành tích' : 'Tạo Thành tích mới'}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-4">
                <form id="achievementForm" onSubmit={handleSaveAchievement}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-bold">Tên thành tích <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" value={editAchievement.name} onChange={(e) => setEditAchievement({...editAchievement, name: e.target.value})} required placeholder="Vd: Fan cứng 30 ngày" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Màu huy hiệu</label>
                      <input type="color" className="form-control form-control-color w-100" value={editAchievement.badgeColor} onChange={(e) => setEditAchievement({...editAchievement, badgeColor: e.target.value})} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Mô tả vinh danh</label>
                      <textarea className="form-control" rows="2" value={editAchievement.description} onChange={(e) => setEditAchievement({...editAchievement, description: e.target.value})}></textarea>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Loại điều kiện</label>
                      <select className="form-select" value={editAchievement.requirementType} onChange={(e) => setEditAchievement({...editAchievement, requirementType: e.target.value})}>
                        <option value="TOTAL_CHECKINS">Tổng số lượt điểm danh tích lũy</option>
                        <option value="MAX_STREAK">Đạt chuỗi điểm danh (Streak)</option>
                        <option value="TOTAL_MISSIONS">Số lượng nhiệm vụ đã làm</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Mốc đạt được</label>
                      <input type="number" className="form-control" value={editAchievement.requirementValue} onChange={(e) => setEditAchievement({...editAchievement, requirementValue: parseInt(e.target.value)})} min="1" />
                    </div>
                    
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Icon (FontAwesome)</label>
                      <input type="text" className="form-control" value={editAchievement.icon} onChange={(e) => setEditAchievement({...editAchievement, icon: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Điểm thưởng</label>
                      <input type="number" className="form-control" value={editAchievement.rewardPoints} onChange={(e) => setEditAchievement({...editAchievement, rewardPoints: parseInt(e.target.value)})} min="0" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Thứ tự hiển thị</label>
                      <input type="number" className="form-control" value={editAchievement.displayOrder} onChange={(e) => setEditAchievement({...editAchievement, displayOrder: parseInt(e.target.value)})} min="1" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4 border" onClick={closeModal}>Hủy</button>
                <button type="submit" form="achievementForm" className="btn btn-primary rounded-pill px-4">Lưu Thành Tích</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default CheckInAchievementsPage;
