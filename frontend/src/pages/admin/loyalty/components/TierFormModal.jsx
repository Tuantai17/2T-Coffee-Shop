import React, { useState, useEffect } from 'react';

function TierFormModal({ tier, onClose, onSave, saving }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    color: '#8E9AAF',
    icon: 'fa-medal',
    active: true,
    minimumEligibleSpending: 0,
    minimumCompletedOrders: 0,
    evaluationMonths: 6,
    dailyCheckinPoints: 0,
    dailySpinCount: 0,
    upgradeVoucherValue: 0,
    birthdayVoucherValue: 0,
    monthlyFreeshipCount: 0,
    prioritySupport: false,
    displayOrder: 99
  });

  const [activeTab, setActiveTab] = useState('basic'); // basic, condition, benefit

  useEffect(() => {
    if (tier) {
      setFormData({
        id: tier.id,
        code: tier.code || '',
        name: tier.name || '',
        color: tier.color || '#8E9AAF',
        icon: tier.icon || 'fa-medal',
        active: tier.active !== false,
        minimumEligibleSpending: tier.minimumEligibleSpending || tier.min || 0,
        minimumCompletedOrders: tier.minimumCompletedOrders || 0,
        evaluationMonths: tier.evaluationMonths || 6,
        dailyCheckinPoints: tier.dailyCheckinPoints || 0,
        dailySpinCount: tier.dailySpinCount || 0,
        upgradeVoucherValue: tier.upgradeVoucherValue || 0,
        birthdayVoucherValue: tier.birthdayVoucherValue || 0,
        monthlyFreeshipCount: tier.monthlyFreeshipCount || 0,
        prioritySupport: tier.prioritySupport || false,
        displayOrder: tier.displayOrder || 99
      });
    }
  }, [tier]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const iconOptions = [
    { value: 'fa-medal', label: 'Huy chương (Medal)' },
    { value: 'fa-award', label: 'Giải thưởng (Award)' },
    { value: 'fa-gem', label: 'Đá quý (Gem)' },
    { value: 'fa-diamond', label: 'Kim cương (Diamond)' },
    { value: 'fa-crown', label: 'Vương miện (Crown)' },
    { value: 'fa-star', label: 'Ngôi sao (Star)' },
    { value: 'fa-trophy', label: 'Cúp (Trophy)' }
  ];

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={!saving ? onClose : undefined}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div className="modal-header border-bottom bg-light">
              <h5 className="modal-title fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "14px" }}>
                <i className={`fa-solid ${tier ? 'fa-pen-to-square' : 'fa-plus'} text-primary`}></i> 
                {tier ? 'CẬP NHẬT HẠNG THÀNH VIÊN' : 'THÊM HẠNG THÀNH VIÊN MỚI'}
              </h5>
              <button type="button" className="btn-close shadow-none" onClick={onClose} disabled={saving}></button>
            </div>
            
            <div className="modal-body p-0">
              {/* Custom Tabs */}
              <div className="d-flex border-bottom bg-light">
                <button 
                  className={`btn rounded-0 border-0 py-3 px-4 fw-bold flex-grow-1 ${activeTab === 'basic' ? 'bg-white text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                  onClick={() => setActiveTab('basic')}
                >
                  <i className="fa-solid fa-circle-info me-2"></i>Thông tin cơ bản
                </button>
                <button 
                  className={`btn rounded-0 border-0 py-3 px-4 fw-bold flex-grow-1 ${activeTab === 'condition' ? 'bg-white text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                  onClick={() => setActiveTab('condition')}
                >
                  <i className="fa-solid fa-scale-balanced me-2"></i>Điều kiện lên hạng
                </button>
                <button 
                  className={`btn rounded-0 border-0 py-3 px-4 fw-bold flex-grow-1 ${activeTab === 'benefit' ? 'bg-white text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                  onClick={() => setActiveTab('benefit')}
                >
                  <i className="fa-solid fa-gift me-2"></i>Quyền lợi (Benefits)
                </button>
              </div>

              <div className="p-4 bg-white" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <form id="tierForm" onSubmit={handleSubmit}>
                  
                  {/* Basic Info Tab */}
                  <div className={activeTab === 'basic' ? 'd-block fade-in' : 'd-none'}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small">Tên hạng <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required placeholder="Ví dụ: Vàng, Kim Cương..." />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small">Mã hệ thống (Code) <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="code" value={formData.code} onChange={handleChange} required placeholder="Ví dụ: GOLD, DIAMOND" disabled={!!tier} />
                        {tier && <small className="text-muted" style={{ fontSize: '10px' }}>Không thể thay đổi mã khi cập nhật</small>}
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small">Màu sắc <span className="text-danger">*</span></label>
                        <div className="d-flex align-items-center gap-3">
                          <input type="color" className="form-control form-control-color" name="color" value={formData.color} onChange={handleChange} title="Chọn màu" />
                          <span className="fw-medium font-monospace bg-light border px-2 py-1 rounded">{formData.color}</span>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small">Icon hiển thị <span className="text-danger">*</span></label>
                        <div className="input-group">
                          <span className="input-group-text bg-light text-center" style={{ width: '45px' }}>
                            <i className={`fa-solid ${formData.icon}`} style={{ color: formData.color }}></i>
                          </span>
                          <select className="form-select" name="icon" value={formData.icon} onChange={handleChange}>
                            {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="col-12 mt-4">
                        <div className="form-check form-switch p-3 bg-light border rounded-3 d-flex align-items-center justify-content-between">
                          <div>
                            <label className="form-check-label fw-bold text-dark mb-0" htmlFor="activeSwitch">Kích hoạt hạng thành viên này</label>
                            <div className="text-muted" style={{ fontSize: '11px' }}>Nếu tắt, thành viên sẽ không thể thăng lên hạng này.</div>
                          </div>
                          <input className="form-check-input fs-4 m-0" type="checkbox" role="switch" id="activeSwitch" name="active" checked={formData.active} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Condition Tab */}
                  <div className={activeTab === 'condition' ? 'd-block fade-in' : 'd-none'}>
                    <div className="alert alert-info py-2 px-3 small border-0 bg-info bg-opacity-10 d-flex gap-2">
                      <i className="fa-solid fa-circle-info mt-1"></i>
                      <div>Khách hàng sẽ tự động lên hạng này khi đạt được các điều kiện dưới đây trong chu kỳ xét duyệt.</div>
                    </div>
                    
                    <div className="row g-3">
                      <div className="col-md-12">
                        <label className="form-label text-muted fw-bold small">Tổng chi tiêu tối thiểu (VNĐ)</label>
                        <div className="input-group">
                          <input type="number" min="0" className="form-control" name="minimumEligibleSpending" value={formData.minimumEligibleSpending} onChange={handleChange} />
                          <span className="input-group-text bg-light">VNĐ</span>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small">Số đơn hàng thành công tối thiểu</label>
                        <div className="input-group">
                          <input type="number" min="0" className="form-control" name="minimumCompletedOrders" value={formData.minimumCompletedOrders} onChange={handleChange} />
                          <span className="input-group-text bg-light">đơn</span>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small">Chu kỳ xét duyệt</label>
                        <div className="input-group">
                          <input type="number" min="1" className="form-control" name="evaluationMonths" value={formData.evaluationMonths} onChange={handleChange} />
                          <span className="input-group-text bg-light">tháng</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benefit Tab */}
                  <div className={activeTab === 'benefit' ? 'd-block fade-in' : 'd-none'}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small">Điểm danh mỗi ngày (Points)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="fa-solid fa-calendar-check text-success"></i></span>
                          <input type="number" min="0" className="form-control" name="dailyCheckinPoints" value={formData.dailyCheckinPoints} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small">Lượt quay Mini Game / Ngày</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="fa-solid fa-gamepad text-info"></i></span>
                          <input type="number" min="0" className="form-control" name="dailySpinCount" value={formData.dailySpinCount} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small">Voucher thưởng lên hạng (Giá trị VNĐ)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="fa-solid fa-arrow-up-right-dots text-primary"></i></span>
                          <input type="number" min="0" className="form-control" name="upgradeVoucherValue" value={formData.upgradeVoucherValue} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small">Voucher quà Sinh nhật (Giá trị VNĐ)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="fa-solid fa-cake-candles text-danger"></i></span>
                          <input type="number" min="0" className="form-control" name="birthdayVoucherValue" value={formData.birthdayVoucherValue} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small">Số lần Miễn phí giao hàng / Tháng</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="fa-solid fa-truck-fast text-warning"></i></span>
                          <input type="number" min="0" className="form-control" name="monthlyFreeshipCount" value={formData.monthlyFreeshipCount} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="col-md-6 d-flex align-items-end">
                        <div className="form-check p-0 w-100 mb-1">
                          <input type="checkbox" className="btn-check" id="prioritySupport" name="prioritySupport" checked={formData.prioritySupport} onChange={handleChange} />
                          <label className={`btn w-100 ${formData.prioritySupport ? 'btn-danger' : 'btn-outline-secondary'}`} htmlFor="prioritySupport">
                            <i className="fa-solid fa-headset me-2"></i>Ưu tiên hỗ trợ CSKH
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                </form>
              </div>
            </div>
            
            <div className="modal-footer border-top bg-light">
              <button type="button" className="btn btn-light border rounded-pill px-4 fw-medium" onClick={onClose} disabled={saving}>Hủy bỏ</button>
              <button type="submit" form="tierForm" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span> Đang lưu...</> : (tier ? 'Cập nhật' : 'Tạo mới')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}

export default TierFormModal;
