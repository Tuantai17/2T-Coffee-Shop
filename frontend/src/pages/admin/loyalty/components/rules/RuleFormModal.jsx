import React, { useState, useEffect } from 'react';

const RuleFormModal = ({ show, onHide, rule, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Tích điểm',
    source: 'ORDER',
    point: 0,
    status: true,
    conditionObj: {}
  });

  useEffect(() => {
    if (rule) {
      let parsedCond = {};
      try {
        parsedCond = JSON.parse(rule.condition);
      } catch(e) {
        // Fallback or empty if not parseable
      }
      setFormData({
        id: rule.id,
        name: rule.name || '',
        type: rule.type || 'Tích điểm',
        source: rule.source || 'ORDER',
        point: rule.point || 0,
        status: rule.status !== false,
        conditionObj: parsedCond
      });
    } else {
      setFormData({
        name: '',
        type: 'Tích điểm',
        source: 'ORDER',
        point: 0,
        status: true,
        conditionObj: { ratioVnd: 1000, excludeShipping: true }
      });
    }
  }, [rule, show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSourceChange = (e) => {
    const newSource = e.target.value;
    let newCond = {};
    if (newSource === 'ORDER') newCond = { ratioVnd: 1000, excludeShipping: true, excludeDiscount: true };
    if (newSource === 'CHECKIN') newCond = { pointsPerDay: 5, streak3: 10, streak7: 30, streak30: 100 };
    if (newSource === 'TIER') newCond = { Silver: 5, Gold: 10, Platinum: 15, Diamond: 20 };
    setFormData(prev => ({ ...prev, source: newSource, conditionObj: newCond, point: 0 }));
  };

  const handleCondChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      conditionObj: {
        ...prev.conditionObj,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      id: formData.id,
      name: formData.name,
      type: formData.type,
      source: formData.source,
      point: Number(formData.point),
      status: formData.status,
      condition: JSON.stringify(formData.conditionObj)
    };
    onSave(payload);
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={onHide}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div className="modal-header border-bottom bg-light">
              <h5 className="modal-title fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "14px" }}>
                <i className={`fa-solid ${rule ? 'fa-pen-to-square' : 'fa-plus'} text-primary`}></i>
                {rule ? ' CẬP NHẬT QUY TẮC' : ' THÊM MỚI QUY TẮC'}
              </h5>
              <button type="button" className="btn-close shadow-none" onClick={onHide}></button>
            </div>
            <div className="px-4 pt-3 text-muted small bg-white">
              Quản lý cách thức tích và trừ điểm cho thành viên.
            </div>
            <form onSubmit={handleSubmit} className="bg-white">
              <div className="modal-body p-4 pt-3" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium small text-muted">Tên quy tắc <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required placeholder="Ví dụ: Tích điểm mua hàng..." />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium small text-muted">Loại quy tắc</label>
                    <select className="form-select" name="type" value={formData.type} onChange={handleChange}>
                      <option value="Tích điểm">Tích điểm (+)</option>
                      <option value="Trừ điểm">Trừ điểm (-)</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-medium small text-muted">Nguồn áp dụng <span className="text-danger">*</span></label>
                    <select className="form-select" name="source" value={formData.source} onChange={handleSourceChange}>
                      <option value="ORDER">Đơn hàng</option>
                      <option value="CHECKIN">Điểm danh</option>
                      <option value="MINIGAME">Mini Game</option>
                      <option value="VOUCHER">Đổi Voucher</option>
                      <option value="BIRTHDAY">Sinh nhật</option>
                      <option value="TIER">Hạng thành viên</option>
                      <option value="MANUAL">Thủ công (Admin cộng/trừ)</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium small text-muted">Điểm mặc định (Số điểm cơ bản)</label>
                    <input type="number" min="0" className="form-control" name="point" value={formData.point} onChange={handleChange} />
                  </div>

                  <div className="col-12 mt-4 mb-2">
                    <h6 className="fw-bold border-bottom pb-2">Cấu hình điều kiện chi tiết</h6>
                  </div>

                  {/* Dynamic Condition Rendering */}
                  {formData.source === 'ORDER' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small text-muted">Tỷ lệ quy đổi (VNĐ = 1 điểm)</label>
                        <input type="number" className="form-control" name="ratioVnd" value={formData.conditionObj.ratioVnd || ''} onChange={handleCondChange} />
                      </div>
                      <div className="col-md-6 d-flex flex-column justify-content-center pt-4">
                        <div className="form-check mb-2">
                          <input type="checkbox" className="form-check-input" id="exShip" name="excludeShipping" checked={formData.conditionObj.excludeShipping || false} onChange={handleCondChange} />
                          <label className="form-check-label small" htmlFor="exShip">Không cộng điểm cho phí Ship</label>
                        </div>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="exDisc" name="excludeDiscount" checked={formData.conditionObj.excludeDiscount || false} onChange={handleCondChange} />
                          <label className="form-check-label small" htmlFor="exDisc">Không cộng phần tiền đã giảm giá</label>
                        </div>
                      </div>
                      <div className="col-12 mt-3">
                        <div className="alert alert-info py-2 small mb-0 border-0 bg-info bg-opacity-10 d-flex gap-2">
                          <i className="fa-solid fa-circle-info mt-1"></i>
                          <div>Hệ thống chỉ cộng điểm tự động khi đơn hàng chuyển sang trạng thái <strong>Hoàn thành</strong>. Đơn hủy sẽ bị thu hồi điểm.</div>
                        </div>
                      </div>
                    </>
                  )}

                  {formData.source === 'CHECKIN' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small text-muted">Điểm nhận mỗi ngày</label>
                        <input type="number" className="form-control" name="pointsPerDay" value={formData.conditionObj.pointsPerDay || ''} onChange={handleCondChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small text-muted">Thưởng chuỗi 3 ngày liên tiếp</label>
                        <input type="number" className="form-control" name="streak3" value={formData.conditionObj.streak3 || ''} onChange={handleCondChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small text-muted">Thưởng chuỗi 7 ngày liên tiếp</label>
                        <input type="number" className="form-control" name="streak7" value={formData.conditionObj.streak7 || ''} onChange={handleCondChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small text-muted">Thưởng chuỗi 30 ngày liên tiếp</label>
                        <input type="number" className="form-control" name="streak30" value={formData.conditionObj.streak30 || ''} onChange={handleCondChange} />
                      </div>
                    </>
                  )}

                  {formData.source === 'TIER' && (
                    <>
                      <div className="col-12 text-muted small mb-2">Cấu hình điểm riêng biệt nhận được theo từng phân hạng của khách hàng.</div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold text-secondary">Silver</label>
                        <input type="number" className="form-control" name="Silver" value={formData.conditionObj.Silver || ''} onChange={handleCondChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold text-warning">Gold</label>
                        <input type="number" className="form-control" name="Gold" value={formData.conditionObj.Gold || ''} onChange={handleCondChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold" style={{color:"#6c757d"}}>Platinum</label>
                        <input type="number" className="form-control" name="Platinum" value={formData.conditionObj.Platinum || ''} onChange={handleCondChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold text-info">Diamond</label>
                        <input type="number" className="form-control" name="Diamond" value={formData.conditionObj.Diamond || ''} onChange={handleCondChange} />
                      </div>
                    </>
                  )}

                  {['MINIGAME', 'VOUCHER', 'BIRTHDAY', 'MANUAL'].includes(formData.source) && (
                    <div className="col-12">
                      <label className="form-label small text-muted">Ghi chú điều kiện / Thông số bổ sung</label>
                      <textarea className="form-control" rows="3" name="notes" value={formData.conditionObj.notes || ''} onChange={handleCondChange} placeholder="Nhập thêm thông tin cấu hình nếu cần (Dạng mô tả)"></textarea>
                    </div>
                  )}

                  <div className="col-12 mt-4">
                    <div className="d-flex align-items-center bg-light p-3 rounded border">
                      <div className="form-check form-switch mb-0">
                        <input className="form-check-input fs-5 m-0 mt-1" type="checkbox" id="ruleStatus" name="status" checked={formData.status} onChange={handleChange} />
                        <label className="form-check-label fw-bold ms-2 mt-1" htmlFor="ruleStatus">Kích hoạt quy tắc này</label>
                      </div>
                      <span className="text-muted ms-auto small mt-1">Quy tắc tắt sẽ ngừng áp dụng ngay lập tức nhưng không mất lịch sử.</span>
                    </div>
                  </div>

                </div>
              </div>
              <div className="modal-footer border-top bg-light">
                <button type="button" className="btn btn-light border rounded-pill px-4 fw-medium" onClick={onHide}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm">
                  {rule ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RuleFormModal;
