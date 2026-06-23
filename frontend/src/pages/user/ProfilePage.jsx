import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createUserAddress,
  deleteUserAddress,
  deleteWishlistItem,
  getUserAddresses,
  getUserProfile,
  getWishlist,
} from "../../services/authService";
import UserLayout from "../../layouts/UserLayout";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";

const emptyAddressForm = {
  label: "Nhà riêng",
  receiverName: "",
  phoneNumber: "",
  addressLine: "",
  ward: "",
  district: "",
  province: "",
  default: false,
};

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState("");

  const { userId } = getAuthSession(AUTH_SCOPES.USER);

  const loadProfileData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [profileRes, addressesRes, wishlistRes] = await Promise.all([
        getUserProfile(userId),
        getUserAddresses(userId),
        getWishlist(userId),
      ]);
      setProfile(profileRes.data);
      setAddresses(Array.isArray(addressesRes.data) ? addressesRes.data : []);
      setWishlist(Array.isArray(wishlistRes.data) ? wishlistRes.data : []);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu hồ sơ:", err);
      setError("Không thể tải thông tin tài khoản, sổ địa chỉ hoặc wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAddressForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAddress = async (event) => {
    event.preventDefault();
    if (!userId) {
      return;
    }

    setSavingAddress(true);
    try {
      await createUserAddress(userId, addressForm);
      setAddressForm(emptyAddressForm);
      await loadProfileData();
      alert("Đã thêm địa chỉ nhận hàng thành công!");
    } catch (err) {
      console.error("Lỗi thêm địa chỉ:", err);
      alert("Không thể thêm địa chỉ mới.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!userId || !window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      return;
    }

    try {
      await deleteUserAddress(userId, addressId);
      await loadProfileData();
    } catch (err) {
      console.error("Lỗi xóa địa chỉ:", err);
      alert("Không thể xóa địa chỉ.");
    }
  };

  const handleRemoveWishlist = async (wishlistItemId) => {
    if (!userId) {
      return;
    }

    try {
      await deleteWishlistItem(userId, wishlistItemId);
      await loadProfileData();
    } catch (err) {
      console.error("Lỗi xóa wishlist:", err);
      alert("Không thể xóa sản phẩm khỏi wishlist.");
    }
  };

  return (
    <UserLayout>
      <div className="container mt-4">
        <div className="text-center mb-4">
          <h3 className="fw-bold text-danger mb-1">TÀI KHOẢN KHÁCH HÀNG</h3>
          <p className="text-muted mb-0">
            Quản lý thông tin, địa chỉ giao hàng và danh sách yêu thích theo cấu trúc MyKingdom.
          </p>
        </div>

        {loading ? (
          <div className="card shadow-sm border-0 rounded-5 py-5 text-center">
            <div className="spinner-border text-danger mx-auto mb-3" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <div className="text-muted">Đang tải hồ sơ khách hàng...</div>
          </div>
        ) : error ? (
          <div className="alert alert-danger rounded-4">{error}</div>
        ) : !profile ? (
          <div className="alert alert-warning rounded-4">
            Không tìm thấy thông tin tài khoản.
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-xl-4">
              <div className="card shadow-sm border-0 rounded-5 p-4 h-100">
                <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-4">
                  <div
                    className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "64px", height: "64px" }}
                  >
                    <i className="fa-solid fa-user fs-3"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-1">
                      {profile.userDetails
                        ? `${profile.userDetails.firstName} ${profile.userDetails.lastName}`
                        : "Chưa cập nhật"}
                    </h5>
                    <span className="badge bg-warning text-dark fw-bold">
                      {profile.role ? profile.role.roleName : "ROLE_USER"}
                    </span>
                  </div>
                </div>

                <div className="mb-3 border-bottom pb-2">
                  <span className="text-muted d-block small">Tên đăng nhập</span>
                  <span className="fw-bold">{profile.userName}</span>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="text-muted d-block small">Email</span>
                  <span className="fw-bold">
                    {profile.userDetails ? profile.userDetails.email : "N/A"}
                  </span>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="text-muted d-block small">Số điện thoại</span>
                  <span className="fw-bold">
                    {profile.userDetails?.phoneNumber || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="mb-4 border-bottom pb-2">
                  <span className="text-muted d-block small">Trạng thái</span>
                  <span
                    className={`badge ${profile.active === 1 ? "bg-success" : "bg-secondary"} px-3 py-2 rounded-pill`}
                  >
                    {profile.active === 1 ? "Hoạt động" : "Tạm khóa"}
                  </span>
                </div>

                <div className="row g-3 text-center">
                  <div className="col-6">
                    <div className="bg-light rounded-4 p-3">
                      <div className="small text-muted">Địa chỉ</div>
                      <div className="fw-bold fs-4 text-danger">{addresses.length}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light rounded-4 p-3">
                      <div className="small text-muted">Wishlist</div>
                      <div className="fw-bold fs-4 text-danger">{wishlist.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-8">
              <div className="card shadow-sm border-0 rounded-5 p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h4 className="fw-bold mb-1">Sổ địa chỉ</h4>
                    <p className="text-muted mb-0">
                      Groundwork để tái sử dụng cho checkout ở các phase tiếp theo.
                    </p>
                  </div>
                </div>

                <form className="row g-3 mb-4" onSubmit={handleAddAddress}>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Nhãn</label>
                    <select
                      className="form-select rounded-4"
                      name="label"
                      value={addressForm.label}
                      onChange={handleAddressChange}
                    >
                      <option value="Nhà riêng">Nhà riêng</option>
                      <option value="Cơ quan">Cơ quan</option>
                      <option value="Người thân">Người thân</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Người nhận</label>
                    <input
                      className="form-control rounded-4"
                      name="receiverName"
                      value={addressForm.receiverName}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Số điện thoại</label>
                    <input
                      className="form-control rounded-4"
                      name="phoneNumber"
                      value={addressForm.phoneNumber}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Địa chỉ chi tiết</label>
                    <input
                      className="form-control rounded-4"
                      name="addressLine"
                      value={addressForm.addressLine}
                      onChange={handleAddressChange}
                      placeholder="Số nhà, tên đường, khu dân cư..."
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Phường / Xã</label>
                    <input
                      className="form-control rounded-4"
                      name="ward"
                      value={addressForm.ward}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Quận / Huyện</label>
                    <input
                      className="form-control rounded-4"
                      name="district"
                      value={addressForm.district}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Tỉnh / Thành phố</label>
                    <input
                      className="form-control rounded-4"
                      name="province"
                      value={addressForm.province}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        id="defaultAddress"
                        className="form-check-input"
                        type="checkbox"
                        name="default"
                        checked={addressForm.default}
                        onChange={handleAddressChange}
                      />
                      <label htmlFor="defaultAddress" className="form-check-label">
                        Đặt làm địa chỉ mặc định
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-danger rounded-pill px-4 fw-bold"
                      disabled={savingAddress}
                    >
                      {savingAddress ? "Đang lưu..." : "Thêm địa chỉ mới"}
                    </button>
                  </div>
                </form>

                <div className="row g-3">
                  {addresses.length === 0 ? (
                    <div className="text-muted">Bạn chưa có địa chỉ giao hàng nào.</div>
                  ) : (
                    addresses.map((address) => (
                      <div className="col-md-6" key={address.id}>
                        <div className="border rounded-4 p-3 h-100">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <div className="fw-bold">{address.receiverName}</div>
                              <div className="small text-muted">{address.label}</div>
                            </div>
                            {address.default && (
                              <span className="badge bg-success rounded-pill">Mặc định</span>
                            )}
                          </div>
                          <div className="small mb-1">{address.phoneNumber}</div>
                          <div className="small text-muted mb-3">
                            {[address.addressLine, address.ward, address.district, address.province]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            Xóa địa chỉ
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card shadow-sm border-0 rounded-5 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h4 className="fw-bold mb-1">Wishlist</h4>
                    <p className="text-muted mb-0">
                      Danh sách yêu thích được lưu riêng ở `user-service`.
                    </p>
                  </div>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-muted">
                    Chưa có sản phẩm nào trong wishlist. Hãy thêm từ trang chi tiết sản phẩm.
                  </div>
                ) : (
                  <div className="row g-3">
                    {wishlist.map((item) => (
                      <div className="col-md-6" key={item.id}>
                        <div className="border rounded-4 p-3 h-100 d-flex gap-3">
                          <img
                            src={item.imageUrl || "/mykingdom_banner.png"}
                            alt={item.productName}
                            style={{ width: "88px", height: "88px", objectFit: "cover", borderRadius: "16px" }}
                          />
                          <div className="flex-grow-1 d-flex flex-column">
                            <h6 className="fw-bold mb-1">{item.productName}</h6>
                            <div className="text-danger fw-semibold mb-3">
                              {Number(item.price || 0).toLocaleString("vi-VN")} VNĐ
                            </div>
                            <div className="mt-auto d-flex gap-2">
                              <Link
                                to={item.productId ? `/products/${item.productId}` : "/products"}
                                className="btn btn-sm btn-outline-danger rounded-pill"
                              >
                                Xem sản phẩm
                              </Link>
                              <button
                                type="button"
                                className="btn btn-sm btn-light border rounded-pill"
                                onClick={() => handleRemoveWishlist(item.id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default ProfilePage;
