import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUserAddresses } from "../../../../services/authService";
import { getStoreContactInfo } from "../../../../services/contactPublicService";
import { AUTH_SCOPES, getAuthSession } from "../../../../utils/authStorage";
import "./QuickOrder.css";

/**
 * Khối Giao hàng / Nhận tại cửa hàng — đặt SAU banner.
 * Desktop: chồng nhẹ tối đa ~24–32px.
 * Mobile: hoàn toàn bên dưới banner, không che ảnh.
 */
function QuickOrder() {
  const [activeTab, setActiveTab] = useState("delivery");
  const [defaultAddress, setDefaultAddress] = useState("");
  const [storeInfo, setStoreInfo] = useState({ address: "Đang tải địa chỉ...", phone: "", googleMapsUrl: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAddress = async () => {
      const { userId } = getAuthSession(AUTH_SCOPES.USER);
      if (userId) {
        try {
          const res = await getUserAddresses(userId);
          const addresses = res.data || [];
          if (addresses.length > 0) {
            const defAddr = addresses.find(a => a.default || a.isDefault) || addresses[0];
            const fullAddr = [defAddr.addressLine, defAddr.ward, defAddr.district, defAddr.province].filter(Boolean).join(", ");
            setDefaultAddress(fullAddr);
          }
        } catch (err) {
          console.error("Lỗi lấy địa chỉ giao hàng:", err);
        }
      }
    };
    fetchAddress();

    const fetchStoreContact = async () => {
      try {
        const res = await getStoreContactInfo();
        if (res?.data?.address) {
          setStoreInfo({
            address: res.data.address,
            phone: res.data.phone || "Chưa cập nhật SĐT",
            googleMapsUrl: res.data.googleMapsUrl || ""
          });
        } else {
          setStoreInfo({ address: "Chưa cập nhật địa chỉ cửa hàng", phone: "Chưa cập nhật SĐT", googleMapsUrl: "" });
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Lỗi lấy thông tin cửa hàng:", err);
        }
        setStoreInfo({ address: "Chưa cập nhật địa chỉ cửa hàng", phone: "Chưa cập nhật SĐT", googleMapsUrl: "" });
      }
    };
    fetchStoreContact();
  }, []);

  const handleOpenMaps = (e) => {
    e.stopPropagation();
    if (storeInfo.address && storeInfo.address !== "Chưa cập nhật địa chỉ cửa hàng") {
      const query = encodeURIComponent(storeInfo.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    }
  };

  return (
    <div className="home-quick-order">
      <div className="container">
        <motion.div
          className="brew-card p-0 overflow-hidden shadow-lg home-quick-order__card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className="row g-0">
            {/* Delivery */}
            <div
              className="col-md-6 p-3 p-md-4 d-flex align-items-center cursor-pointer home-quick-order__pane"
              onClick={() => setActiveTab("delivery")}
              style={{
                backgroundColor: activeTab === "delivery" ? "var(--light-cream)" : "#F8F5F0",
                borderRight: "1px solid #EAEAEA",
              }}
            >
              <div
                className="bg-white rounded-circle shadow-sm p-3 me-3 me-md-4 text-center d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "64px", height: "64px" }}
              >
                <i
                  className="fa-solid fa-motorcycle fs-4"
                  style={{
                    color: activeTab === "delivery" ? "var(--secondary-color)" : "var(--gray-text)",
                  }}
                />
              </div>
              <div className="flex-grow-1 min-w-0">
                <h5
                  className="fw-bold mb-1"
                  style={{
                    color: activeTab === "delivery" ? "var(--primary-color)" : "var(--gray-text)",
                  }}
                >
                  Giao hàng tận nơi
                </h5>
                <p className="text-muted small mb-2 mb-md-3">Giao nhanh 30-45 phút</p>
                {activeTab === "delivery" && (
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <div className="position-relative flex-grow-1">
                      <i className="fa-solid fa-location-dot position-absolute top-50 start-0 translate-middle-y ms-3 text-danger" />
                      <input
                        type="text"
                        className="form-control form-brew-control ps-5 cursor-pointer"
                        placeholder="Nhập địa chỉ giao hàng..."
                        value={defaultAddress}
                        readOnly
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/profile/addresses");
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-brew-primary rounded-pill px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Đặt ngay
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pickup */}
            <div
              className="col-md-6 p-3 p-md-4 d-flex align-items-center cursor-pointer home-quick-order__pane"
              onClick={() => setActiveTab("pickup")}
              style={{
                backgroundColor: activeTab === "pickup" ? "var(--light-cream)" : "#F8F5F0",
              }}
            >
              <div
                className="bg-white rounded-circle shadow-sm p-3 me-3 me-md-4 text-center d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "64px", height: "64px" }}
              >
                <i
                  className="fa-solid fa-store fs-4"
                  style={{
                    color: activeTab === "pickup" ? "var(--secondary-color)" : "var(--gray-text)",
                  }}
                />
              </div>
              <div className="flex-grow-1 min-w-0">
                <h5
                  className="fw-bold mb-1"
                  style={{
                    color: activeTab === "pickup" ? "var(--primary-color)" : "var(--gray-text)",
                  }}
                >
                  Nhận tại cửa hàng
                </h5>
                <p className="text-muted small mb-2 mb-md-3 text-truncate" title={storeInfo.address}>
                  {storeInfo.address}
                </p>
                {activeTab === "pickup" && (
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
                    <div>
                      <div className="small fw-medium d-flex align-items-center text-dark">
                        <i className="fa-solid fa-phone me-2 text-primary" />
                        Hotline: {storeInfo.phone}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-4 border-1 text-dark fw-semibold mt-2 mt-sm-0"
                      onClick={handleOpenMaps}
                    >
                      Chọn ngay
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default QuickOrder;
