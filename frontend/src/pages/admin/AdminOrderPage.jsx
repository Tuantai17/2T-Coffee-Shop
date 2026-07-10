import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminOrders, updateOrderStatus, getAdminOrderDetail } from "../../services/orderService";
import { exportOrdersToExcel } from "../../services/orderExportService";
import OrderSummaryCards from "./orders/OrderSummaryCards";
import OrderFilterBar from "./orders/OrderFilterBar";
import OrderList from "./orders/OrderList";
import OrderPagination from "./orders/OrderPagination";
import OrderDetailDrawer from "./orders/OrderDetailDrawer";
import OrderPrintView from "./orders/OrderPrintView";
import CancelOrderModal from "./orders/CancelOrderModal";
import { useSearchParams } from "react-router-dom";

function AdminOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Data state
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  
  // Cancel Modal State
  const [cancelOrderId, setCancelOrderId] = useState(null);
  
  // Filtering and Sorting state (synced with URL)
  const getFilterFromURL = (key, defaultVal) => searchParams.get(key) || defaultVal;
  
  const [filters, setFilters] = useState({
    search: getFilterFromURL("search", ""),
    status: getFilterFromURL("status", ""),
    sort: getFilterFromURL("sort", "newest"),
    startDate: getFilterFromURL("startDate", ""),
    endDate: getFilterFromURL("endDate", "")
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(parseInt(getFilterFromURL("page", "1")));
  const [pageSize, setPageSize] = useState(parseInt(getFilterFromURL("size", "10")));

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail View state
  const [detailOrder, setDetailOrder] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState(false);

  // Print state
  const [ordersToPrint, setOrdersToPrint] = useState([]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: pageSize,
        keyword: filters.search,
        status: filters.status,
        fromDate: filters.startDate,
        toDate: filters.endDate,
        sort: filters.sort
      };
      
      const response = await getAdminOrders(params);
      
      // Update URL silently
      setSearchParams(params, { replace: true });
      
      if (response.data) {
        setOrders(response.data.content || []);
        setTotalElements(response.data.totalElements || 0);
        setStatistics(response.data.statistics || null);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
      setOrders([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters, setSearchParams]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // When filters or page size change, reset page to 1
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Actions
  const handleSelectAll = (checked, currentOrders) => {
    if (checked) {
      const newIds = [...new Set([...selectedIds, ...currentOrders.map(o => o.id)])];
      setSelectedIds(newIds);
    } else {
      const idsToRemove = currentOrders.map(o => o.id);
      setSelectedIds(selectedIds.filter(id => !idsToRemove.includes(id)));
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleUpdateStatus = async (orderIds, newStatus) => {
    if (!window.confirm(`Bạn có chắc chắn muốn chuyển ${orderIds.length} đơn hàng sang trạng thái: ${newStatus}?`)) return;

    try {
      const promises = orderIds.map(id => {
        const order = orders.find(o => o.id === id);
        return updateOrderStatus(id, newStatus, order?.paymentStatus || "PENDING");
      });
      await Promise.all(promises);
      
      setSelectedIds([]);
      loadOrders(); // Refresh from server to get accurate statistics
      
      // Update drawer if open
      if (detailOrder && orderIds.includes(detailOrder.id)) {
        setDetailOrder({ ...detailOrder, status: newStatus });
      }
    } catch (error) {
      console.error(error);
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại!");
      loadOrders();
    }
  };

  const handleViewDetail = async (order) => {
    setDetailOrder(order); // Show immediately with basic data
    setDrawerLoading(true);
    setDrawerError(false);
    try {
      const res = await getAdminOrderDetail(order.id);
      setDetailOrder(res.data || res);
    } catch (err) {
      console.error("Failed to load order details:", err);
      setDrawerError(true);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handlePrint = (orderIds) => {
    if (!orderIds || orderIds.length === 0) return;
    const printOrders = orders.filter(o => orderIds.includes(o.id));
    setOrdersToPrint(printOrders);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleExportFilter = async () => {
    setExporting(true);
    // Since we paginate on server, if we want to export filtered, we might need a separate API call without pagination.
    // For now, we export the current page or fetch all? Let's just pass the current orders.
    // In a real app, this should hit an export API endpoint.
    await exportOrdersToExcel(orders, filters, "Bao_cao_don_hang");
    setExporting(false);
  };

  const handleExportSelected = async () => {
    setExporting(true);
    const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
    await exportOrdersToExcel(selectedOrders, null, "Don_hang_da_chon");
    setExporting(false);
  };

  const handleExportSingle = async (order) => {
    await exportOrdersToExcel([order], null, `Don_hang_MKD-${String(order.id).padStart(6, '0')}`);
  };

  const handleOpenCancelModal = (orderId) => {
    setCancelOrderId(orderId);
  };

  const handleCancelSuccess = () => {
    setCancelOrderId(null);
    loadOrders();
  };

  return (
    <AdminLayout>
      <div className="container-fluid mt-4 px-xl-4 pb-5">
        
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Quản lý đơn hàng</h2>
            <p className="text-muted small mb-0">Quản lý trạng thái, thanh toán, thông tin khách hàng và thống kê doanh thu từ đơn hàng.</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button className="btn btn-light neu-pill shadow-sm fw-semibold px-3" onClick={loadOrders} disabled={loading}>
              <i className="fa-solid fa-rotate-right me-1"></i> Làm mới
            </button>
            <button 
              className="btn btn-light neu-pill shadow-sm fw-semibold px-3" 
              disabled={selectedIds.length === 0}
              title={selectedIds.length === 0 ? "Vui lòng chọn ít nhất 1 đơn hàng để in" : "In các đơn hàng đã chọn"}
              onClick={() => handlePrint(selectedIds)}
            >
              <i className="fa-solid fa-print me-1"></i> In đơn hàng
            </button>
            <div className="dropdown">
              <button 
                className="btn bg-white border neu-pill shadow-sm fw-semibold px-3 dropdown-toggle" 
                data-bs-toggle="dropdown"
                disabled={exporting}
              >
                {exporting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa-solid fa-download me-1"></i>}
                Xuất Excel
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3">
                <li><button className="dropdown-item small" onClick={handleExportFilter}>Xuất trang hiện tại ({orders.length})</button></li>
                <li><button className="dropdown-item small" onClick={handleExportSelected} disabled={selectedIds.length === 0}>Xuất đơn đã chọn ({selectedIds.length})</button></li>
              </ul>
            </div>
            <button 
              className="btn btn-primary neu-pill shadow-sm fw-bold px-3" 
              style={{ backgroundColor: "var(--admin-primary)", border: "none" }}
              onClick={() => window.scrollTo({ top: 150, behavior: "smooth" })}
            >
              <i className="fa-solid fa-filter me-1"></i> Bộ lọc
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <OrderSummaryCards statistics={statistics} loading={loading} />

        {/* Filter Bar */}
        <OrderFilterBar 
          filters={filters} 
          setFilters={handleFilterChange} 
          onReset={() => handleFilterChange({ search: "", status: "", sort: "newest", startDate: "", endDate: "" })} 
        />

        {/* Order Table List */}
        <OrderList 
          orders={orders} 
          loading={loading}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onViewDetail={handleViewDetail}
          onUpdateStatus={handleUpdateStatus}
          onPrint={handlePrint}
          onExportSingle={handleExportSingle}
          onCancel={handleOpenCancelModal}
        />

        {/* Pagination */}
        {totalElements > 0 && (
          <OrderPagination 
            currentPage={currentPage}
            totalItems={totalElements}
            pageSize={pageSize}
            setPageSize={handlePageSizeChange}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Detail Drawer */}
      <OrderDetailDrawer 
        show={!!detailOrder} 
        order={detailOrder} 
        loading={drawerLoading}
        error={drawerError}
        onRetry={() => handleViewDetail(detailOrder)}
        onClose={() => { setDetailOrder(null); setDrawerError(false); }} 
        onUpdateStatus={handleUpdateStatus}
        onPrint={handlePrint}
        onExport={handleExportSingle}
      />

      {/* Cancel Order Modal */}
      {cancelOrderId && (
        <CancelOrderModal
          orderId={cancelOrderId}
          onClose={() => setCancelOrderId(null)}
          onSuccess={handleCancelSuccess}
        />
      )}

      {/* Hidden Print View */}
      <OrderPrintView ordersToPrint={ordersToPrint} />
      
      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminOrderPage;
