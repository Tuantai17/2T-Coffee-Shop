# KẾ HOẠCH TRIỂN KHAI HỆ THỐNG THÔNG BÁO (USER & ADMIN)

Tài liệu này đóng vai trò như một bản đặc tả kỹ thuật (Technical Specification) giúp team Backend và Frontend cùng phối hợp xây dựng hoàn chỉnh tính năng "Chuông thông báo" cho cả giao diện Khách hàng (User) và Quản trị viên (Admin).

---

## PHẦN 1: YÊU CẦU DÀNH CHO BACKEND (API & DATABASE)

Hiện tại Backend mới chỉ có `notification-service` làm nhiệm vụ consume event từ Kafka (ghi log/gửi email). Chúng ta cần nâng cấp thành một RESTful Service hoàn chỉnh.

### 1. Database Schema (Gợi ý Model `Notification`)
```json
{
  "id": "Long (Primary Key)",
  "userId": "String (ID của người nhận. Nếu là thông báo Admin hệ thống thì có thể là null hoặc 'admin')",
  "title": "String (Tiêu đề ngắn: 'Đơn hàng mới')",
  "message": "String (Nội dung: 'Đơn hàng #123 vừa được đặt')",
  "type": "String (Enum: ORDER_NEW, PRODUCT_LOW_STOCK, SYSTEM, BANNER_UPDATED...)",
  "isRead": "Boolean (Mặc định: false)",
  "targetUrl": "String (Đường dẫn chuyển trang khi user bấm vào thông báo. Vd: '/admin/orders/123')",
  "relatedEntityId": "String (ID của entity liên quan: orderId, productId...)",
  "metadata": "JSON/Map (Lưu thêm dữ liệu nếu cần)",
  "createdAt": "Timestamp",
  "readAt": "Timestamp"
}
```

### 2. Các Endpoint cần tạo (REST API)
Cần chia làm 2 bộ Controller: **AdminNotificationController** và **UserNotificationController**.

**Bộ API cho Khách Hàng (User):**
- `GET /api/notifications` -> Lấy danh sách thông báo của User đang đăng nhập (Phân trang).
- `GET /api/notifications/unread-count` -> Lấy tổng số thông báo chưa đọc của User.
- `PATCH /api/notifications/{id}/read` -> User đánh dấu đọc 1 thông báo.
- `PATCH /api/notifications/read-all` -> User đánh dấu đọc tất cả.

**Bộ API cho Quản Trị Viên (Admin):**
- `GET /api/notifications/admin` -> Lấy thông báo hệ thống (Phân trang, hỗ trợ filter search, type, isRead, timeRange).
- `GET /api/notifications/admin/unread-count` -> Tổng chưa đọc của hệ thống.
- `PATCH /api/notifications/admin/{id}/read` -> Admin đánh dấu đọc.
- `PATCH /api/notifications/admin/{id}/unread` -> Admin đánh dấu CHƯA đọc.
- `PATCH /api/notifications/admin/read-all` -> Admin đọc tất cả.
- `DELETE /api/notifications/admin/{id}` -> Xóa 1 thông báo.
- `POST /api/notifications/admin/bulk-read` -> Đánh dấu đọc hàng loạt (truyền mảng IDs).
- `POST /api/notifications/admin/bulk-delete` -> Xóa hàng loạt (truyền mảng IDs).
- `DELETE /api/notifications/admin/read` -> Xóa toàn bộ thông báo đã đọc.

### 3. Realtime (Tùy chọn cho giai đoạn 2)
Để chuông thông báo tự nhảy số mà không cần F5:
- **Tùy chọn Dễ**: Thêm Web Socket (STOMP/SockJS) vào `notification-service`. Khi Kafka nhận event, đẩy thêm 1 message qua WebSocket xuống Frontend.
- **Tùy chọn Khác**: SSE (Server-Sent Events) hoặc Frontend gọi API định kỳ (Polling) mỗi 30s.

---

## PHẦN 2: YÊU CẦU DÀNH CHO FRONTEND

### 1. Phía Admin (ĐÃ HOÀN THÀNH 90%)
- UI/UX cho Chuông Header, Dropdown và Trang Quản lý (`/admin/notifications`) **ĐÃ ĐƯỢC XÂY DỰNG HOÀN CHỈNH**.
- Code nằm tại `src/pages/admin/notifications/` và `src/services/notificationService.js`.
- **Việc cần làm ngày mai**: Khi Backend code xong các endpoint API phía trên, chỉ cần bỏ comment code thực thi hoặc map lại đúng đường dẫn `/api/...` trong file `notificationService.js`, toàn bộ giao diện Admin sẽ tự động hoạt động hoàn hảo.

### 2. Phía Khách Hàng / Người Dùng (CẦN LÀM MỚI)
- **Tạo `UserHeader.jsx` (hoặc update header hiện tại)**: Thêm biểu tượng Chuông Notification tương tự như bên Admin.
- **Tạo `UserNotificationDropdown.jsx`**: Giao diện sổ xuống chứa 5 thông báo cá nhân mới nhất (ví dụ: "Đơn hàng của bạn đang được giao").
- **Tạo trang `/profile/notifications`**: Trang xem toàn bộ lịch sử thông báo cá nhân của Khách hàng, có phân trang đơn giản.
- **Tái sử dụng tiện ích**: Có thể import các hàm từ `src/utils/notificationUtils.jsx` (như hàm `formatRelativeTime`) để tiết kiệm thời gian format ngày giờ.

---

## TỔNG KẾT ROADMAP CHO NGÀY MAI
1. **Sáng**: Backend chốt Model DB và viết các endpoint CRUD cơ bản cho Notification.
2. **Trưa**: Test API bằng Postman. Frontend ghép nối API thật vào `notificationService.js` của Admin để test tính năng Đọc/Xóa/Lọc thông báo.
3. **Chiều**: Frontend triển khai tiếp cục UI (Dropdown + Trang danh sách) trên giao diện User (Khách hàng) và nối API `/api/notifications` của user.
4. **Tối (Tùy chọn)**: Tích hợp WebSocket nếu có thời gian để đẩy Realtime.
