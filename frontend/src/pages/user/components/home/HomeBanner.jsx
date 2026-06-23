import { Link } from "react-router-dom";
import { applyImageFallback, DEFAULT_IMAGE_FALLBACK, resolveImageUrl } from "../../../../utils/imageFallback";

function HomeBanner({ banner }) {
  return (
    <div className="container mt-3">
      <div className="card border-0 rounded-4 overflow-hidden shadow-sm">
        {banner ? (
          <div className="position-relative">
            <img
              src={resolveImageUrl(banner.imageUrl)}
              alt={banner.title || "Banner trang chủ"}
              className="w-100 h-auto img-fluid"
              style={{ maxHeight: "450px", objectFit: "cover" }}
              onError={(event) => applyImageFallback(event, DEFAULT_IMAGE_FALLBACK)}
            />
            {/* Nếu bạn muốn giữ text đè lên ảnh. Với MyKingdom thường banner là full hình ảnh thiết kế sẵn */}
            {banner.title && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0) 100%)", pointerEvents: "none" }}>
                <div className="text-white p-4 p-lg-5" style={{ maxWidth: "520px", pointerEvents: "auto" }}>
                  <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-bold mb-3">Khuyến mãi cực hot</span>
                  <h2 className="fw-bold mb-2">{banner.title}</h2>
                  <p className="mb-3 text-white-50">{banner.subtitle}</p>
                  <Link to={banner.targetUrl || "/products"} className="btn btn-danger rounded-pill px-4 fw-bold">
                    Khám phá ngay
                  </Link>
                </div>
              </div>
            )}
            {/* Thêm hiệu ứng nút bấm mũi tên trái/phải giả lập (nếu làm slider sau này) */}
            <button className="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-3 shadow-sm d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px', opacity: '0.8' }}>
              <i className="fa-solid fa-chevron-left text-danger"></i>
            </button>
            <button className="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-3 shadow-sm d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px', opacity: '0.8' }}>
              <i className="fa-solid fa-chevron-right text-danger"></i>
            </button>
          </div>
        ) : (
          <img
            src="/mykingdom_banner.png"
            alt="MyKingdom Promotional Banner"
            className="w-100 h-auto img-fluid"
            style={{ maxHeight: "450px", objectFit: "cover" }}
          />
        )}
      </div>
    </div>
  );
}

export default HomeBanner;
