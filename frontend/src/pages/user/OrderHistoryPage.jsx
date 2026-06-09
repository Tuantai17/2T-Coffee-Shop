import { useEffect, useState } from "react";
import { getOrdersByUser } from "../../services/orderService";
import UserLayout from "../../layouts/UserLayout";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await getOrdersByUser(userId);
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <UserLayout>
      <div className="container mt-4">
        <h2 className="fw-bold mb-4">Lịch Sử Mua Hàng</h2>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="alert alert-info text-center py-4 rounded-4">
            Bạn chưa thực hiện bất kỳ đơn hàng nào!
          </div>
        ) : (
          <div className="row g-3">
            {orders.map((o) => (
              <div className="col-12" key={o.id}>
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <span className="text-muted">Mã đơn hàng:</span> <span className="fw-bold">#{o.id}</span>
                    </div>
                    <div>
                      <span className="text-muted">Ngày đặt:</span> <span className="fw-semibold">{new Date(o.orderedDate || Date.now()).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-md-8">
                      <p className="mb-1"><span className="fw-semibold">Khách hàng:</span> {o.user ? o.user.userName : 'Không rõ'}</p>
                      <p className="mb-0">
                        <span className="fw-semibold">Sản phẩm: </span>
                        {o.items && o.items.length > 0 ? (
                          o.items.map(item => `${item.product ? item.product.productName : 'Sản phẩm'} (x${item.quantity})`).join(", ")
                        ) : 'Không có sản phẩm'}
                      </p>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0 d-flex flex-column justify-content-between align-items-md-end">
                      <div>
                        <p className="mb-1"><span className="fw-semibold">Trạng thái:</span> <span className={`badge ${o.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'} px-3 py-2 fs-6`}>{o.status}</span></p>
                        <h4 className="text-primary fw-bold mb-0 mt-2">Tổng: {(o.total || 0).toLocaleString("vi-VN")} VNĐ</h4>
                      </div>
                      <button 
                        className="btn btn-outline-primary rounded-pill px-4 py-2 mt-3 fw-bold btn-sm"
                        onClick={() => setSelectedOrder(o)}
                      >
                        <i className="fa-solid fa-circle-info me-1"></i> Xem Chi Tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Chi Tiết Đơn Hàng */}
      {selectedOrder && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          zIndex: 1050,
          animation: 'fadeIn 0.25s ease-out'
        }} onClick={() => setSelectedOrder(null)}>
          <div className="modal-dialog-custom bg-white p-4 rounded-5 shadow-lg position-relative" style={{
            width: '90%',
            maxWidth: '650px',
            maxHeight: '85vh',
            overflowY: 'auto',
            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Nút đóng */}
            <button className="btn-close-custom btn btn-light rounded-circle position-absolute" style={{
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
            }} onClick={() => setSelectedOrder(null)}>
              <i className="fa-solid fa-xmark fs-5"></i>
            </button>

            {/* Tiêu đề */}
            <div className="text-center mb-4">
              <span className="badge bg-danger text-white px-3 py-2 rounded-pill fw-bold mb-2">CHI TIẾT ĐƠN HÀNG</span>
              <h3 className="fw-extrabold text-dark mt-2">Mã Đơn Hàng #{selectedOrder.id}</h3>
              <p className="text-muted mb-0">Ngày đặt: {new Date(selectedOrder.orderedDate || Date.now()).toLocaleDateString("vi-VN")}</p>
            </div>

            {/* Tình trạng & Khách hàng */}
            <div className="card border-0 bg-light rounded-4 p-3 mb-4">
              <div className="row text-center">
                <div className="col-6 border-end">
                  <span className="text-muted d-block small fw-bold">TRẠNG THÁI</span>
                  <span className={`badge ${selectedOrder.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'} px-3 py-2 rounded-pill mt-2`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block small fw-bold">KHÁCH HÀNG</span>
                  <span className="fw-bold text-dark mt-2 d-block">{selectedOrder.user ? selectedOrder.user.userName : 'Không rõ'}</span>
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <h5 className="fw-bold text-dark mb-3">
              <i className="fa-solid fa-boxes-stacked me-2 text-danger"></i>Danh sách sản phẩm đồ chơi
            </h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="py-2.5">Sản phẩm</th>
                    <th className="py-2.5 text-center">Số lượng</th>
                    <th className="py-2.5 text-end">Đơn giá</th>
                    <th className="py-2.5 text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 fw-bold text-dark">
                          {item.product ? item.product.productName : 'Sản phẩm đồ chơi'}
                        </td>
                        <td className="py-3 text-center fw-semibold">
                          {item.quantity} chiếc
                        </td>
                        <td className="py-3 text-end text-muted">
                          {(item.product ? item.product.price : 0).toLocaleString("vi-VN")} VNĐ
                        </td>
                        <td className="py-3 text-end fw-extrabold text-danger">
                          {((item.product ? item.product.price : 0) * item.quantity).toLocaleString("vi-VN")} VNĐ
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">Không có sản phẩm trong đơn hàng.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Tổng thanh toán */}
            <div className="card border-0 bg-danger text-white rounded-4 p-3 mt-4">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold fs-5">TỔNG THANH TOÁN:</span>
                <span className="fw-extrabold fs-4">{(selectedOrder.total || 0).toLocaleString("vi-VN")} VNĐ</span>
              </div>
            </div>

            {/* Nút đóng / in */}
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={() => setSelectedOrder(null)}>
                ĐÓNG
              </button>
              <button className="btn btn-toy-primary rounded-pill px-4 fw-bold text-white" onClick={() => window.print()}>
                <i className="fa-solid fa-print me-1"></i> IN HÓA ĐƠN
              </button>
            </div>

          </div>
        </div>
      )}
    </UserLayout>
  );
}

export default OrderHistoryPage;
