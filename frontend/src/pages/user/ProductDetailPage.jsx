import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addToCart } from "../../services/cartService";
import { addWishlistItem } from "../../services/authService";
import { getCategories, getProductById, getProducts } from "../../services/productService";
import UserLayout from "../../layouts/UserLayout";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import {
  applyImageFallback,
  DEFAULT_IMAGE_FALLBACK,
  resolveImageUrl,
} from "../../utils/imageFallback";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");

  const loadProduct = async () => {
    try {
      const res = await getProductById(id);
      const nextProduct = res.data;
      setProduct(nextProduct);
      setActiveImage(
        resolveImageUrl(nextProduct.imageUrl, nextProduct.imageUrls?.[0]) ||
          resolveImageUrl(nextProduct.imageUrls?.[0]) ||
          "https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=500"
      );
    } catch (error) {
      console.error(error);
      setProduct(null);
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

  const handleAddToCart = async (productId, nextQuantity = quantity) => {
    const { userId } = getAuthSession(AUTH_SCOPES.USER);
    if (!userId) {
      alert("Vui lòng đăng nhập trước!");
      navigate("/login");
      return;
    }

    try {
      await addToCart(productId, nextQuantity);
      alert("Đã thêm sản phẩm đồ chơi vào giỏ hàng thành công!");
    } catch (error) {
      console.error(error);
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };

  const handleAddToWishlist = async () => {
    const { userId } = getAuthSession(AUTH_SCOPES.USER);
    if (!userId) {
      alert("Vui lòng đăng nhập trước khi dùng wishlist!");
      navigate("/login");
      return;
    }

    if (!product) {
      return;
    }

    try {
      await addWishlistItem(userId, {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: product.imageUrl,
        price: product.price,
      });
      alert("Đã thêm sản phẩm vào wishlist!");
    } catch (error) {
      console.error(error);
      alert("Không thể thêm sản phẩm vào wishlist.");
    }
  };

  const getCategoryName = (categoryId) => {
    const found = categories.find((category) => String(category.id) === String(categoryId));
    return found ? found.name : `Danh mục #${categoryId}`;
  };

  useEffect(() => {
    setLoading(true);
    loadProduct();
    loadCategories();
  }, [id]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const fetchRelated = async () => {
      try {
        const res = await getProducts({
          category: product.categoryId,
          sort: "newest",
        });
        const filtered = (res.data || []).filter((item) => item.id !== product.id);
        setRelatedProducts(filtered.slice(0, 4));
      } catch (error) {
        console.error("Lỗi lấy sản phẩm liên quan:", error);
      }
    };

    fetchRelated();
  }, [product]);

  const hasDiscount =
    product && product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const gallery =
    product?.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : product?.imageUrl
        ? [resolveImageUrl(product.imageUrl)]
        : ["https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=500"];

  return (
    <UserLayout>
      <div className="container mt-4">
        {loading ? (
          <div className="card border-0 shadow-sm rounded-5 py-5 text-center">
            <div className="spinner-border text-danger mx-auto mb-3" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <div className="text-muted">Đang tải chi tiết sản phẩm...</div>
          </div>
        ) : !product ? (
          <div className="alert alert-danger rounded-4 text-center">
            Sản phẩm đồ chơi không tồn tại hoặc đã bị gỡ khỏi hệ thống.
          </div>
        ) : (
          <>
            <div className="card shadow-sm border-0 rounded-5 overflow-hidden p-4 bg-white">
              <div className="row g-4">
                <div className="col-lg-6">
                  <div
                    className="bg-light rounded-5 overflow-hidden position-relative p-3 mb-3"
                    style={{ minHeight: "420px" }}
                  >
                    {hasDiscount && (
                      <span className="badge bg-danger position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill">
                        -{discountPercentage}% OFF
                      </span>
                    )}
                    {product.badge && (
                      <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill">
                        {product.badge}
                      </span>
                    )}
                    <img
                      src={resolveImageUrl(activeImage)}
                      alt={product.name}
                      className="w-100 h-100"
                      style={{ objectFit: "cover", borderRadius: "24px", minHeight: "390px" }}
                      onError={(event) => applyImageFallback(event, DEFAULT_IMAGE_FALLBACK)}
                    />
                  </div>

                  <div className="d-flex gap-3 flex-wrap">
                    {gallery.map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        className={`btn p-0 border ${activeImage === image ? "border-danger" : "border-light"} rounded-4 overflow-hidden`}
                        onClick={() => setActiveImage(image)}
                      >
                        <img
                          src={resolveImageUrl(image)}
                          alt={`${product.name} ${index + 1}`}
                          style={{ width: "88px", height: "88px", objectFit: "cover" }}
                          onError={(event) => applyImageFallback(event, DEFAULT_IMAGE_FALLBACK)}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-lg-6 d-flex flex-column justify-content-between py-2">
                  <div>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-bold">
                        {getCategoryName(product.categoryId)}
                      </span>
                      {product.brand && (
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">
                          {product.brand}
                        </span>
                      )}
                      {product.sku && (
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">
                          SKU: {product.sku}
                        </span>
                      )}
                    </div>

                    <h1 className="fw-bold text-dark mb-2" style={{ fontSize: "2rem" }}>
                      {product.name}
                    </h1>

                    <div className="d-flex flex-wrap gap-3 mb-3 text-muted align-items-center">
                      <span>
                        <i className="fa-solid fa-folder-open text-warning me-1"></i>
                        {getCategoryName(product.categoryId)}
                      </span>
                      {(product.ageMin || product.ageMax) && (
                        <span>
                          <i className="fa-solid fa-child-reaching text-primary me-1"></i>
                          Phù hợp {product.ageMin || 0}-{product.ageMax || "12+"} tuổi
                        </span>
                      )}
                      <span>
                        <i
                          className={`fa-solid ${product.quantity > 0 ? "fa-circle-check text-success" : "fa-circle-xmark text-danger"} me-1`}
                        ></i>
                        {product.quantity > 0
                          ? `Còn hàng (${product.quantity} chiếc)`
                          : "Hết hàng"}
                      </span>
                    </div>

                    <p className="text-muted mb-3">
                      {product.shortDescription || product.description}
                    </p>

                    <div className="card bg-light border-0 rounded-5 p-4 mb-4">
                      <span className="text-muted small">
                        {hasDiscount ? "Giá ưu đãi hôm nay" : "Giá bán"}
                      </span>
                      <div className="text-danger fw-bold display-6 mb-1">
                        {(product.price || 0).toLocaleString("vi-VN")} VNĐ
                      </div>
                      {hasDiscount && (
                        <div className="text-muted text-decoration-line-through">
                          {product.originalPrice.toLocaleString("vi-VN")} VNĐ
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold">Số lượng mua</label>
                      <div
                        className="d-flex align-items-center border rounded-pill bg-white px-2 py-1"
                        style={{ width: "150px" }}
                      >
                        <button
                          type="button"
                          className="btn btn-link text-danger fw-bold border-0 p-0 fs-5 mx-2"
                          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="form-control text-center border-0 p-0 fw-bold fs-5 text-dark"
                          value={quantity}
                          min="1"
                          max={product.quantity > 0 ? product.quantity : 99}
                          onChange={(event) =>
                            setQuantity(Math.max(1, Number(event.target.value) || 1))
                          }
                          style={{ boxShadow: "none" }}
                        />
                        <button
                          type="button"
                          className="btn btn-link text-danger fw-bold border-0 p-0 fs-5 mx-2"
                          onClick={() => setQuantity((value) => value + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="card border-0 bg-warning-subtle rounded-5 p-4 mb-4">
                      <h5 className="fw-bold mb-3">Thông tin nhanh</h5>
                      <div className="row g-3 small">
                        <div className="col-sm-6">
                          <div className="text-muted">Thương hiệu</div>
                          <div className="fw-semibold">{product.brand || "Đang cập nhật"}</div>
                        </div>
                        <div className="col-sm-6">
                          <div className="text-muted">Trạng thái hiển thị</div>
                          <div className="fw-semibold">{product.status || "ACTIVE"}</div>
                        </div>
                        <div className="col-sm-6">
                          <div className="text-muted">Slug</div>
                          <div className="fw-semibold text-break">{product.slug || "Đang cập nhật"}</div>
                        </div>
                        <div className="col-sm-6">
                          <div className="text-muted">Tags</div>
                          <div className="fw-semibold">{product.tags || "Đang cập nhật"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-md-row gap-3">
                    <button
                      className="btn btn-danger btn-lg flex-grow-1 py-3 rounded-pill fw-bold"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.quantity <= 0}
                    >
                      <i className="fa-solid fa-cart-plus me-2"></i>
                      {product.quantity > 0 ? "THÊM VÀO GIỎ HÀNG" : "HẾT HÀNG TẠM THỜI"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-lg py-3 rounded-pill fw-bold"
                      onClick={handleAddToWishlist}
                    >
                      <i className="fa-regular fa-heart me-2"></i>
                      Yêu thích
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0 rounded-5 p-4 mt-4">
              <h4 className="fw-bold mb-3">Mô tả chi tiết</h4>
              <p className="text-muted mb-0" style={{ lineHeight: "1.8" }}>
                {product.description || "Nội dung mô tả đang được cập nhật."}
              </p>
            </div>

            {relatedProducts.length > 0 && (
              <div className="mt-5 mb-4">
                <h4 className="fw-bold text-danger mb-4 border-bottom pb-2">
                  <i className="fa-solid fa-wand-magic-sparkles me-2"></i>
                  Sản phẩm liên quan
                </h4>
                <div className="row g-4">
                  {relatedProducts.map((item) => {
                    const relatedHasDiscount =
                      item.originalPrice && item.originalPrice > item.price;

                    return (
                      <div className="col-12 col-md-6 col-xl-3" key={item.id}>
                        <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden">
                          <img
                            src={resolveImageUrl(
                              item.imageUrl,
                              "https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=500"
                            )}
                            alt={item.name}
                            style={{ height: "210px", objectFit: "cover" }}
                            onError={(event) => applyImageFallback(event, DEFAULT_IMAGE_FALLBACK)}
                          />
                          <div className="card-body d-flex flex-column p-4">
                            <div className="small text-uppercase text-muted fw-semibold mb-2">
                              {item.brand || "Toy Store"}
                            </div>
                            <h5 className="fw-bold mb-2">{item.name}</h5>
                            <div className="text-danger fw-bold mb-2">
                              {(item.price || 0).toLocaleString("vi-VN")} VNĐ
                            </div>
                            {relatedHasDiscount && (
                              <div className="text-muted text-decoration-line-through small mb-3">
                                {item.originalPrice.toLocaleString("vi-VN")} VNĐ
                              </div>
                            )}

                            <div className="mt-auto d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-outline-danger rounded-pill fw-bold flex-grow-1"
                                onClick={() => {
                                  navigate(`/products/${item.id}`);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                              >
                                Chi tiết
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger rounded-pill fw-bold"
                                onClick={() => handleAddToCart(item.id, 1)}
                              >
                                Mua
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
