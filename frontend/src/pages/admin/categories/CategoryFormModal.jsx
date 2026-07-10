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

  const generateSlug = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
      .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
      .replace(/đ/gi, 'd')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from name
      if (name === "name") {
        newData.slug = generateSlug(value);
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
        <div className="modal-content border-0 rounded-0 shadow-lg bg-white">
          <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
            <h5 className="modal-title fw-bold text-dark">{initialData ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3" style={{ backgroundColor: "var(--admin-bg)" }}>
            <form onSubmit={handleSubmit} id="categoryForm">
              
              <div className="card rounded-0 border-light p-4 mb-4 shadow-sm bg-white">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Tên danh mục <span className="text-danger">*</span></label>
                    <input type="text" className="form-control rounded-0 w-100" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Slug</label>
                    <input type="text" className="form-control rounded-0 w-100" name="slug" value={formData.slug} onChange={handleChange} placeholder="Tự động tạo nếu để trống" />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold small">Danh mục cha</label>
                    <select 
                      className="form-select rounded-0 w-100" 
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

              <div className="card rounded-0 border-light p-4 mb-4 shadow-sm bg-white">
                <div className="row g-4">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small d-block">Ảnh đại diện</label>
                    <div 
                      className="card rounded-0 d-flex flex-column align-items-center justify-content-center overflow-hidden position-relative bg-light mb-2" 
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
                      <button type="button" className="btn btn-sm btn-link text-danger w-100 mb-2" onClick={() => { setPreviewImage(""); setFormData(p=>({...p, imageUrl: ""})) }}>
                        Xóa ảnh
                      </button>
                    )}
                    <input 
                      type="text" 
                      className="form-control rounded-0 form-control-sm" 
                      placeholder="Hoặc nhập Link URL ảnh..."
                      value={formData.imageUrl}
                      onChange={(e) => {
                         setFormData(p => ({...p, imageUrl: e.target.value}));
                         setPreviewImage(e.target.value);
                      }}
                    />
                  </div>
                  
                  <div className="col-md-8">
                    <label className="form-label fw-semibold small">Mô tả</label>
                    <textarea 
                      className="form-control rounded-0 w-100" 
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
          <div className="modal-footer border-top-0 px-4 pb-4 pt-0 justify-content-end" style={{ backgroundColor: "var(--admin-bg)" }}>
            <button type="button" className="btn btn-outline-secondary rounded-0 px-4 bg-white" onClick={onClose} disabled={isUploading}>Hủy</button>
            <button type="submit" form="categoryForm" className="btn rounded-0 px-4 fw-bold" style={{ backgroundColor: "var(--admin-primary)", color: "#fff" }} disabled={isUploading}>
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
