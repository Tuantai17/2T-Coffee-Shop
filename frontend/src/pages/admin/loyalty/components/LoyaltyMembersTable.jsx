import React, { useMemo } from "react";

function LoyaltyMembersTable({
  members,
  loading,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  sortOption,
  setSortOption,
  onOpenDetail,
  onOpenPointModal,
}) {
  const getTierBadge = (tier) => {
    if (!tier) return null;
    switch (tier.toLowerCase()) {
      case "silver":
        return (
          <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-2 py-1">
            <i className="fa-solid fa-medal me-1"></i> Silver
          </span>
        );
      case "gold":
        return (
          <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-2 py-1">
            <i className="fa-solid fa-award me-1"></i> Gold
          </span>
        );
      case "platinum":
        return (
          <span
            className="badge border rounded-pill px-2 py-1"
            style={{ backgroundColor: "#f9f6fd", color: "#9b59b6", borderColor: "#9b59b640" }}
          >
            <i className="fa-solid fa-gem me-1"></i> Platinum
          </span>
        );
      case "diamond":
        return (
          <span
            className="badge border rounded-pill px-2 py-1"
            style={{ backgroundColor: "#f5fafd", color: "#3498db", borderColor: "#3498db40" }}
          >
            <i className="fa-solid fa-diamond me-1"></i> Diamond
          </span>
        );
      default:
        return <span className="badge bg-light text-dark border rounded-pill px-2 py-1">{tier}</span>;
    }
  };

  const toggleSortPoints = () => {
    if (sortOption === "points_desc") {
      setSortOption("points_asc");
    } else {
      setSortOption("points_desc");
    }
  };

  const totalItems = members.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMembers = members.slice(startIndex, startIndex + pageSize);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="card border-0 rounded-4 bg-white shadow-sm overflow-hidden mb-4">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 text-nowrap">
          <thead className="bg-light">
            <tr>
              <th className="border-0 text-muted fw-bold py-3 ps-4" style={{ fontSize: "11px" }}>
                Thành viên
              </th>
              <th className="border-0 text-muted fw-bold py-3" style={{ fontSize: "11px" }}>
                Hạng
              </th>
              <th
                className="border-0 text-muted fw-bold py-3 text-end cursor-pointer"
                style={{ fontSize: "11px", cursor: "pointer" }}
                onClick={toggleSortPoints}
                title="Bấm để sắp xếp theo điểm"
              >
                Điểm hiện tại{" "}
                {sortOption === "points_desc" ? (
                  <i className="fa-solid fa-sort-down ms-1 text-primary"></i>
                ) : sortOption === "points_asc" ? (
                  <i className="fa-solid fa-sort-up ms-1 text-primary"></i>
                ) : (
                  <i className="fa-solid fa-sort ms-1"></i>
                )}
              </th>
              <th className="border-0 text-muted fw-bold py-3 ps-4" style={{ fontSize: "11px" }}>
                Điện thoại
              </th>
              <th className="border-0 text-muted fw-bold py-3" style={{ fontSize: "11px" }}>
                Ngày tham gia
              </th>
              <th className="border-0 text-muted fw-bold py-3" style={{ fontSize: "11px" }}>
                Trạng thái
              </th>
              <th className="border-0 text-muted fw-bold py-3 text-center pe-4" style={{ fontSize: "11px" }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-5 text-muted">
                  <div className="spinner-border spinner-border-sm text-danger me-2" role="status"></div>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : paginatedMembers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-5 text-muted">
                  <i className="fa-solid fa-box-open mb-3 fs-3 text-light-muted"></i>
                  <p className="mb-0">Không có thành viên phù hợp bộ lọc hiện tại.</p>
                </td>
              </tr>
            ) : (
              paginatedMembers.map((user) => (
                <tr key={user.id}>
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={user.avatar || "https://api.dicebear.com/9.x/initials/svg?seed=" + user.name}
                        alt="avatar"
                        className="rounded-circle object-fit-cover shadow-sm"
                        style={{ width: "36px", height: "36px" }}
                      />
                      <div>
                        <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                          {user.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: "11px" }}>
                          {user.email || "Chưa có email"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{getTierBadge(user.tier)}</td>
                  <td className="text-end fw-black text-dark" style={{ fontSize: "13px" }}>
                    {user.points?.toLocaleString("vi-VN") || 0}
                  </td>
                  <td className="ps-4 text-muted fw-medium" style={{ fontSize: "12px" }}>
                    {user.phone || "-"}
                  </td>
                  <td className="text-muted" style={{ fontSize: "12px" }}>
                    {user.date || "-"}
                  </td>
                  <td>
                    {user.status === "Hoat dong" || user.status === "Hoạt động" ? (
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill fw-medium">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill fw-medium">
                        Bị khóa
                      </span>
                    )}
                  </td>
                  <td className="text-center pe-4">
                    <button
                      className="btn btn-sm btn-light rounded-circle text-primary me-2 action-btn border"
                      title="Xem chi tiết"
                      onClick={() => onOpenDetail(user)}
                    >
                      <i className="fa-regular fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-light rounded-circle text-success action-btn border"
                      title="Cộng / Trừ điểm"
                      onClick={() => onOpenPointModal(user)}
                    >
                      <i className="fa-solid fa-plus-minus"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalItems > 0 && (
        <div className="card-footer bg-white border-top-0 py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small">
              Hiển thị {Math.min(startIndex + 1, totalItems)}-{Math.min(startIndex + pageSize, totalItems)} trong tổng {totalItems} thành viên
            </span>
            <select
              className="form-select form-select-sm shadow-none"
              style={{ width: "80px" }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <nav aria-label="Page navigation">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link shadow-none" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                  <i className="fa-solid fa-angle-left"></i>
                </button>
              </li>
              {getPageNumbers().map(pageNum => (
                <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                  <button className="page-link shadow-none" onClick={() => setCurrentPage(pageNum)}>
                    {pageNum}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link shadow-none" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                  <i className="fa-solid fa-angle-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

export default LoyaltyMembersTable;
