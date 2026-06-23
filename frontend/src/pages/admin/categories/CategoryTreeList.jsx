import React, { useState } from "react";

function CategoryTreeList({
  treeData,
  loading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete,
}) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allIds = {};
    treeData.forEach(parent => {
      allIds[parent.id] = true;
    });
    setExpandedRows(allIds);
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  // Flatten tree for selection check
  const flattenData = () => {
    let result = [];
    treeData.forEach(parent => {
      result.push(parent);
      if (parent.children && expandedRows[parent.id]) {
        result = [...result, ...parent.children];
      }
    });
    return result;
  };

  const visibleNodes = flattenData();
  const isAllSelected = visibleNodes.length > 0 && visibleNodes.every(node => selectedIds.includes(node.id));
  const isIndeterminate = !isAllSelected && visibleNodes.some(node => selectedIds.includes(node.id));

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    onSelectAll(checked, visibleNodes);
  };

  const renderRow = (node, level) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedRows[node.id];
    const isSelected = selectedIds.includes(node.id);

    return (
      <React.Fragment key={node.id}>
        <tr style={{ borderBottom: "1px dashed rgba(0,0,0,0.05)" }}>
          <td className="px-4 py-3">
            <input 
              type="checkbox" 
              className="form-check-input" 
              style={{ cursor: "pointer" }}
              checked={isSelected}
              onChange={(e) => onSelectOne(node.id, e.target.checked)}
            />
          </td>
          <td className="py-3">
            <div className="d-flex align-items-center" style={{ paddingLeft: `${level * 30}px` }}>
              {level === 0 ? (
                hasChildren ? (
                  <button 
                    className="btn btn-sm btn-link p-0 me-2 text-muted text-decoration-none" 
                    onClick={() => toggleRow(node.id)}
                  >
                    <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'} fa-xs`}></i>
                  </button>
                ) : (
                  <span className="me-2" style={{ width: "16px", display: "inline-block" }}></span>
                )
              ) : (
                <span className="me-2 text-muted">
                  <i className="fa-solid fa-level-up fa-rotate-90 fa-xs"></i>
                </span>
              )}
              
              <div className="d-flex align-items-center gap-2">
                <i className={`fa-solid ${level === 0 ? 'fa-folder text-warning' : 'fa-folder-open text-muted'} fa-sm`}></i>
                <span className={`text-dark ${level === 0 ? 'fw-bold' : 'fw-semibold'}`}>
                  {node.name}
                </span>
                <span className={`badge ${level === 0 ? 'bg-light text-dark border' : 'bg-light text-muted border'} ms-2`} style={{ fontSize: "0.65rem" }}>
                  {level === 0 ? 'Cấp 1' : 'Cấp 2'}
                </span>
              </div>
            </div>
          </td>
          <td className="py-3">
            <div 
              className="rounded-3 shadow-sm bg-white"
              style={{ 
                width: "44px", 
                height: "44px",
                backgroundImage: `url(${node.imageUrl || "https://placehold.co/100x100?text=No+Image"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid rgba(0,0,0,0.05)"
              }}
            />
          </td>
          <td className="py-3 text-muted small" style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {node.description || "-"}
          </td>
          <td className="py-3 text-center">
            <span className={`badge rounded-pill ${node.productCount > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-muted border'}`} style={{ padding: "6px 12px" }}>
              {node.productCount || 0}
            </span>
          </td>
          <td className="py-3 text-center">
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-sm btn-light text-primary rounded-circle shadow-sm" style={{ width: "32px", height: "32px" }} title="Sửa" onClick={() => onEdit(node)}>
                <i className="fa-solid fa-pen"></i>
              </button>
              <button className="btn btn-sm btn-light text-danger rounded-circle shadow-sm" style={{ width: "32px", height: "32px" }} title="Xóa" onClick={() => onDelete(node)}>
                <i className="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && node.children.map(child => renderRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="neu-card overflow-hidden">
      <div className="d-flex justify-content-end px-4 py-2 border-bottom" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
        <button className="btn btn-sm btn-link text-decoration-none text-muted" onClick={expandAll}>
          <i className="fa-solid fa-expand me-1"></i> Mở rộng tất cả
        </button>
        <button className="btn btn-sm btn-link text-decoration-none text-muted" onClick={collapseAll}>
          <i className="fa-solid fa-compress me-1"></i> Thu gọn tất cả
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ minWidth: "900px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface)", borderBottom: "2px solid rgba(0,0,0,0.05)" }}>
              <th className="px-4 py-3" style={{ width: "40px" }}>
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  style={{ cursor: "pointer" }}
                  checked={isAllSelected}
                  ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                  onChange={handleSelectAllChange}
                />
              </th>
              <th className="py-3 text-muted small fw-bold">Danh mục</th>
              <th className="py-3 text-muted small fw-bold" style={{ width: "80px" }}>Ảnh</th>
              <th className="py-3 text-muted small fw-bold">Mô tả</th>
              <th className="py-3 text-muted small fw-bold text-center" style={{ width: "120px" }}>Số sản phẩm</th>
              <th className="py-3 text-muted small fw-bold text-center" style={{ width: "120px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan="6" className="px-4 py-3">
                    <div className="placeholder-glow d-flex gap-3 align-items-center">
                      <span className="placeholder rounded" style={{ width: "200px", height: "20px" }}></span>
                      <span className="placeholder rounded-circle" style={{ width: "40px", height: "40px" }}></span>
                      <span className="placeholder rounded col-4"></span>
                    </div>
                  </td>
                </tr>
              ))
            ) : treeData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  <i className="fa-regular fa-folder-open fs-1 mb-3"></i>
                  <p className="mb-0">Không tìm thấy danh mục nào.</p>
                </td>
              </tr>
            ) : (
              treeData.map(node => renderRow(node, 0))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CategoryTreeList;
