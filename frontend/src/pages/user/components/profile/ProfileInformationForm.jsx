import React, { useState, useEffect } from "react";
import { updateUser } from "../../../../services/authService";
import { AUTH_SCOPES, getAuthSession } from "../../../../utils/authStorage";

function ProfileInformationForm({ profile, onUpdateSuccess }) {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.userDetails
          ? `${profile.userDetails.firstName || ""} ${profile.userDetails.lastName || ""}`.trim()
          : "",
        phoneNumber: profile.userDetails?.phoneNumber || "",
        email: profile.userDetails?.email || profile.userName || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleReset = () => {
    if (profile) {
      setForm({
        fullName: profile.userDetails
          ? `${profile.userDetails.firstName || ""} ${profile.userDetails.lastName || ""}`.trim()
          : "",
        phoneNumber: profile.userDetails?.phoneNumber || "",
        email: profile.userDetails?.email || profile.userName || "",
      });
    }
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!form.fullName.trim()) {
      setError("Vui lòng nhập họ tên.");
      return false;
    }
    if (form.phoneNumber && !/^[0-9+]{9,15}$/.test(form.phoneNumber.replace(/\s+/g, ""))) {
      setError("Số điện thoại không hợp lệ.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const parts = form.fullName.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      const updatedUserPayload = {
        ...profile,
        userDetails: {
          ...profile.userDetails,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: form.phoneNumber.replace(/\s+/g, ""),
        },
      };

      await updateUser(profile.id, updatedUserPayload);
      setSuccess("Cập nhật thông tin thành công.");
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (err) {
      console.error("Lỗi cập nhật hồ sơ:", err);
      setError("Không thể cập nhật thông tin tài khoản. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const roleName = profile?.role?.roleName === "ROLE_USER" ? "Thành viên" : (profile?.role?.roleName || "Thành viên");
  const displayName = form.fullName || profile?.userName || "Thành viên";

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Thông tin tài khoản</h4>
        <p className="text-muted mb-0 small">Quản lý và cập nhật thông tin cá nhân của bạn.</p>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 py-2 small" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success rounded-3 py-2 small" role="alert">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-dark">Họ và tên</label>
                <input
                  type="text"
                  className="form-control"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  style={{ borderRadius: "8px" }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-dark">Email</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={form.email}
                  disabled
                  readOnly
                  style={{ borderRadius: "8px", cursor: "not-allowed" }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-dark">Số điện thoại</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  style={{ borderRadius: "8px" }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-dark">Ngày tạo tài khoản</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value="Chưa cập nhật"
                  disabled
                  readOnly
                  style={{ borderRadius: "8px", cursor: "not-allowed" }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-dark">Vai trò</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={roleName}
                  disabled
                  readOnly
                  style={{ borderRadius: "8px", cursor: "not-allowed" }}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-4 d-flex flex-column align-items-center justify-content-center border-start">
            <div className="position-relative mb-3 text-center">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0b1c55&color=fff&size=150`}
                alt="Avatar Preview"
                className="rounded-circle border shadow-sm"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
              />
              <div 
                className="position-absolute bg-white rounded-circle shadow-sm border d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px", bottom: "5px", right: "5px", cursor: "not-allowed" }}
                title="Tính năng cập nhật ảnh sẽ được thêm sau"
              >
                <i className="fa-solid fa-camera text-muted small"></i>
              </div>
            </div>
            <div className="text-center">
              <span className="fw-semibold d-block mb-1">Ảnh đại diện</span>
              <span className="text-muted small d-block mb-2">JPG, PNG tối đa 2MB</span>
              <button type="button" className="btn btn-outline-danger btn-sm rounded-pill px-4" disabled>
                <i className="fa-solid fa-arrow-up-from-bracket me-2"></i>Đổi ảnh
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-top d-flex gap-2">
          <button
            type="submit"
            className="btn btn-danger px-4 rounded-3 d-flex align-items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : (
              <i className="fa-solid fa-floppy-disk"></i>
            )}
            Cập nhật thông tin
          </button>
          <button
            type="button"
            className="btn btn-light border px-4 rounded-3"
            onClick={handleReset}
            disabled={loading}
          >
            Hủy thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileInformationForm;
