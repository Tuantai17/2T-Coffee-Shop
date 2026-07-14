import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { getOrdersByUser } from "../../services/orderService";
import { getUserProfile } from "../../services/authService";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import ProfileSidebar from "./components/profile/ProfileSidebar";
import OrderDetailModal from "./components/OrderDetailModal";

function statusBadgeClass(status) {
  switch (status) {
    case "COMPLETED":
      return { bg: "bg-success-subtle", text: "text-success", icon: "fa-circle-check" };
    case "DELIVERING":
    case "SHIPPING":
      return { bg: "bg-primary-subtle", text: "text-primary", icon: "fa-truck-fast" };
    case "READY_FOR_DELIVERY":
      return { bg: "bg-warning-subtle", text: "text-warning", icon: "fa-truck-ramp-box" };
    case "CANCELLED":
      return { bg: "bg-secondary", text: "text-dark", icon: "fa-circle-xmark" };
    case "PREPARING":
    case "PACKING":
      return { bg: "bg-info-subtle", text: "text-info", icon: "fa-box-open" };
    case "CONFIRMED":
      return { bg: "bg-success-subtle", text: "text-success", icon: "fa-check" };
    case "PENDING_CONFIRMATION":
    case "PENDING":
      return { bg: "bg-primary-subtle", text: "text-primary", icon: "fa-hourglass-half" };
    default:
      return { bg: "bg-warning-subtle", text: "text-warning", icon: "fa-clock" };
  }
}

function statusText(status) {
  switch (status) {
    case "COMPLETED": return "Hoàn thành";
    case "DELIVERING":
    case "SHIPPING": return "Đang giao hàng";
    case "READY_FOR_DELIVERY": return "Chờ giao hàng";
    case "CANCELLED": return "Đã hủy";
    case "PREPARING":
    case "PACKING": return "Đang chuẩn bị";
    case "CONFIRMED": return "Đã xác nhận";
    case "PENDING_CONFIRMATION":
    case "PENDING": return "Chờ duyệt";
    default: return status;
  }
}

const TABS = [
  { id: "ALL", label: "Tất cả", icon: "fa-border-all" },
  { id: "PENDING_CONFIRMATION", label: "Chờ duyệt", icon: "fa-hourglass-half" },
  { id: "CONFIRMED", label: "Đã xác nhận", icon: "fa-check" },
  { id: "PREPARING", label: "Đang chuẩn bị", icon: "fa-box-open" },
  { id: "READY_FOR_DELIVERY", label: "Chờ giao hàng", icon: "fa-truck-ramp-box" },
  { id: "DELIVERING", label: "Đang giao hàng", icon: "fa-truck-fast" },
  { id: "COMPLETED", label: "Hoàn thành", icon: "fa-circle-check" },
  { id: "CANCELLED", label: "Đã hủy", icon: "fa-circle-xmark" },
];

