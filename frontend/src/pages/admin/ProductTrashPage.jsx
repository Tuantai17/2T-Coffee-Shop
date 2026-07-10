import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getTrashProducts, restoreProduct, permanentlyDeleteProduct } from "../../services/productService";
import { Link } from "react-router-dom";

function ProductTrashPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getTrashProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.error("Failed to load trash products", error);
      showStatus("Lỗi khi tải dữ liệu thùng rác.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showStatus = (message, type = "success") => {
    setStatusMsg({ message, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreProduct(id);
      showStatus("Khôi phục sản phẩm thành công!");
      loadData();
    } catch (error) {
      showStatus("Khôi phục thất bại!", "error");
    }
  };

  const handleRestoreSelected = async () => {
    if (!window.confirm(`Khôi phục ${selectedIds.length} sản phẩm?`)) return;
    setLoading(true);
    let successCount = 0;
    for (const id of selectedIds) {
      try {
        await restoreProduct(id);
        successCount++;
      } catch (e) {
        console.error(e);
      }
    }
    showStatus(`Đã khôi phục ${successCount}/${selectedIds.length} sản phẩm.`);
    setSelectedIds([]);
    loadData();
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm("Cảnh báo: Hành động này sẽ XÓA VĨNH VIỄN sản phẩm khỏi hệ thống và không thể khôi phục. Tiếp tục?")) return;
    try {
      await permanentlyDeleteProduct(id);
      showStatus("Xóa vĩnh viễn thành công!");
      loadData();
    } catch (error) {
      showStatus("Xóa vĩnh viễn thất bại!", "error");
    }
  };

  const handlePermanentDeleteSelected = async () => {
    if (!window.confirm(`Cảnh báo: XÓA VĨNH VIỄN ${selectedIds.length} sản phẩm?`)) return;
    setLoading(true);
    let successCount = 0;
    for (const id of selectedIds) {
      try {
        await permanentlyDeleteProduct(id);
        successCount++;
      } catch (e) {
        console.error(e);
      }
    }
    showStatus(`Đã xóa vĩnh viễn ${successCount}/${selectedIds.length} sản phẩm.`);
    setSelectedIds([]);
    loadData();
  };

  return (
    <AdminLayout>
      <div className="container-fluid px-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: "var(--admin-text)" }}>Thùng rác sản phẩm</h3>
            <p className="mb-0 text-muted">Quản lý các sản phẩm đã xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.</p>
          </div>
          <div className="d-flex gap-3 align-items-center">
            {statusMsg && (
              <div className={`badge bg-${statusMsg.type === 'error' ? 'danger' : 'success'} px-3 py-2 rounded-pill shadow-sm animate__animated animate__fadeIn`}>
                {statusMsg.message}
              </div>
            )}
            <Link to="/admin/products" className="neu-pill text-decoration-none">
              <i className="fa-solid fa-arrow-left me-2"></i> Trở về danh sách
            </Link>
            {selectedIds.length > 0 && (
              <>
                <button className="neu-pill text-decoration-none bg-success text-white border-success" onClick={handleRestoreSelected}>
                  <i className="fa-solid fa-rotate-left me-2"></i> Khôi phục ({selectedIds.length})
                </button>
                <button className="neu-pill text-decoration-none bg-danger text-white border-danger" onClick={handlePermanentDeleteSelected}>
                  <i className="fa-solid fa-trash-can me-2"></i> Xóa vĩnh viễn ({selectedIds.length})
                </button>
              </>
            )}
          </div>
        </div>

        <div className="neu-surface p-4 rounded-4 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" style={{ width: "40px" }}>
                    <input 
                      type="checkbox" 
                      className="form-check-input"
                      checked={products.length > 0 && selectedIds.length === products.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th scope="col" style={{ minWidth: "250px" }}>Sản phẩm</th>
                  <th scope="col">Người xóa</th>
                  <th scope="col">Lý do</th>
                  <th scope="col">Thời gian xóa</th>
                  <th scope="col" className="text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4">Đang tải...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4 text-muted">Thùng rác trống.</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          className="form-check-input"
                          checked={selectedIds.includes(p.id)}
                          onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                        />
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={p.imageUrl || "https://placehold.co/40x40"} 
                            alt={p.name || p.productName}
                            className="rounded-3 shadow-sm me-3"
                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            onError={(e) => { e.target.src = "https://placehold.co/40x40" }}
                          />
                          <div>
                            <h6 className="mb-0 fw-bold">{p.name || p.productName}</h6>
                            <small className="text-muted">SKU: {p.sku || "N/A"}</small>
                          </div>
                        </div>
                      </td>
                      <td>{p.deletedBy || "N/A"}</td>
                      <td className="text-truncate" style={{ maxWidth: "200px" }} title={p.deleteReason}>{p.deleteReason || "N/A"}</td>
                      <td>{p.deletedAt ? new Date(p.deletedAt).toLocaleString("vi-VN") : "N/A"}</td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-outline-success me-2 rounded-pill"
                          onClick={() => handleRestore(p.id)}
                          title="Khôi phục"
                        >
                          <i className="fa-solid fa-rotate-left"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-pill"
                          onClick={() => handlePermanentDelete(p.id)}
                          title="Xóa vĩnh viễn"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ProductTrashPage;
