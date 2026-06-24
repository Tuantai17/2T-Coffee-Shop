import React, { useState, useEffect } from "react";
import uploadService from "../../../services/uploadService";

function BannerFormModal({ show, onClose, initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    targetUrl: "",
    position: "HOME_HERO",
    sortOrder: 1,
    active: true,
  });

  const [previewImage, setPreviewImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (show && initialData) {
      setFormData({
        title: initialData.title || "",
        subtitle: initialData.subtitle || "",
        imageUrl: initialData.imageUrl || "",
        targetUrl: initialData.targetUrl || "",
        position: initialData.position || "HOME_HERO",
        sortOrder: initialData.sortOrder ?? 1,
        active: Boolean(initialData.active),
      });
      setPreviewImage(initialData.imageUrl || "");
    } else if (show) {
      setFormData({
        title: "",
        subtitle: "",
        imageUrl: "",
        targetUrl: "",
        position: "HOME_HERO",
        sortOrder: 1,
        active: true,
      });
      setPreviewImage("");
    }
  }, [show, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreviewImage(localUrl);
        
        // Upload to Cloudinary via backend in "banners" folder
        const cloudinaryUrl = await uploadService.uploadImage(file, "banners");
        
        // Update form with actual Cloudinary URL
        setFormData(prev => ({ ...prev, imageUrl: cloudinaryUrl }));
        setPreviewImage(cloudinaryUrl);
      } catch (error) {
        alert("Có lỗi xảy ra khi tải ảnh lên Cloudinary!");
        setPreviewImage("");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 rounded-4 shadow-lg neu-surface">
          <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
            <h5 className="modal-title fw-bold text-dark">{initialData ? "Chỉnh sửa banner" : "Thêm banner mới"}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3" style={{ backgroundColor: "var(--admin-bg)" }}>
            <form onSubmit={handleSubmit} id="bannerForm">
              
              <div className="neu-card p-4 mb-4">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold small">Tiêu đề (Chỉ dùng quản trị) <span className="text-danger">*</span></label>
                    <input type="text" className="neu-input w-100" name="title" value={formData.title} onChange={handleChange} required maxLength="150" placeholder="VD: Khuyến mãi tết 2026..." />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Vị trí hiển thị</label>
                    <select className="neu-input w-100 form-select" name="position" value={formData.position} onChange={handleChange}>
                      <option value="HOME_HERO">HOME_HERO (Banner chính)</option>
                      <option value="HOME_SECONDARY">HOME_SECONDARY (Banner phụ)</option>
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold small">Mô tả (Chỉ dùng quản trị)</label>
                    <textarea 
                      className="neu-input w-100" 
                      name="subtitle" 
                      rows="2" 
                      placeholder="Mô tả nội dung banner để dễ quản lý..." 
                      value={formData.subtitle} 
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="neu-card p-4 mb-4">
                <label className="form-label fw-semibold small d-block">Ảnh Banner (1920x600px) <span className="text-danger">*</span></label>
                <div 
                  className="neu-card d-flex flex-column align-items-center justify-content-center overflow-hidden position-relative mb-2" 
                  style={{ height: "200px", border: "2px dashed rgba(0,0,0,0.1)", backgroundColor: "var(--admin-bg)", cursor: "pointer" }}
                  onClick={() => document.getElementById("bannerImageInput").click()}
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <>
                      <i className="fa-solid fa-cloud-arrow-up fs-2 text-muted mb-2"></i>
                      <span className="small text-muted">Tải ảnh lên (PNG, JPG, WEBP)</span>
                    </>
                  )}
                  <input type="file" id="bannerImageInput" className="d-none" accept="image/*" onChange={handleImageChange} />
                </div>
                {previewImage && (
                  <button type="button" className="btn btn-sm btn-link text-danger mt-1" onClick={() => { setPreviewImage(""); setFormData(p=>({...p, imageUrl: ""})) }}>
                    <i className="fa-solid fa-trash-can me-1"></i> Xóa ảnh
                  </button>
                )}
              </div>

              <div className="neu-card p-4 mb-4">
                <div className="row g-3">
                  <div className="col-md-7">
                    <label className="form-label fw-semibold small">Link URL (Đích đến khi click)</label>
                    <input type="text" className="neu-input w-100" name="targetUrl" value={formData.targetUrl} onChange={handleChange} placeholder="VD: /collections/summer-sale hoặc https://..." />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Thứ tự <span className="text-danger">*</span></label>
                    <input type="number" min="0" className="neu-input w-100" name="sortOrder" value={formData.sortOrder} onChange={handleChange} required />
                    <div className="form-text small" style={{ fontSize: "11px" }}>Số nhỏ hiển thị trước.</div>
                  </div>
                  <div className="col-md-2 d-flex align-items-center pt-3">
                    <div className="form-check form-switch mt-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        role="switch" 
                        name="active"
                        id="activeSwitch"
                        checked={formData.active}
                        onChange={handleChange}
                        style={{ cursor: "pointer", width: "40px", height: "20px" }}
                      />
                      <label className="form-check-label ms-2 small fw-semibold" htmlFor="activeSwitch">Hiển thị</label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer border-top-0 px-4 pb-4 pt-0 justify-content-end" style={{ backgroundColor: "var(--admin-bg)", borderBottomLeftRadius: "var(--admin-radius-lg)", borderBottomRightRadius: "var(--admin-radius-lg)" }}>
            <button type="button" className="neu-pill px-4" onClick={onClose} disabled={isUploading}>Hủy</button>
            <button type="submit" form="bannerForm" className="neu-pill px-4 fw-bold" style={{ backgroundColor: "var(--admin-primary)", color: "#fff", pointerEvents: (!formData.title || !previewImage) ? "none" : "auto", opacity: (!formData.title || !previewImage) ? 0.5 : 1 }} disabled={isUploading}>
              {isUploading ? (
                <><i className="fa-solid fa-spinner fa-spin me-2"></i> Đang tải...</>
              ) : (
                <><i className="fa-solid fa-save me-2"></i> {initialData ? "Lưu thay đổi" : "Tạo banner"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BannerFormModal;
