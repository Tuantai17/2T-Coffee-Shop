import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, getCategories } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import UserLayout from "../../layouts/UserLayout";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      // Lấy tối đa 8 sản phẩm hiển thị nổi bật ở trang chủ
      setProducts(res.data.slice(0, 8));
    } catch (error) {
      console.error("Lỗi lấy sản phẩm nổi bật:", error);
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

  const handleAddToCart = async (productId) => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      alert("Vui lòng đăng nhập trước khi mua hàng!");
      return;
    }

    try {
      await addToCart(productId, 1);
      alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (error) {
      alert("Thêm vào giỏ hàng thất bại!");
      console.error(error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Danh mục phong cách mặc định đẹp mắt để hiển thị động
  const categoryStyles = [
    { color: "#ffd200", img: "https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=150" }, // LEGO
    { color: "#ff8da1", img: "https://images.unsplash.com/photo-1559251606-c623743a6d76?w=150" }, // Búp bê
    { color: "#3ba2ff", img: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=150" }, // Siêu xe
    { color: "#5cdb5c", img: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=150" }, // Giáo dục
    { color: "#a55cff", img: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=150" }  // Robot
  ];

  return (
    <UserLayout>
      {/* Banner Quảng Cáo Lớn */}
      <div className="container mt-3">
        <div className="card border-0 rounded-5 overflow-hidden shadow-sm">
          <img
            src="/mykingdom_banner.png"
            alt="MyKingdom Promotional Banner"
            className="w-100 h-auto img-fluid"
            style={{ maxHeight: "450px", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Vòng Tròn Danh Mục Nổi Bật */}
      <div className="container mt-5">
        <div className="text-center mb-4">
          <h3 className="fw-extrabold text-danger mb-1">DANH MỤC NỔI BẬT</h3>
          <p className="text-muted">Lựa chọn đồ chơi phù hợp với lứa tuổi phát triển của bé</p>
        </div>
        <div className="row justify-content-center text-center g-4">
          {categories.length === 0 ? (
            <div className="text-muted">Không có danh mục nào.</div>
          ) : (
            categories.map((cat, idx) => {
              const style = categoryStyles[idx % categoryStyles.length];
              return (
                <div className="col-6 col-md-2.5 category-item mx-lg-3" key={cat.id || idx} style={{ cursor: "pointer", width: "180px" }}>
                  <div className="category-circle" style={{ backgroundColor: style.color + "25" }}>
                    <img
                      src={style.img}
                      alt={cat.name}
                      className="rounded-circle"
                      style={{ width: "80px", height: "80px", objectFit: "cover" }}
                    />
                  </div>
                  <span className="fw-bold text-dark d-block mt-2" style={{ fontSize: "0.95rem" }}>{cat.name}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sản Phẩm Hot Nổi Bật */}
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2">
          <div>
            <h3 className="fw-extrabold text-danger mb-1"><i className="fa-solid fa-fire-flame-simple me-2"></i>SẢN PHẨM KHUYẾN MÃI HOT</h3>
            <p className="text-muted mb-0">Ưu đãi giảm giá đặc biệt duy nhất trong tuần này</p>
          </div>
          <Link to="/products" className="btn btn-toy-secondary text-dark fw-bold">
            Xem Tất Cả &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="alert alert-warning text-center rounded-4 py-5">
            <h4>Chưa có sản phẩm đồ chơi nào!</h4>
            <p className="text-muted">Vui lòng đăng nhập với tài khoản ADMIN để thêm đồ chơi mới.</p>
          </div>
        ) : (
          <div className="row g-4">
            {products.map((p) => {
              const hasDiscount = p.originalPrice && p.originalPrice > p.price;
              const discountPercentage = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
              return (
                <div className="col-12 col-md-3" key={p.id}>
                  <div className="card h-100 toy-card position-relative p-2">
                    {/* Nhãn giảm giá phong cách đồ chơi */}
                    {hasDiscount && (
                      <span className="toy-badge-discount">-{discountPercentage}%</span>
                    )}

                    {/* Hình ảnh */}
                    <div className="position-relative bg-light rounded-4 overflow-hidden" style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                      <p className="card-text text-muted text-truncate mb-2" style={{ fontSize: "0.85rem" }}>{p.description}</p>
                      
                      {/* Giá tiền */}
                      <div className="mb-3" style={{ minHeight: "48px" }}>
                        <span className="text-danger fw-extrabold fs-5 block-price">
                          {p.price.toLocaleString("vi-VN")} VNĐ
                        </span>
                        {hasDiscount && (
                          <>
                            <br />
                            <span className="text-muted text-decoration-line-through me-2" style={{ fontSize: "0.85rem" }}>
                              {p.originalPrice.toLocaleString("vi-VN")} VNĐ
                            </span>
                          </>
                        )}
                      </div>

                    <div className="mt-auto d-flex gap-2">
                      <Link to={`/products/${p.id}`} className="btn btn-outline-danger btn-sm rounded-pill fw-bold flex-grow-1" style={{ borderWidth: "2px" }}>
                        Chi tiết
                      </Link>
                      <button
                        className="btn btn-danger btn-sm rounded-pill px-3"
                        onClick={() => handleAddToCart(p.id)}
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
        )}
      </div>

      {/* Cam kết của MyKingdom */}
      <div className="bg-white py-5 mt-5 border-top">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-4">
              <div className="mb-3 text-danger">
                <i className="fa-solid fa-truck-fast fs-1"></i>
              </div>
              <h5 className="fw-bold">GIAO HÀNG NHANH CHÓNG</h5>
              <p className="text-muted">Giao hàng hoả tốc nội thành trong 2 giờ và giao hàng toàn quốc.</p>
            </div>
            <div className="col-md-4">
              <div className="mb-3 text-warning">
                <i className="fa-solid fa-circle-check fs-1"></i>
              </div>
              <h5 className="fw-bold">ĐỒ CHƠI CHÍNH HÃNG</h5>
              <p className="text-muted">Cam kết 100% đồ chơi chính hãng, kiểm định an toàn chất lượng.</p>
            </div>
            <div className="col-md-4">
              <div className="mb-3 text-success">
                <i className="fa-solid fa-gift fs-1"></i>
              </div>
              <h5 className="fw-bold">TÍCH ĐIỂM ĐỔI QUÀ</h5>
              <p className="text-muted">Tích điểm thành viên nhận ưu đãi lớn và quà tặng nhân dịp sinh nhật bé.</p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default HomePage;
