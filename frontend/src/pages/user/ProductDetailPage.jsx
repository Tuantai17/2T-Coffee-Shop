import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getProducts, getCategories } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import UserLayout from "../../layouts/UserLayout";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const loadProduct = async () => {
    try {
      const res = await getProductById(id);
      setProduct(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  const handleAddToCart = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      alert("Vui lòng đăng nhập trước!");
      navigate("/login");
      return;
    }

    try {
      await addToCart(product.id, quantity);
      alert("Đã thêm sản phẩm đồ chơi vào giỏ hàng thành công!");
    } catch (error) {
      console.error(error);
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };

  const getCategoryName = (catId) => {
    const found = categories.find((cat) => String(cat.id) === String(catId));
    return found ? found.name : `Danh mục #${catId}`;
  };

  useEffect(() => {
    setLoading(true);
    loadProduct();
    loadCategories();
  }, [id]);

  useEffect(() => {
    if (product) {
      const fetchRelated = async () => {
        try {
          const res = await getProducts();
          const filtered = res.data.filter(
            (p) =>
              String(p.categoryId) === String(product.categoryId) &&
              p.id !== product.id
          );
          setRelatedProducts(filtered.slice(0, 4));
        } catch (e) {
          console.error("Lỗi lấy sản phẩm liên quan:", e);
        }
      };
      fetchRelated();
    }
  }, [product]);

  const hasDiscount = product && product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <UserLayout>
      <div className="container mt-4">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : !product ? (
          <div className="alert alert-danger text-center">Sản phẩm đồ chơi không tồn tại!</div>
        ) : (
          <>
            <div className="card shadow-sm border-0 rounded-5 overflow-hidden p-4 bg-white">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="bg-light rounded-4 overflow-hidden position-relative p-2" style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {hasDiscount && (
                      <span className="toy-badge-discount" style={{ top: "25px", left: "25px" }}>-{discountPercentage}% OFF</span>
                    )}
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=500"}
                      alt={product.name}
                      className="w-100 h-100"
                      style={{ objectFit: "cover", borderRadius: "20px" }}
                    />
                  </div>
                </div>
                <div className="col-md-6 d-flex flex-column justify-content-between py-2">
                  <div>
                    <span className="badge bg-danger mb-2 px-3 py-2 rounded-pill fw-bold" style={{ fontSize: "0.85rem" }}>
                      {getCategoryName(product.categoryId)}
                    </span>
                    <h1 className="fw-extrabold text-dark mb-2" style={{ fontSize: "2rem" }}>{product.name}</h1>
                    
                    {/* Thông tin bổ sung (Danh mục & Tình trạng kho) */}
                    <div className="d-flex gap-3 mb-3 text-muted align-items-center" style={{ fontSize: "0.9rem" }}>
                      <span><i className="fa-solid fa-folder-open text-warning me-1"></i> Danh mục: <strong>{getCategoryName(product.categoryId)}</strong></span>
                      <span>|</span>
                      <span>
                        <i className={`fa-solid ${product.quantity > 0 ? "fa-circle-check text-success" : "fa-circle-xmark text-danger"} me-1`}></i> 
                        Tình trạng: <strong className={product.quantity > 0 ? "text-success" : "text-danger"}>
                          {product.quantity > 0 ? `Còn hàng (${product.quantity} chiếc)` : "Hết hàng"}
                        </strong>
                      </span>
                    </div>

                    <p className="text-muted mb-4 fs-6" style={{ lineHeight: "1.6" }}>{product.description}</p>
                    
                    <div className="card bg-light border-0 rounded-4 p-3 mb-4">
                      <span className="text-muted" style={{ fontSize: "0.9rem" }}>{hasDiscount ? "Giá khuyến mãi:" : "Giá bán:"}</span>
                      <h3 className="text-danger fw-extrabold mb-1">{product.price.toLocaleString("vi-VN")} VNĐ</h3>
                      {hasDiscount && (
                        <span className="text-muted text-decoration-line-through" style={{ fontSize: "0.85rem" }}>
                          {product.originalPrice.toLocaleString("vi-VN")} VNĐ
                        </span>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-3 mb-4">
                      <span className="fw-bold text-dark">Số lượng mua:</span>
                      <div className="d-flex align-items-center border rounded-pill bg-white px-2 py-1" style={{ width: "130px" }}>
                        <button className="btn btn-link text-danger fw-bold border-0 p-0 fs-5 mx-2" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                        <input
                          type="number"
                          className="form-control text-center border-0 p-0 fw-bold fs-5 text-dark"
                          value={quantity}
                          min="1"
                          max={product.quantity > 0 ? product.quantity : 99}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                          style={{ boxShadow: "none" }}
                        />
                        <button className="btn btn-link text-danger fw-bold border-0 p-0 fs-5 mx-2" onClick={() => setQuantity(q => q + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button className="btn btn-toy-primary btn-lg w-100 py-3 rounded-pill fw-bold" onClick={handleAddToCart} disabled={product.quantity <= 0}>
                      <i className="fa-solid fa-cart-plus me-2"></i> {product.quantity > 0 ? "THÊM VÀO GIỎ HÀNG" : "HẾT HÀNG TẠM THỜI"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Khối hiển thị sản phẩm liên quan */}
            {relatedProducts.length > 0 && (
              <div className="mt-5 mb-4">
                <h4 className="fw-extrabold text-danger mb-4 border-bottom pb-2">
                  <i className="fa-solid fa-wand-magic-sparkles me-2"></i>SẢN PHẨM TƯƠNG TỰ CHO BÉ
                </h4>
                <div className="row g-4">
                  {relatedProducts.map((p) => {
                    const pHasDiscount = p.originalPrice && p.originalPrice > p.price;
                    const pDiscountPercentage = pHasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
                    return (
                      <div className="col-12 col-md-3" key={p.id}>
                        <div className="card h-100 toy-card position-relative p-2">
                          {pHasDiscount && (
                            <span className="toy-badge-discount">-{pDiscountPercentage}%</span>
                          )}

                          {/* Hình ảnh */}
                          <div className="position-relative bg-light rounded-4 overflow-hidden" style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img
                              src={p.imageUrl || "https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=500"}
                              className="card-img-top w-100 h-100"
                              alt={p.name}
                              style={{ objectFit: "cover" }}
                            />
                          </div>

                          {/* Chi tiết */}
                          <div className="card-body d-flex flex-column p-3">
                            <h5 className="card-title fw-bold text-dark text-truncate mb-1">{p.name}</h5>
                            <p className="card-text text-muted text-truncate mb-2" style={{ fontSize: "0.8rem" }}>{p.description}</p>
                            
                            {/* Giá tiền */}
                            <div className="mb-3" style={{ minHeight: "44px" }}>
                              <span className="text-danger fw-extrabold block-price">
                                {p.price.toLocaleString("vi-VN")} VNĐ
                              </span>
                              {pHasDiscount && (
                                <>
                                  <br />
                                  <span className="text-muted text-decoration-line-through" style={{ fontSize: "0.8rem" }}>
                                    {p.originalPrice.toLocaleString("vi-VN")} VNĐ
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="mt-auto d-flex gap-2">
                              <button 
                                className="btn btn-outline-danger btn-sm rounded-pill fw-bold flex-grow-1"
                                onClick={() => {
                                  navigate(`/products/${p.id}`);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                Chi tiết
                              </button>
                              <button
                                className="btn btn-danger btn-sm rounded-pill px-3"
                                onClick={async () => {
                                  const userId = sessionStorage.getItem("userId");
                                  if (!userId) {
                                    alert("Vui lòng đăng nhập trước!");
                                    navigate("/login");
                                    return;
                                  }
                                  try {
                                    await addToCart(p.id, 1);
                                    alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
                                  } catch (e) {
                                    console.error(e);
                                    alert("Thêm vào giỏ hàng thất bại!");
                                  }
                                }}
                                disabled={p.quantity <= 0 || p.availability <= 0}
                              >
                                <i className="fa-solid fa-cart-shopping"></i> Mua
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
}

export default ProductDetailPage;
