import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

function RewardCycleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== 'new';
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [cycle, setCycle] = useState({
    name: '',
    description: '',
    days: 7,
    cycleType: 'REPEATING',
    startDate: '',
    endDate: '',
    isRepeatable: true
  });

  useEffect(() => {
    if (isEdit) {
      fetchCycle();
    }
  }, [id]);

  const fetchCycle = async () => {
    try {
      const res = await axiosClient.get(`/api/admin/check-ins/reward-cycles/${id}`);
      setCycle(res);
    } catch (error) {
      toast.error('Lỗi khi tải thông tin chu kỳ');
      navigate('/admin/check-in/reward-cycles');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCycle(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEdit) {
        await axiosClient.put(`/api/admin/check-ins/reward-cycles/${id}`, cycle);
        toast.success('Cập nhật thành công');
      } else {
        await axiosClient.post('/api/admin/check-ins/reward-cycles', cycle);
        toast.success('Tạo chu kỳ thành công');
        navigate('/admin/check-in/reward-cycles');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu');
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

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="mb-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/admin/check-in/reward-cycles" className="text-decoration-none">Chu kỳ phần thưởng</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{isEdit ? 'Chỉnh sửa' : 'Tạo mới'}</li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="fw-bold mb-0">{isEdit ? 'Chỉnh sửa chu kỳ' : 'Tạo chu kỳ mới'}</h3>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <form onSubmit={handleSubmit}>
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Thông tin cơ bản</h5>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Tên chu kỳ <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="name" value={cycle.name} onChange={handleChange} required placeholder="Ví dụ: Chuỗi 7 ngày năng động" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Mô tả</label>
                    <textarea className="form-control" name="description" value={cycle.description} onChange={handleChange} rows="3" placeholder="Mô tả về chu kỳ này..."></textarea>
                  </div>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Loại chu kỳ</label>
                      <select className="form-select" name="cycleType" value={cycle.cycleType} onChange={handleChange}>
                        <option value="REPEATING">Tuần hoàn (Lặp lại sau khi xong)</option>
                        <option value="MONTHLY">Theo tháng dương lịch</option>
                        <option value="ONE_TIME">Một lần (Sự kiện)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Số ngày (Độ dài chuỗi)</label>
                      <input type="number" className="form-control" name="days" value={cycle.days} onChange={handleChange} min="1" max="365" />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Ngày bắt đầu áp dụng</label>
                      <input type="date" className="form-control" name="startDate" value={cycle.startDate || ''} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Ngày kết thúc</label>
                      <input type="date" className="form-control" name="endDate" value={cycle.endDate || ''} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-check form-switch mt-4">
                    <input className="form-check-input cursor-pointer" type="checkbox" name="isRepeatable" checked={cycle.isRepeatable} onChange={handleChange} />
                    <label className="form-check-label fw-bold ms-2">Cho phép người dùng lặp lại chu kỳ này</label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Link to="/admin/check-in/reward-cycles" className="btn btn-light px-4 rounded-pill border">Hủy</Link>
                <button type="submit" className="btn btn-primary px-4 rounded-pill" disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa-solid fa-save me-2"></i>}
                  {isEdit ? 'Lưu thay đổi' : 'Tạo chu kỳ'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <h5 className="fw-bold mb-0">Cấu hình mốc nhận thưởng</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info border-0 text-sm">
                  <i className="fa-solid fa-circle-info me-2"></i> 
                  Vui lòng lưu thông tin cơ bản trước khi cấu hình phần thưởng cho từng mốc ngày.
                </div>
                {isEdit && (
                  <button className="btn btn-outline-primary w-100 rounded-pill mt-3">
                    <i className="fa-solid fa-gift me-2"></i> Mở Reward Builder
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default RewardCycleFormPage;
