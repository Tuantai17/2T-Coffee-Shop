import { Link } from "react-router-dom";

function DashboardHeading() {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 className="fw-bold mb-1" style={{ color: "var(--admin-text)" }}>Tổng quan hệ thống</h3>
        <p className="mb-0 text-muted">Theo dõi hoạt động kinh doanh và tình trạng cửa hàng hôm nay.</p>
      </div>
      <div className="d-flex gap-3">
        <button className="neu-pill text-decoration-none">
          <i className="fa-solid fa-download"></i>
          Xuất báo cáo
        </button>
        <Link to="/admin/products" className="neu-pill text-decoration-none" style={{ backgroundColor: "var(--admin-primary)", color: "#fff" }}>
          <i className="fa-solid fa-plus"></i>
          Thêm sản phẩm
        </Link>
      </div>
    </div>
  );
}

export default DashboardHeading;
