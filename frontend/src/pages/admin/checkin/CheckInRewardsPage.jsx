import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { motion } from 'framer-motion';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

function CheckInRewardsPage() {
  const [activeTab, setActiveTab] = useState('mystery-box');
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBox, setEditBox] = useState({
    name: '',
    description: '',
    imageUrl: '',
    totalQuantity: 100,
    remainingQuantity: 100,
    guaranteedReward: false,
    requireKey: false,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (activeTab === 'mystery-box') {
      fetchBoxes();
    }
  }, [activeTab]);

  const fetchBoxes = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/check-ins/mystery-boxes');
      setBoxes(res);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Mystery Box');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/api/admin/check-ins/mystery-boxes/${id}/status`, { status });
      toast.success('Cập nhật trạng thái thành công');
      fetchBoxes();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const deleteBox = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hộp quà này?')) {
      try {
        await axiosClient.delete(`/api/admin/check-ins/mystery-boxes/${id}`);
        toast.success('Xóa hộp quà thành công');
        fetchBoxes();
      } catch (error) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const openModal = (box = null) => {
    if (box) {
      setEditBox(box);
    } else {
      setEditBox({
        name: '',
        description: '',
        imageUrl: '',
        totalQuantity: 100,
        remainingQuantity: 100,
        guaranteedReward: false,
        requireKey: false,
        startDate: '',
        endDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveBox = async (e) => {
    e.preventDefault();
    try {
      if (editBox.id) {
        await axiosClient.put(`/api/admin/check-ins/mystery-boxes/${editBox.id}`, editBox);
      } else {
        await axiosClient.post('/api/admin/check-ins/mystery-boxes', editBox);
      }
      toast.success('Lưu hộp quà thành công');
      fetchBoxes();
      closeModal();
    } catch (error) {
      toast.error('Lưu thất bại');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE': return <span className="badge bg-success">Đang hoạt động</span>;
      case 'INACTIVE': return <span className="badge bg-secondary">Tạm dừng</span>;
      case 'DEPLETED': return <span className="badge bg-danger">Hết hàng</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Quản lý Phần thưởng</h3>
            <p className="text-muted mb-0">Quản lý Mystery Box và các vật phẩm thưởng</p>
          </div>
          <button className="btn btn-primary rounded-pill px-4" onClick={() => openModal()}>
            <i className="fa-solid fa-plus me-2"></i> Tạo Mystery Box mới
          </button>
        </div>

        <ul className="nav nav-pills mb-4 gap-2">
          <li className="nav-item">
            <button 
              className={`nav-link rounded-pill px-4 fw-bold ${activeTab === 'mystery-box' ? 'active shadow-sm' : 'bg-white border text-muted'}`}
              onClick={() => setActiveTab('mystery-box')}
            >
              Hộp quà bí ẩn (Mystery Box)
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link rounded-pill px-4 fw-bold ${activeTab === 'rewards' ? 'active shadow-sm' : 'bg-white border text-muted'}`}
              onClick={() => setActiveTab('rewards')}
            >
              Vật phẩm thưởng
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link rounded-pill px-4 fw-bold ${activeTab === 'history' ? 'active shadow-sm' : 'bg-white border text-muted'}`}
              onClick={() => setActiveTab('history')}
            >
              Lịch sử phát
            </button>
          </li>
        </ul>

        {activeTab === 'mystery-box' && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body p-0">
              {loading ? (
                <div className="d-flex justify-content-center p-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : boxes.length === 0 ? (
                <div className="text-center p-5 text-muted">
                  <i className="fa-solid fa-box-open fs-1 mb-3"></i>
                  <h5>Chưa có Mystery Box nào</h5>
                  <p>Hãy tạo một hộp quà mới để thu hút người dùng.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-4">Tên Hộp quà</th>
                        <th>Tồn kho</th>
                        <th>Thời hạn áp dụng</th>
                        <th>Yêu cầu Chìa khóa</th>
                        <th>Tỷ lệ 100% trúng</th>
                        <th>Trạng thái</th>
                        <th className="text-end pe-4">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boxes.map(box => (
                        <tr key={box.id}>
                          <td className="ps-4 fw-bold">
                            <div className="d-flex align-items-center">
                              {box.imageUrl ? (
                                <img src={box.imageUrl} alt="" className="rounded me-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                              ) : (
                                <div className="bg-light rounded d-flex align-items-center justify-content-center me-3 text-primary" style={{ width: '40px', height: '40px' }}>
                                  <i className="fa-solid fa-gift"></i>
                                </div>
                              )}
                              {box.name}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                <div className={`progress-bar ${box.remainingQuantity / box.totalQuantity < 0.2 ? 'bg-danger' : 'bg-success'}`} style={{ width: `${(box.remainingQuantity / box.totalQuantity) * 100}%` }}></div>
                              </div>
                              <span className="small fw-bold">{box.remainingQuantity}/{box.totalQuantity}</span>
                            </div>
                          </td>
                          <td>
                            {box.startDate ? new Date(box.startDate).toLocaleDateString('vi-VN') : 'Không giới hạn'} 
                            {box.endDate ? ` - ${new Date(box.endDate).toLocaleDateString('vi-VN')}` : ''}
                          </td>
                          <td>
                            {box.requireKey ? <span className="badge bg-warning text-dark"><i className="fa-solid fa-key me-1"></i>Có</span> : <span className="text-muted">Không</span>}
                          </td>
                          <td>
                            {box.guaranteedReward ? <span className="text-success fw-bold"><i className="fa-solid fa-check me-1"></i>Có</span> : <span className="text-muted">Random (Có rủi ro trượt)</span>}
                          </td>
                          <td>{getStatusBadge(box.status)}</td>
                          <td className="text-end pe-4">
                            <div className="dropdown">
                              <button className="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown">
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                                <li><button className="dropdown-item fw-bold text-primary"><i className="fa-solid fa-list me-2"></i>Quản lý Item bên trong</button></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item" onClick={() => openModal(box)}><i className="fa-solid fa-pen me-2 text-muted"></i>Chỉnh sửa thông tin</button></li>
                                {box.status === 'INACTIVE' ? (
                                  <li><button className="dropdown-item" onClick={() => updateStatus(box.id, 'ACTIVE')}><i className="fa-solid fa-play me-2 text-success"></i>Kích hoạt</button></li>
                                ) : (
                                  <li><button className="dropdown-item" onClick={() => updateStatus(box.id, 'INACTIVE')}><i className="fa-solid fa-pause me-2 text-warning"></i>Tạm dừng</button></li>
                                )}
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item text-danger" onClick={() => deleteBox(box.id)}><i className="fa-solid fa-trash me-2"></i>Xóa</button></li>
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
        )}
        
        {activeTab === 'rewards' && (
          <div className="text-center p-5 bg-white rounded-4 shadow-sm text-muted">
            <i className="fa-solid fa-gem fs-1 mb-3"></i>
            <h5>Đang phát triển</h5>
            <p>Tính năng quản lý từng vật phẩm độc lập đang được hoàn thiện.</p>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="text-center p-5 bg-white rounded-4 shadow-sm text-muted">
            <i className="fa-solid fa-clock-rotate-left fs-1 mb-3"></i>
            <h5>Đang phát triển</h5>
            <p>Lịch sử mở hộp quà sẽ hiển thị tại đây.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">{editBox.id ? 'Chỉnh sửa Mystery Box' : 'Tạo Mystery Box mới'}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-4">
                <form id="boxForm" onSubmit={handleSaveBox}>
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Tên hộp quà <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" value={editBox.name} onChange={(e) => setEditBox({...editBox, name: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Mô tả hấp dẫn</label>
                      <textarea className="form-control" rows="2" value={editBox.description} onChange={(e) => setEditBox({...editBox, description: e.target.value})}></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">URL Hình ảnh</label>
                      <input type="text" className="form-control" value={editBox.imageUrl} onChange={(e) => setEditBox({...editBox, imageUrl: e.target.value})} />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Tổng số lượng phát hành</label>
                      <input type="number" className="form-control" value={editBox.totalQuantity} onChange={(e) => setEditBox({...editBox, totalQuantity: parseInt(e.target.value), remainingQuantity: editBox.id ? editBox.remainingQuantity : parseInt(e.target.value)})} min="1" />
                    </div>
                    {editBox.id && (
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Số lượng còn lại</label>
                        <input type="number" className="form-control" value={editBox.remainingQuantity} onChange={(e) => setEditBox({...editBox, remainingQuantity: parseInt(e.target.value)})} min="0" max={editBox.totalQuantity} />
                      </div>
                    )}
                    
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Ngày bắt đầu</label>
                      <input type="date" className="form-control" value={editBox.startDate || ''} onChange={(e) => setEditBox({...editBox, startDate: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Ngày kết thúc</label>
                      <input type="date" className="form-control" value={editBox.endDate || ''} onChange={(e) => setEditBox({...editBox, endDate: e.target.value})} />
                    </div>
                    
                    <div className="col-md-6 mt-4">
                      <div className="form-check form-switch">
                        <input className="form-check-input cursor-pointer" type="checkbox" checked={editBox.guaranteedReward || false} onChange={(e) => setEditBox({...editBox, guaranteedReward: e.target.checked})} />
                        <label className="form-check-label fw-bold ms-2">Đảm bảo 100% trúng quà (Không có tỷ lệ trượt)</label>
                      </div>
                    </div>
                    <div className="col-md-6 mt-4">
                      <div className="form-check form-switch">
                        <input className="form-check-input cursor-pointer" type="checkbox" checked={editBox.requireKey || false} onChange={(e) => setEditBox({...editBox, requireKey: e.target.checked})} />
                        <label className="form-check-label fw-bold ms-2 text-warning">Yêu cầu Chìa Khóa Vàng để mở</label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4 border" onClick={closeModal}>Hủy</button>
                <button type="submit" form="boxForm" className="btn btn-primary rounded-pill px-4">Lưu Hộp Quà</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default CheckInRewardsPage;
