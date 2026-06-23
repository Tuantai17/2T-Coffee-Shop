import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const getRoleVn = (roleName) => {
  switch (roleName) {
    case "ROLE_ADMIN": return "Quản trị viên";
    case "ROLE_STAFF": return "Nhân viên";
    case "ROLE_USER":
    default: return "Khách hàng";
  }
};

const getStatusVn = (active) => {
  return active === 1 ? "Hoạt động" : "Bị khóa";
};

export const exportUsersToExcel = async (users, fileName = "Danh_sach_nguoi_dung") => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Admin MyKingdom";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Danh sách người dùng", { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });
  
  ws.columns = [
    { header: "STT", key: "stt", width: 5 },
    { header: "ID Hệ thống", key: "id", width: 15 },
    { header: "Tên đăng nhập", key: "username", width: 20 },
    { header: "Họ và Tên", key: "fullname", width: 30 },
    { header: "Email", key: "email", width: 30 },
    { header: "Số điện thoại", key: "phone", width: 15 },
    { header: "Vai trò", key: "role", width: 20 },
    { header: "Trạng thái", key: "status", width: 15 }
  ];

  users.forEach((u, idx) => {
    ws.addRow({
      stt: idx + 1,
      id: u.id,
      username: u.userName,
      fullname: u.userDetails ? `${u.userDetails.firstName} ${u.userDetails.lastName}` : "Chưa cập nhật",
      email: u.userDetails?.email || "Chưa có",
      phone: u.userDetails?.phoneNumber || "Chưa có",
      role: getRoleVn(u.role?.roleName),
      status: getStatusVn(u.active)
    });
  });

  // Style Header
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };
  ws.autoFilter = 'A1:H1';

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  saveAs(blob, `${fileName}_${dateStr}.xlsx`);
};
