import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function MiniGameBanner({ gamesData }) {
  return (
    <div className="container mt-5 pt-3">
      <div 
        className="rounded-4 overflow-hidden position-relative shadow-sm d-flex flex-column flex-md-row align-items-center p-4 p-md-5"
        style={{ background: "linear-gradient(135deg, #4A2E1E 0%, #2E1810 100%)" }}
      >
        <div className="position-absolute top-0 end-0 opacity-25 w-50 h-100 d-none d-md-block" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=600')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>
        <div className="position-absolute top-0 end-0 w-50 h-100 d-none d-md-block" style={{ background: "linear-gradient(90deg, #2E1810 0%, rgba(46,24,16,0) 100%)" }}></div>

        <div className="position-relative z-1 text-center text-md-start mb-4 mb-md-0 placeholder-glow" style={{ maxWidth: "400px", width: "100%" }}>
          <span className="badge bg-warning text-dark mb-3 px-3 py-2 fs-6 rounded-pill">MINI GAME</span>
          
          {!gamesData ? (
             <>
               <div className="placeholder col-10 bg-secondary rounded mb-2" style={{ height: "32px" }}></div>
               <div className="placeholder col-8 bg-secondary rounded mb-4" style={{ height: "32px" }}></div>
               <div className="placeholder col-5 bg-secondary rounded-pill py-3"></div>
             </>
          ) : (
            <>
              <h2 className="fw-bold text-white mb-3">Chơi game nhận điểm & voucher hấp dẫn</h2>
              <Link to="/game" className="btn btn-warning fw-bold rounded-pill px-5 hover-scale py-2 text-uppercase">
                Chơi ngay
              </Link>
            </>
          )}
        </div>

        <div className="position-relative z-1 ms-md-auto d-flex gap-3 justify-content-center placeholder-glow">
          {!gamesData ? (
             <>
               <div className="bg-white p-2 rounded-4 shadow d-flex flex-column align-items-center" style={{ width: "120px" }}>
                 <div className="placeholder bg-secondary w-100 rounded-3 mb-2" style={{ aspectRatio: "1/1" }}></div>
                 <div className="placeholder col-8 bg-secondary rounded"></div>
               </div>
               <div className="d-flex align-items-center text-white opacity-50">
                 <i className="fa-solid fa-plus fs-5"></i>
               </div>
               <div className="bg-white p-2 rounded-4 shadow d-flex flex-column align-items-center" style={{ width: "120px" }}>
                 <div className="placeholder bg-secondary w-100 rounded-3 mb-2" style={{ aspectRatio: "1/1" }}></div>
                 <div className="placeholder col-8 bg-secondary rounded"></div>
               </div>
             </>
          ) : (
             null
          )}
        </div>
      </div>
    </div>
  );
}

export default MiniGameBanner;
