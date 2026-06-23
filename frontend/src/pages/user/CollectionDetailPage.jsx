import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addToCart } from "../../services/cartService";
import { getCollectionBySlug, getProducts } from "../../services/productService";
import UserLayout from "../../layouts/UserLayout";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import {
  applyImageFallback,
  DEFAULT_IMAGE_FALLBACK,
  resolveImageUrl,
} from "../../utils/imageFallback";

function CollectionDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCollectionDetail = async () => {
      setLoading(true);
      setError("");

      try {
        const collectionRes = await getCollectionBySlug(slug);
        const nextCollection = collectionRes.data;
        setCollection(nextCollection);

        const searchParams = new URLSearchParams(
          (nextCollection.targetUrl || "").includes("?")
            ? nextCollection.targetUrl.split("?")[1]
            : ""
        );

        const filters = {
          category: nextCollection.categoryFilter || searchParams.get("category") || undefined,
          brand: nextCollection.brandFilter || searchParams.get("brand") || undefined,
          badge: nextCollection.badgeFilter || searchParams.get("badge") || undefined,
          onSale: searchParams.get("onSale") === "true" ? true : undefined,
          featured: searchParams.get("featured") === "true" ? true : undefined,
          sort: searchParams.get("sort") || "newest",
        };

        const productsRes = await getProducts(filters);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch (nextError) {
        console.error("Lỗi tải collection:", nextError);
        setError("Không thể tải trang collection. Vui lòng thử lại sau.");
        setCollection(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadCollectionDetail();
  }, [slug]);

  const handleAddToCart = async (productId) => {
    const { userId } = getAuthSession(AUTH_SCOPES.USER);
    if (!userId) {
      alert("Vui lòng đăng nhập trước khi mua hàng!");
      navigate("/login");
      return;
    }

    try {
      await addToCart(productId, 1);
      alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (nextError) {
      console.error(nextError);
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };

  return (
    <UserLayout>
      <div className="container mt-4">
        {loading ? (
          <div className="card border-0 shadow-sm rounded-5 py-5 text-center">
            <div className="spinner-border text-danger mx-auto mb-3" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <div className="text-muted">Đang tải collection...</div>
          </div>
        ) : error ? (
          <div className="alert alert-danger rounded-4">{error}</div>
        ) : !collection ? (
          <div className="alert alert-warning rounded-4">
            Collection không tồn tại hoặc đã bị ẩn khỏi hệ thống.
          </div>
        ) : (
          <>
            <div
              className="rounded-5 overflow-hidden text-white position-relative mb-4"
              style={{
                minHeight: "320px",
                backgroundImage: `linear-gradient(120deg, rgba(214,40,40,0.92), rgba(255,183,3,0.78)), url(${resolveImageUrl(collection.bannerUrl)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="p-4 p-lg-5" style={{ maxWidth: "720px" }}>
                <span className="badge rounded-pill bg-white text-danger fw-bold px-3 py-2 mb-3">
                  Collection Detail
                </span>
                <h1 className="fw-bold mb-3">{collection.name}</h1>
                <p className="mb-3 text-white-50 fs-5">
                  {collection.subtitle || collection.description || "Bộ sưu tập được cấu hình từ admin cho homepage."}
                </p>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {collection.categoryFilter && (
                    <span className="badge bg-dark-subtle text-white px-3 py-2 rounded-pill">
                      Danh mục #{collection.categoryFilter}
                    </span>
                  )}
                  {collection.brandFilter && (
                    <span className="badge bg-dark-subtle text-white px-3 py-2 rounded-pill">
                      {collection.brandFilter}
                    </span>
                  )}
                  {collection.badgeFilter && (
                    <span className="badge bg-dark-subtle text-white px-3 py-2 rounded-pill">
                      Badge {collection.badgeFilter}
                    </span>
                  )}
                </div>
                <Link to="/products" className="btn btn-light text-danger rounded-pill px-4 fw-bold">
                  Xem toàn bộ sản phẩm
                </Link>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <h3 className="fw-bold text-danger mb-1">Sản phẩm trong collection</h3>
                <p className="text-muted mb-0">
                  Tổng cộng {products.length} sản phẩm đang khớp điều kiện của bộ sưu tập này.
                </p>
              </div>
              {collection.targetUrl && (
                <Link to={collection.targetUrl} className="btn btn-outline-danger rounded-pill fw-bold">
                  Mở theo bộ lọc gốc
                </Link>
              )}
            </div>

            {products.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-5 py-5 text-center">
                <h4 className="fw-bold mb-2">Chưa có sản phẩm phù hợp</h4>
                <p className="text-muted mb-0">
                  Hãy kiểm tra lại cấu hình category, brand hoặc badge của collection trong trang admin.
                </p>
              </div>
            ) : (
              <div className="row g-4">
                {products.map((product) => {
                  const hasDiscount =
                    product.originalPrice && Number(product.originalPrice) > Number(product.price);
                  const discountPercentage = hasDiscount
                    ? Math.round(
                        ((Number(product.originalPrice) - Number(product.price)) /
                          Number(product.originalPrice)) *
                          100
                      )
                    : 0;

                  return (
                    <div className="col-12 col-md-6 col-xl-3" key={product.id}>
                      <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden">
                        <div className="position-relative">
                          {hasDiscount && (
                            <span className="badge bg-danger position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill">
                              -{discountPercentage}%
                            </span>
                          )}
                          {product.badge && (
                            <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill">
                              {product.badge}
                            </span>
                          )}
                          <img
                            src={resolveImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="w-100"
                            style={{ height: "240px", objectFit: "cover" }}
                            onError={(event) => applyImageFallback(event, DEFAULT_IMAGE_FALLBACK)}
                          />
                        </div>

                        <div className="card-body d-flex flex-column p-4">
                          <div className="small text-uppercase text-muted fw-semibold mb-2">
                            {product.brand || "Toy Store"}
                          </div>
                          <h5 className="fw-bold mb-2">{product.name}</h5>
                          <p className="text-muted small mb-3">
                            {product.shortDescription || product.description || "Sản phẩm dành cho bé."}
                          </p>
                          <div className="mb-3">
                            <div className="text-danger fw-bold fs-5">
                              {(product.price || 0).toLocaleString("vi-VN")} VNĐ
                            </div>
                            {hasDiscount && (
                              <div className="text-muted text-decoration-line-through small">
                                {Number(product.originalPrice).toLocaleString("vi-VN")} VNĐ
                              </div>
                            )}
                          </div>

                          <div className="mt-auto d-flex gap-2">
                            <Link
                              to={`/products/${product.id}`}
                              className="btn btn-outline-danger rounded-pill fw-bold flex-grow-1"
                            >
                              Chi tiết
                            </Link>
                            <button
                              type="button"
                              className="btn btn-danger rounded-pill fw-bold"
                              onClick={() => handleAddToCart(product.id)}
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
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
}

export default CollectionDetailPage;
