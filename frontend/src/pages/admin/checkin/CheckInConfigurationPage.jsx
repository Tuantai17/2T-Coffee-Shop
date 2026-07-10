import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { motion } from 'framer-motion';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

function CheckInConfigurationPage() {
  const [config, setConfig] = useState({
    name: '',
    isActive: false,
    startDate: '',
    endDate: '',
    timezone: 'Asia/Ho_Chi_Minh',
    startTime: '00:00:00',
    endTime: '23:59:59',
    maxCheckinsPerDay: 1,
    basePoints: 10,
    resetOnMiss: true,
    allowRecovery: true,
    maxRecoveryPerMonth: 3,
    recoveryFee: 50,
    recoveryDays: 7,
    heroTitle: 'Điểm Danh Mỗi Ngày, Nhận Quà Liền Tay',
    heroDesc: 'Tham gia điểm danh để nhận nhiều phần quà hấp dẫn.',
    checkinButtonText: 'Điểm Danh Ngay',
    afterCheckinText: 'Đã Điểm Danh',
    enableConfetti: true,
    enableLuckyDay: true,
    enableMysteryBox: true,
    enableMission: true,
    enableAchievement: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/check-ins/config');
      if (res && res.id) {
        setConfig(res);
      }
      setHasChanges(false);
    } catch (error) {
      toast.error('Không thể tải cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axiosClient.put('/api/admin/check-ins/config', config);
      setConfig(res);
      setHasChanges(false);
      toast.success('Lưu cấu hình thành công!');
    } catch (error) {
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <div className="spinner-border text-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const CardSection = ({ title, icon, children }) => (
    <div className="card border-0 mb-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div className="card-header bg-white border-0 pt-4 pb-0">
        <h5 className="fw-bold mb-0">
          <i className={`fa-solid ${icon} text-primary me-2`}></i> {title}
        </h5>
        <hr />
      </div>
      <div className="card-body pt-2 pb-4">
        {children}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Cấu hình điểm danh</h3>
            <p className="text-muted mb-0">Thiết lập luật chơi và giao diện điểm danh</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary rounded-pill px-4" onClick={fetchConfig} disabled={saving}>
              Khôi phục
            </button>
            <button className="btn btn-primary rounded-pill px-4" onClick={handleSave} disabled={!hasChanges || saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa-solid fa-save me-2"></i>}
              Lưu thay đổi
            </button>
          </div>
        </div>

        {hasChanges && (
          <div className="alert alert-warning border-0 rounded-4 shadow-sm mb-4">
            <i className="fa-solid fa-triangle-exclamation me-2"></i>
            Bạn có thay đổi chưa lưu. Hãy nhớ bấm "Lưu thay đổi" nhé.
          </div>
        )}

        <div className="row">
          <div className="col-lg-8">
            <CardSection title="Trạng thái chương trình" icon="fa-toggle-on">
              <div className="mb-4">
                <div className="form-check form-switch fs-5">
                  <input className="form-check-input cursor-pointer" type="checkbox" name="isActive" checked={config.isActive || false} onChange={handleChange} />
                  <label className="form-check-label fw-bold ms-2">Bật chương trình điểm danh</label>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label">Tên chương trình</label>
                  <input type="text" className="form-control" name="name" value={config.name || ''} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ngày bắt đầu</label>
                  <input type="date" className="form-control" name="startDate" value={config.startDate || ''} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ngày kết thúc (tùy chọn)</label>
                  <input type="date" className="form-control" name="endDate" value={config.endDate || ''} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Múi giờ</label>
                  <select className="form-select" name="timezone" value={config.timezone || ''} onChange={handleChange}>
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Giờ mở cửa (mỗi ngày)</label>
                  <input type="time" className="form-control" name="startTime" value={config.startTime || ''} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Giờ đóng cửa</label>
                  <input type="time" className="form-control" name="endTime" value={config.endTime || ''} onChange={handleChange} />
                </div>
              </div>
            </CardSection>

            <CardSection title="Quy tắc chuỗi (Streak)" icon="fa-fire">
              <div className="row g-3">
                <div className="col-md-12 mb-3">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" name="resetOnMiss" checked={config.resetOnMiss || false} onChange={handleChange} />
                    <label className="form-check-label">Mất chuỗi nếu quên điểm danh 1 ngày</label>
                  </div>
                </div>
                <div className="col-md-12 mb-2">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" name="allowRecovery" checked={config.allowRecovery || false} onChange={handleChange} />
                    <label className="form-check-label fw-bold">Cho phép khôi phục chuỗi (Recovery)</label>
                  </div>
                </div>
                
                {config.allowRecovery && (
                  <div className="col-12 p-3 bg-light rounded-3 border">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Số lần khôi phục tối đa/tháng</label>
                        <input type="number" className="form-control" name="maxRecoveryPerMonth" value={config.maxRecoveryPerMonth || 0} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Chi phí khôi phục (Điểm)</label>
                        <input type="number" className="form-control" name="recoveryFee" value={config.recoveryFee || 0} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Được khôi phục trong vòng (ngày)</label>
                        <input type="number" className="form-control" name="recoveryDays" value={config.recoveryDays || 0} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardSection>

            <CardSection title="Tích hợp tính năng Gamification" icon="fa-gamepad">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" name="enableLuckyDay" checked={config.enableLuckyDay || false} onChange={handleChange} />
                    <label className="form-check-label">Ngày may mắn (Lucky Day)</label>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" name="enableMysteryBox" checked={config.enableMysteryBox || false} onChange={handleChange} />
                    <label className="form-check-label">Hộp quà bí ẩn (Mystery Box)</label>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" name="enableMission" checked={config.enableMission || false} onChange={handleChange} />
                    <label className="form-check-label">Hệ thống nhiệm vụ (Missions)</label>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" name="enableAchievement" checked={config.enableAchievement || false} onChange={handleChange} />
                    <label className="form-check-label">Thành tích (Achievements)</label>
                  </div>
                </div>
              </div>
            </CardSection>
          </div>

          <div className="col-lg-4">
            <CardSection title="Quy tắc cơ bản" icon="fa-coins">
              <div className="mb-3">
                <label className="form-label">Điểm nhận được mỗi lần điểm danh</label>
                <input type="number" className="form-control" name="basePoints" value={config.basePoints || 0} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Giới hạn điểm danh mỗi ngày</label>
                <input type="number" className="form-control" name="maxCheckinsPerDay" value={config.maxCheckinsPerDay || 1} onChange={handleChange} />
              </div>
            </CardSection>

            <CardSection title="Giao diện người dùng" icon="fa-palette">
              <div className="mb-3">
                <label className="form-label">Tiêu đề (Hero Title)</label>
                <input type="text" className="form-control" name="heroTitle" value={config.heroTitle || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Mô tả ngắn</label>
                <textarea className="form-control" rows="2" name="heroDesc" value={config.heroDesc || ''} onChange={handleChange}></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label">Chữ trên nút (Chưa điểm danh)</label>
                <input type="text" className="form-control" name="checkinButtonText" value={config.checkinButtonText || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Chữ trên nút (Đã điểm danh)</label>
                <input type="text" className="form-control" name="afterCheckinText" value={config.afterCheckinText || ''} onChange={handleChange} />
              </div>
              <div className="form-check form-switch mt-4">
                <input className="form-check-input" type="checkbox" name="enableConfetti" checked={config.enableConfetti || false} onChange={handleChange} />
                <label className="form-check-label">Bật hiệu ứng pháo hoa (Confetti)</label>
              </div>
            </CardSection>
            
            <CardSection title="Bảo mật & Gian lận" icon="fa-shield-halved">
               <div className="alert alert-info border-0 rounded-3 mb-0" style={{ fontSize: '13px' }}>
                 <i className="fa-solid fa-info-circle me-1"></i> Idempotency Key và Rate Limiting đã được tự động kích hoạt bởi API Gateway để chống spam click.
               </div>
            </CardSection>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default CheckInConfigurationPage;
