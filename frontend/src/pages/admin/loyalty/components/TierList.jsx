import React, { useState } from 'react';
import toast from 'react-hot-toast';

function TierList({ tiers, loading, onEdit, onDelete, onUpdateOrder }) {
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to be generated before styling the original row
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    // Call the parent handler to reorder items in state immediately for visual feedback
    onUpdateOrder(draggedItemIndex, index);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItemIndex(null);
    // Optionally trigger an API save here if we want to save on every drop
    // We can also let the parent component handle a "Save Order" button
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  return (
    <div className="card border-0 rounded-4 bg-white shadow-sm overflow-hidden mb-4">
      <div className="table-responsive">
        <table className="table align-middle mb-0 text-nowrap">
          <thead className="bg-light">
            <tr>
              <th className="border-0 text-muted fw-bold py-3 ps-4" style={{ fontSize: "11px", width: "40px" }}></th>
              <th className="border-0 text-muted fw-bold py-3" style={{ fontSize: "11px" }}>Hạng</th>
              <th className="border-0 text-muted fw-bold py-3 text-center" style={{ fontSize: "11px" }}>Trạng thái</th>
              <th className="border-0 text-muted fw-bold py-3 text-center" style={{ fontSize: "11px" }}>Điều kiện chi tiêu</th>
              <th className="border-0 text-muted fw-bold py-3 text-center" style={{ fontSize: "11px" }}>Màu sắc</th>
              <th className="border-0 text-muted fw-bold py-3" style={{ fontSize: "11px" }}>Quyền lợi chính</th>
              <th className="border-0 text-muted fw-bold py-3 text-center" style={{ fontSize: "11px" }}>Số thành viên</th>
              <th className="border-0 text-muted fw-bold py-3 text-center pe-4" style={{ fontSize: "11px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-5 text-muted">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : tiers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-5 text-muted">
                  <i className="fa-solid fa-box-open mb-2 fs-4"></i>
                  <p className="mb-0">Không có dữ liệu hạng thành viên.</p>
                </td>
              </tr>
            ) : (
              tiers.map((tier, index) => (
                <tr 
                  key={tier.id || tier.code} 
                  className={`border-bottom ${!tier.active ? 'opacity-75 bg-light' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  style={{ cursor: 'grab' }}
                >
                  <td className="ps-4 text-muted text-center" style={{ cursor: 'grab' }}>
                    <i className="fa-solid fa-grip-vertical"></i>
                  </td>
                  <td className="py-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle d-flex align-items-center justify-content-center border" style={{ width: "32px", height: "32px", backgroundColor: `${tier.color || '#ccc'}15`, borderColor: `${tier.color || '#ccc'}40` }}>
                        <i className={`fa-solid ${tier.icon || 'fa-star'}`} style={{ color: tier.color || '#ccc' }}></i>
                      </div>
                      <div>
                        <div className="fw-bold" style={{ color: tier.color || '#333', fontSize: "13px" }}>{tier.name}</div>
                        <div className="text-muted" style={{ fontSize: "10px" }}>{tier.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    {tier.active ? (
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill fw-medium">Đang bật</span>
                    ) : (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill fw-medium">Đã tắt</span>
                    )}
                  </td>
                  <td className="text-center fw-medium text-dark" style={{ fontSize: "12px" }}>
                    {tier.min ? `${tier.min.toLocaleString()} VNĐ` : '0 VNĐ'}
                    {tier.minCompletedOrders > 0 && <div className="text-muted" style={{ fontSize: "10px" }}>và {tier.minCompletedOrders} đơn</div>}
                  </td>
                  <td className="text-center">
                    <div className="d-inline-flex align-items-center gap-2 bg-light rounded px-2 py-1 border">
                      <div className="rounded-circle shadow-sm" style={{ width: "12px", height: "12px", backgroundColor: tier.color || '#ccc' }}></div>
                      <span className="text-muted" style={{ fontSize: "10px" }}>{(tier.color || '#ccc').toUpperCase()}</span>
                    </div>
                  </td>
                  <td>
                    <ul className="list-unstyled mb-0 text-muted" style={{ fontSize: "11px" }}>
                      {tier.benefits && tier.benefits.map((b, i) => (
                        <li key={i} className="mb-1"><i className="fa-solid fa-circle me-2" style={{ fontSize: "4px" }}></i>{b}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="text-center fw-bold text-dark" style={{ fontSize: "14px" }}>
                    {tier.members || 0}
                  </td>
                  <td className="text-center pe-4">
                    <button 
                      className="btn btn-sm btn-light rounded-circle text-primary me-1 action-btn shadow-sm border" 
                      title="Chỉnh sửa"
                      onClick={() => onEdit(tier)}
                    >
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-light rounded-circle text-danger action-btn shadow-sm border" 
                      title="Xóa"
                      onClick={() => onDelete(tier)}
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
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

export default TierList;
