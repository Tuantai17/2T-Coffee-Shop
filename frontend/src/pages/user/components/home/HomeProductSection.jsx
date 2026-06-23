import { useState } from "react";
import { Link } from "react-router-dom";
import { applyImageFallback, DEFAULT_IMAGE_FALLBACK, resolveImageUrl } from "../../../../utils/imageFallback";

function HomeProductSection({ title, type, products, loading, viewAllLink, onAddToCart, iconClass }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 5; // Desktop 5 products
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 0));
  const handleNextPage = () => setPage(prev => Math.min(prev + 1, totalPages - 1));

  // Tránh lỗi index out of bounds khi products nhỏ hơn itemsPerPage
  const currentProducts = products.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2 border-danger border-opacity-25">
        <div>
          <h3 className="fw-extrabold text-danger mb-1" style={{ fontSize: "1.5rem" }}>
            {iconClass && <i className={`${iconClass} me-2 text-warning`}></i>}
            {title}
          </h3>
        </div>
        <Link to={viewAllLink} className="text-danger fw-bold text-decoration-none hover-opacity">
          Xem tất cả <i className="fa-solid fa-arrow-right-long ms-1"></i>
        </Link>
      </div>

      <div className="position-relative">
        {products.length > itemsPerPage && (
          <button
            className="btn btn-light rounded-circle shadow position-absolute start-0 top-50 translate-middle-y d-none d-md-flex align-items-center justify-content-center border"
            style={{ width: "40px", height: "40px", zIndex: 10, opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? "not-allowed" : "pointer", marginLeft: "-20px" }}
            onClick={handlePrevPage}
            disabled={page === 0}
          >
            <i className="fa-solid fa-chevron-left text-danger"></i>
          </button>
        )}

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-muted">Không có sản phẩm nào.</div>
        ) : (
          <div className="row g-3 flex-nowrap overflow-auto hide-scrollbar pb-3">
            {currentProducts.map((p) => {
              const hasDiscount = p.originalPrice && p.originalPrice > p.price;
              const discountPercentage = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
              return (
                <div className="col-9 col-sm-6 col-md-4 col-lg-2.4" style={{ width: "20%" }} key={p.id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4 position-relative hover-shadow transition-all" style={{ transition: "transform 0.2s, box-shadow 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                    {/* Badge giảm giá */}
                    {hasDiscount && (
                      <span className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 m-2 rounded-2 fw-bold" style={{ fontSize: "0.8rem", zIndex: 2 }}>
                        -{discountPercentage}%
                      </span>
                    )}
                    {type === 'new' && !hasDiscount && (
                       <span className="position-absolute top-0 start-0 bg-info text-white px-2 py-1 m-2 rounded-2 fw-bold" style={{ fontSize: "0.8rem", zIndex: 2 }}>
                         Mới
                       </span>
                    )}

                    <Link to={`/products/${p.id}`} className="position-relative bg-light rounded-top-4 overflow-hidden d-block" style={{ height: "200px" }}>
                      <img
                        src={resolveImageUrl(p.imageUrl, "https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=500")}
                        className="card-img-top w-100 h-100"
                        alt={p.name}
                        style={{ objectFit: "cover" }}
                        onError={(event) => applyImageFallback(event, DEFAULT_IMAGE_FALLBACK)}
                      />
                    </Link>

                    <div className="card-body d-flex flex-column p-3">
                      <Link to={`/products/${p.id}`} className="text-decoration-none">
                        <h6 className="card-title fw-bold text-dark mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '38px', fontSize: "0.95rem" }}>
                          {p.name}
                        </h6>
                      </Link>
                      
                      <div className="mb-3 mt-auto">
                        <span className="text-danger fw-bold fs-6 d-block">
                          {p.price.toLocaleString("vi-VN")}đ
                        </span>
                        {hasDiscount ? (
                          <span className="text-muted text-decoration-line-through" style={{ fontSize: "0.85rem" }}>
                            {p.originalPrice.toLocaleString("vi-VN")}đ
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.85rem", visibility: "hidden" }}>0đ</span>
                        )}
                      </div>

                      <div className="d-flex gap-2">
                        <button className="btn btn-danger btn-sm rounded-3 flex-grow-1 fw-bold" onClick={() => onAddToCart(p.id)}>
                          Mua
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {products.length > itemsPerPage && (
          <button
            className="btn btn-light rounded-circle shadow position-absolute end-0 top-50 translate-middle-y d-none d-md-flex align-items-center justify-content-center border"
            style={{ width: "40px", height: "40px", zIndex: 10, opacity: page === totalPages - 1 ? 0.4 : 1, cursor: page === totalPages - 1 ? "not-allowed" : "pointer", marginRight: "-20px" }}
            onClick={handleNextPage}
            disabled={page === totalPages - 1}
          >
            <i className="fa-solid fa-chevron-right text-danger"></i>
          </button>
        )}
      </div>
    </div>
  );
}

export default HomeProductSection;
