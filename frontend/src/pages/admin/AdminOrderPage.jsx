import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getAllOrders, updateOrderStatus } from "../../services/orderService";
import { exportOrdersToExcel } from "../../services/orderExportService";
import OrderSummaryCards from "./orders/OrderSummaryCards";
import OrderFilterBar from "./orders/OrderFilterBar";
import OrderList from "./orders/OrderList";
import OrderPagination from "./orders/OrderPagination";
import OrderDetailDrawer from "./orders/OrderDetailDrawer";
import OrderPrintView from "./orders/OrderPrintView";

function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filtering and Sorting state
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sort: "newest",
    startDate: "",
    endDate: ""
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail View state
  const [detailOrder, setDetailOrder] = useState(null);

  // Print state
  const [ordersToPrint, setOrdersToPrint] = useState([]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter Logic
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // 1. Search
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(o => {
        const idMatch = `#MKD-${String(o.id).padStart(6, '0')}`.toLowerCase().includes(q) || String(o.id).includes(q);
        const nameMatch = (o.receiverName || o.user?.userName || "").toLowerCase().includes(q);
        const phoneMatch = (o.phone || "").includes(q);
        const emailMatch = (o.user?.email || "").toLowerCase().includes(q);
        return idMatch || nameMatch || phoneMatch || emailMatch;
      });
    }

    // 2. Status
    if (filters.status) {
      result = result.filter(o => o.status === filters.status);
    }

    // 3. Date Range
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);

      result = result.filter(o => {
        if (!o.orderedDate) return false;
        let date;
        if (Array.isArray(o.orderedDate)) {
          const [y, m, d] = o.orderedDate;
          date = new Date(y, m - 1, d);
        } else {
          date = new Date(o.orderedDate);
        }
        return date >= start && date <= end;
      });
    }

    // 4. Sort
    result.sort((a, b) => {
      if (filters.sort === "newest") {
        return b.id - a.id; // Fallback to id if date is same or hard to compare
      }
      if (filters.sort === "oldest") {
        return a.id - b.id;
      }
      if (filters.sort === "totalDesc") {
        return (b.total || 0) - (a.total || 0);
      }
      if (filters.sort === "totalAsc") {
        return (a.total || 0) - (b.total || 0);
      }
      return 0;
    });

    return result;
  }, [orders, filters]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [filters, pageSize]);

  // Pagination logic
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedOrders, currentPage, pageSize]);

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
      
      // Update local state without fetching again to feel faster
      setOrders(prev => prev.map(o => {
        if (orderIds.includes(o.id)) {
          return { ...o, status: newStatus };
        }
        return o;
      }));
      
      // Update drawer if open
      if (detailOrder && orderIds.includes(detailOrder.id)) {
        setDetailOrder({ ...detailOrder, status: newStatus });
      }

      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại!");
      loadOrders(); // Rollback by reloading
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
    await exportOrdersToExcel(filteredAndSortedOrders, filters, "Bao_cao_don_hang");
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
                <li><button className="dropdown-item small" onClick={handleExportFilter}>Xuất theo bộ lọc ({filteredAndSortedOrders.length})</button></li>
                <li><button className="dropdown-item small" onClick={handleExportSelected} disabled={selectedIds.length === 0}>Xuất đơn đã chọn ({selectedIds.length})</button></li>
                <li><button className="dropdown-item small" onClick={() => exportOrdersToExcel(orders, null, "Toan_bo_don_hang")}>Xuất toàn bộ hệ thống</button></li>
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
        <OrderSummaryCards orders={orders} loading={loading} />

        {/* Filter Bar */}
        <OrderFilterBar 
          filters={filters} 
          setFilters={setFilters} 
          onReset={() => setFilters({ search: "", status: "", sort: "newest", startDate: "", endDate: "" })} 
        />

        {/* Order Table List */}
        <OrderList 
          orders={paginatedOrders} 
          loading={loading}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onViewDetail={setDetailOrder}
          onUpdateStatus={handleUpdateStatus}
          onPrint={handlePrint}
          onExportSingle={handleExportSingle}
        />

        {/* Pagination */}
        {!loading && filteredAndSortedOrders.length > 0 && (
          <OrderPagination 
            currentPage={currentPage}
            totalItems={filteredAndSortedOrders.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Drawer */}
      <OrderDetailDrawer 
        show={!!detailOrder} 
        order={detailOrder} 
        onClose={() => setDetailOrder(null)} 
        onUpdateStatus={handleUpdateStatus}
        onPrint={handlePrint}
        onExport={handleExportSingle}
      />

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
