import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../../../utils/formatPrice';
import { resolveImageUrl, applyImageFallback } from '../../../../utils/imageFallback';

function QuickViewModal({ product, isOpen, onClose, onAddToCart }) {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedSugar, setSelectedSugar] = useState('100%');
  const [selectedIce, setSelectedIce] = useState('100%');
  
  // Mock calculate price based on size
  const basePrice = product.price * (1 - (product.discount || 0) / 100);
  const sizePrice = selectedSize === 'S' ? -5000 : (selectedSize === 'L' ? 10000 : 0);
  const finalPrice = basePrice + sizePrice;

  const handleAddToCart = () => {
    // In real app, we would pass options too
    onAddToCart(product.id, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-absolute w-100 h-100 bg-dark"
            style={{ opacity: 0.5 }}
            onClick={onClose}
          ></motion.div>

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-4 shadow-lg position-relative overflow-hidden z-3 mx-3"
            style={{ width: "100%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
          >
            <button 
              className="btn position-absolute top-0 end-0 m-3 rounded-circle bg-light d-flex align-items-center justify-content-center hover-scale shadow-sm z-3"
              style={{ width: "40px", height: "40px" }}
              onClick={onClose}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="row g-0 flex-grow-1 overflow-auto">
              <div className="col-md-5 bg-light d-flex align-items-center justify-content-center p-4">
                <img 
                  src={resolveImageUrl(product.imageUrl)} 
                  alt={product.name}
                  className="img-fluid rounded-4 shadow-sm"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                  onError={(e) => applyImageFallback(e)}
                />
              </div>
              <div className="col-md-7 p-4 p-md-5">
                <span className="badge bg-danger rounded-pill mb-2">Thức uống</span>
                <h3 className="fw-bold text-dark mb-2">{product.name}</h3>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <h4 className="fw-bold mb-0" style={{ color: "var(--secondary-color)" }}>{formatPrice(finalPrice)}</h4>
                  {sizePrice !== 0 && <span className="text-muted small">(Đã tính phí Size {selectedSize})</span>}
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3">KÍCH CỠ</h6>
                  <div className="d-flex gap-2">
                    {['S', 'M', 'L'].map(size => (
                      <button 
                        key={size}
                        className={`btn rounded-pill px-4 py-2 fw-semibold transition-all ${selectedSize === size ? 'btn-brew-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3">LƯỢNG ĐƯỜNG</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    {['0%', '30%', '50%', '70%', '100%'].map(sugar => (
                      <button 
                        key={sugar}
                        className={`btn rounded-pill px-3 py-1 text-sm fw-medium transition-all ${selectedSugar === sugar ? 'bg-dark text-white' : 'bg-light text-dark'}`}
                        onClick={() => setSelectedSugar(sugar)}
                        style={{ border: "1px solid #e2e8f0" }}
                      >
                        {sugar}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3">LƯỢNG ĐÁ</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    {['0%', '30%', '50%', '70%', '100%'].map(ice => (
                      <button 
                        key={ice}
                        className={`btn rounded-pill px-3 py-1 text-sm fw-medium transition-all ${selectedIce === ice ? 'bg-dark text-white' : 'bg-light text-dark'}`}
                        onClick={() => setSelectedIce(ice)}
                        style={{ border: "1px solid #e2e8f0" }}
                      >
                        {ice}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="my-4" />

                <div className="d-flex gap-3 align-items-center">
                  <div className="d-flex align-items-center bg-light rounded-pill p-1 border">
                    <button className="btn rounded-circle" onClick={() => setQuantity(Math.max(1, quantity - 1))}><i className="fa-solid fa-minus small"></i></button>
                    <span className="fw-bold px-3">{quantity}</span>
                    <button className="btn rounded-circle" onClick={() => setQuantity(quantity + 1)}><i className="fa-solid fa-plus small"></i></button>
                  </div>
                  <button 
                    className="btn btn-brew-primary flex-grow-1 rounded-pill py-3 fw-bold shadow hover-scale d-flex align-items-center justify-content-center gap-2"
                    onClick={handleAddToCart}
                  >
                    <i className="fa-solid fa-cart-plus"></i>
                    THÊM VÀO GIỎ - {formatPrice(finalPrice * quantity)}
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default QuickViewModal;
