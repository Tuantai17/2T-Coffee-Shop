import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getStoreContactInfo } from "../../../../services/contactPublicService";
import SupportChatWidget from "../support/SupportChatWidget";

function FloatingButtons() {
  const [zaloPhone, setZaloPhone] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchStoreContact = async () => {
      try {
        const res = await getStoreContactInfo();
        if (res?.data?.phone) {
          setZaloPhone(res.data.phone);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Lỗi lấy thông tin cửa hàng cho Zalo:", err);
        }
      }
    };
    fetchStoreContact();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleZaloClick = () => {
    if (zaloPhone) {
      // Remove any non-numeric characters for the Zalo link
      const cleanPhone = zaloPhone.replace(/\D/g, "");
      window.open(`https://zalo.me/${cleanPhone}`, "_blank");
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <div className="position-fixed end-0 bottom-0 p-4 d-flex flex-column gap-3" style={{ zIndex: 1040 }}>
        <motion.button 
          className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center border-0 text-white hover-scale"
          style={{ width: "50px", height: "50px", backgroundColor: "#0068FF" }}
          whileHover={{ scale: 1.1 }}
          title="Zalo"
          onClick={handleZaloClick}
        >
          <span className="fw-bold" style={{ fontSize: "14px" }}>Zalo</span>
        </motion.button>

        <div className="position-relative">
          <motion.button 
            className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center border-0 text-white hover-scale"
            style={{ width: "50px", height: "50px", backgroundColor: "var(--secondary-color)" }}
            whileHover={{ scale: 1.1 }}
            title="Chat Support"
            onClick={toggleChat}
          >
            <i className="fa-solid fa-headset fs-5"></i>
          </motion.button>
          
          {unreadCount > 0 && !isChatOpen && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        <motion.button 
          className="btn bg-white rounded-circle shadow d-flex align-items-center justify-content-center border hover-scale text-muted mt-2"
          style={{ width: "40px", height: "40px", alignSelf: "center" }}
          whileHover={{ scale: 1.1 }}
          onClick={scrollToTop}
          title="Back To Top"
        >
          <i className="fa-solid fa-arrow-up"></i>
        </motion.button>
      </div>

      <SupportChatWidget 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        onUnreadCountChange={setUnreadCount} 
      />
    </>
  );
}

export default FloatingButtons;
