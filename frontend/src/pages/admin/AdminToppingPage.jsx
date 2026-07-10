import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getToppings, createTopping, updateTopping, deleteTopping } from "../../services/productService";
import uploadService from "../../services/uploadService";

function AdminToppingPage() {
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", price: 0, imageUrl: "" });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getToppings();
      setToppings(res.data || []);
    } catch (error) {
      console.error(error);
      alert("Lỗi tải dữ liệu Toppings");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, price: item.price, imageUrl: item.imageUrl || "" });
    } else {
      setEditingItem(null);
      setFormData({ name: "", price: 0, imageUrl: "" });
    }
    setShowModal(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        const url = await uploadService.uploadImage(file, "toppings");
        setFormData(prev => ({ ...prev, imageUrl: url }));
      } catch (err) {
        alert("Lỗi upload ảnh");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateTopping(editingItem.id, formData);
      } else {
        await createTopping(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      alert("Lỗi lưu Topping");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa Topping này?")) return;
    try {
      await deleteTopping(id);
      loadData();
    } catch (error) {
      alert("Lỗi xóa Topping");
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid px-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-1">Quản lý Topping</h3>
          <button className="neu-pill bg-primary text-white" onClick={() => handleOpenModal()}>
            + Thêm Topping
          </button>
        </div>

        <div className="neu-card p-4">
          {loading ? <p>Đang tải...</p> : (
            <table className="table table-borderless align-middle mb-0">
              <thead className="small text-muted border-bottom">
                <tr>
                  <th>Ảnh</th>
                  <th>Tên Topping</th>
                  <th>Giá (VNĐ)</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {toppings.map(t => (
                  <tr key={t.id}>
                    <td>
                      {t.imageUrl ? <img src={t.imageUrl} alt={t.name} width="50" className="rounded" /> : <div className="bg-light rounded" style={{width: 50, height: 50}}></div>}
                    </td>
                    <td className="fw-semibold">{t.name}</td>
                    <td className="text-success fw-bold">{t.price?.toLocaleString()}đ</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary rounded-circle me-2" onClick={() => handleOpenModal(t)}><i className="fa-solid fa-pen"></i></button>
                      <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDelete(t.id)}><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content neu-surface rounded-4">
                <div className="modal-header border-0">
                  <h5 className="fw-bold">{editingItem ? "Sửa Topping" : "Thêm Topping"}</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit} id="toppingForm">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Tên Topping</label>
                      <input type="text" className="neu-input w-100" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Giá (VNĐ)</label>
                      <input 
                        type="number" 
                        className="neu-input w-100 text-success fw-bold" 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value === "" ? "" : Number(e.target.value)})} 
                        required 
                        min="0" 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold d-block">Ảnh</label>
                      {formData.imageUrl && (
                        <div className="mb-2 position-relative d-inline-block">
                          <img src={formData.imageUrl} width="80" className="rounded shadow-sm" alt="Preview"/>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle rounded-circle p-0" 
                            style={{ width: "20px", height: "20px", fontSize: "10px" }}
                            onClick={() => setFormData({...formData, imageUrl: ""})}
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      )}
                      <input type="file" className="form-control mb-2" onChange={handleImageChange} accept="image/*" />
                      <input 
                        type="text" 
                        className="neu-input w-100" 
                        placeholder="Hoặc nhập URL ảnh..." 
                        value={formData.imageUrl} 
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                      />
                      {isUploading && <small className="text-muted d-block mt-1">Đang tải ảnh...</small>}
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="neu-pill" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" form="toppingForm" className="neu-pill bg-primary text-white" disabled={isUploading}>Lưu</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminToppingPage;
