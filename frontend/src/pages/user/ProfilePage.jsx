import React, { useEffect, useState, useCallback } from "react";
import { getUserProfile } from "../../services/authService";
import UserLayout from "../../layouts/UserLayout";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import ProfileSidebar from "./components/profile/ProfileSidebar";
import ProfileInformationForm from "./components/profile/ProfileInformationForm";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { userId } = getAuthSession(AUTH_SCOPES.USER);

  const loadProfileData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const profileRes = await getUserProfile(userId);
      setProfile(profileRes.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu hồ sơ:", err);
      setError("Không thể tải thông tin tài khoản.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  return (
    <UserLayout>
      <div className="container py-4" style={{ maxWidth: "1200px" }}>
        {loading ? (
          <div className="card shadow-sm border-0 rounded-4 py-5 text-center">
            <div className="spinner-border text-danger mx-auto mb-3" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <div className="text-muted">Đang tải hồ sơ khách hàng...</div>
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
              <ProfileInformationForm profile={profile} onUpdateSuccess={loadProfileData} />
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default ProfilePage;
