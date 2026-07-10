import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function FloatingMiniCart({ cartCount }) {
  if (cartCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="position-fixed z-3 d-md-none"
        style={{ bottom: "20px", right: "20px" }}
      >
        <Link 
          to="/cart" 
          className="btn btn-danger rounded-pill shadow-lg d-flex align-items-center gap-2 px-4 py-3 border border-white"
          style={{ border: "2px solid #fff" }}
        >
          <div className="position-relative">
            <i className="fa-solid fa-cart-shopping fs-5"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark border border-white" style={{ fontSize: "0.6rem" }}>
              {cartCount}
            </span>
          </div>
          <span className="fw-bold ms-2">Thanh toán</span>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}

export default FloatingMiniCart;
