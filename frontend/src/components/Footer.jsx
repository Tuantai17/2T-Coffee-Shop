import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={{ backgroundColor: "#0b1c55", color: "#fff", paddingTop: "50px", paddingBottom: "20px" }} className="mt-auto border-top border-danger border-4">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-3">
            <Link className="navbar-brand text-decoration-none d-block mb-4" to="/">
              <span className="fw-extrabold fs-2 text-white position-relative" style={{ fontFamily: "'Fredoka One', 'Plus Jakarta Sans', sans-serif", textShadow: "3px 3px 0px #a1141c, -1px -1px 0px #a1141c, 1px -1px 0px #a1141c, -1px 1px 0px #a1141c, 1px 1px 0px #a1141c", letterSpacing: "1px" }}>
                My<span style={{ color: "#ffcf00" }}>KINGDOM</span>
              </span>
            </Link>
            <p className="text-white-50" style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
              Hệ thống siêu thị đồ chơi & sản phẩm dành cho mẹ và bé hàng đầu Việt Nam. Cam kết hàng chính hãng, chất lượng cao, an toàn cho trẻ.
            </p>
            <div className="d-flex gap-3 mt-4">
              <a href="#" className="text-white bg-primary rounded-circle d-flex align-items-center justify-content-center hover-opacity" style={{ width: "35px", height: "35px", textDecoration: "none" }}><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="text-white bg-danger rounded-circle d-flex align-items-center justify-content-center hover-opacity" style={{ width: "35px", height: "35px", textDecoration: "none" }}><i className="fa-brands fa-youtube"></i></a>
              <a href="#" className="text-white bg-dark rounded-circle d-flex align-items-center justify-content-center hover-opacity" style={{ width: "35px", height: "35px", textDecoration: "none" }}><i className="fa-brands fa-tiktok"></i></a>
              <a href="#" className="text-white rounded-circle d-flex align-items-center justify-content-center hover-opacity" style={{ width: "35px", height: "35px", textDecoration: "none", background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}><i className="fa-brands fa-instagram"></i></a>
            </div>
          </div>
          
          <div className="col-6 col-md-3">
            <h6 className="fw-bold mb-4 text-uppercase">Hỗ Trợ Khách Hàng</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white">Trung tâm trợ giúp</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white">Hướng dẫn đặt hàng</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white">Phương thức vận chuyển</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white">Chính sách đổi trả</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white">Liên hệ hỗ trợ</Link></li>
            </ul>
          </div>
          
          <div className="col-6 col-md-3">
            <h6 className="fw-bold mb-4 text-uppercase">Chính Sách & Quy Định</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white">Chính sách bảo mật</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white">Điều khoản sử dụng</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white">Chính sách thành viên</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white">Chính sách trả góp</Link></li>
              <li><Link to="#" className="text-white-50 text-decoration-none hover-white">Quy định chung</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <h6 className="fw-bold mb-4 text-uppercase">Thông Tin Liên Hệ</h6>
            <ul className="list-unstyled d-flex flex-column gap-3" style={{ fontSize: "0.9rem" }}>
              <li className="d-flex gap-3 align-items-start">
                <i className="fa-solid fa-location-dot mt-1 text-danger"></i>
                <span className="text-white-50">768 Nguyễn Kiệm, P.4, Q. Phú Nhuận, TP. Hồ Chí Minh</span>
              </li>
              <li className="d-flex gap-3 align-items-center">
                <i className="fa-solid fa-phone text-danger"></i>
                <span className="text-white-50">1900 1208 (8:00 - 22:00)</span>
              </li>
              <li className="d-flex gap-3 align-items-center">
                <i className="fa-solid fa-envelope text-danger"></i>
                <span className="text-white-50">cskh@mykingdom.com.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary mt-5 mb-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <small className="text-white-50">&copy; {new Date().getFullYear()} MyKingdom Clone. All rights reserved.</small>
          <div className="d-flex gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" height="20" className="bg-white px-2 py-1 rounded" style={{ objectFit: "contain" }} />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" height="20" className="bg-white px-2 py-1 rounded" style={{ objectFit: "contain" }} />
          </div>
        </div>
      </div>
      <style>{`
        .hover-white:hover { color: #fff !important; }
        .hover-opacity:hover { opacity: 0.8; }
      `}</style>
    </footer>
  );
}

export default Footer;
