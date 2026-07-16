import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/AdminLayout";
import axiosClient from "../../../api/axiosClient";
import OrderStatusTimeline from "./OrderStatusTimeline";
import OrderItemsTable from "./OrderItemsTable";
import ReportItemIssueModal from "./ReportItemIssueModal";
import ResolveOrderIssueModal from "./ResolveOrderIssueModal";
import OrderHistoryTimeline from "./OrderHistoryTimeline";
import CustomerContactCard from "./CustomerContactCard";
import WaitingForRestockBanner from "./WaitingForRestockBanner";
import OrderCancelledBanner from "./OrderCancelledBanner";
import CancelOrderModal from "./CancelOrderModal";

const formatOrderDateTime = (orderedDate) => {
  if (!orderedDate) {
    return "-";
  }

  if (Array.isArray(orderedDate)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = orderedDate;
    const localDate = new Date(year, (month || 1) - 1, day || 1, hour, minute, second);
    return Number.isNaN(localDate.getTime()) ? "-" : localDate.toLocaleString("vi-VN");
  }

  const normalizedDateStr = typeof orderedDate === 'string' && !orderedDate.endsWith('Z') ? `${orderedDate}Z` : orderedDate;
  const parsedDate = new Date(normalizedDateStr);
  return Number.isNaN(parsedDate.getTime()) ? "-" : parsedDate.toLocaleString("vi-VN");
};

const getPaymentStatusLabel = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PAID":
      return "Đã thanh toán";
    case "PAYMENT_ON_DELIVERY":
    case "PENDING":
      return "Chưa thanh toán";
    case "FAILED":
      return "Thất bại";
    case "CANCELLED":
      return "Đã hủy";
    case "REFUNDED":
      return "Đã hoàn tiền";
    default:
      return status || "Chưa thanh toán";
  }
};

const OrderEditPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [showResolveIssueModal, setShowResolveIssueModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Form State
  const [selectedStatus, setSelectedStatus] = useState('');
  const [formData, setFormData] = useState({
    receiverName: '',
    phone: '',
    address: '',
    note: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const [orderRes, historyRes, issuesRes] = await Promise.all([
        axiosClient.get(`/api/shop/admin/orders/${orderId}`),
        axiosClient.get(`/api/shop/admin/orders/${orderId}/history`),
        axiosClient.get(`/api/shop/admin/orders/${orderId}/issues`)
      ]);
      setOrder(orderRes.data);
      setHistory(historyRes.data);
      setIssues(issuesRes.data);
      
      setSelectedStatus(orderRes.data.status);
      setFormData({
        receiverName: orderRes.data.receiverName || '',
        phone: orderRes.data.phone || '',
        address: orderRes.data.address || '',
        note: orderRes.data.note || ''
      });
    } catch (error) {
      console.error("Error fetching order data:", error);
      alert("Không thể tải thông tin đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Update details if changed
      if (
        formData.receiverName !== order.receiverName ||
        formData.phone !== order.phone ||
        formData.address !== order.address ||
        formData.note !== order.note
      ) {
        await axiosClient.put(`/api/shop/admin/orders/${orderId}/details`, {
          ...formData,
          performedBy: "Admin"
        });
      }
      
      // Update status if changed
      if (selectedStatus !== order.status) {
        await axiosClient.put(`/api/shop/admin/orders/${orderId}/status`, { 
          status: selectedStatus, 
          performedBy: "Admin" 
        });
      }
      
      alert("Lưu thay đổi thành công!");
      fetchOrderData();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi lưu thay đổi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSuccess = () => {
    setShowCancelModal(false);
    fetchOrderData();
  };

  if (loading) return <AdminLayout><div className="p-4 text-center mt-5"><div className="spinner-border text-primary"></div></div></AdminLayout>;
  if (!order) return <AdminLayout><div className="p-4 text-center mt-5">Không tìm thấy đơn hàng</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="container-fluid p-4 bg-light min-vh-100" style={{ fontFamily: 'Inter, sans-serif' }}>
        
        {/* Header section */}
        <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border">
          <div>
            <h4 className="d-inline mb-0 align-middle fw-bold">Chỉnh sửa đơn hàng #{order.id < 10 ? 'MKD-00000'+order.id : 'MKD-'+order.id}</h4>
            <span className={`badge ms-3 bg-${selectedStatus === "COMPLETED" ? "success" : selectedStatus === "CANCELLED" ? "danger" : selectedStatus === "AWAITING_CUSTOMER_DECISION" ? "warning text-dark" : "primary"} rounded-pill px-3 py-2 fs-6`}>
              {selectedStatus === "AWAITING_CUSTOMER_DECISION" ? "Chờ khách phản hồi" : 
               selectedStatus === "PENDING_CONFIRMATION" ? "Chờ xác nhận" : 
               selectedStatus === "CONFIRMED" ? "Đã xác nhận" :
               selectedStatus === "PREPARING" ? "Đang chuẩn bị" :
               selectedStatus === "WAITING_FOR_RESTOCK" ? "Chờ nhập hàng" :
               selectedStatus === "READY_FOR_PICKUP" ? "Chờ nhận tại quầy" :
               selectedStatus === "READY_FOR_DELIVERY" ? "Chờ giao hàng" :
               selectedStatus === "DELIVERING" ? "Đang giao" :
               selectedStatus === "COMPLETED" ? "Hoàn thành" : selectedStatus}
            </span>
            <div className="text-muted mt-2 small">
              <i className="bi bi-clock me-1"></i> {formatOrderDateTime(order.orderedDate)}
            </div>
          </div>
          <div>
            <button className="btn btn-outline-secondary me-2 bg-white text-dark" onClick={() => navigate("/admin/orders")}>
              <i className="bi bi-arrow-left me-1"></i> Quay lại
            </button>
            <button className="btn btn-outline-secondary me-2 bg-white text-dark" onClick={() => window.print()}>
              <i className="bi bi-printer me-1"></i> In đơn hàng
            </button>
            <button 
                className="btn btn-outline-danger me-2" 
                onClick={() => setShowCancelModal(true)}
                disabled={order.status === 'CANCELLED' || order.status === 'COMPLETED'}
              >
                <i className="bi bi-x-circle me-2"></i>Hủy đơn hàng
            </button>
            <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save me-1"></i>}
              Lưu thay đổi
            </button>
          </div>
        </div>

        {/* Timeline section */}
        <div className="card shadow-sm border-0 mb-4 rounded-4">
          <div className="card-body px-5 py-4">
            <OrderStatusTimeline 
              currentStatus={order.status} 
              selectedStatus={selectedStatus}
              onSelectStatus={setSelectedStatus}
              history={history} 
            />
          </div>
        </div>

        {/* Three Columns Info */}
        <div className="row g-4 mb-4">
          {/* Col 1: Customer */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100 rounded-4">
              <div className="card-header bg-white border-bottom pt-3 pb-2 px-4 d-flex align-items-center">
                <i className="bi bi-person-badge text-primary me-2 fs-5"></i>
                <h6 className="fw-bold mb-0">Thông tin khách hàng</h6>
              </div>
              <div className="card-body p-4">
                <div className="row mb-3">
                  <div className="col-4 text-muted">Họ tên:</div>
                  <div className="col-8 fw-semibold">{order.userName || order.user?.username || order.receiverName || 'N/A'}</div>
                </div>
                <div className="row mb-3 align-items-center">
                  <div className="col-4 text-muted">SĐT:</div>
                  <div className="col-8 fw-semibold d-flex align-items-center">
                    {order.user?.phone || order.phone || 'N/A'}
                    <div className="ms-auto d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary rounded-circle p-1" style={{width: '28px', height:'28px'}}><i className="bi bi-telephone-fill"></i></button>
                      <button className="btn btn-sm btn-outline-success rounded-circle p-1" style={{width: '28px', height:'28px'}}><i className="bi bi-whatsapp"></i></button>
                      <button className="btn btn-sm btn-outline-info rounded-circle p-1" style={{width: '28px', height:'28px'}}><i className="bi bi-envelope-fill"></i></button>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-4 text-muted">Email:</div>
                  <div className="col-8 fw-semibold">{order.userEmail || order.user?.email || 'N/A'}</div>
                </div>
                <div className="row">
                  <div className="col-4 text-muted">User ID:</div>
                  <div className="col-8 fw-semibold">{order.userId || order.user?.id || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Shipping Info Form */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100 rounded-4">
              <div className="card-header bg-white border-bottom pt-3 pb-2 px-4 d-flex align-items-center">
                <i className="bi bi-truck text-primary me-2 fs-5"></i>
                <h6 className="fw-bold mb-0">Thông tin giao hàng</h6>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label text-muted small mb-1">Người nhận</label>
                    <input type="text" className="form-control form-control-sm" name="receiverName" value={formData.receiverName} onChange={handleInputChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small mb-1">SĐT người nhận</label>
                    <input type="text" className="form-control form-control-sm" name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">Địa chỉ</label>
                    <input type="text" className="form-control form-control-sm" name="address" value={formData.address} onChange={handleInputChange} />
                    <div className="form-text" style={{fontSize: '11px'}}>{order.ward}, {order.district}, {order.province}</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">Ghi chú giao hàng</label>
                    <input type="text" className="form-control form-control-sm" name="note" value={formData.note} onChange={handleInputChange} placeholder="Ghi chú từ khách hàng..." />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Payment Info */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100 rounded-4">
              <div className="card-header bg-white border-bottom pt-3 pb-2 px-4 d-flex align-items-center">
                <i className="bi bi-wallet2 text-primary me-2 fs-5"></i>
                <h6 className="fw-bold mb-0">Thông tin thanh toán</h6>
              </div>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3 align-items-center">
                  <span className="text-muted">Phương thức thanh toán</span>
                  <span className="fw-semibold">{order.paymentMethod || 'COD'}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 align-items-center">
                  <span className="text-muted">Trạng thái thanh toán</span>
                  <span className="badge bg-light text-dark border">{getPaymentStatusLabel(order.paymentStatus)}</span>
                </div>
                <hr className="my-2 opacity-10" />
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tạm tính</span>
                  <span className="fw-semibold">{(order.total - (order.shippingFee || 0) + (order.discountAmount || 0)).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Phí vận chuyển</span>
                  <span className="fw-semibold">{order.shippingFee?.toLocaleString('vi-VN') || 0} đ</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Giảm giá</span>
                  <span className="fw-semibold">{order.discountAmount?.toLocaleString('vi-VN') || 0} đ</span>
                </div>
                <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                  <span className="fw-bold text-dark">Tổng thanh toán</span>
                  <span className="fw-bold text-success fs-5">{order.total?.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancelled Banner */}
        <OrderCancelledBanner order={order} />

        {/* Waiting For Restock Banner */}
        {order.status === 'WAITING_FOR_RESTOCK' && (
          <WaitingForRestockBanner order={order} onRestockUpdated={fetchOrderData} />
        )}

        {/* Products Table Section */}
        <div className="card shadow-sm border-0 mb-4 rounded-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-3 px-4">
            <h6 className="fw-bold mb-0"><i className="bi bi-box-seam me-2 text-primary"></i>Danh sách sản phẩm trong đơn</h6>
          </div>
          <div className="card-body p-0">
            <OrderItemsTable 
              items={order.items} 
              onReportIssue={(item) => { setSelectedItem(item); setReportModalOpen(true); }} 
              issues={issues} 
              onResolveIssue={(issue) => { setSelectedIssueId(issue.id); setShowResolveIssueModal(true); }} 
              orderStatus={order.status}
            />
            
            <div className="d-flex justify-content-end align-items-center p-4 border-top bg-white rounded-bottom-4">
              <span className="fw-bold fs-5 me-4">Tổng thanh toán:</span>
              <span className="fw-bold fs-4 text-success">{order.total?.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>

        {/* Customer Contact Card */}
        <CustomerContactCard 
          orderId={orderId} 
          customerName={order.receiverName} 
          customerPhone={order.phone} 
          customerEmail={order.userEmail || order.user?.email || order.userName} 
          onLogSuccess={fetchOrderData}
        />

        {/* Order History Timeline */}
        <OrderHistoryTimeline history={history} />
        
        {/* Modals */}
        <ReportItemIssueModal 
          show={isReportModalOpen} 
          onHide={() => setReportModalOpen(false)} 
          orderId={orderId} 
          item={selectedItem} 
          onSuccess={fetchOrderData} 
        />

        {showResolveIssueModal && selectedIssueId && (
          <ResolveOrderIssueModal
            show={showResolveIssueModal}
            onHide={() => setShowResolveIssueModal(false)}
            orderId={orderId}
            issue={issues.find(i => i.id === selectedIssueId)}
            item={order?.items?.find(i => i.id === issues.find(issue => issue.id === selectedIssueId)?.orderItemId)}
            onSuccess={fetchOrderData} 
          />
        )}

        {showCancelModal && (
          <CancelOrderModal
            orderId={orderId}
            onClose={() => setShowCancelModal(false)}
            onSuccess={handleCancelSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderEditPage;
