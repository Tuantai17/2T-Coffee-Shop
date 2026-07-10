import React, { useState, useEffect } from "react";
import { updateUser, updateUserAddress } from "../../../../services/authService";
import { AUTH_SCOPES, getAuthSession } from "../../../../utils/authStorage";
import uploadService from "../../../../services/uploadService";
import { useRef } from "react";

function ProfileInformationForm({ profile, addresses = [], onUpdateSuccess }) {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    avatarUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDefaultAddressId, setSelectedDefaultAddressId] = useState("");
  const [originalDefaultId, setOriginalDefaultId] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.userDetails
          ? `${profile.userDetails.firstName || ""} ${profile.userDetails.lastName || ""}`.trim()
          : "",
        phoneNumber: profile.userDetails?.phoneNumber || "",
        email: profile.userDetails?.email || profile.userName || "",
        avatarUrl: profile.userDetails?.avatarUrl || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.default) || addresses[0];
      setSelectedDefaultAddressId(defaultAddr.id.toString());
      setOriginalDefaultId(defaultAddr.id.toString());
    } else {
      setSelectedDefaultAddressId("");
      setOriginalDefaultId("");
    }
  }, [addresses]);

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
        avatarUrl: profile.userDetails?.avatarUrl || "",
      });
    }
    setError("");
    setSuccess("");
  };

  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Kích thước ảnh vượt quá 2MB.");
      return;
    }

    setUploadingAvatar(true);
    setError("");
    try {
      const url = await uploadService.uploadImage(file, "avatars");
      setForm(prev => ({ ...prev, avatarUrl: url }));
      setSuccess("Tải ảnh lên thành công! Bấm 'Cập nhật thông tin' để lưu.");
    } catch (err) {
      console.error("Lỗi upload avatar:", err);
      setError("Không thể tải ảnh lên. Vui lòng thử lại sau.");
    } finally {
      setUploadingAvatar(false);
    }
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
          avatarUrl: form.avatarUrl,
        },
      };

      await updateUser(profile.id, updatedUserPayload);

      // Nếu địa chỉ mặc định bị thay đổi
      if (selectedDefaultAddressId && selectedDefaultAddressId !== originalDefaultId) {
        const addressToUpdate = addresses.find(a => a.id.toString() === selectedDefaultAddressId);
        if (addressToUpdate) {
          await updateUserAddress(profile.id, addressToUpdate.id, {
            ...addressToUpdate,
            default: true,
            isDefault: true
          });
        }
      }

      setSuccess("Cập nhật thông tin thành công.");
      window.dispatchEvent(new Event("profileUpdated"));
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
    <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Thông tin tài khoản</h4>
        <p className="text-muted mb-0 small">Quản lý và cập nhật thông tin cá nhân của bạn.</p>
      </div>

      {error && (
        <div 
          className="alert alert-danger shadow-sm rounded-3 py-3 px-4 mb-0 d-flex align-items-center gap-2" 
          role="alert"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            minWidth: '300px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <i className="fa-solid fa-circle-exclamation fs-5"></i>
          <div>
            <div className="fw-bold mb-1">Lỗi</div>
            <div className="small m-0">{error}</div>
          </div>
          <button type="button" className="btn-close ms-auto" onClick={() => setError("")} aria-label="Close"></button>
        </div>
      )}
      {success && (
        <div 
          className="alert alert-success shadow-sm rounded-3 py-3 px-4 mb-0 d-flex align-items-center gap-2" 
          role="alert"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            minWidth: '300px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <i className="fa-solid fa-circle-check fs-5"></i>
          <div>
            <div className="fw-bold mb-1">Thông báo</div>
            <div className="small m-0">{success}</div>
          </div>
          <button type="button" className="btn-close ms-auto" onClick={() => setSuccess("")} aria-label="Close"></button>
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

              {/* Khu vực Địa chỉ mặc định */}
              <div className="col-12 mt-4">
                <label className="form-label fw-bold text-dark mb-2">Địa chỉ mặc định</label>
                {addresses.length === 0 ? (
                  <div className="alert alert-light border text-center small py-3">
                    Bạn chưa có địa chỉ nào. Vui lòng thêm tại <a href="/profile/addresses" className="text-danger fw-medium text-decoration-none">Sổ địa chỉ</a>.
                  </div>
                ) : (
                  <>
                    <select
                      className="form-select mb-3"
                      style={{ borderRadius: "8px", cursor: "pointer", appearance: "none" }}
                      value={selectedDefaultAddressId}
                      onChange={(e) => setSelectedDefaultAddressId(e.target.value)}
                    >
                      {addresses.map((addr) => {
                        const fullAddr = [addr.addressLine, addr.ward, addr.district, addr.province].filter(Boolean).join(", ");
                        return (
                          <option key={addr.id} value={addr.id}>
                            {addr.label ? `${addr.label} - ` : ""}{fullAddr}
                          </option>
                        );
                      })}
                    </select>

                    {/* Hiển thị chi tiết địa chỉ đang chọn */}
                    {selectedDefaultAddressId && (
                      (() => {
                        const addr = addresses.find(a => a.id.toString() === selectedDefaultAddressId);
                        if (!addr) return null;
                        const fullAddr = [addr.addressLine, addr.ward, addr.district, addr.province].filter(Boolean).join(", ");
                        return (
                          <div className="card border rounded-3 bg-light p-3 position-relative">
                            {addr.id.toString() === originalDefaultId && (
                              <span className="badge border border-danger text-danger position-absolute top-0 end-0 m-3" style={{ backgroundColor: "#fff5f5" }}>
                                <i className="fa-solid fa-star me-1"></i> Mặc định
                              </span>
                            )}
                            <div className="d-flex align-items-start gap-3">
                              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm border" style={{ width: "40px", height: "40px", flexShrink: 0 }}>
                                <i className={`fa-solid ${addr.label === "Công ty" ? "fa-briefcase" : addr.label === "Nhà người thân" ? "fa-users" : "fa-house"} text-danger`}></i>
                              </div>
                              <div className="small">
                                <div className="mb-1">
                                  <span className="text-muted d-inline-block" style={{ width: "80px" }}>Người nhận:</span>
                                  <span className="fw-medium">{addr.receiverName || displayName}</span>
                                </div>
                                <div className="mb-1">
                                  <span className="text-muted d-inline-block" style={{ width: "80px" }}>Số điện thoại:</span>
                                  <span className="fw-medium">{addr.phoneNumber || form.phoneNumber}</span>
                                </div>
                                <div>
                                  <span className="text-muted d-inline-block" style={{ width: "80px" }}>Địa chỉ:</span>
                                  <span>{fullAddr}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4 d-flex flex-column align-items-center justify-content-center border-start">
            <div className="position-relative mb-3 text-center">
              <img
                src={form.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0b1c55&color=fff&size=150`}
                alt="Avatar Preview"
                className="rounded-circle border shadow-sm"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
              />
              <div 
                className="position-absolute bg-white rounded-circle shadow-sm border d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px", bottom: "5px", right: "5px", cursor: "pointer" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa-solid fa-camera text-muted small"></i>
              </div>
            </div>
            <div className="text-center">
              <span className="fw-semibold d-block mb-1">Ảnh đại diện</span>
              <span className="text-muted small d-block mb-2">JPG, PNG, WEBP, GIF tối đa 2MB</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/jpeg, image/png, image/jpg, image/webp, image/gif" 
                style={{ display: "none" }} 
              />
              <button 
                type="button" 
                className="btn btn-outline-danger btn-sm rounded-pill px-4" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar || loading}
              >
                {uploadingAvatar ? (
                  <><i className="fa-solid fa-spinner fa-spin me-2"></i>Đang tải...</>
                ) : (
                  <><i className="fa-solid fa-arrow-up-from-bracket me-2"></i>Đổi ảnh</>
                )}
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
