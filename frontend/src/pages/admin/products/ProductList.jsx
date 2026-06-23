import React from "react";

function ProductList({
  products,
  loading,
  categories,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onToggleFeature,
  onEdit,
  onDelete,
}) {
  const moneyFormatter = new Intl.NumberFormat("vi-VN");

  const getCategoryName = (categoryId) => {
    const found = categories.find((cat) => String(cat.id) === String(categoryId));
    return found ? found.name : categoryId;
  };

  const getStatusBadge = (status, quantity) => {
    if (quantity <= 0 || status === "OUT_OF_STOCK") {
      return <span className="badge" style={{ backgroundColor: "#ffc107", color: "#856404", padding: "5px 10px" }}>Hết hàng</span>;
    }
    if (status === "ACTIVE") {
      return <span className="badge" style={{ backgroundColor: "rgba(25, 135, 84, 0.1)", color: "#198754", padding: "5px 10px", border: "1px solid rgba(25, 135, 84, 0.2)" }}>Đang bán</span>;
    }
    return <span className="badge bg-secondary">Ẩn</span>;
  };

  const isAllSelected = products.length > 0 && selectedIds.length === products.length;

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString("vi-VN");
    return new Date(dateString).toLocaleString("vi-VN", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="neu-card overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ minWidth: "1200px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface)", borderBottom: "2px solid rgba(0,0,0,0.05)" }}>
              <th className="px-4 py-3" style={{ width: "40px" }}>
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  style={{ cursor: "pointer" }}
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="py-3 text-muted small fw-bold">Sản phẩm</th>
              <th className="py-3 text-muted small fw-bold">Slug</th>
              <th className="py-3 text-muted small fw-bold">SKU</th>
              <th className="py-3 text-muted small fw-bold">Danh mục</th>
              <th className="py-3 text-muted small fw-bold text-center">Trạng thái</th>
              <th className="py-3 text-muted small fw-bold text-end">Giá bán</th>
              <th className="py-3 text-muted small fw-bold text-end">Giá gốc</th>
              <th className="py-3 text-muted small fw-bold text-center">Tồn kho</th>
              <th className="py-3 text-muted small fw-bold text-center">Hiển thị & Thứ tự</th>
              <th className="py-3 text-muted small fw-bold">Cập nhật</th>
              <th className="py-3 text-muted small fw-bold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan="12" className="px-4 py-3">
                    <div className="placeholder-glow d-flex gap-3 align-items-center">
                      <span className="placeholder rounded-circle" style={{ width: "40px", height: "40px" }}></span>
                      <div className="w-100">
                        <span className="placeholder col-4 rounded mb-2"></span>
                        <br />
                        <span className="placeholder col-2 rounded"></span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-5 text-muted">
                  <i className="fa-solid fa-box-open fs-1 mb-3"></i>
                  <p className="mb-0">Không tìm thấy sản phẩm nào.</p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px dashed rgba(0,0,0,0.05)" }}>
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      style={{ cursor: "pointer" }}
                      checked={selectedIds.includes(product.id)}
                      onChange={(e) => onSelectOne(product.id, e.target.checked)}
                    />
                  </td>
                  <td className="py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="rounded-3 shadow-sm"
                        style={{ 
                          width: "50px", 
                          height: "50px",
                          backgroundImage: `url(${product.imageUrl || "https://placehold.co/100x100?text=No+Image"})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }}
                      />
                      <div className="fw-bold text-dark" style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {product.name || product.productName}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 small text-muted" style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>{product.slug || "-"}</td>
                  <td className="py-3 fw-semibold">{product.sku || "-"}</td>
                  <td className="py-3 small">{getCategoryName(product.categoryId || product.category)}</td>
                  <td className="py-3 text-center">{getStatusBadge(product.status, product.quantity || product.availability)}</td>
                  <td className="py-3 text-end fw-bold text-dark">{moneyFormatter.format(product.price || 0)}đ</td>
                  <td className="py-3 text-end small text-muted">{product.originalPrice ? moneyFormatter.format(product.originalPrice) + "đ" : "-"}</td>
                  <td className="py-3 text-center fw-bold" style={{ color: (product.quantity || product.availability) <= 0 ? "var(--admin-danger)" : "inherit" }}>
                    {product.quantity || product.availability || 0}
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex flex-column align-items-end gap-2 mx-auto" style={{ width: "fit-content" }}>
                      <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.75rem" }}>
                        <span className="text-muted" style={{ width: "25px", textAlign: "left" }}>KM</span>
                        <input 
                          type="number" 
                          className="form-control form-control-sm text-center p-0" 
                          style={{ width: "35px", height: "20px", fontSize: "0.75rem" }}
                          defaultValue={product.onSaleOrder || 0}
                          onBlur={(e) => onToggleFeature(product.id, 'onSaleOrder', Number(e.target.value))}
                          title="Thứ tự Khuyến mãi"
                        />
                        <div className="form-check form-switch m-0">
                          <input className="form-check-input" type="checkbox" role="switch" style={{ cursor: "pointer", height: "16px", width: "30px" }} checked={Boolean(product.onSale)} onChange={(e) => onToggleFeature(product.id, 'onSale', e.target.checked)} />
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.75rem" }}>
                        <span className="text-muted" style={{ width: "25px", textAlign: "left" }}>New</span>
                        <input 
                          type="number" 
                          className="form-control form-control-sm text-center p-0" 
                          style={{ width: "35px", height: "20px", fontSize: "0.75rem" }}
                          defaultValue={product.newArrivalOrder || 0}
                          onBlur={(e) => onToggleFeature(product.id, 'newArrivalOrder', Number(e.target.value))}
                          title="Thứ tự Mới"
                        />
                        <div className="form-check form-switch m-0">
                          <input className="form-check-input" type="checkbox" role="switch" style={{ cursor: "pointer", height: "16px", width: "30px" }} checked={Boolean(product.newArrival)} onChange={(e) => onToggleFeature(product.id, 'newArrival', e.target.checked)} />
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.75rem" }}>
                        <span className="text-muted" style={{ width: "25px", textAlign: "left" }}>Hot</span>
                        <input 
                          type="number" 
                          className="form-control form-control-sm text-center p-0" 
                          style={{ width: "35px", height: "20px", fontSize: "0.75rem" }}
                          defaultValue={product.featuredOrder || 0}
                          onBlur={(e) => onToggleFeature(product.id, 'featuredOrder', Number(e.target.value))}
                          title="Thứ tự Hot"
                        />
                        <div className="form-check form-switch m-0">
                          <input className="form-check-input" type="checkbox" role="switch" style={{ cursor: "pointer", height: "16px", width: "30px" }} checked={Boolean(product.featured)} onChange={(e) => onToggleFeature(product.id, 'featured', e.target.checked)} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 small text-muted">
                    {formatDate(product.updatedAt)}
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button className="btn btn-sm btn-light text-primary rounded-circle" style={{ width: "32px", height: "32px" }} title="Sửa" onClick={() => onEdit(product)}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="btn btn-sm btn-light text-danger rounded-circle" style={{ width: "32px", height: "32px" }} title="Xóa" onClick={() => onDelete(product.id)}>
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductList;
