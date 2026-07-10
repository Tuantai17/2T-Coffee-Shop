import React from 'react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

function ProductGrid({ products, loading, error, onAddToCart, onQuickView, viewMode, onReset }) {
  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem", color: "var(--primary-color)" }}></div>
        <h5 className="text-muted fw-bold">Đang tải thức uống...</h5>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger rounded-4 text-center py-5 d-flex flex-column align-items-center">
        <i className="fa-solid fa-triangle-exclamation fs-1 mb-3 text-danger"></i>
        <h5 className="fw-bold">{error}</h5>
        <button className="btn btn-outline-danger mt-3 rounded-pill px-4 fw-bold hover-scale" onClick={onReset}>Thử lại</button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 shadow-sm border" style={{ minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <img src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png" alt="Empty" style={{ width: "120px", opacity: 0.5 }} className="mb-4" />
        <h4 className="fw-bold text-dark">Không tìm thấy thức uống nào!</h4>
        <p className="text-muted mb-4">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác xem sao nhé.</p>
        <button className="btn btn-brew-primary rounded-pill px-5 py-2 fw-bold hover-scale shadow-sm" onClick={onReset}>
          Xóa bộ lọc
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className={viewMode === 'grid' ? "row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3 g-md-4" : "d-flex flex-column gap-3"}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {products.map(product => (
        <motion.div className={viewMode === 'grid' ? "col" : "w-100"} key={product.id} variants={itemVariants}>
          <ProductCard 
            product={product} 
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
            viewMode={viewMode}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default ProductGrid;
