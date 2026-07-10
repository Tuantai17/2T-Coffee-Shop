import React from "react";

function LoyaltyMemberFilters({
  searchTerm,
  setSearchTerm,
  tierFilter,
  setTierFilter,
  statusFilter,
  setStatusFilter,
  sortOption,
  setSortOption,
}) {
  return (
    <div className="card border-0 rounded-4 p-3 mb-4 bg-white shadow-sm d-flex flex-row align-items-center flex-wrap gap-3">
      <div className="input-group input-group-sm flex-grow-1" style={{ minWidth: "200px", maxWidth: "300px" }}>
        <span className="input-group-text bg-light border-0 rounded-start-pill ps-3">
          <i className="fa-solid fa-magnifying-glass text-muted"></i>
        </span>
        <input
          type="text"
          className="form-control bg-light border-0 rounded-end-pill shadow-none"
          placeholder="Tìm kiếm tên, SĐT, Email..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="d-flex align-items-center gap-2 border-start ps-3">
        <span className="text-muted text-nowrap" style={{ fontSize: "11px" }}>
          Hạng:
        </span>
        <select
          className="form-select form-select-sm bg-light border-0 rounded-pill shadow-none text-dark fw-medium"
          style={{ width: "120px" }}
          value={tierFilter}
          onChange={(event) => setTierFilter(event.target.value)}
        >
          <option value="Tat ca">Tất cả</option>
          <option value="Silver">Silver</option>
          <option value="Gold">Gold</option>
          <option value="Platinum">Platinum</option>
          <option value="Diamond">Diamond</option>
        </select>
      </div>

      <div className="d-flex align-items-center gap-2 border-start ps-3">
        <span className="text-muted text-nowrap" style={{ fontSize: "11px" }}>
          Trạng thái:
        </span>
        <select
          className="form-select form-select-sm bg-light border-0 rounded-pill shadow-none text-dark fw-medium"
          style={{ width: "120px" }}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="Tat ca">Tất cả</option>
          <option value="Hoat dong">Hoạt động</option>
          <option value="Tam khoa">Bị khóa</option>
        </select>
      </div>

      <div className="d-flex align-items-center gap-2 border-start ps-3 ms-auto">
        <span className="text-muted text-nowrap" style={{ fontSize: "11px" }}>
          Sắp xếp:
        </span>
        <select
          className="form-select form-select-sm bg-light border-0 rounded-pill shadow-none text-dark fw-medium"
          style={{ width: "180px" }}
          value={sortOption}
          onChange={(event) => setSortOption(event.target.value)}
        >
          <option value="default">Mặc định</option>
          <option value="points_desc">Điểm cao → thấp</option>
          <option value="points_asc">Điểm thấp → cao</option>
          <option value="join_desc">Tham gia mới nhất</option>
          <option value="join_asc">Tham gia cũ nhất</option>
          <option value="tier_desc">Hạng cao → thấp</option>
          <option value="tier_asc">Hạng thấp → cao</option>
        </select>
      </div>
    </div>
  );
}

export default LoyaltyMemberFilters;
