import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../../utils/formatPrice';

function ProfileDashboard({ profile, orders = [] }) {
  const firstName = profile?.userDetails?.firstName || profile?.userName || "Thành viên";
  
  // Real data
  const loyaltyPoints = profile?.loyaltyPoints || 0;
  const ordersCount = orders.length;

  const statCards = [
    { icon: "fa-bag-shopping", color: "text-danger", bg: "bg-danger-subtle", value: ordersCount, label: "Đơn hàng", link: "/profile/orders", linkText: "Xem chi tiết" },
    { icon: "fa-star", color: "text-warning", bg: "bg-warning-subtle", value: loyaltyPoints.toLocaleString("vi-VN"), label: "Điểm Loyalty", link: "#loyalty", linkText: "Xem chi tiết" },
  ];

  const recentOrdersData = orders.slice(0, 5);

  const recentOrders = recentOrdersData.map(recentOrderData => {
    const formattedCode = `BM${String(recentOrderData.id).padStart(8, "0")}`;
    const orderDateObj = new Date(recentOrderData.orderedDate || Date.now());
    const orderDate = orderDateObj.toLocaleDateString("vi-VN");
    let orderTime = "";
    
    if (Array.isArray(recentOrderData.orderedDate) && recentOrderData.orderedDate.length > 3) {
      orderTime = `${String(recentOrderData.orderedDate[3]).padStart(2, '0')}:${String(recentOrderData.orderedDate[4]).padStart(2, '0')}`;
    } else if (!Array.isArray(recentOrderData.orderedDate) && String(recentOrderData.orderedDate).includes("T")) {
      orderTime = orderDateObj.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
    }

    return {
      id: formattedCode,
      date: orderDate,
      time: orderTime,
      itemsCount: recentOrderData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      total: recentOrderData.total || 0,
      status: recentOrderData.status === "COMPLETED" ? "Hoàn thành" 
            : recentOrderData.status === "SHIPPING" ? "Đang giao"
            : recentOrderData.status === "PACKING" ? "Đang chuẩn bị"
            : recentOrderData.status === "CANCELLED" ? "Đã hủy"
            : "Chờ duyệt",
      image: recentOrderData.items?.[0]?.product?.imageUrl || "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500",
      rawId: recentOrderData.id
    };
  });

  // Loyalty calculations based on real points
  const currentPoints = loyaltyPoints;
  const nextTierPoints = currentPoints < 3000 ? 3000 : (currentPoints < 10000 ? 10000 : currentPoints);
  const pointsToNextTier = nextTierPoints > currentPoints ? nextTierPoints - currentPoints : 0;
  const progressPercent = nextTierPoints > 0 ? Math.min(100, Math.round((currentPoints / nextTierPoints) * 100)) : 100;
  
  let currentTier = "NEW MEMBER";
  let tierImage = "/images/bronze-medal.png";
  let nextTierName = "SILVER";
  if (currentPoints >= 10000) {
    currentTier = "DIAMOND MEMBER";
    tierImage = "/images/diamond-medal.png";
    nextTierName = "VVIP";
  } else if (currentPoints >= 3000) {
    currentTier = "GOLD MEMBER";
    tierImage = "/images/gold-medal.png";
    nextTierName = "DIAMOND";
  } else if (currentPoints >= 1000) {
    currentTier = "SILVER MEMBER";
    tierImage = "/images/silver-medal.png";
    nextTierName = "GOLD";
  }

  return (
    <div className="profile-dashboard">
      <div className="row g-4">
        {/* Left Column */}
        <div className="col-lg-8">
          
          {/* Welcome Section */}
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              Xin chào, {firstName}! <span style={{ fontSize: "1.2rem" }}>👋</span>
            </h3>
            <p className="text-muted">Hôm nay bạn muốn thưởng thức gì?</p>
          </div>

          {/* Stat Cards */}
          <div className="row g-3 mb-4">
            {statCards.map((stat, idx) => (
              <div key={idx} className="col-md-6 col-sm-6 col-12">
                <div className="card border-0 rounded-4 p-3 bg-white shadow-sm h-100 hover-lift transition-all">
                  <div className="d-flex align-items-center gap-3 h-100">
                    <div className={`rounded-4 d-flex align-items-center justify-content-center ${stat.bg} ${stat.color} flex-shrink-0`} style={{ width: "60px", height: "60px" }}>
                      <i className={`fa-solid ${stat.icon} fs-3`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <span className="small text-muted fw-semibold">{stat.label}</span>
                      <div className="fw-bold text-dark mb-1" style={{ fontSize: "1.5rem" }}>{stat.value}</div>
                      <Link to={stat.link} className="text-decoration-none small fw-medium" style={{ color: "#c67c4e" }}>
                        {stat.linkText} <i className="fa-solid fa-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Row: Recent Orders */}
          {recentOrders.length > 0 && (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-end mb-3">
                <h6 className="fw-bold mb-0">Đơn hàng gần nhất</h6>
                <Link to="/profile/orders" className="text-decoration-none small text-danger fw-medium">Xem tất cả <i className="fa-solid fa-chevron-right" style={{fontSize:"10px"}}></i></Link>
              </div>
              <div className="d-flex flex-column gap-3">
                {recentOrders.map((order, idx) => (
                  <div key={idx} className="card border-0 rounded-4 p-4 bg-white shadow-sm hover-lift transition-all">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <div className="d-flex gap-3 mb-0">
                          <img src={order.image} alt="Order" className="rounded-4 object-fit-cover shadow-sm" style={{ width: "80px", height: "80px" }} />
                          <div className="d-flex flex-column justify-content-center">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="fw-bold text-dark">{order.id}</span>
                              <span className="badge bg-primary-subtle text-primary rounded-pill" style={{ fontSize: "10px" }}>{order.status}</span>
                            </div>
                            <div className="text-muted small mb-1">{order.date} {order.time && `· ${order.time}`}</div>
                            <div className="text-dark fw-medium">{order.itemsCount} món · {formatPrice(order.total)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <Link to="/profile/orders" className="btn btn-outline-danger w-100 rounded-pill fw-bold" style={{ fontSize: "13px" }}>
                          CHI TIẾT ĐƠN HÀNG
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-lg-4 d-flex flex-column gap-4">
          
          {/* Loyalty Card */}
          <div className="card border-0 rounded-4 p-4 bg-white shadow-sm position-relative overflow-hidden text-center hover-lift transition-all">
            <div className="position-absolute bg-light rounded-circle" style={{ width: "150px", height: "150px", top: "-50px", right: "-50px", opacity: 0.5 }}></div>
            
            <h6 className="text-muted small fw-bold mb-3 text-uppercase">Hạng thành viên</h6>
            
            <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
              <img src={tierImage} alt="Tier" style={{ width: "60px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }} onError={(e) => e.target.style.display = 'none'} />
              <div className="text-start">
                <div className="fw-extrabold text-dark" style={{ fontSize: "18px", letterSpacing: "1px" }}>{currentTier}</div>
                <div className="fw-bold text-dark fs-5">{currentPoints.toLocaleString("vi-VN")} <span className="small text-muted fw-normal">điểm</span></div>
              </div>
            </div>

            {pointsToNextTier > 0 ? (
              <>
                <div className="progress rounded-pill bg-light border mb-2" style={{ height: "8px" }}>
                  <div className="progress-bar rounded-pill" style={{ width: `${progressPercent}%`, backgroundColor: "#c67c4e" }}></div>
                </div>
                <div className="text-start text-muted mb-3" style={{ fontSize: "11px" }}>
                  <span className="fw-bold text-dark">{pointsToNextTier.toLocaleString("vi-VN")}</span> điểm nữa để lên hạng <span className="fw-bold text-warning">{nextTierName}</span>
                </div>
              </>
            ) : (
              <div className="text-start text-success fw-bold mb-3 small">
                Bạn đã đạt hạng cao nhất!
              </div>
            )}
            
            <button className="btn btn-link text-danger fw-bold text-decoration-none p-0 small">
              Xem chi tiết hạng thành viên <i className="fa-solid fa-arrow-right ms-1" style={{ fontSize: "10px" }}></i>
            </button>
          </div>

        </div>
      </div>

      <style>{`
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.06) !important;
        }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}

export default ProfileDashboard;
