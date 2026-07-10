import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../../../services/productService';
import { resolveImageUrl, applyImageFallback, DEFAULT_IMAGE_FALLBACK } from '../../../../utils/imageFallback';
import { formatPrice } from '../../../../utils/formatPrice';
import { addToCart } from '../../../../services/cartService';

function RecommendedProducts() {
  const [products, setProducts] = useState([]);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProducts();
        const all = res.data?.content || res.data || [];
        // Take random 6 products
        const shuffled = [...all].sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 6));
      } catch (err) {
        console.error('Error loading recommended:', err);
      }
    };
    load();
  }, []);

  const handleQuickAdd = async (product) => {
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1);
      // Small delay for UX
      setTimeout(() => setAddingId(null), 600);
    } catch (err) {
      console.error(err);
      setAddingId(null);
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="mt-5 mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold mb-0" style={{ color: "#2d2d2d" }}>
          <i className="fa-solid fa-wand-magic-sparkles me-2" style={{ color: "#c67c4e" }}></i>
          Có thể bạn sẽ thích
        </h5>
        <Link to="/products" className="text-decoration-none fw-semibold d-flex align-items-center gap-1" style={{ color: "#c67c4e", fontSize: "14px" }}>
          Xem tất cả <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i>
        </Link>
      </div>

      <div className="d-flex gap-3 overflow-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
        {products.map((p) => {
          const isAdding = addingId === p.id;
          return (
            <div
              key={p.id}
              className="flex-shrink-0 bg-white rounded-4 overflow-hidden position-relative"
              style={{
                width: "180px",
                border: "1px solid #f0ebe5",
                scrollSnapAlign: "start",
                transition: "all 0.3s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Link to={`/products/${p.id}`}>
                <div style={{ height: "140px", backgroundColor: "#fdf8f4" }}>
                  <img
                    src={resolveImageUrl(p.imageUrl, DEFAULT_IMAGE_FALLBACK)}
                    alt={p.name || p.productName}
                    className="w-100 h-100"
                    style={{ objectFit: "contain", padding: "8px" }}
                    onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)}
                  />
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/products/${p.id}`} className="text-decoration-none">
                  <div className="fw-semibold mb-1 text-truncate" style={{ color: "#2d2d2d", fontSize: "13px" }}>
                    {p.name || p.productName}
                  </div>
                </Link>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-bold" style={{ color: "#c67c4e", fontSize: "14px" }}>
                    {formatPrice(p.price)}
                  </span>
                  <button
                    className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center border-0"
                    style={{
                      width: "30px", height: "30px",
                      backgroundColor: isAdding ? "#22c55e" : "var(--primary-color, #c67c4e)",
                      color: "#fff",
                      transition: "all 0.3s",
                    }}
                    onClick={() => handleQuickAdd(p)}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <i className="fa-solid fa-check" style={{ fontSize: "11px" }}></i>
                    ) : (
                      <i className="fa-solid fa-plus" style={{ fontSize: "11px" }}></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecommendedProducts;
