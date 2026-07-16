import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getUserProfile, getUserAddresses } from "../../services/authService";
import UserLayout from "../../layouts/UserLayout";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import ProfileSidebar from "./components/profile/ProfileSidebar";
import ProfileInformationForm from "./components/profile/ProfileInformationForm";
import ProfileDashboard from "./components/profile/ProfileDashboard";
import ProfileLoyalty from "./components/profile/ProfileLoyalty";
import ProfileCheckin from "./components/profile/ProfileCheckin";
import ProfileVoucher from "./components/profile/ProfileVoucher";
import ProfileMiniGame from "./components/profile/ProfileMiniGame";
import ProfilePassword from "./components/profile/ProfilePassword";

import { getOrdersByUser } from "../../services/orderService";
import loyaltyApi from "../../api/loyaltyApi";
import miniGameApi from "../../api/miniGameApi";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  const { userId } = getAuthSession(AUTH_SCOPES.USER);

  const loadProfileData = useCallback(async (showLoading = true) => {
    if (!userId) {
      if (showLoading) setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    setError("");

    try {
      const [profileRes, addressRes, orderRes, loyaltyRes, miniGameRes] = await Promise.all([
        getUserProfile(userId),
        getUserAddresses(userId),
        getOrdersByUser(userId),
        loyaltyApi.getMyLoyaltyAccount().catch(() => ({ data: { availablePoints: 0 } })),
        miniGameApi.getMyGameSummary()
          .then((response) => ({ data: response?.data || null, unavailable: false }))
          .catch((miniGameError) => ({
            data: null,
            unavailable: [404, 502, 503, 504].includes(miniGameError?.response?.status),
          })),
      ]);
      const profileData = profileRes.data;
      if (loyaltyRes?.data) {
        profileData.loyaltyPoints = loyaltyRes.data.availablePoints || 0;
      }
      profileData.miniGameSummary = miniGameRes?.data || null;
      profileData.miniGameUnavailable = Boolean(miniGameRes?.unavailable);
      setProfile(profileData);
      setAddresses(addressRes.data);
      const sortedOrders = Array.isArray(orderRes.data) 
        ? orderRes.data.sort((a, b) => b.id - a.id)
        : [];
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu hồ sơ:", err);
      setError("Không thể tải thông tin tài khoản.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Determine what to render based on URL
  const isInfoPage = location.pathname.includes("/profile/info");
  const isLoyaltyPage = location.pathname.includes("/profile/loyalty");
  const isCheckinPage = location.pathname.includes("/profile/checkin");
  const isVoucherPage = location.pathname.includes("/profile/vouchers");
  const isMiniGamePage = location.pathname.includes("/profile/minigame");
  const isPasswordPage = location.pathname.includes("/profile/password");

  return (
    <UserLayout>
      <div style={{ backgroundColor: "#FAF8F4", minHeight: "100vh", padding: "30px 0" }}>
        <div className="container" style={{ maxWidth: "1300px" }}>
          {loading ? (
            <div className="card shadow-sm border-0 rounded-4 py-5 text-center bg-white">
              <div className="spinner-border text-danger mx-auto mb-3" role="status"></div>
              <div className="text-muted">Đang tải trung tâm tài khoản...</div>
            </div>
          ) : error ? (
            <div className="alert alert-danger rounded-4 d-flex align-items-center justify-content-between">
              <span>{error}</span>
              <button className="btn btn-sm btn-outline-danger" onClick={loadProfileData}>Thử lại</button>
            </div>
          ) : !profile ? (
            <div className="alert alert-warning rounded-4">
              Không tìm thấy thông tin tài khoản.
            </div>
          ) : (
            <div className="row g-4">
              {/* Sidebar (Left Column) */}
              <div className="col-lg-3">
                <ProfileSidebar profile={profile} />
              </div>

              {/* Main Content (Right Column) */}
              <div className="col-lg-9">
                {isInfoPage ? (
                  <ProfileInformationForm profile={profile} addresses={addresses} onUpdateSuccess={loadProfileData} />
                ) : isLoyaltyPage ? (
                  <ProfileLoyalty />
                ) : isCheckinPage ? (
                  <ProfileCheckin profile={profile} onUpdateSuccess={loadProfileData} />
                ) : isVoucherPage ? (
                  <ProfileVoucher profile={profile} />
                ) : isMiniGamePage ? (
                  <ProfileMiniGame
                    summary={profile?.miniGameSummary}
                    unavailable={profile?.miniGameUnavailable}
                  />
                ) : isPasswordPage ? (
                  <ProfilePassword profile={profile} />
                ) : (
                  <ProfileDashboard profile={profile} orders={orders} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

export default ProfilePage;
