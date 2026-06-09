# 🌟 MYKINGDOM TOY STORE - FRONTEND (REACT.JS & VITE)

Thư mục này chứa mã nguồn giao diện người dùng (**Frontend**) của dự án **Hệ thống Vi dịch vụ Thương mại Điện tử - MyKingdom Toy Store**. Giao diện được thiết kế hiện đại, trực quan, hỗ trợ đầy đủ các tính năng cho cả khách hàng và quản trị viên, kết nối trực tiếp đến hệ thống Backend Microservices thông qua **Spring Cloud API Gateway**.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **React 19**: Thư viện Javascript xây dựng giao diện người dùng theo hướng thành phần (Component-based).
* **Vite 8**: Công cụ xây dựng và đóng gói ứng dụng cực nhanh với cơ chế Hot Module Replacement (HMR).
* **Bootstrap 5**: Thư viện CSS cung cấp giao diện responsive và các component UI tiêu chuẩn.
* **React Router DOM v7**: Quản lý định tuyến và điều hướng trang động.
* **Axios**: Thư viện kết nối HTTP Client để gửi nhận dữ liệu với API Gateway.

---

## 📁 Cấu Trúc Thư Mục `/src`

Cấu trúc thư mục được thiết kế theo mô hình phân lớp rõ ràng, dễ bảo trì và mở rộng:

```text
src/
├── api/
│   └── axiosClient.js        # Cấu hình Axios Interceptors, tự động đính kèm JWT và Cart-Id
├── components/
│   ├── AdminSidebar.jsx      # Thanh điều hướng riêng cho trang quản trị
│   ├── Footer.jsx            # Chân trang dùng chung
│   ├── Navbar.jsx            # Thanh menu đầu trang (điều hướng, hiển thị giỏ hàng, thông tin tài khoản)
│   └── ProtectedRoute.jsx    # Component bảo mật kiểm tra quyền truy cập (User/Admin) trước khi vào trang
├── pages/
│   ├── user/                 # Phân hệ khách hàng (User pages)
│   │   ├── CartPage.jsx           # Trang quản lý giỏ hàng (thêm, bớt, thay đổi số lượng)
│   │   ├── CheckoutPage.jsx       # Trang đặt hàng và điền thông tin thanh toán
│   │   ├── HomePage.jsx           # Trang chủ hiển thị danh mục và sản phẩm nổi bật/khuyến mãi
│   │   ├── LoginPage.jsx          # Trang đăng nhập tài khoản
│   │   ├── RegisterPage.jsx       # Trang đăng ký tài khoản mới
│   │   ├── OrderHistoryPage.jsx   # Trang xem lịch sử đơn hàng & in hóa đơn chi tiết
│   │   ├── ProductDetailPage.jsx  # Trang chi tiết sản phẩm & xem đánh giá
│   │   ├── ProductListPage.jsx    # Trang danh sách sản phẩm theo bộ lọc/danh mục
│   │   └── ProfilePage.jsx        # Trang quản lý hồ sơ cá nhân khách hàng
│   └── admin/                # Phân hệ quản trị (Admin pages)
│       ├── DashboardPage.jsx      # Trang thống kê tổng quan (Sản phẩm, Đơn hàng, Người dùng...)
│       ├── AdminCategoryPage.jsx  # Quản lý Danh mục (Thêm, Sửa, Xóa)
│       ├── AdminProductPage.jsx   # Quản lý Sản phẩm (Thêm, Sửa, Xóa, cập nhật thông tin)
│       ├── AdminOrderPage.jsx     # Quản lý Đơn hàng (Xem hóa đơn, Duyệt/Cập nhật trạng thái)
│       └── AdminUserPage.jsx      # Quản lý tài khoản người dùng đăng ký hệ thống
├── services/                 # Lớp tích hợp dịch vụ API (gọi endpoints từ Backend)
│   ├── authService.js        # Đăng ký, đăng nhập, hồ sơ người dùng (kết nối User Service)
│   ├── cartService.js        # Thêm/bớt/lấy giỏ hàng (kết nối Order Service & Redis Cache)
│   ├── orderService.js        # Tạo đơn hàng, lấy lịch sử đơn hàng (kết nối Order Service)
│   └── productService.js     # Lấy/Cập nhật sản phẩm, danh mục (kết nối Catalog Service)
├── App.css                   # Định kiểu tùy biến cho ứng dụng
├── App.jsx                   # Khai báo các tuyến đường (routes) và phân quyền ứng dụng
├── index.css                 # Định kiểu CSS gốc
└── main.jsx                  # Điểm khởi chạy của ứng dụng React
```

