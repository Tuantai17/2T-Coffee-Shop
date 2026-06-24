import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  createCollection,
  deleteCollection,
  getCollections,
  updateCollection,
} from "../../services/productService";
import uploadService from "../../services/uploadService";

const defaultForm = {
  name: "",
  slug: "",
  subtitle: "",
  description: "",
  bannerUrl: "",
  targetUrl: "/products",
  categoryFilter: "",
  brandFilter: "",
  badgeFilter: "",
  active: true,
  featured: true,
  sortOrder: 0,
};

function AdminCollectionPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);

  const loadCollections = async () => {
    try {
      const response = await getCollections({ activeOnly: false });
      setCollections(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi lấy collections:", error);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleChange = (event, setter) => {
    const { name, value, type, checked } = event.target;
    setter((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const normalizePayload = (source) => ({
    ...source,
    sortOrder: Number(source.sortOrder || 0),
    active: Boolean(source.active),
    featured: Boolean(source.featured),
  });

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await createCollection(normalizePayload(form));
      alert("Đã tạo collection.");
      setForm(defaultForm);
      loadCollections();
    } catch (error) {
      console.error(error);
      alert("Tạo collection thất bại!");
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      await updateCollection(editingCollection.id, normalizePayload(editForm));
      alert("Đã cập nhật collection.");
      setEditingCollection(null);
      loadCollections();
    } catch (error) {
      console.error(error);
      alert("Cập nhật collection thất bại!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa collection này?")) {
      return;
    }
    try {
      await deleteCollection(id);
      alert("Đã xóa collection.");
      loadCollections();
    } catch (error) {
      console.error(error);
      alert("Xóa collection thất bại!");
    }
  };

  const startEdit = (collection) => {
    setEditingCollection(collection);
    setEditForm({
      name: collection.name || "",
      slug: collection.slug || "",
      subtitle: collection.subtitle || "",
      description: collection.description || "",
      bannerUrl: collection.bannerUrl || "",
      targetUrl: collection.targetUrl || "/products",
      categoryFilter: collection.categoryFilter || "",
      brandFilter: collection.brandFilter || "",
      badgeFilter: collection.badgeFilter || "",
      active: Boolean(collection.active),
      featured: Boolean(collection.featured),
      sortOrder: collection.sortOrder ?? 0,
    });
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        // Upload to Cloudinary via backend
        const targetFolder = `collections/temp_${Date.now()}`;
        const cloudinaryUrl = await uploadService.uploadImage(file, targetFolder);
        
        // Update form with actual Cloudinary URL
        setter((current) => ({
          ...current,
          bannerUrl: cloudinaryUrl,
        }));
      } catch (error) {
        alert("Có lỗi xảy ra khi tải ảnh lên Cloudinary!");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const renderForm = (source, setter, onSubmit, submitLabel) => (
    <form onSubmit={onSubmit} className="card shadow-sm border-0 rounded-4 p-4 mb-4">
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Tên collection</label>
          <input name="name" className="form-control rounded-3" value={source.name} onChange={(e) => handleChange(e, setter)} required />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold">Slug</label>
          <input name="slug" className="form-control rounded-3" value={source.slug} onChange={(e) => handleChange(e, setter)} />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Tiêu đề phụ</label>
          <input name="subtitle" className="form-control rounded-3" value={source.subtitle} onChange={(e) => handleChange(e, setter)} />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Mô tả</label>
          <textarea name="description" className="form-control rounded-3" rows="3" value={source.description} onChange={(e) => handleChange(e, setter)}></textarea>
        </div>
        
        {/* Banner Upload */}
        <div className="col-md-6">
          <label className="form-label fw-semibold d-block">Banner URL</label>
          <div className="d-flex align-items-center gap-3 mb-2">
            <div 
              className="border rounded-3 d-flex flex-column align-items-center justify-content-center bg-light position-relative overflow-hidden"
              style={{ width: "120px", height: "80px", cursor: "pointer", borderStyle: "dashed" }}
              onClick={() => document.getElementById(`bannerUpload_${submitLabel}`).click()}
            >
              {source.bannerUrl ? (
                <img src={source.bannerUrl} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <i className="fa-solid fa-cloud-arrow-up text-muted fs-4"></i>
              )}
              <input 
                type="file" 
                id={`bannerUpload_${submitLabel}`} 
                className="d-none" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, setter)} 
              />
            </div>
            <div className="flex-grow-1">
              <input name="bannerUrl" className="form-control rounded-3" value={source.bannerUrl} onChange={(e) => handleChange(e, setter)} placeholder="Hoặc nhập link trực tiếp" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold">Link đích</label>
          <input name="targetUrl" className="form-control rounded-3" value={source.targetUrl} onChange={(e) => handleChange(e, setter)} />
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">Thứ tự</label>
          <input name="sortOrder" type="number" className="form-control rounded-3" value={source.sortOrder} onChange={(e) => handleChange(e, setter)} />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">Filter category</label>
          <input name="categoryFilter" className="form-control rounded-3" value={source.categoryFilter} onChange={(e) => handleChange(e, setter)} />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">Filter brand</label>
          <input name="brandFilter" className="form-control rounded-3" value={source.brandFilter} onChange={(e) => handleChange(e, setter)} />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">Filter badge</label>
          <input name="badgeFilter" className="form-control rounded-3" value={source.badgeFilter} onChange={(e) => handleChange(e, setter)} />
        </div>
        <div className="col-12 d-flex flex-wrap gap-4">
          <div className="form-check">
            <input id={`${submitLabel}-active`} name="active" type="checkbox" className="form-check-input" checked={source.active} onChange={(e) => handleChange(e, setter)} />
            <label className="form-check-label fw-semibold" htmlFor={`${submitLabel}-active`}>Đang hiển thị</label>
          </div>
          <div className="form-check">
            <input id={`${submitLabel}-featured`} name="featured" type="checkbox" className="form-check-input" checked={source.featured} onChange={(e) => handleChange(e, setter)} />
            <label className="form-check-label fw-semibold" htmlFor={`${submitLabel}-featured`}>Hiển thị ở trang chủ</label>
          </div>
        </div>
      </div>
      <button type="submit" className="btn btn-primary rounded-3 px-4 py-2 fw-bold mt-4" disabled={isUploading}>
        {isUploading ? <><i className="fa-solid fa-spinner fa-spin me-2"></i> Đang tải ảnh...</> : submitLabel}
      </button>
    </form>
  );

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h2 className="fw-bold mb-4">Quản Lý Collection Trang Chủ</h2>
        {renderForm(form, setForm, handleCreate, "Tạo collection")}

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          {loading ? (
            <div className="text-center my-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>
          ) : collections.length === 0 ? (
            <div className="text-center my-4 text-muted">Chưa có collection nào.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="py-3">Tên</th>
                    <th className="py-3">Bộ lọc</th>
                    <th className="py-3">Hiển thị</th>
                    <th className="py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection) => (
                    <tr key={collection.id}>
                      <td className="px-4 py-3 fw-bold">#{collection.id}</td>
                      <td className="py-3">
                        <div className="fw-semibold">{collection.name}</div>
                        <div className="small text-muted">{collection.slug}</div>
                      </td>
                      <td className="py-3 small">
                        category: {collection.categoryFilter || "-"}<br />
                        brand: {collection.brandFilter || "-"}<br />
                        badge: {collection.badgeFilter || "-"}
                      </td>
                      <td className="py-3">
                        <span className={`badge ${collection.active ? "bg-success" : "bg-secondary"} rounded-pill px-3 py-2 me-2`}>
                          {collection.active ? "Active" : "Hidden"}
                        </span>
                        {collection.featured && <span className="badge bg-warning text-dark rounded-pill px-3 py-2">Home</span>}
                      </td>
                      <td className="py-3 text-center">
                        <button className="btn btn-outline-primary btn-sm rounded-3 px-3 me-2" onClick={() => startEdit(collection)}>Sửa</button>
                        <button className="btn btn-danger btn-sm rounded-3 px-3" onClick={() => handleDelete(collection.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editingCollection && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
                <h5 className="modal-title fw-bold text-dark">Chỉnh sửa collection</h5>
                <button type="button" className="btn-close" onClick={() => setEditingCollection(null)}></button>
              </div>
              <div className="modal-body px-4 py-3">
                {renderForm(editForm, setEditForm, handleUpdate, "Cập nhật collection")}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminCollectionPage;
