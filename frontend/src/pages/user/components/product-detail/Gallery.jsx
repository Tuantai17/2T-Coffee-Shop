import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveImageUrl, applyImageFallback, DEFAULT_IMAGE_FALLBACK } from '../../../../utils/imageFallback';

function Gallery({ product }) {
  const hasDiscount = product && product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  let gallery = [];
  if (product?.imageUrl) {
    gallery.push(product.imageUrl);
  }
  if (product?.imageUrls?.length > 0) {
    product.imageUrls.forEach(url => {
      if (url !== product.imageUrl) {
        gallery.push(url);
      }
    });
  }
  if (gallery.length === 0) {
    gallery.push("https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500");
  }

  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const handleNext = (e) => {
    e.stopPropagation();
    const idx = gallery.indexOf(activeImage);
    setActiveImage(gallery[(idx + 1) % gallery.length]);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    const idx = gallery.indexOf(activeImage);
    setActiveImage(gallery[(idx - 1 + gallery.length) % gallery.length]);
  };

  return (
    <div>
      {/* Main Image */}
      <div 
        className="overflow-hidden position-relative mb-3 d-flex align-items-center justify-content-center"
        style={{ aspectRatio: "1 / 1", cursor: "zoom-in" }}
        onClick={() => setIsZoomOpen(true)}
      >
        {/* Badges Overlay */}
        <div className="position-absolute top-0 start-0 p-3 d-flex flex-column gap-2" style={{ zIndex: 4 }}>
          {hasDiscount && (
            <span className="badge bg-danger px-3 py-2 rounded-pill fw-bold" style={{ fontSize: "0.85rem" }}>
              -{discountPercentage}% OFF
            </span>
          )}
          {product?.isNew && (
            <span className="badge px-3 py-2 rounded-pill fw-bold" style={{ backgroundColor: "#00c853", color: "white", fontSize: "0.85rem" }}>
              NEW
            </span>
          )}
          {product?.isBestSeller && (
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold" style={{ fontSize: "0.85rem" }}>
              BEST SELLER
            </span>
          )}
        </div>

        {product?.quantity <= 0 && (
          <div className="position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(255,255,255,0.7)", zIndex: 3 }}>
            <span className="bg-dark text-white px-4 py-2 rounded-pill fw-bold fs-5 shadow">Hết hàng</span>
          </div>
        )}

        {/* Carousel Buttons */}
        {gallery.length > 1 && (
          <>
            <button 
              className="btn btn-light position-absolute start-0 top-50 translate-middle-y ms-3 rounded-circle shadow-sm d-flex align-items-center justify-content-center border"
              onClick={handlePrev}
              style={{ width: "45px", height: "45px", zIndex: 5 }}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button 
              className="btn btn-light position-absolute end-0 top-50 translate-middle-y me-3 rounded-circle shadow-sm d-flex align-items-center justify-content-center border"
              onClick={handleNext}
              style={{ width: "45px", height: "45px", zIndex: 5 }}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            src={resolveImageUrl(activeImage)}
            alt={product?.name || "Product"}
            className="w-100 h-100 transition-all hover-zoom"
            style={{ objectFit: "contain" }}
            onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)}
          />
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="d-flex gap-3 overflow-auto hide-scrollbar pb-2 justify-content-center" style={{ scrollSnapType: "x mandatory" }}>
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              className={`btn p-0 border-2 rounded-4 overflow-hidden shadow-sm transition-all flex-shrink-0 ${activeImage === image ? "border-danger scale-up" : "border-white opacity-75"}`}
              onClick={() => setActiveImage(image)}
              style={{ width: "80px", height: "80px", scrollSnapAlign: "start" }}
            >
              <img
                src={resolveImageUrl(image)}
                alt={`Thumb ${index + 1}`}
                className="w-100 h-100 object-fit-cover"
                onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal show d-block" 
            style={{ backgroundColor: "rgba(0,0,0,0.95)", zIndex: 1050 }}
            onClick={() => setIsZoomOpen(false)}
          >
            <div className="modal-dialog modal-fullscreen m-0 d-flex align-items-center justify-content-center h-100">
              <div className="modal-content bg-transparent border-0 position-relative w-100 h-100">
                <button 
                  className="btn btn-light position-absolute top-0 end-0 m-4 rounded-circle d-flex align-items-center justify-content-center border-0 shadow"
                  onClick={(e) => { e.stopPropagation(); setIsZoomOpen(false); }}
                  style={{ width: "50px", height: "50px", zIndex: 1060 }}
                >
                  <i className="fa-solid fa-times fs-4"></i>
                </button>

                {gallery.length > 1 && (
                  <>
                    <button 
                      className="btn btn-light position-absolute start-0 top-50 translate-middle-y ms-4 rounded-circle d-flex align-items-center justify-content-center shadow border-0"
                      onClick={handlePrev}
                      style={{ width: "60px", height: "60px", zIndex: 1060 }}
                    >
                      <i className="fa-solid fa-chevron-left fs-3"></i>
                    </button>
                    <button 
                      className="btn btn-light position-absolute end-0 top-50 translate-middle-y me-4 rounded-circle d-flex align-items-center justify-content-center shadow border-0"
                      onClick={handleNext}
                      style={{ width: "60px", height: "60px", zIndex: 1060 }}
                    >
                      <i className="fa-solid fa-chevron-right fs-3"></i>
                    </button>
                  </>
                )}

                <div className="w-100 h-100 d-flex align-items-center justify-content-center p-5">
                  <motion.img
                    key={`zoom-${activeImage}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                    src={resolveImageUrl(activeImage)}
                    alt={product?.name}
                    className="img-fluid"
                    style={{ maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .scale-up { transform: scale(1.05); }
        .hover-zoom:hover { transform: scale(1.03); }
      `}</style>
    </div>
  );
}

export default Gallery;
