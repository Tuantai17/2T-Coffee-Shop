import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getOptionGroups, createOptionGroup, updateOptionGroup, deleteOptionGroup } from "../../services/productService";

function AdminOptionGroupPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", required: true, multiSelect: false, options: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getOptionGroups();
      setGroups(res.data || []);
    } catch (error) {
      console.error(error);
      alert("Lỗi tải dữ liệu Nhóm Tùy Chọn");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        name: item.name, 
        required: item.required, 
        multiSelect: item.multiSelect, 
        options: item.options || [] 
      });
    } else {
      setEditingItem(null);
      setFormData({ name: "", required: true, multiSelect: false, options: [] });
    }
    setShowModal(true);
  };

  const handleAddOption = () => {
    setFormData(prev => ({ ...prev, options: [...prev.options, { name: "", priceAdjustment: 0, displayOrder: 0 }] }));
  };

  const handleUpdateOption = (idx, field, value) => {
    const updated = [...formData.options];
    updated[idx][field] = value;
    setFormData(prev => ({ ...prev, options: updated }));
  };

  const handleRemoveOption = (idx) => {
    setFormData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateOptionGroup(editingItem.id, formData);
      } else {
        await createOptionGroup(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      alert("Lỗi lưu Nhóm Tùy Chọn");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa nhóm tùy chọn này?")) return;
    try {
      await deleteOptionGroup(id);
      loadData();
    } catch (error) {
      alert("Lỗi xóa nhóm tùy chọn");
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid px-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-1">Quản lý Option Groups (Đá, Đường...)</h3>
          <button className="neu-pill bg-primary text-white" onClick={() => handleOpenModal()}>
            + Thêm Nhóm Tùy Chọn
          </button>
        </div>

        <div className="neu-card p-4">
          {loading ? <p>Đang tải...</p> : (
            <table className="table table-borderless align-middle mb-0">
              <thead className="small text-muted border-bottom">
                <tr>
                  <th>Tên Nhóm</th>
                  <th>Bắt buộc</th>
                  <th>Chọn nhiều</th>
                  <th>Số mục chọn</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(g => (
                  <tr key={g.id}>
                    <td className="fw-semibold">{g.name}</td>
                    <td>{g.required ? <span className="badge bg-danger">Có</span> : <span className="badge bg-secondary">Không</span>}</td>
                    <td>{g.multiSelect ? <span className="badge bg-success">Có</span> : <span className="badge bg-secondary">Không</span>}</td>
                    <td>{g.options?.length || 0} mục</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary rounded-circle me-2" onClick={() => handleOpenModal(g)}><i className="fa-solid fa-pen"></i></button>
                      <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDelete(g.id)}><i className="fa-solid fa-trash"></i></button>
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
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content neu-surface rounded-4">
                <div className="modal-header border-0">
                  <h5 className="fw-bold">{editingItem ? "Sửa Nhóm Tùy Chọn" : "Thêm Nhóm Tùy Chọn"}</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit} id="optGroupForm">
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Tên Nhóm (VD: Lượng Đường)</label>
                        <input type="text" className="neu-input w-100" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                      </div>
                      <div className="col-md-3 d-flex align-items-center mt-4 pt-2">
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" checked={formData.required} onChange={e => setFormData({...formData, required: e.target.checked})} />
                          <label className="form-check-label small">Bắt buộc chọn</label>
                        </div>
                      </div>
                      <div className="col-md-3 d-flex align-items-center mt-4 pt-2">
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" checked={formData.multiSelect} onChange={e => setFormData({...formData, multiSelect: e.target.checked})} />
                          <label className="form-check-label small">Cho phép chọn nhiều</label>
                        </div>
                      </div>
                    </div>

                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">Các lựa chọn (Options)</h6>
                        <button type="button" className="btn btn-sm btn-outline-primary rounded-pill" onClick={handleAddOption}>
                          + Thêm lựa chọn
                        </button>
                      </div>
                      {formData.options.length === 0 ? <p className="text-muted small">Chưa có lựa chọn nào.</p> : (
                        <table className="table table-borderless table-sm">
                          <thead>
                            <tr>
                              <th style={{ width: "15%" }}>Thứ tự</th>
                              <th style={{ width: "45%" }}>Tên lựa chọn (VD: 50% Đường)</th>
                              <th style={{ width: "30%" }}>Giá cộng thêm (VNĐ)</th>
                              <th className="text-end" style={{ width: "10%" }}>Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.options.map((opt, idx) => (
                              <tr key={idx}>
                                <td>
                                  <input type="number" className="neu-input w-100 form-control-sm text-center fw-bold" value={opt.displayOrder || 0} onChange={e => handleUpdateOption(idx, "displayOrder", Number(e.target.value))} required />
                                </td>
                                <td>
                                  <input type="text" className="neu-input w-100 form-control-sm" value={opt.name} onChange={e => handleUpdateOption(idx, "name", e.target.value)} required />
                                </td>
                                <td>
                                  <input type="number" className="neu-input w-100 form-control-sm text-success fw-bold" value={opt.priceAdjustment} onChange={e => handleUpdateOption(idx, "priceAdjustment", Number(e.target.value))} required min="0" />
                                </td>
                                <td className="text-end">
                                  <button type="button" className="btn btn-sm btn-danger rounded-circle" onClick={() => handleRemoveOption(idx)}><i className="fa-solid fa-trash"></i></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="neu-pill" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" form="optGroupForm" className="neu-pill bg-primary text-white">Lưu</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminOptionGroupPage;
