import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { getUserProfile } from "../../services/authService";
import { getStoreContactInfo, submitContactMessage } from "../../services/contactPublicService";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";

function ContactPage() {
  const [storeInfo, setStoreInfo] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(true);

  const isRequestCanceled = (error) =>
    error?.code === "ERR_CANCELED" || error?.name === "CanceledError";

  useEffect(() => {
    const storeController = new AbortController();
    const profileController = new AbortController();

    const fetchInfo = async () => {
      try {
        const res = await getStoreContactInfo({ signal: storeController.signal });
        if (res?.data) {
          setStoreInfo(res.data);
        }
      } catch (err) {
        if (!isRequestCanceled(err) && !storeController.signal.aborted) {
          console.error("Lỗi lấy thông tin cửa hàng:", err);
        }
      } finally {
        if (!storeController.signal.aborted) {
          setFetchingInfo(false);
        }
      }
    };

    const fillUserInfo = async () => {
      const { userId } = getAuthSession(AUTH_SCOPES.USER);
      if (!userId) return;

      try {
        const res = await getUserProfile(userId, { signal: profileController.signal });
        if (res?.data) {
          const profile = res.data;
          const firstName = profile.userDetails?.firstName || "";
          const lastName = profile.userDetails?.lastName || "";
          setForm((prev) => ({
            ...prev,
            fullName: `${firstName} ${lastName}`.trim(),
            email: profile.userName || profile.userDetails?.email || "",
            phone: profile.userDetails?.phoneNumber || "",
          }));
        }
      } catch (err) {
        if (!isRequestCanceled(err) && !profileController.signal.aborted) {
          console.error("Lỗi lấy thông tin cá nhân:", err);
        }
      }
    };

    fetchInfo();
    fillUserInfo();

    return () => {
      storeController.abort();
      profileController.abort();
    };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!form.fullName.trim()) return "Họ và tên không được để trống.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return "Email không hợp lệ.";
    if (!form.phone.trim() || !/^[0-9+]{9,15}$/.test(form.phone.replace(/\s+/g, ""))) {
      return "Số điện thoại không hợp lệ.";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      return "Nội dung phải có ít nhất 10 ký tự.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    try {
      await submitContactMessage(form);
      toast.success("Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất có thể!");
      setForm((prev) => ({ ...prev, message: "" }));
    } catch (err) {
      console.error("Lỗi gửi liên hệ:", err);
      toast.error("Không thể gửi liên hệ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5" style={{ flex: 1, marginTop: "80px" }}>
        <div className="row g-4">
          <div className="col-lg-7 order-2 order-lg-1">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-lg-5 h-100">
              <div className="text-center mb-4">
                <h3 className="fw-bold mb-2" style={{ color: "var(--primary-color)" }}>
                  LIÊN HỆ VỚI CHÚNG TÔI
                </h3>
                <div className="d-flex justify-content-center mb-3">
                  <div
                    style={{
                      width: "60px",
                      height: "3px",
                      backgroundColor: "var(--secondary-color)",
                      borderRadius: "2px",
                    }}
                  ></div>
                </div>
                <p className="text-muted">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn!</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium small text-dark">
                      Họ và tên <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên"
                      style={{ borderRadius: "8px" }}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium small text-dark">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Nhập email"
                      style={{ borderRadius: "8px" }}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-medium small text-dark">
                      Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                      style={{ borderRadius: "8px" }}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-medium small text-dark">
                      Nội dung <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Nhập nội dung liên hệ của bạn..."
                      style={{ borderRadius: "8px", resize: "none" }}
                      disabled={loading}
                    ></textarea>
                  </div>
                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn w-100 fw-bold py-2 rounded-3 text-white shadow-sm"
                      style={{ backgroundColor: "var(--primary-color)" }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fa-solid fa-circle-notch fa-spin me-2"></i>ĐANG GỬI...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-paper-plane me-2"></i>GỬI LIÊN HỆ
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="col-lg-5 order-1 order-lg-2">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
              <div className="p-4 bg-white border-bottom">
                <h5
                  className="fw-bold mb-0 d-flex align-items-center gap-2"
                  style={{ color: "var(--primary-color)" }}
                >
                  <i className="fa-solid fa-mug-hot"></i> THÔNG TIN CỬA HÀNG
                </h5>
              </div>
              <div className="p-4 bg-white flex-grow-1">
                {fetchingInfo ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-secondary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                ) : storeInfo ? (
                  <div className="d-flex flex-column gap-4">
                    <div className="d-flex gap-3">
                      <div className="mt-1">
                        <i className="fa-solid fa-location-dot fs-5 text-danger"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">Địa chỉ</h6>
                        <p className="text-muted mb-0">
                          {storeInfo.address || "Chưa cập nhật địa chỉ"}
                        </p>
                      </div>
                    </div>
                    <div className="d-flex gap-3">
                      <div className="mt-1">
                        <i
                          className="fa-solid fa-phone fs-5"
                          style={{ color: "var(--primary-color)" }}
                        ></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">Số điện thoại</h6>
                        <p className="text-muted mb-0">
                          {storeInfo.phone || "Chưa cập nhật SĐT"}
                        </p>
                      </div>
                    </div>

                    {storeInfo.googleMapsUrl && (
                      <div className="mt-2 rounded-3 overflow-hidden border shadow-sm" style={{ height: "250px" }}>
                        {storeInfo.googleMapsUrl.includes("<iframe") ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: storeInfo.googleMapsUrl
                                .replace(/width="[^"]+"/, 'width="100%"')
                                .replace(/height="[^"]+"/, 'height="100%"'),
                            }}
                            style={{ width: "100%", height: "100%" }}
                          />
                        ) : (
                          <iframe
                            src={storeInfo.googleMapsUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Google Maps"
                          ></iframe>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    Thông tin cửa hàng chưa được cập nhật.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ContactPage;
