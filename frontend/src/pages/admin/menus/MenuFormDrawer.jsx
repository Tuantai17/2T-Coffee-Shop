import React, { useState, useEffect } from "react";
import { Offcanvas } from "bootstrap";

function MenuFormDrawer({ show, onClose, menuToEdit, onSave, parentOptions }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: "",
    path: "",
    icon: "",
    displayOrder: 0,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Bootstrap Offcanvas instance management
    const el = document.getElementById('menuFormOffcanvas');
    if (el) {
      const bsOffcanvas = Offcanvas.getInstance(el) || new Offcanvas(el, { backdrop: 'static' });
      if (show) {
        bsOffcanvas.show();
      } else {
        bsOffcanvas.hide();
      }
    }
  }, [show]);

  useEffect(() => {
    if (menuToEdit) {
      setFormData({
        name: menuToEdit.name || "",
        slug: menuToEdit.slug || "",
        parentId: menuToEdit.parentId || "",
        path: menuToEdit.path || "",
        icon: menuToEdit.icon || "",
        displayOrder: menuToEdit.displayOrder || 0,
        isActive: menuToEdit.isActive !== false
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        parentId: "",
        path: "",
        icon: "",
        displayOrder: 0,
        isActive: true
      });
    }
  }, [menuToEdit, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSlug = () => {
    if (!formData.name) return;
    const slug = formData.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = { ...formData };
      if (!submitData.parentId) {
        submitData.parentId = null;
      }
      if (submitData.displayOrder === "" || isNaN(submitData.displayOrder)) {
        submitData.displayOrder = 0;
      } else {
        submitData.displayOrder = Number(submitData.displayOrder);
      }
      
      await onSave(submitData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close handler interceptor to call parent onClose
  useEffect(() => {
    const el = document.getElementById('menuFormOffcanvas');
    if (el) {
      const handleHidden = () => {
        if (show) onClose();
      };
      el.addEventListener('hidden.bs.offcanvas', handleHidden);
      return () => {
        el.removeEventListener('hidden.bs.offcanvas', handleHidden);
      };
    }
  }, [show, onClose]);

  return (
    <div className="offcanvas offcanvas-end shadow" tabIndex="-1" id="menuFormOffcanvas" style={{ width: "500px", maxWidth: "100%" }}>
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title fw-bold">
          {menuToEdit ? "Sửa menu" : "Thêm menu"}
        </h5>
        <button type="button" className="btn-close shadow-none" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Tên menu <span className="text-danger">*</span></label>
            <input 
              type="text" 
              className="form-control shadow-none" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={generateSlug}
              required
              placeholder="VD: SẢN PHẨM"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Slug</label>
            <input 
              type="text" 
              className="form-control shadow-none" 
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="san-pham"
            />
            <small className="text-muted">Được tạo tự động từ tên menu, chỉ chứa chữ thường, số và gạch ngang.</small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Menu cha</label>
            <select 
              className="form-select shadow-none" 
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
            >
              <option value="">-- Không có (Menu gốc) --</option>
              {parentOptions.map(p => {
                // Prevent selecting itself
                if (menuToEdit && p.id === menuToEdit.id) return null;
                return (
                  <option key={p.id} value={p.id}>{p.name}</option>
                );
              })}
            </select>
            <small className="text-muted">Chọn menu cha để tạo menu con.</small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Đường dẫn (Path) <span className="text-danger">*</span></label>
            <input 
              type="text" 
              className="form-control shadow-none" 
              name="path"
              value={formData.path}
              onChange={handleChange}
              required
              placeholder="/products?type=sale"
            />
            <small className="text-muted">Nhập đường dẫn nội bộ (bắt đầu bằng /) hoặc URL bên ngoài.</small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Icon URL (Tùy chọn)</label>
            <input 
              type="text" 
              className="form-control shadow-none" 
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Thứ tự hiển thị <span className="text-danger">*</span></label>
            <input 
              type="number" 
              className="form-control shadow-none" 
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              min="0"
              required
            />
            <small className="text-muted">Số nhỏ hơn sẽ được hiển thị trước (cùng cấp).</small>
          </div>

          <div className="mb-4 form-check form-switch d-flex align-items-center gap-2 ps-0">
            <label className="form-label fw-semibold mb-0">Trạng thái hiển thị</label>
            <input 
              className="form-check-input mt-0 ms-auto shadow-none" 
              type="checkbox" 
              role="switch" 
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              style={{ width: "40px", height: "20px", cursor: "pointer" }}
            />
          </div>

          <hr />
          
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-light" data-bs-dismiss="offcanvas">Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              {menuToEdit ? "Cập nhật menu" : "Thêm menu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MenuFormDrawer;