function OrderHistoryPage() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const location = useLocation();

  // Filters
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchCode, setSearchCode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { userId } = getAuthSession(AUTH_SCOPES.USER);

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const [profileRes, orderRes] = await Promise.all([
        getUserProfile(userId),
        getOrdersByUser(userId)
      ]);
      setProfile(profileRes.data);
      // Sort newest first
      const sortedOrders = Array.isArray(orderRes.data) 
        ? orderRes.data.sort((a, b) => b.id - a.id)
        : [];
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (location.state?.openOrder && orders.length > 0) {
      const orderToOpen = orders.find(o => String(o.id) === String(location.state.openOrder));
      if (orderToOpen) {
        setSelectedOrder(orderToOpen);
        // Clear the state so it doesn't reopen if the user refreshes
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state?.openOrder, orders]);

  const handleResetFilters = () => {
    setSearchCode("");
    setFromDate("");
    setToDate("");
    setActiveTab("ALL");
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab !== "ALL" && order.status !== activeTab) return false;
    
    const formattedCode = `MKD${String(order.id).padStart(8, "0")}`;
    if (searchCode && !formattedCode.toLowerCase().includes(searchCode.toLowerCase())) return false;
    
    if (fromDate || toDate) {
      const orderDate = new Date(order.orderedDate || Date.now());
      if (fromDate) {
        const from = new Date(fromDate);
        if (orderDate < from) return false;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (orderDate > to) return false;
      }
    }
    
    return true;
  });

  return (
    <UserLayout>
      <div style={{ backgroundColor: "#FAF8F4", minHeight: "100vh", padding: "30px 0" }}>
        <div className="container" style={{ maxWidth: "1300px" }}>
          {loading && !profile ? (
            <div className="card shadow-sm border-0 rounded-4 py-5 text-center bg-white">
            <div className="spinner-border text-danger mx-auto mb-3" role="status"></div>
            <div className="text-muted">Đang tải lịch sử mua hàng...</div>
          </div>
        ) : !profile ? (
          <div className="alert alert-warning rounded-4">Không tìm thấy thông tin tài khoản.</div>
        ) : (
          <div className="row g-4">
            {/* Sidebar */}
            <div className="col-lg-3">
              <ProfileSidebar profile={profile} />
            </div>

            {/* Main Content */}
            <div className="col-lg-9">
              {/* Áp dụng zoom 75% cho khu vực nội dung bên phải theo yêu cầu để gọn gàng hơn */}
              <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white" style={{ zoom: "75%" }}>
                <h4 className="fw-bold mb-1">Đơn hàng của tôi</h4>
                <p className="text-muted mb-4 small">Theo dõi toàn bộ đơn hàng đã mua và đang xử lý của bạn.</p>

                {/* Tabs */}
                <div className="d-flex flex-wrap gap-2 mb-4 pb-3 border-bottom overflow-auto">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`btn btn-sm rounded-pill px-3 py-2 fw-medium d-flex align-items-center gap-2 border ${
                        activeTab === tab.id 
                          ? "btn-danger text-danger bg-danger-subtle border-danger" 
                          : "btn-light text-muted border-light hover-shadow"
                      }`}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                    </button>
                  ))}
                </div>

                {/* Filters */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1">Tìm kiếm theo mã đơn hàng</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Tìm kiếm theo mã đơn hàng..." 
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small text-muted mb-1">Từ ngày</label>
                    <input 
                      type="date" 
                      className="form-control text-muted" 
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small text-muted mb-1">Đến ngày</label>
                    <input 
                      type="date" 
                      className="form-control text-muted" 
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button className="btn btn-outline-secondary w-100" onClick={handleResetFilters}>
                      Đặt lại
                    </button>
                  </div>
                </div>

                {/* Orders Table */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border">
                    <div className="text-muted mb-2"><i className="fa-solid fa-box-open fs-1"></i></div>
                    <p className="mb-0">Không tìm thấy đơn hàng nào phù hợp.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle text-nowrap table-hover" style={{ fontSize: "0.95rem" }}>
                      <thead>
                        <tr className="text-muted small">
                          <th className="fw-medium border-0 pb-3" style={{ minWidth: "120px" }}>Mã đơn hàng</th>
                          <th className="fw-medium border-0 pb-3" style={{ minWidth: "100px" }}>Ngày đặt</th>
                          <th className="fw-medium border-0 pb-3" style={{ minWidth: "250px" }}>Sản phẩm</th>
                          <th className="fw-medium border-0 pb-3" style={{ minWidth: "120px" }}>Tổng tiền</th>
                          <th className="fw-medium border-0 pb-3" style={{ minWidth: "180px" }}>Phương thức thanh toán</th>
                          <th className="fw-medium border-0 pb-3 text-center" style={{ minWidth: "120px" }}>Trạng thái</th>
                          <th className="fw-medium border-0 pb-3 text-center" style={{ minWidth: "100px" }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="border-top-0">
                        {filteredOrders.map(order => {
                          const formattedCode = `MKD${String(order.id).padStart(8, "0")}`;
                          const orderDateObj = new Date(order.orderedDate || Date.now());
                          const orderDate = orderDateObj.toLocaleDateString("vi-VN");
                          let orderTime = "-";
                          if (Array.isArray(order.orderedDate) && order.orderedDate.length > 3) {
                             // Assuming [y,m,d,h,m,s]
                             orderTime = `${String(order.orderedDate[3]).padStart(2, '0')}:${String(order.orderedDate[4]).padStart(2, '0')}`;
                          } else if (!Array.isArray(order.orderedDate) && String(order.orderedDate).includes("T")) {
                             orderTime = orderDateObj.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
                          }
                          const mainItem = order.items?.[0];
                          const extraCount = Math.max(0, (order.items?.length || 0) - 1);
                          const st = statusBadgeClass(order.status);
                          
                          return (
                            <tr key={order.id} className="border-bottom">
                              <td className="py-3">
                                <div className="fw-bold text-dark">{formattedCode}</div>
                                <button 
                                  className="btn btn-link p-0 text-primary small text-decoration-none"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  Xem chi tiết
                                </button>
                              </td>
                              <td className="py-3 text-dark">{orderDate}{orderTime !== "-" && <><br/><span className="text-muted small">{orderTime}</span></>}</td>
                              <td className="py-3">
                                <div className="d-flex align-items-center gap-2">
                                  {mainItem?.product?.imageUrl ? (
                                    <img 
                                      src={mainItem.product.imageUrl} 
                                      alt="Product" 
                                      className="rounded border" 
                                      style={{ width: "40px", height: "40px", objectFit: "cover" }} 
                                    />
                                  ) : (
                                    <div className="bg-light rounded border d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                      <i className="fa-solid fa-image text-muted"></i>
                                    </div>
                                  )}
                                  <div style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                                    <div className="fw-medium text-dark text-truncate" style={{ fontSize: "0.9rem" }}>
                                      {mainItem?.product?.productName || "Sản phẩm đồ chơi"}
                                    </div>
                                    <div className="small text-muted">
                                      Số lượng: {mainItem?.quantity || 1}
                                      {extraCount > 0 && <span> và {extraCount} sản phẩm khác</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 fw-bold text-danger">
                                {(order.total || 0).toLocaleString("vi-VN")} đ
                              </td>
                              <td className="py-3 text-dark">
                                {order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : (order.paymentMethod || "COD")}
                              </td>
                              <td className="py-3 text-center">
                                <div className={`badge rounded-pill px-3 py-2 ${st.bg} ${st.text} d-inline-flex align-items-center gap-1 border border-light`}>
                                  <i className={`fa-solid ${st.icon} small`}></i>
                                  {statusText(order.status)}
                                </div>
                              </td>
                              <td className="py-3 text-center">
                                <button 
                                  className="btn btn-outline-secondary rounded-pill btn-sm px-3 fw-medium"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  Xem chi tiết
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} profile={profile} onClose={() => setSelectedOrder(null)} />
      )}
    </UserLayout>
  );
}

export default OrderHistoryPage;
