import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { changePassword } from '../../../../services/authService';

function ProfilePassword({ profile }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các trường.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp.');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        userId: profile?.id,
        oldPassword,
        newPassword
      });
      setSuccess('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      if (err.response?.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : 'Có lỗi xảy ra, vui lòng thử lại sau.');
      } else {
        setError('Có lỗi xảy ra, vui lòng kiểm tra lại mạng hoặc thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
      <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
        <h5 className="fw-bold mb-0 text-dark">Đổi mật khẩu</h5>
        <p className="text-muted small mt-1">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
      </div>
      
      <div className="card-body p-4">
        {error && <div className="alert alert-danger rounded-3 py-2 small">{error}</div>}
        {success && <div className="alert alert-success rounded-3 py-2 small">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-3 d-flex align-items-center">
              <label className="form-label mb-md-0 fw-medium text-muted small">Mật khẩu cũ</label>
            </div>
            <div className="col-md-9">
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu hiện tại"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-3 d-flex align-items-center">
              <label className="form-label mb-md-0 fw-medium text-muted small">Mật khẩu mới</label>
            </div>
            <div className="col-md-9">
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-3 d-flex align-items-center">
              <label className="form-label mb-md-0 fw-medium text-muted small">Xác nhận mật khẩu</label>
            </div>
            <div className="col-md-9">
              <input
                type="password"
                className="form-control"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-3"></div>
            <div className="col-md-9 d-flex align-items-center gap-3">
              <button 
                type="submit" 
                className="btn text-white px-4 py-2 fw-bold" 
                style={{ backgroundColor: "#c67c4e", borderRadius: "8px" }}
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
                Lưu Thay Đổi
              </button>
              <Link to="/forgot-password" className="text-decoration-none" style={{ color: "#c67c4e", fontSize: "14px", fontWeight: "500" }}>
                Quên mật khẩu?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePassword;
