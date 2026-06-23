import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const formatMoney = (val) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

const formatDate = (dateArr) => {
  if (!dateArr) return "";
  if (Array.isArray(dateArr)) {
    const [y, m, d] = dateArr;
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  }
  return new Date(dateArr).toLocaleDateString("vi-VN");
};

const getStatusVn = (status) => {
  const map = {
    "PENDING_CONFIRMATION": "Chờ xác nhận",
    "CONFIRMED": "Đã xác nhận",
    "PACKING": "Đang chuẩn bị",
    "SHIPPING": "Đang giao",
    "COMPLETED": "Hoàn thành",
    "CANCELLED": "Đã hủy"
  };
  return map[status] || status;
};

export const exportOrdersToExcel = async (orders, filters, fileName = "Bao_cao_don_hang") => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Admin MyKingdom";
  workbook.created = new Date();

  // --- SHEET 1: TỔNG QUAN ---
  const wsOverview = workbook.addWorksheet("Tổng quan");
  wsOverview.columns = [
    { header: "Chỉ tiêu", key: "metric", width: 30 },
    { header: "Giá trị", key: "value", width: 40 }
  ];

  // Calculate stats
  let totalRevenue = 0, totalItems = 0, totalShipping = 0, totalDiscount = 0;
  let statusCounts = { PENDING_CONFIRMATION: 0, SHIPPING: 0, COMPLETED: 0, CANCELLED: 0 };
  
  orders.forEach(o => {
    if (o.status === "COMPLETED") totalRevenue += o.total || 0;
    totalShipping += o.shippingFee || 0;
    totalDiscount += o.discountAmount || 0;
    totalItems += o.items?.length || 0;
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
  });

  const overviewData = [
    { metric: "Thời điểm xuất", value: new Date().toLocaleString("vi-VN") },
    { metric: "Khoảng thời gian (Lọc)", value: filters?.startDate ? `${filters.startDate} đến ${filters.endDate}` : "Toàn thời gian" },
    { metric: "Trạng thái (Lọc)", value: filters?.status ? getStatusVn(filters.status) : "Tất cả" },
    { metric: "Từ khóa tìm kiếm", value: filters?.search || "Không" },
    { metric: "", value: "" },
    { metric: "Tổng số đơn", value: orders.length },
    { metric: "Đơn chờ xác nhận", value: statusCounts.PENDING_CONFIRMATION },
    { metric: "Đơn đang giao", value: statusCounts.SHIPPING },
    { metric: "Đơn hoàn thành", value: statusCounts.COMPLETED },
    { metric: "Đơn đã hủy", value: statusCounts.CANCELLED },
    { metric: "", value: "" },
    { metric: "Tổng giảm giá", value: totalDiscount },
    { metric: "Tổng phí vận chuyển", value: totalShipping },
    { metric: "Doanh thu thực tế (chỉ tính đơn Hoàn thành)", value: totalRevenue },
    { metric: "Tổng số lượng sản phẩm bán ra", value: totalItems },
  ];

  overviewData.forEach(row => wsOverview.addRow(row));

  // Style Overview
  wsOverview.getRow(1).font = { bold: true };
  wsOverview.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };
  
  // Format numbers in overview
  wsOverview.eachRow((row, rowNum) => {
    if (rowNum > 1 && typeof row.getCell(2).value === "number") {
      row.getCell(2).numFmt = '#,##0';
    }
  });

  // --- SHEET 2: DANH SÁCH ĐƠN HÀNG ---
  const wsOrders = workbook.addWorksheet("Danh sách đơn hàng", { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });
  wsOrders.columns = [
    { header: "STT", key: "stt", width: 5 },
    { header: "Mã đơn hàng", key: "id", width: 15 },
    { header: "Ngày đặt", key: "date", width: 15 },
    { header: "Tên khách hàng", key: "customer", width: 25 },
    { header: "Số điện thoại", key: "phone", width: 15 },
    { header: "Người nhận hàng", key: "receiver", width: 25 },
    { header: "Địa chỉ giao hàng", key: "address", width: 50 },
    { header: "Tổng số loại SP", key: "itemCount", width: 15 },
    { header: "Tạm tính", key: "subTotal", width: 15 },
    { header: "Giảm giá", key: "discount", width: 15 },
    { header: "Phí vận chuyển", key: "shipping", width: 15 },
    { header: "Tổng thanh toán", key: "total", width: 18 },
    { header: "Phương thức TT", key: "paymentMethod", width: 15 },
    { header: "Trạng thái TT", key: "paymentStatus", width: 15 },
    { header: "Trạng thái đơn", key: "status", width: 15 },
    { header: "Ghi chú", key: "note", width: 30 },
  ];

  orders.forEach((o, idx) => {
    wsOrders.addRow({
      stt: idx + 1,
      id: `#MKD-${String(o.id).padStart(6, '0')}`,
      date: formatDate(o.orderedDate),
      customer: o.user?.userName || "Khách vãng lai",
      phone: o.phone,
      receiver: o.receiverName,
      address: [o.address, o.ward, o.district, o.province].filter(Boolean).join(", "),
      itemCount: o.items?.length || 0,
      subTotal: o.total - (o.shippingFee || 0) + (o.discountAmount || 0),
      discount: o.discountAmount || 0,
      shipping: o.shippingFee || 0,
      total: o.total,
      paymentMethod: o.paymentMethod || "COD",
      paymentStatus: o.paymentStatus === "PAID" ? "Đã thanh toán" : o.paymentStatus,
      status: getStatusVn(o.status),
      note: o.note || ""
    });
  });

  // Style Orders
  wsOrders.getRow(1).font = { bold: true };
  wsOrders.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };
  wsOrders.autoFilter = 'A1:P1';
  ["I", "J", "K", "L"].forEach(col => {
    wsOrders.getColumn(col).numFmt = '#,##0';
  });

  // --- SHEET 3: CHI TIẾT SẢN PHẨM ---
  const wsItems = workbook.addWorksheet("Chi tiết sản phẩm", { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });
  wsItems.columns = [
    { header: "STT", key: "stt", width: 5 },
    { header: "Mã đơn hàng", key: "orderId", width: 15 },
    { header: "Ngày đặt", key: "date", width: 15 },
    { header: "SKU", key: "sku", width: 10 },
    { header: "Tên sản phẩm", key: "productName", width: 40 },
    { header: "Số lượng", key: "quantity", width: 10 },
    { header: "Đơn giá", key: "price", width: 15 },
    { header: "Thành tiền", key: "total", width: 15 },
    { header: "Trạng thái đơn", key: "orderStatus", width: 15 },
  ];

  let itemIdx = 1;
  orders.forEach(o => {
    if (o.items && o.items.length > 0) {
      o.items.forEach(item => {
        wsItems.addRow({
          stt: itemIdx++,
          orderId: `#MKD-${String(o.id).padStart(6, '0')}`,
          date: formatDate(o.orderedDate),
          sku: item.product?.id,
          productName: item.product?.productName,
          quantity: item.quantity,
          price: item.price,
          total: (item.price || 0) * (item.quantity || 0),
          orderStatus: getStatusVn(o.status)
        });
      });
    }
  });

  // Style Items
  wsItems.getRow(1).font = { bold: true };
  wsItems.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };
  wsItems.autoFilter = 'A1:I1';
  ["G", "H"].forEach(col => {
    wsItems.getColumn(col).numFmt = '#,##0';
  });

  // Write and Save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  saveAs(blob, `${fileName}_${dateStr}.xlsx`);
};
