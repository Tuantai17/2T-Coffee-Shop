import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// User Pages
import HomePage from "./pages/user/HomePage";
import ProductListPage from "./pages/user/ProductListPage";
import ProductDetailPage from "./pages/user/ProductDetailPage";
import CollectionDetailPage from "./pages/user/CollectionDetailPage";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import LoginPage from "./pages/user/LoginPage";
import RegisterPage from "./pages/user/RegisterPage";
import ForgotPasswordPage from "./pages/user/ForgotPasswordPage";
import VerifyOtpPage from "./pages/user/VerifyOtpPage";
import ResetPasswordPage from "./pages/user/ResetPasswordPage";
import OrderHistoryPage from "./pages/user/OrderHistoryPage";
import ProfilePage from "./pages/user/ProfilePage";
import AddressPage from "./pages/user/AddressPage";
import OrderSuccessPage from "./pages/user/OrderSuccessPage";
import LoyaltyRewardsPage from "./pages/user/LoyaltyRewardsPage";
import LoyaltyRewardSuccessPage from "./pages/user/LoyaltyRewardSuccessPage";

// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage";
import AdminProductPage from "./pages/admin/AdminProductPage";
import ProductTrashPage from "./pages/admin/ProductTrashPage";
import AdminCategoryPage from "./pages/admin/AdminCategoryPage";
import AdminToppingPage from "./pages/admin/AdminToppingPage";
import AdminOptionGroupPage from "./pages/admin/AdminOptionGroupPage";
import AdminOrderPage from "./pages/admin/AdminOrderPage";
import OrderEditPage from "./pages/admin/orders/OrderEditPage";
import AdminUserPage from "./pages/admin/AdminUserPage";
import AdminLoyaltyDashboard from "./pages/admin/loyalty/AdminLoyaltyDashboard";
import AdminLoyaltyMembers from "./pages/admin/loyalty/AdminLoyaltyMembers";
import AdminLoyaltyTiers from "./pages/admin/loyalty/AdminLoyaltyTiers";
import AdminLoyaltyRules from "./pages/admin/loyalty/AdminLoyaltyRules";
import AdminLoyaltyRewards from "./pages/admin/loyalty/AdminLoyaltyRewards";
import AdminVoucherDashboardPage from "./pages/admin/vouchers/AdminVoucherDashboardPage";
import VoucherStudioPage from "./pages/admin/vouchers/VoucherStudioPage";
import AdminRewardCreatePage from "./pages/admin/vouchers/AdminRewardCreatePage";
import AdminBannerPage from "./pages/admin/AdminBannerPage";
import AdminCollectionPage from "./pages/admin/AdminCollectionPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminNotificationPage from "./pages/admin/AdminNotificationPage";
import AdminMenuPage from "./pages/admin/AdminMenuPage";
import AdminPostListPage from "./pages/admin/posts/AdminPostListPage";
import AdminPostCreatePage from "./pages/admin/posts/AdminPostCreatePage";
import AdminPostEditPage from "./pages/admin/posts/AdminPostEditPage";
import AdminPostPreviewPage from "./pages/admin/posts/AdminPostPreviewPage";
import AdminPostCategoryPage from "./pages/admin/posts/AdminPostCategoryPage";

// Admin Check-in Pages
import CheckInDashboardPage from "./pages/admin/checkin/CheckInDashboardPage";
import CheckInConfigurationPage from "./pages/admin/checkin/CheckInConfigurationPage";
import RewardCycleListPage from "./pages/admin/checkin/RewardCycleListPage";
import RewardCycleDetailPage from "./pages/admin/checkin/RewardCycleDetailPage";
import CheckInCalendarPage from "./pages/admin/checkin/CheckInCalendarPage";
import MissionManagementPage from "./pages/admin/checkin/MissionManagementPage";
import RewardManagementPage from "./pages/admin/checkin/RewardManagementPage";
import AchievementManagementPage from "./pages/admin/checkin/AchievementManagementPage";
import CheckInUserListPage from "./pages/admin/checkin/CheckInUserListPage";
import CheckInUserDetailPage from "./pages/admin/checkin/CheckInUserDetailPage";
import CheckInHistoryPage from "./pages/admin/checkin/CheckInHistoryPage";
import CheckInFaqPage from "./pages/admin/checkin/CheckInFaqPage";


