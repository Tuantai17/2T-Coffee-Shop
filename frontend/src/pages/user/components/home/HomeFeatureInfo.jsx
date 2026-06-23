function HomeFeatureInfo() {
  return (
    <div className="bg-white py-5 mt-5 border-top">
      <div className="container">
        <div className="row text-center g-4">
          <div className="col-12 col-md-4">
            <div className="mb-3 d-flex justify-content-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center bg-danger bg-opacity-10" style={{ width: "80px", height: "80px" }}>
                <i className="fa-solid fa-truck-fast fs-1 text-danger"></i>
              </div>
            </div>
            <h5 className="fw-bold text-dark">GIAO HÀNG NHANH CHÓNG</h5>
            <p className="text-muted px-4">Giao hàng hoả tốc nội thành trong 2 giờ và giao hàng toàn quốc.</p>
          </div>
          <div className="col-12 col-md-4">
            <div className="mb-3 d-flex justify-content-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10" style={{ width: "80px", height: "80px" }}>
                <i className="fa-solid fa-shield-halved fs-1 text-primary"></i>
              </div>
            </div>
            <h5 className="fw-bold text-dark">ĐỒ CHƠI CHÍNH HÃNG</h5>
            <p className="text-muted px-4">Cam kết 100% đồ chơi chính hãng, kiểm định an toàn chất lượng.</p>
          </div>
          <div className="col-12 col-md-4">
            <div className="mb-3 d-flex justify-content-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center bg-warning bg-opacity-10" style={{ width: "80px", height: "80px" }}>
                <i className="fa-solid fa-gift fs-1 text-warning"></i>
              </div>
            </div>
            <h5 className="fw-bold text-dark">TÍCH ĐIỂM ĐỔI QUÀ</h5>
            <p className="text-muted px-4">Tích điểm thành viên nhận ưu đãi lớn và quà tặng nhân dịp sinh nhật bé.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeFeatureInfo;
