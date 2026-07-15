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
import PaymentResultPage from "./pages/user/PaymentResultPage";
import GameCenterPage from "./pages/user/GameCenterPage";
import MiniGamePlayPage from "./pages/user/MiniGamePlayPage";

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

// Admin Check-in (single-page module with tabs)
import CheckInManagementPage from "./pages/admin/checkin/CheckInManagementPage";
import MiniGameManagementPage from "./pages/admin/minigame/MiniGameManagementPage";


// Public News & Contact Pages
import NewsPage from "./pages/user/NewsPage";
import NewsDetailPage from "./pages/user/NewsDetailPage";
import ContactPage from "./pages/user/ContactPage";

// Admin Contacts
import AdminStoreContactPage from "./pages/admin/contacts/AdminStoreContactPage";
import AdminContactListPage from "./pages/admin/contacts/AdminContactListPage";

// Admin Support Chat
import AdminSupportPage from "./pages/admin/support/AdminSupportPage";

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
        <Route path="/voucher" element={<LoyaltyRewardsPage />} />
        <Route path="/loyalty/rewards" element={<ProtectedRoute><LoyaltyRewardsPage /></ProtectedRoute>} />
        <Route path="/loyalty/rewards/success" element={<ProtectedRoute><LoyaltyRewardSuccessPage /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<NewsDetailPage />} />
        
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/lien-he" element={<ContactPage />} />

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
          path="/payment/vnpay/result"
          element={
            <ProtectedRoute>
              <PaymentResultPage />
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
        <Route
          path="/profile/minigame"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Mini-Game User Routes */}
        <Route
          path="/games"
          element={
            <ProtectedRoute>
              <GameCenterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/:slug"
          element={
            <ProtectedRoute>
              <MiniGamePlayPage />
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
        
        {/* Admin Contact Management */}
        <Route
          path="/admin/store-contact"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminStoreContactPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contacts"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminContactListPage />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Support Chat */}
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminSupportPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Mini-Game Management */}
        <Route
          path="/admin/mini-games"
          element={
            <ProtectedRoute adminOnly={true}>
              <MiniGameManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mini-games/*"
          element={
            <ProtectedRoute adminOnly={true}>
              <MiniGameManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Check-in: single-page module (tabs: dashboard / programs / history / settings) */}
        <Route
          path="/admin/check-in"
          element={
            <ProtectedRoute adminOnly={true}>
              <CheckInManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/check-in/*"
          element={
            <ProtectedRoute adminOnly={true}>
              <CheckInManagementPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
