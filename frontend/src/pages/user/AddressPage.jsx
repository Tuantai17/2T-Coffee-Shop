import React, { useEffect, useState, useCallback } from "react";
import { getUserProfile, getUserAddresses, createUserAddress, updateUserAddress, deleteUserAddress } from "../../services/authService";
import UserLayout from "../../layouts/UserLayout";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import ProfileSidebar from "./components/profile/ProfileSidebar";
import AddressCard from "./components/profile/AddressCard";
import AddressFormModal from "./components/profile/AddressFormModal";

function AddressPage() {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState(null);

  const { userId } = getAuthSession(AUTH_SCOPES.USER);

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false); return;
    }
    setLoading(true); setError("");
    try {
      const [profileRes, addressRes] = await Promise.all([
        getUserProfile(userId),
        getUserAddresses(userId)
      ]);
      setProfile(profileRes.data);
      // Sort addresses: default first
      const sortedAddresses = addressRes.data.sort((a, b) => {
        const isDefaultA = a.default || a.isDefault;
        const isDefaultB = b.default || b.isDefault;
        if (isDefaultA && !isDefaultB) return -1;
        if (!isDefaultA && isDefaultB) return 1;
        return 0;
      });
      setAddresses(sortedAddresses);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
      setError("Không thể tải thông tin sổ địa chỉ.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleOpenEdit = (address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = async (addressData) => {
    setIsSaving(true);
    try {
      if (editingAddress) {
        await updateUserAddress(userId, editingAddress.id, addressData);
      } else {
        await createUserAddress(userId, addressData);
      }
      setShowModal(false);
      setEditingAddress(null);
      loadData(); // Refresh list
    } catch (err) {
      console.error("Lỗi lưu địa chỉ:", err);
      alert("Đã xảy ra lỗi khi lưu địa chỉ.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      try {
        await deleteUserAddress(userId, addressId);
        loadData();
      } catch (err) {
        console.error("Lỗi xóa địa chỉ:", err);
        alert("Đã xảy ra lỗi khi xóa địa chỉ.");
      }
    }
  };

  const handleSetDefault = async (address) => {
    setSettingDefaultId(address.id);
    try {
      await updateUserAddress(userId, address.id, {
        ...address,
        default: true,
        isDefault: true
      });
      loadData();
    } catch (err) {
      console.error("Lỗi đặt mặc định:", err);
      alert("Đã xảy ra lỗi khi cập nhật.");
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <UserLayout>
      <div style={{ backgroundColor: "#FAF8F4", minHeight: "100vh", padding: "30px 0" }}>
        <div className="container" style={{ maxWidth: "1300px" }}>
          {loading && !profile ? (
            <div className="card shadow-sm border-0 rounded-4 py-5 text-center bg-white">
            <div className="spinner-border text-danger mx-auto mb-3" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <div className="text-muted">Đang tải sổ địa chỉ...</div>
          </div>
        ) : error && !profile ? (
          <div className="alert alert-danger rounded-4">
            {error} <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadData}>Thử lại</button>
          </div>
        ) : !profile ? (
          <div className="alert alert-warning rounded-4">Không tìm thấy thông tin tài khoản.</div>
        ) : (
          <div className="row g-4">
            {/* Sidebar (Left Column) */}
            <div className="col-lg-3">
              <ProfileSidebar profile={profile} />
            </div>

            {/* Main Content (Right Column) */}
            <div className="col-lg-9">
              <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="fw-bold mb-1">Sổ địa chỉ</h4>
                    <p className="text-muted mb-0 small">
                      <i className="fa-solid fa-circle-info text-primary me-1"></i> 
                      Địa chỉ mặc định sẽ hiển thị trong trang thông tin tài khoản.
                    </p>
                  </div>
                  <button className="btn btn-danger px-4 rounded-3 d-flex align-items-center gap-2 fw-medium" onClick={handleOpenAdd}>
                    <i className="fa-solid fa-plus"></i> Thêm địa chỉ mới
                  </button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                {loading && addresses.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border">
                    <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm mb-3" style={{ width: "80px", height: "80px" }}>
                      <i className="fa-solid fa-map-location-dot text-muted fs-1"></i>
                    </div>
                    <h5 className="fw-bold">Bạn chưa có địa chỉ nào</h5>
                    <p className="text-muted mb-4">Thêm địa chỉ giao hàng để thanh toán nhanh chóng hơn.</p>
                    <button className="btn btn-outline-danger px-4 rounded-pill fw-medium" onClick={handleOpenAdd}>
                      Thêm địa chỉ ngay
                    </button>
                  </div>
                ) : (
                  <div className="address-list">
                    {addresses.map(address => (
                      <AddressCard 
                        key={address.id} 
                        address={address} 
                        onEdit={handleOpenEdit} 
                        onDelete={handleDeleteAddress} 
                        onSetDefault={handleSetDefault}
                        isSettingDefault={settingDefaultId === address.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      <AddressFormModal 
        show={showModal} 
        onClose={handleCloseModal} 
        onSave={handleSaveAddress} 
        address={editingAddress} 
        isSaving={isSaving}
      />
    </UserLayout>
  );
}

export default AddressPage;
