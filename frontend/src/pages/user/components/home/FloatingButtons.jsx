import { motion } from "framer-motion";

function FloatingButtons() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="position-fixed end-0 bottom-0 p-4 d-flex flex-column gap-3" style={{ zIndex: 1040 }}>
      <motion.button 
        className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center border-0 text-white hover-scale"
        style={{ width: "50px", height: "50px", backgroundColor: "#0084FF" }}
        whileHover={{ scale: 1.1 }}
        title="Messenger"
      >
        <i className="fa-brands fa-facebook-messenger fs-4"></i>
      </motion.button>
      
      <motion.button 
        className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center border-0 text-white hover-scale"
        style={{ width: "50px", height: "50px", backgroundColor: "#0068FF" }}
        whileHover={{ scale: 1.1 }}
        title="Zalo"
      >
        <span className="fw-bold" style={{ fontSize: "14px" }}>Zalo</span>
      </motion.button>

      <motion.button 
        className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center border-0 text-white hover-scale"
        style={{ width: "50px", height: "50px", backgroundColor: "var(--secondary-color)" }}
        whileHover={{ scale: 1.1 }}
        title="Chat Support"
      >
        <i className="fa-solid fa-headset fs-5"></i>
      </motion.button>

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
  );
}

export default FloatingButtons;
