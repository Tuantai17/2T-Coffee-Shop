import React, { useState } from 'react';

const RuleList = ({ rules, onEdit, onDelete, onToggleStatus }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredRules = rules.filter(rule => {
    const matchSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "ALL" || rule.type === typeFilter;
    const matchStatus = statusFilter === "ALL" || 
      (statusFilter === "ACTIVE" && rule.status) || 
      (statusFilter === "INACTIVE" && !rule.status);
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
  const paginatedRules = filteredRules.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const formatCondition = (rule) => {
    try {
      const data = JSON.parse(rule.condition);
      if (rule.source === 'ORDER') {
        let text = `${data.ratioVnd || 1000} VNĐ = 1 điểm.`;
        if (data.excludeShipping) text += " Không tính phí ship.";
        if (data.excludeDiscount) text += " Không tính giảm giá.";
        return text;
      }
      if (rule.source === 'CHECKIN') {
        let text = `${data.pointsPerDay || rule.point} điểm/ngày.`;
        if (data.streak3) text += ` Chuỗi 3 ngày: +${data.streak3}.`;
        if (data.streak7) text += ` Chuỗi 7 ngày: +${data.streak7}.`;
        return text;
      }
      if (rule.source === 'TIER') {
        return `Tùy chỉnh theo hạng. Silver: ${data.Silver || 0}, Gold: ${data.Gold || 0}...`;
      }
      return rule.condition;
    } catch (e) {
      return rule.condition; // Fallback for old simple strings
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'ORDER': return <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill" style={{fontSize:"10px"}}>Đơn hàng</span>;
      case 'CHECKIN': return <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill" style={{fontSize:"10px"}}>Điểm danh</span>;
      case 'MINIGAME': return <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill" style={{fontSize:"10px"}}>Mini game</span>;
      case 'VOUCHER': return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill" style={{fontSize:"10px"}}>Đổi Voucher</span>;
      case 'BIRTHDAY': return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill" style={{fontSize:"10px"}}>Sinh nhật</span>;
      case 'MANUAL': return <span className="badge bg-dark bg-opacity-10 text-dark border border-dark border-opacity-25 rounded-pill" style={{fontSize:"10px"}}>Thủ công</span>;
      default: return <span className="badge bg-light text-dark rounded-pill" style={{fontSize:"10px"}}>Khác</span>;
    }
  };

  return (
    <div className="card border-0 rounded-4 bg-white shadow-sm overflow-hidden mb-4">
      {/* Filters */}
      <div className="p-4 border-bottom bg-light bg-opacity-50">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="fa-solid fa-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                placeholder="Tìm kiếm quy tắc..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select" 
              value={typeFilter} 
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">Tất cả Loại</option>
              <option value="Tích điểm">Tích điểm</option>
              <option value="Trừ điểm">Trừ điểm</option>
            </select>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select" 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">Tất cả Trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm tắt</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table align-middle mb-0 text-nowrap table-hover">
          <thead className="bg-light">
            <tr>
              <th className="border-0 text-muted fw-bold py-3 ps-4" style={{ fontSize: "11px" }}>Tên quy tắc</th>
              <th className="border-0 text-muted fw-bold py-3 text-center" style={{ fontSize: "11px" }}>Loại / Nguồn</th>
              <th className="border-0 text-muted fw-bold py-3" style={{ fontSize: "11px" }}>Điều kiện áp dụng</th>
              <th className="border-0 text-muted fw-bold py-3 text-center" style={{ fontSize: "11px" }}>Điểm mặc định</th>
              <th className="border-0 text-muted fw-bold py-3 text-center" style={{ fontSize: "11px" }}>Trạng thái</th>
              <th className="border-0 text-muted fw-bold py-3 text-center pe-4" style={{ fontSize: "11px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRules.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  <i className="fa-solid fa-filter-circle-xmark mb-2 fs-4"></i>
                  <p className="mb-0">Không tìm thấy quy tắc nào phù hợp.</p>
                </td>
              </tr>
            ) : (
              paginatedRules.map((rule) => (
                <tr key={rule.id} className={!rule.status ? "opacity-50" : ""}>
                  <td className="ps-4 py-3 fw-bold text-dark" style={{ fontSize: "13px" }}>
                    {rule.name}
                    {rule.updatedAt && <div className="text-muted fw-normal" style={{fontSize: "10px"}}>Sửa: {new Date(rule.updatedAt).toLocaleDateString('vi-VN')}</div>}
                  </td>
                  <td className="text-center">
                    <div className="d-flex flex-column align-items-center gap-1">
                      <span className={`badge ${rule.type === 'Tích điểm' ? 'bg-success text-success bg-opacity-10 border border-success border-opacity-25' : 'bg-danger text-danger bg-opacity-10 border border-danger border-opacity-25'} rounded-pill`} style={{ fontSize: "10px" }}>
                        {rule.type}
                      </span>
                      {getSourceBadge(rule.source)}
                    </div>
                  </td>
                  <td className="text-muted" style={{ fontSize: "12px", whiteSpace: "normal", maxWidth: "250px" }}>
                    {formatCondition(rule)}
                  </td>
                  <td className="text-center fw-bold text-dark" style={{ fontSize: "13px" }}>{rule.point}</td>
                  <td className="text-center">
                    <span className={`badge ${rule.status ? 'bg-success' : 'bg-secondary'} rounded-pill fw-medium`} style={{ fontSize: "10px" }}>
                      {rule.status ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="text-center pe-4">
                    <div className="form-check form-switch d-inline-block me-3 align-middle" style={{ margin: 0 }}>
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        role="switch" 
                        checked={rule.status} 
                        onChange={() => onToggleStatus(rule)}
                        style={{ cursor: "pointer" }} 
                      />
                    </div>
                    <button onClick={() => onEdit(rule)} className="btn btn-sm btn-light rounded-circle text-primary me-1 action-btn" title="Chỉnh sửa">
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button onClick={() => onDelete(rule.id)} className="btn btn-sm btn-light rounded-circle text-danger action-btn" title="Xóa mềm">
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-light">
          <span className="text-muted small">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRules.length)} trong tổng số {filteredRules.length} quy tắc
          </span>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Trước</button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Sau</button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default RuleList;