// Public News Pages
import NewsPage from "./pages/user/NewsPage";
import NewsDetailPage from "./pages/user/NewsDetailPage";

// Security
import ProtectedRoute from "./components/ProtectedRoute";

import { Toaster } from 'react-hot-toast';
import "./styles/voucher-loyalty.css";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/collections/:slug" element={<CollectionDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/loyalty/rewards" element={<ProtectedRoute><LoyaltyRewardsPage /></ProtectedRoute>} />
        <Route path="/loyalty/rewards/success" element={<ProtectedRoute><LoyaltyRewardSuccessPage /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<NewsDetailPage />} />

        {/* User Protected Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:orderId"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/info"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/loyalty"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/checkin"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/vouchers"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/addresses"
          element={
            <ProtectedRoute>
              <AddressPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/trash"
          element={
            <ProtectedRoute adminOnly={true}>
              <ProductTrashPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/toppings"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminToppingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/option-groups"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminOptionGroupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/trash"
          element={
            <ProtectedRoute adminOnly={true}>
              <ProductTrashPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders/:orderId/edit"
          element={
            <ProtectedRoute adminOnly={true}>
              <OrderEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/banners"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminBannerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/collections"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminCollectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vouchers"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminVoucherDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vouchers/create"
          element={
            <ProtectedRoute adminOnly={true}>
              <VoucherStudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vouchers/:id/edit"
          element={
            <ProtectedRoute adminOnly={true}>
              <VoucherStudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loyalty/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLoyaltyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loyalty/members"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLoyaltyMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loyalty/tiers"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLoyaltyTiers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loyalty/rules"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLoyaltyRules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loyalty/rewards"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLoyaltyRewards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loyalty/rewards/create"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminRewardCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminNotificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menus"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPostListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts/create"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPostCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts/:id/edit"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPostEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts/:id/preview"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPostPreviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/post-categories"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPostCategoryPage />
            </ProtectedRoute>
          }
        />
      
        {/* Admin Checkin Routes */}
        <Route path="/admin/check-in/dashboard" element={<ProtectedRoute adminOnly={true}><CheckInDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/check-in/configuration" element={<ProtectedRoute adminOnly={true}><CheckInConfigurationPage /></ProtectedRoute>} />
        <Route path="/admin/check-in/reward-cycles" element={<ProtectedRoute adminOnly={true}><RewardCycleListPage /></ProtectedRoute>} />
        <Route path="/admin/check-in/reward-cycles/:id" element={<ProtectedRoute adminOnly={true}><RewardCycleDetailPage /></ProtectedRoute>} />
        <Route path="/admin/check-in/calendar" element={<ProtectedRoute adminOnly={true}><CheckInCalendarPage /></ProtectedRoute>} />
        <Route path="/admin/check-in/missions" element={<ProtectedRoute adminOnly={true}><MissionManagementPage /></ProtectedRoute>} />
        <Route path="/admin/check-in/rewards" element={<ProtectedRoute adminOnly={true}><RewardManagementPage /></ProtectedRoute>} />
        <Route path="/admin/check-in/achievements" element={<ProtectedRoute adminOnly={true}><AchievementManagementPage /></ProtectedRoute>} />
        <Route path="/admin/check-in/users" element={<ProtectedRoute adminOnly={true}><CheckInUserListPage /></ProtectedRoute>} />
        <Route path="/admin/check-in/users/:userId" element={<ProtectedRoute adminOnly={true}><CheckInUserDetailPage /></ProtectedRoute>} />
        <Route path="/admin/check-in/history" element={<ProtectedRoute adminOnly={true}><CheckInHistoryPage /></ProtectedRoute>} />
        <Route path="/admin/check-in/faq" element={<ProtectedRoute adminOnly={true}><CheckInFaqPage /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
