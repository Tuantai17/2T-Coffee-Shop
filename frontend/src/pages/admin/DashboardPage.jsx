import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getUsers } from "../../services/authService";
import { getAllOrders } from "../../services/orderService";
import {
  getBanners,
  getCategories,
  getCollections,
  getProducts,
} from "../../services/productService";
import DashboardChart from "./components/DashboardChart";
import DashboardHeading from "./components/DashboardHeading";
import DashboardStatCard from "./components/DashboardStatCard";
import RecentOrders from "./components/RecentOrders";

function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    pendingOrders: 0,
    paidOrders: 0,
    banners: 0,
    collections: 0,
  });
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [productsRes, categoriesRes, ordersRes, usersRes, bannersRes, collectionsRes] =
          await Promise.all([
            getProducts(),
            getCategories(),
            getAllOrders(),
            getUsers(),
            getBanners({ activeOnly: false }),
            getCollections({ activeOnly: false }),
          ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        setOrdersList(orders);
        
        const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        const pendingOrders = orders.filter((order) =>
          ["PENDING_CONFIRMATION", "PENDING", "PROCESSING"].includes(
            String(order.status || "").toUpperCase()
          )
        ).length;
        const paidOrders = orders.filter((order) =>
          ["PAID", "PAYMENT_ON_DELIVERY", "COMPLETED"].includes(
            String(order.paymentStatus || "").toUpperCase()
          )
        ).length;

        setStats({
          products: Array.isArray(productsRes.data) ? productsRes.data.length : 0,
          categories: Array.isArray(categoriesRes.data) ? categoriesRes.data.length : 0,
          orders: orders.length,
          users: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
          revenue,
          pendingOrders,
          paidOrders,
          banners: Array.isArray(bannersRes.data) ? bannersRes.data.length : 0,
          collections: Array.isArray(collectionsRes.data) ? collectionsRes.data.length : 0,
        });
      } catch (nextError) {
        console.error("Lỗi tải dashboard:", nextError);
        setError(
          "Không thể tải dashboard từ các microservice. Hãy kiểm tra gateway, user-service, order-service và product-catalog-service."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const moneyFormatter = new Intl.NumberFormat("vi-VN");

  return (
    <AdminLayout>
      <div className="container-fluid px-0">
        <DashboardHeading />

        {error && <div className="alert alert-danger rounded-4 neu-surface mb-4 border-0 shadow-sm">{error}</div>}

        <div className="row g-4 mb-4">
          <div className="col-md-6 col-xl-3">
            <DashboardStatCard 
              title="Tổng doanh thu"
              value={`${moneyFormatter.format(stats.revenue)}đ`}
              icon="fa-dollar-sign"
              color="success"
              percent="18.6"
              isIncrease={true}
              subtext="So với 7 ngày trước"
              loading={loading}
            />
          </div>
          <div className="col-md-6 col-xl-3">
            <DashboardStatCard 
              title="Tổng đơn hàng"
              value={stats.orders}
              icon="fa-cart-shopping"
              color="primary"
              percent="12.4"
              isIncrease={true}
              subtext="So với 7 ngày trước"
              loading={loading}
            />
          </div>
          <div className="col-md-6 col-xl-3">
            <DashboardStatCard 
              title="Tổng sản phẩm"
              value={stats.products}
              icon="fa-box"
              color="warning"
              percent="8.7"
              isIncrease={true}
              subtext="So với 7 ngày trước"
              loading={loading}
            />
          </div>
          <div className="col-md-6 col-xl-3">
            <DashboardStatCard 
              title="Tổng người dùng"
              value={stats.users}
              icon="fa-users"
              color="danger"
              percent="15.3"
              isIncrease={true}
              subtext="So với 7 ngày trước"
              loading={loading}
            />
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-xl-8">
            <DashboardChart loading={loading} />
          </div>
          <div className="col-xl-4">
            <RecentOrders orders={ordersList} loading={loading} />
          </div>
        </div>
        
        {/* Quick Actions Component */}
        <div className="neu-card p-4">
          <h5 className="fw-bold mb-3">Thao tác nhanh</h5>
          <div className="d-flex flex-wrap gap-3">
            <div className="neu-pill px-4">
              <i className="fa-solid fa-box text-primary"></i>
              Thêm sản phẩm
            </div>
            <div className="neu-pill px-4">
              <i className="fa-solid fa-folder text-success"></i>
              Thêm danh mục
            </div>
            <div className="neu-pill px-4">
              <i className="fa-solid fa-panorama text-danger"></i>
              Thêm banner
            </div>
            <div className="neu-pill px-4">
              <i className="fa-solid fa-layer-group text-warning"></i>
              Thêm collection
            </div>
            <div className="neu-pill px-4">
              <i className="fa-solid fa-file-invoice text-info"></i>
              Xem đơn hàng
            </div>
            <div className="neu-pill px-4">
              <i className="fa-solid fa-users text-secondary"></i>
              Quản lý người dùng
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default DashboardPage;
