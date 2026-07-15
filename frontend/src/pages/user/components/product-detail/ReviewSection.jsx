import React from 'react';

function ReviewSection({ product }) {
  // Mock review data since no API yet
  const stats = {
    average: product?.rating || 4.8,
    total: product?.reviews || 120,
    breakdown: [
      { stars: 5, percent: 85 },
      { stars: 4, percent: 10 },
      { stars: 3, percent: 3 },
      { stars: 2, percent: 1 },
      { stars: 1, percent: 1 },
    ]
  };

  const mockReviews = [
    {
      id: 1,
      user: "Nguyễn Minh Anh",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
      date: "2 ngày trước",
      content: "Cà phê đậm đà, sữa béo vừa phải, rất ngon! Mình đã uống ở đây nhiều lần và lúc nào cũng ưng ý.",
      images: [
        "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=100",
        "https://images.unsplash.com/photo-1572490122747-3968b75bb811?w=100"
      ],
      likes: 12
    },
    {
      id: 2,
      user: "Trần Quốc Huy",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4,
      date: "1 tuần trước",
      content: "Món tủ của mình mỗi khi đến 2T Coffee Shop. Tuy nhiên hôm nay hơi ngọt xíu.",
      images: [],
      likes: 5
    }
  ];

  return (
    <div className="brew-card rounded-5 p-4 bg-white shadow-sm mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-uppercase mb-0">Đánh giá sản phẩm</h5>
        <button className="btn btn-outline-danger rounded-pill fw-bold px-4">Viết đánh giá</button>
      </div>

      <div className="row g-4 mb-4">
        {/* Stats */}
        <div className="col-md-4 col-lg-3 text-center border-end">
          <div className="display-4 fw-bold text-danger mb-1">{stats.average}</div>
          <div className="text-warning mb-2 fs-5">
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star-half-stroke"></i>
          </div>
          <div className="text-muted small">({stats.total} đánh giá)</div>
        </div>

        {/* Breakdown */}
        <div className="col-md-8 col-lg-5">
          {stats.breakdown.map(item => (
            <div className="d-flex align-items-center gap-2 mb-2 small" key={item.stars}>
              <div style={{ width: "20px" }}>{item.stars} <i className="fa-solid fa-star text-warning"></i></div>
              <div className="progress flex-grow-1" style={{ height: "6px" }}>
                <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${item.percent}%` }}></div>
              </div>
              <div style={{ width: "35px", textAlign: "right" }} className="text-muted">{item.percent}%</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="text-light" />

      {/* Reviews List */}
      <div className="d-flex flex-column gap-4 mt-4">
        {mockReviews.map(review => (
          <div key={review.id} className="d-flex gap-3 pb-3 border-bottom border-light">
            <img src={review.avatar} alt={review.user} className="rounded-circle object-fit-cover" style={{ width: "45px", height: "45px" }} />
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="fw-bold">{review.user}</div>
                <div className="small text-muted">{review.date}</div>
              </div>
              <div className="text-warning small mb-2">
                {[...Array(review.rating)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
              </div>
              <p className="text-muted mb-2 small" style={{ lineHeight: "1.6" }}>{review.content}</p>
              
              {review.images.length > 0 && (
                <div className="d-flex gap-2 mb-2">
                  {review.images.map((img, idx) => (
                    <img key={idx} src={img} alt="review img" className="rounded-3 object-fit-cover border" style={{ width: "60px", height: "60px" }} />
                  ))}
                </div>
              )}

              <button className="btn btn-link p-0 text-muted small text-decoration-none d-flex align-items-center gap-1">
                <i className="fa-regular fa-thumbs-up"></i> Hữu ích ({review.likes})
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-light rounded-pill px-4 text-danger fw-bold border">Xem tất cả đánh giá ({stats.total})</button>
      </div>
    </div>
  );
}

export default ReviewSection;
