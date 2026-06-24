import React, { useState, useEffect } from "react";
import uploadService from "../../../services/uploadService";

function CategoryFormModal({ show, onClose, initialData, parentCategories, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
    imageUrl: "",
  });

  const [previewImage, setPreviewImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (show && initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        parentId: initialData.parentId || "",
        imageUrl: initialData.imageUrl || "",
      });
      setPreviewImage(initialData.imageUrl || "");
    } else if (show) {
      setFormData({
        name: "",
        slug: "",
        description: "",
        parentId: "",
        imageUrl: "",
      });
      setPreviewImage("");
    }
  }, [show, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from name if creating new and slug is empty
      if (name === "name" && !initialData && !prev.slug) {
        newData.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      }
      return newData;
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreviewImage(localUrl);
        
        // Upload to Cloudinary via backend in "categories" folder
        const cloudinaryUrl = await uploadService.uploadImage(file, "categories");
        
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

  // Filter out self and children to prevent circular parent loops
  const availableParents = parentCategories.filter(cat => cat.id !== initialData?.id);

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 rounded-4 shadow-lg neu-surface">
          <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
            <h5 className="modal-title fw-bold text-dark">{initialData ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3" style={{ backgroundColor: "var(--admin-bg)" }}>
            <form onSubmit={handleSubmit} id="categoryForm">
              
              <div className="neu-card p-4 mb-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Tên danh mục <span className="text-danger">*</span></label>
                    <input type="text" className="neu-input w-100" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Slug</label>
                    <input type="text" className="neu-input w-100" name="slug" value={formData.slug} onChange={handleChange} placeholder="Tu dong tao neu de trong" />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold small">Danh mục cha</label>
                    <select 
                      className="neu-input w-100 form-select" 
                      name="parentId" 
                      value={formData.parentId} 
                      onChange={handleChange}
                      disabled={initialData && initialData.children && initialData.children.length > 0} // Cannot make parent a child if it has children
                    >
                      <option value="">-- Không có (Danh mục cấp 1) --</option>
                      {availableParents.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {initialData && initialData.children && initialData.children.length > 0 && (
                      <div className="form-text text-warning small mt-1">
                        <i className="fa-solid fa-triangle-exclamation me-1"></i> Không thể chuyển thành danh mục con vì đang chứa danh mục con khác.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="neu-card p-4 mb-4">
                <div className="row g-4">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small d-block">Ảnh đại diện</label>
                    <div 
                      className="neu-card d-flex flex-column align-items-center justify-content-center overflow-hidden position-relative" 
                      style={{ height: "150px", border: "2px dashed rgba(0,0,0,0.1)", backgroundColor: "var(--admin-bg)", cursor: "pointer" }}
                      onClick={() => document.getElementById("catImageInput").click()}
                    >
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up fs-2 text-muted mb-2"></i>
                          <span className="small text-muted">Tải ảnh lên</span>
                        </>
                      )}
                      <input type="file" id="catImageInput" className="d-none" accept="image/*" onChange={handleImageChange} />
                    </div>
                    {previewImage && (
                      <button type="button" className="btn btn-sm btn-link text-danger mt-2 w-100" onClick={() => { setPreviewImage(""); setFormData(p=>({...p, imageUrl: ""})) }}>
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                  
                  <div className="col-md-8">
                    <label className="form-label fw-semibold small">Mô tả</label>
                    <textarea 
                      className="neu-input w-100" 
                      name="description" 
                      rows="6" 
                      placeholder="Nhập mô tả chi tiết danh mục..." 
                      value={formData.description} 
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer border-top-0 px-4 pb-4 pt-0 justify-content-end" style={{ backgroundColor: "var(--admin-bg)", borderBottomLeftRadius: "var(--admin-radius-lg)", borderBottomRightRadius: "var(--admin-radius-lg)" }}>
            <button type="button" className="neu-pill px-4" onClick={onClose} disabled={isUploading}>Hủy</button>
            <button type="submit" form="categoryForm" className="neu-pill px-4 fw-bold" style={{ backgroundColor: "var(--admin-primary)", color: "#fff" }} disabled={isUploading}>
              {isUploading ? (
                <><i className="fa-solid fa-spinner fa-spin me-2"></i> Đang tải...</>
              ) : (
                <><i className="fa-solid fa-save me-2"></i> {initialData ? "Lưu thay đổi" : "Tạo danh mục"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryFormModal;
