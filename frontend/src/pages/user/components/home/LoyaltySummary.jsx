import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function LoyaltySummary({ loyaltyData }) {
  return (
    <div className="container mt-5 pt-3">
      <div 
        className="brew-card rounded-4 p-4 p-md-5 position-relative overflow-hidden"
        style={{ borderLeft: "6px solid var(--accent-green)", backgroundColor: "#FAFFF9" }}
      >
        <div className="position-absolute top-0 end-0 opacity-10 p-4" style={{ transform: "scale(1.5) translate(10%, -10%)" }}>
          <i className="fa-solid fa-ranking-star text-success" style={{ fontSize: "15rem" }}></i>
        </div>

        <div className="row position-relative z-1 align-items-center">
          <div className="col-lg-6 mb-4 mb-lg-0 placeholder-glow">
            <h4 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "var(--accent-green)", letterSpacing: "1px" }}>
              LOYALTY CỦA BẠN
            </h4>
            
            {!loyaltyData ? (
              // Skeleton Frame
              <div>
                <div className="placeholder col-3 bg-secondary rounded mb-3"></div>
                <div className="placeholder col-6 bg-secondary rounded mb-4" style={{ height: "50px" }}></div>
                <div className="placeholder col-10 bg-secondary rounded-pill mb-2" style={{ height: "10px" }}></div>
                <div className="placeholder col-5 bg-secondary rounded"></div>
              </div>
            ) : (
              <div>
                {/* Dữ liệu thật sẽ render ở đây */}
              </div>
            )}
          </div>

          <div className="col-lg-6 d-flex flex-column justify-content-center placeholder-glow">
            {!loyaltyData ? (
              // Skeleton Frame
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="bg-white rounded-4 p-3 text-center border border-success border-opacity-25 h-100 shadow-sm d-flex flex-column align-items-center">
                    <div className="placeholder bg-secondary rounded-circle mb-3" style={{ width: "50px", height: "50px" }}></div>
                    <div className="placeholder col-8 bg-secondary rounded mb-2"></div>
                    <div className="placeholder col-6 bg-secondary rounded"></div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white rounded-4 p-3 text-center border border-warning border-opacity-25 h-100 shadow-sm d-flex flex-column align-items-center">
                    <div className="placeholder bg-secondary rounded-circle mb-3" style={{ width: "50px", height: "50px" }}></div>
                    <div className="placeholder col-8 bg-secondary rounded mb-2"></div>
                    <div className="placeholder col-6 bg-secondary rounded"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div></div>
            )}
            <Link to="/profile" className={`btn btn-outline-success rounded-pill w-100 fw-bold py-2 text-uppercase ${!loyaltyData ? 'disabled' : ''}`}>
              Xem chi tiết Loyalty
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoyaltySummary;
