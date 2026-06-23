import { Link } from "react-router-dom";

function RecentOrders({ orders, loading }) {
  const moneyFormatter = new Intl.NumberFormat("vi-VN");

  const getStatusColor = (status) => {
    switch (String(status).toUpperCase()) {
      case "PENDING_CONFIRMATION":
      case "PENDING":
        return { bg: "var(--admin-warning)", text: "#856404" };
      case "PROCESSING":
        return { bg: "#e0cffc", text: "#6f42c1" };
      case "SHIPPING":
        return { bg: "#cff4fc", text: "#055160" };
      case "COMPLETED":
        return { bg: "var(--admin-success)", text: "#fff" };
      case "CANCELLED":
        return { bg: "var(--admin-danger)", text: "#fff" };
      default:
        return { bg: "var(--admin-primary)", text: "#fff" };
    }
  };

  const getStatusText = (status) => {
    switch (String(status).toUpperCase()) {
      case "PENDING_CONFIRMATION":
      case "PENDING":
        return "Chờ xác nhận";
      case "PROCESSING":
        return "Đang chuẩn bị";
      case "SHIPPING":
        return "Đang giao";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return "Đã xác nhận";
    }
  };

  const getAvatarColor = (index) => {
    const colors = ["#ffc107", "#0dcaf0", "#e83e8c", "#fd7e14", "#20c997"];
    return colors[index % colors.length];
  };

  // Show max 5 recent orders
  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <div className="neu-card p-4 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-1">Đơn hàng gần đây</h5>
          <small className="text-muted">Các đơn hàng mới nhất</small>
        </div>
        <div className="neu-circle" style={{ width: "32px", height: "32px" }}>
          <i className="fa-solid fa-ellipsis-vertical text-muted"></i>
        </div>
      </div>

      <div className="flex-grow-1">
        {loading ? (
          [1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div className="d-flex gap-3">
                <div className="placeholder-glow">
                  <span className="placeholder rounded-circle" style={{ width: "45px", height: "45px" }}></span>
                </div>
                <div className="placeholder-glow">
                  <span className="placeholder col-8 mb-1 rounded"></span>
                  <span className="placeholder col-6 rounded"></span>
                </div>
              </div>
            </div>
          ))
        ) : recentOrders.length > 0 ? (
          recentOrders.map((order, idx) => {
            const statusConfig = getStatusColor(order.status);
            return (
              <div key={order.id || idx} className="d-flex justify-content-between align-items-center mb-3 pb-3" style={{ borderBottom: "1px dashed rgba(0,0,0,0.05)" }}>
                <div className="d-flex gap-3 align-items-center">
                  <div 
                    className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold shadow-sm"
                    style={{ width: "45px", height: "45px", backgroundColor: getAvatarColor(idx) }}
                  >
                    <i className="fa-solid fa-box-open"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark mb-1">#{order.id?.substring(0, 10).toUpperCase() || `MKD-000${245 - idx}`}</div>
                    <div className="small text-muted">{order.customerName || "Khách hàng"} • Hôm nay</div>
                  </div>
                </div>
                <div className="text-end d-flex flex-column align-items-end gap-1">
                  <div className="fw-bold text-dark">{moneyFormatter.format(order.total || 0)}đ</div>
                  <span 
                    className="badge rounded-pill" 
                    style={{ 
                      backgroundColor: statusConfig.bg, 
                      color: statusConfig.text,
                      padding: "5px 10px",
                      fontWeight: "600",
                      fontSize: "0.75rem"
                    }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="text-muted ms-2">
                  <i className="fa-solid fa-chevron-right small"></i>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="fa-solid fa-inbox fs-1 mb-3"></i>
            <p>Chưa có đơn hàng nào.</p>
          </div>
        )}
      </div>

      <div className="mt-auto text-center pt-2">
        <Link to="/admin/orders" className="text-decoration-none fw-bold" style={{ color: "var(--admin-primary)" }}>
          Xem tất cả đơn hàng &rarr;
        </Link>
      </div>
    </div>
  );
}

export default RecentOrders;
