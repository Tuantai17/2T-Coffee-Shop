import React from "react";

function MenuSummaryCards({ menus }) {
  const totalMenus = menus.length;
  const level1Menus = menus.filter(m => !m.parentId).length;
  const level2Menus = menus.filter(m => m.parentId).length;
  const activeMenus = menus.filter(m => m.isActive).length;

  return (
    <div className="row g-4 mb-4">
      <div className="col-12 col-md-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 d-flex flex-row align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px", backgroundColor: "rgba(13, 110, 253, 0.1)", color: "#0d6efd" }}>
            <i className="fa-solid fa-list-ul fs-4"></i>
          </div>
          <div>
            <p className="mb-0 text-muted fw-semibold">Tổng menu</p>
            <h4 className="mb-0 fw-bold">{totalMenus} <span className="fs-6 text-muted fw-normal">menu</span></h4>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 d-flex flex-row align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px", backgroundColor: "rgba(25, 135, 84, 0.1)", color: "#198754" }}>
            <i className="fa-solid fa-layer-group fs-4"></i>
          </div>
          <div>
            <p className="mb-0 text-muted fw-semibold">Menu cấp 1</p>
            <h4 className="mb-0 fw-bold">{level1Menus} <span className="fs-6 text-muted fw-normal">menu</span></h4>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 d-flex flex-row align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px", backgroundColor: "rgba(253, 126, 20, 0.1)", color: "#fd7e14" }}>
            <i className="fa-solid fa-diagram-project fs-4"></i>
          </div>
          <div>
            <p className="mb-0 text-muted fw-semibold">Menu cấp 2</p>
            <h4 className="mb-0 fw-bold">{level2Menus} <span className="fs-6 text-muted fw-normal">menu</span></h4>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 d-flex flex-row align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px", backgroundColor: "rgba(111, 66, 193, 0.1)", color: "#6f42c1" }}>
            <i className="fa-regular fa-eye fs-4"></i>
          </div>
          <div>
            <p className="mb-0 text-muted fw-semibold">Đang hiển thị</p>
            <h4 className="mb-0 fw-bold">{activeMenus} <span className="fs-6 text-muted fw-normal">menu</span></h4>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuSummaryCards;