---

## 🔒 Cơ Chế Bảo Mật & Quản Lý Trạng Thái

### 1. Xác thực JWT (JSON Web Token)
* Khi người dùng đăng nhập thành công qua `authService.js`, hệ thống lưu trữ Token JWT và thông tin vai trò (`role`), mã định danh (`userId`) vào `sessionStorage`.
* Cấu hình [axiosClient.js](file:///e:/Web2_/e-commerce-microservices/frontend/src/api/axiosClient.js) sử dụng Request Interceptor tự động đính kèm Token này vào Header của mỗi request:
  ```javascript
  config.headers.Authorization = `Bearer ${token}`;
  ```

### 2. Định danh Giỏ hàng vãng lai (Anonymous Cart-Id)
* Để hỗ trợ thêm sản phẩm vào giỏ hàng mà không cần đăng nhập ngay, hệ thống tự động sinh ra một `Cart-Id` ngẫu nhiên trong `sessionStorage`.
* ID này được gửi kèm qua Header `Cart-Id` lên API Gateway và được xử lý lưu trữ tạm thời trên **Redis Cache** của **Order Service**. Khi khách hàng đăng nhập, giỏ hàng sẽ được đồng bộ.

### 3. Phân Quyền Định Tuyến (Protected Routes)
* [ProtectedRoute.jsx](file:///e:/Web2_/e-commerce-microservices/frontend/src/components/ProtectedRoute.jsx) đóng vai trò là chốt chặn bảo mật trên Client:
  * Các trang cá nhân như Giỏ hàng, Đặt hàng, Lịch sử mua hàng yêu cầu người dùng phải đăng nhập trước. Nếu chưa đăng nhập, người dùng sẽ tự động bị điều hướng về trang `/login`.
  * Các trang quản trị (`/admin/**`) yêu cầu kiểm tra vai trò người dùng. Chỉ tài khoản có `role` là `ROLE_ADMIN` hoặc `ROLE_STAFF` mới được phép truy cập. Các trường hợp khác sẽ hiển thị cảnh báo và chuyển hướng về trang chủ.

---

## 🌐 Sơ Đồ Định Tuyến API qua Gateway

Tất cả các service API tích hợp đều gọi thông qua cổng chung là `http://localhost:8900` (API Gateway) để phân tải đến các microservices tương ứng:

* **`/api/accounts/**`** ➡️ Định tuyến tới `user-service` (quản lý tài khoản, phân quyền, xác thực).
* **`/api/catalog/**`** ➡️ Định tuyến tới `product-catalog-service` (danh mục đồ chơi, quản lý sản phẩm).
* **`/api/shop/**`** ➡️ Định tuyến tới `order-service` (xử lý giỏ hàng trên Redis, quy trình đặt hàng).
* **`/api/review/**`** ➡️ Định tuyến tới `product-recommendation-service` (lưu trữ đánh giá sản phẩm).

---

## 🚀 Hướng Dẫn Cài Đặt và Khởi Chạy

### 📋 Yêu cầu hệ thống
* **Node.js** phiên bản 18 trở lên.
* **NPM** (đi kèm Node.js).
* Đảm bảo hệ thống Backend Microservices đã được khởi chạy (qua file `run.bat` ở thư mục gốc).

### 🛠️ Các bước thực hiện

1. **Di chuyển vào thư mục frontend:**
   ```bash
   cd e:\Web2_\e-commerce-microservices\frontend
   ```

2. **Cài đặt các gói thư viện phụ thuộc:**
   ```bash
   npm install
   ```

3. **Khởi chạy ứng dụng ở chế độ phát triển (Development Mode):**
   ```bash
   npm run dev
   ```

4. **Truy cập ứng dụng:**
   Mở trình duyệt web và truy cập địa chỉ: [http://localhost:5173](http://localhost:5173) hoặc [http://localhost:5174](http://localhost:5174) (tùy thuộc vào cổng hiển thị trên Terminal).
