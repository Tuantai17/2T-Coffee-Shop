import React, { useMemo } from 'react';

function TierStats({ tiers }) {
  const stats = useMemo(() => {
    if (!tiers || tiers.length === 0) {
      return {
        total: 0,
        activeMembers: 0,
        largestTier: 'N/A',
        smallestTier: 'N/A'
      };
    }

    const total = tiers.length;
    let activeMembers = 0;
    let largest = tiers[0];
    let smallest = tiers[0];

    tiers.forEach(tier => {
      const members = tier.members || 0;
      activeMembers += members;

      if (members > (largest.members || 0)) {
        largest = tier;
      }
      if (members < (smallest.members || 0)) {
        smallest = tier;
      }
    });

    return {
      total,
      activeMembers,
      largestTier: largest.members > 0 ? largest.name : 'Chưa có',
      smallestTier: smallest.members > 0 || tiers.length > 0 ? smallest.name : 'Chưa có'
    };
  }, [tiers]);

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-3">
        <div className="card border-0 rounded-4 bg-white shadow-sm p-3 d-flex flex-row align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: "48px", height: "48px" }}>
            <i className="fa-solid fa-layer-group fs-5"></i>
          </div>
          <div>
            <div className="text-muted small fw-medium">Tổng số hạng</div>
            <div className="fw-black fs-5 text-dark">{stats.total}</div>
          </div>
        </div>
      </div>
      
      <div className="col-12 col-md-3">
        <div className="card border-0 rounded-4 bg-white shadow-sm p-3 d-flex flex-row align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success" style={{ width: "48px", height: "48px" }}>
            <i className="fa-solid fa-users fs-5"></i>
          </div>
          <div>
            <div className="text-muted small fw-medium">Tổng thành viên</div>
            <div className="fw-black fs-5 text-dark">{stats.activeMembers.toLocaleString('vi-VN')}</div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-3">
        <div className="card border-0 rounded-4 bg-white shadow-sm p-3 d-flex flex-row align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning" style={{ width: "48px", height: "48px" }}>
            <i className="fa-solid fa-arrow-trend-up fs-5"></i>
          </div>
          <div>
            <div className="text-muted small fw-medium">Đông thành viên nhất</div>
            <div className="fw-black fs-5 text-dark text-truncate" style={{ maxWidth: '120px' }}>{stats.largestTier}</div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-3">
        <div className="card border-0 rounded-4 bg-white shadow-sm p-3 d-flex flex-row align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center bg-secondary bg-opacity-10 text-secondary" style={{ width: "48px", height: "48px" }}>
            <i className="fa-solid fa-arrow-trend-down fs-5"></i>
          </div>
          <div>
            <div className="text-muted small fw-medium">Ít thành viên nhất</div>
            <div className="fw-black fs-5 text-dark text-truncate" style={{ maxWidth: '120px' }}>{stats.smallestTier}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TierStats;
