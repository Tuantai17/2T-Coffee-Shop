import React, { useState } from "react";

function MenuTreeTable({ 
  menus, 
  expandedRows, 
  onToggleExpand, 
  selectedIds, 
  onSelectRow, 
  onSelectAll, 
  onToggleStatus, 
  onEdit, 
  onDelete 
}) {

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString("vi-VN", { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const getFilteredChildren = (parentId) => {
    return menus.filter(m => m.parentId === parentId);
  };

  const roots = menus.filter(m => !m.parentId);

  // Determine indeterminate state for select all
  const allIds = menus.map(m => m.id);
  const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

  return (
    <div className="table-responsive rounded-3 bg-white" style={{ border: "1px solid #edf2f9" }}>
      <table className="table table-hover align-middle mb-0" style={{ borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #edf2f9" }}>
          <tr>
            <th scope="col" className="py-3 px-4 border-0" style={{ width: "50px" }}>
              <div className="form-check custom-checkbox mb-0">
                <input 
                  className="form-check-input shadow-none" 
                  type="checkbox" 
                  checked={isAllSelected}
                  ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                  onChange={(e) => onSelectAll(e.target.checked, allIds)}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </th>
            <th scope="col" className="py-3 text-muted fw-semibold border-0" style={{ fontSize: "13px" }}>Menu</th>
            <th scope="col" className="py-3 text-muted fw-semibold border-0" style={{ fontSize: "13px" }}>Đường dẫn</th>
            <th scope="col" className="py-3 text-muted fw-semibold border-0 text-center" style={{ fontSize: "13px", width: "80px" }}>Thứ tự</th>
            <th scope="col" className="py-3 text-muted fw-semibold border-0 text-center" style={{ fontSize: "13px", width: "100px" }}>Hiển thị</th>
            <th scope="col" className="py-3 text-muted fw-semibold border-0 text-center" style={{ fontSize: "13px", width: "160px" }}>Cập nhật</th>
            <th scope="col" className="py-3 text-muted fw-semibold border-0 text-center" style={{ fontSize: "13px", width: "120px" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody className="border-top-0">
          {menus.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-5">
                <div className="text-muted">
                  <i className="fa-solid fa-folder-open fs-1 mb-3 text-secondary opacity-50"></i>
                  <h5 className="fw-semibold">Chưa có menu</h5>
                  <p className="mb-0">Hãy thêm menu đầu tiên để hiển thị trên Header website.</p>
                </div>
              </td>
            </tr>
          ) : (
            roots.map(root => {
              const children = getFilteredChildren(root.id);
              const hasChildren = children.length > 0;
              const isExpanded = expandedRows[root.id];
              const isSelected = selectedIds.includes(root.id);

              return (
                <React.Fragment key={root.id}>
                  {/* Cấp 1 */}
                  <tr className="border-bottom" style={{ borderColor: "#edf2f9", transition: "background-color 0.2s" }}>
                    <td className="py-3 px-4 border-0">
                      <div className="form-check custom-checkbox mb-0">
                        <input 
                          className="form-check-input shadow-none" 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={(e) => onSelectRow(root.id, e.target.checked)}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    </td>
                    <td className="py-3 border-0">
                      <div className="d-flex align-items-center gap-2">
                        {hasChildren ? (
                          <button 
                            className="btn btn-sm btn-light p-0 d-flex align-items-center justify-content-center text-muted" 
                            style={{ width: "24px", height: "24px", borderRadius: "6px" }}
                            onClick={() => onToggleExpand(root.id)}
                          >
                            <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'} fs-7`}></i>
                          </button>
                        ) : (
                          <div style={{ width: "24px" }}></div>
                        )}
                        <span className="fw-semibold text-dark text-uppercase" style={{ fontSize: "14px" }}>{root.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted border-0" style={{ fontSize: "14px" }}>{root.path}</td>
                    <td className="py-3 text-center border-0 text-dark fw-semibold" style={{ fontSize: "14px" }}>{root.displayOrder}</td>
                    <td className="py-3 text-center border-0">
                      <div className="form-check form-switch d-flex justify-content-center mb-0">
                        <input 
                          className="form-check-input shadow-none cursor-pointer" 
                          type="checkbox" 
                          role="switch" 
                          checked={root.isActive}
                          onChange={(e) => onToggleStatus(root.id, e.target.checked)}
                        />
                      </div>
                    </td>
                    <td className="py-3 text-center text-muted border-0" style={{ fontSize: "13px" }}>{formatDate(root.updatedAt || root.createdAt)}</td>
                    <td className="py-3 text-center border-0">
                      <div className="d-flex justify-content-center gap-2">
                        <button className="btn btn-sm text-secondary p-1" title="Sửa" onClick={() => onEdit(root)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="btn btn-sm text-danger p-1" title="Xóa" onClick={() => onDelete(root)}>
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Cấp 2 */}
                  {hasChildren && isExpanded && children.map((child, index) => {
                    const isChildSelected = selectedIds.includes(child.id);
                    const isLastChild = index === children.length - 1;
                    return (
                      <tr key={child.id} className="border-bottom" style={{ backgroundColor: "#fafbfc", borderColor: "#edf2f9" }}>
                        <td className="py-3 px-4 border-0">
                          <div className="form-check custom-checkbox mb-0">
                            <input 
                              className="form-check-input shadow-none" 
                              type="checkbox" 
                              checked={isChildSelected}
                              onChange={(e) => onSelectRow(child.id, e.target.checked)}
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        </td>
                        <td className="py-3 border-0 position-relative">
                          {/* Tree connecting lines */}
                          <div className="position-absolute" style={{ 
                              left: "24px", 
                              top: 0, 
                              bottom: isLastChild ? "50%" : 0, 
                              width: "1px", 
                              backgroundColor: "#dee2e6" 
                            }}></div>
                          <div className="position-absolute" style={{ 
                              left: "24px", 
                              top: "50%", 
                              width: "20px", 
                              height: "1px", 
                              backgroundColor: "#dee2e6" 
                            }}></div>
                          
                          <div className="d-flex align-items-center gap-2 ps-5">
                            <span className="fw-medium text-dark" style={{ fontSize: "14px" }}>{child.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-muted border-0" style={{ fontSize: "14px" }}>{child.path}</td>
                        <td className="py-3 text-center border-0 text-dark" style={{ fontSize: "14px" }}>{root.displayOrder}.{child.displayOrder}</td>
                        <td className="py-3 text-center border-0">
                          <div className="form-check form-switch d-flex justify-content-center mb-0">
                            <input 
                              className="form-check-input shadow-none cursor-pointer" 
                              type="checkbox" 
                              role="switch" 
                              checked={child.isActive}
                              onChange={(e) => onToggleStatus(child.id, e.target.checked)}
                            />
                          </div>
                        </td>
                        <td className="py-3 text-center text-muted border-0" style={{ fontSize: "13px" }}>{formatDate(child.updatedAt || child.createdAt)}</td>
                        <td className="py-3 text-center border-0">
                          <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-sm text-secondary p-1" title="Sửa" onClick={() => onEdit(child)}>
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button className="btn btn-sm text-danger p-1" title="Xóa" onClick={() => onDelete(child)}>
                              <i className="fa-regular fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MenuTreeTable;
