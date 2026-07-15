import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--primary-color)", color: "#fff", paddingTop: "60px", paddingBottom: "20px" }} className="mt-auto">
      <div className="container">
        <div className="row g-4 mb-5">
          <div className="col-12 col-md-4 pe-md-5">
            <Link className="navbar-brand text-decoration-none d-flex align-items-center gap-2 mb-4" to="/">
              <img src="/logo_2Tcoffee_shop.png" alt="2T Coffee Shop" style={{ height: "70px", objectFit: "contain" }} className="bg-white p-1 rounded shadow-sm" />
              <span className="fw-bold fs-3 text-white" style={{ letterSpacing: "-0.5px" }}>
                2T Coffee <span style={{ color: "var(--secondary-color)" }}>Shop</span>
              </span>
            </Link>
            <p className="text-white-50 mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
              Thưởng thức đồ uống chất lượng, trải nghiệm tuyệt vời mỗi ngày. Khơi nguồn cảm hứng từ những hạt cà phê tinh hoa.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-white bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center hover-opacity transition-all" style={{ width: "40px", height: "40px", textDecoration: "none" }}><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="text-white bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center hover-opacity transition-all" style={{ width: "40px", height: "40px", textDecoration: "none" }}><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="text-white bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center hover-opacity transition-all" style={{ width: "40px", height: "40px", textDecoration: "none" }}><i className="fa-brands fa-tiktok"></i></a>
              <a href="#" className="text-white bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center hover-opacity transition-all" style={{ width: "40px", height: "40px", textDecoration: "none" }}><i className="fa-brands fa-youtube"></i></a>
            </div>
          </div>
          
          <div className="col-6 col-md-2">
            <h6 className="fw-bold mb-4 text-uppercase text-white" style={{ letterSpacing: "1px" }}>Về Chúng Tôi</h6>
            <ul className="list-unstyled d-flex flex-column gap-3" style={{ fontSize: "0.95rem" }}>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white transition-all">Giới thiệu</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white transition-all">Tuyển dụng</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white transition-all">Cửa hàng</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white transition-all">Tin tức</Link></li>
            </ul>
          </div>
          
          <div className="col-6 col-md-2">
            <h6 className="fw-bold mb-4 text-uppercase text-white" style={{ letterSpacing: "1px" }}>Chính Sách</h6>
            <ul className="list-unstyled d-flex flex-column gap-3" style={{ fontSize: "0.95rem" }}>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white transition-all">Điều khoản sử dụng</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white transition-all">Chính sách bảo mật</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white transition-all">Chính sách đổi trả</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white transition-all">Phương thức thanh toán</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-4">
            <h6 className="fw-bold mb-4 text-uppercase text-white" style={{ letterSpacing: "1px" }}>Đăng ký nhận tin</h6>
            <p className="text-white-50 mb-3" style={{ fontSize: "0.95rem" }}>Nhận ưu đãi và tin tức mới nhất từ 2T Coffee Shop.</p>
            <div className="position-relative mb-4">
              <input type="email" className="form-control rounded-pill bg-white bg-opacity-10 border-0 text-white ps-4 py-3 pe-5" placeholder="Nhập email của bạn..." style={{ backdropFilter: "blur(4px)" }} />
              <button className="btn position-absolute top-50 end-0 translate-middle-y text-white h-100 px-4 rounded-pill hover-opacity">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
            <div className="d-flex gap-3 align-items-center">
              <i className="fa-solid fa-phone-volume fs-3" style={{ color: "var(--secondary-color)" }}></i>
              <div>
                <div className="text-white-50 small">Hotline hỗ trợ</div>
                <div className="fw-bold fs-5 text-white">1900 1234</div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-secondary mb-4 opacity-25" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <small className="text-white-50">&copy; {new Date().getFullYear()} 2T Coffee Shop. Tất cả quyền được bảo lưu.</small>
          <div className="d-flex gap-3 align-items-center">
            <span className="text-white-50 small">Thanh toán an toàn:</span>
            <div className="d-flex gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" height="24" className="bg-white px-2 py-1 rounded shadow-sm" style={{ objectFit: "contain" }} />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" height="24" className="bg-white px-2 py-1 rounded shadow-sm" style={{ objectFit: "contain" }} />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .hover-white:hover { color: #fff !important; padding-left: 5px; }
        .hover-opacity:hover { opacity: 0.8; }
        .form-control::placeholder { color: rgba(255,255,255,0.5); }
      `}</style>
    </footer>
  );
}

export default Footer;
