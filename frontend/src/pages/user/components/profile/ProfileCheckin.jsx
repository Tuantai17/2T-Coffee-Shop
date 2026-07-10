import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


function ProfileCheckin({ profile }) {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  
  // Real data mixed with mock for UI
  
  const [loading, setLoading] = useState(true);
  const [checkinData, setCheckinData] = useState(null);

  useEffect(() => {
    // Fetch real checkin data
    axios.get('/api/loyalty/me/checkin-status', { headers: { 'X-User-Id': profile?.id || 1 } })
      .then(res => {
        setCheckinData(res.data);
        setIsCheckedIn(res.data.checkedInToday);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi lấy dữ liệu điểm danh:', err);
        setLoading(false);
      });
  }, [profile]);

  const points = profile?.loyaltyPoints || 2450;
  
  // Handlers
  const handleCheckIn = () => {
    axios.post('/api/loyalty/checkin', {}, { headers: { 'X-User-Id': profile?.id || 1 } })
      .then(res => {
        setIsCheckedIn(true);
        setCheckinData(prev => ({
          ...prev,
          currentStreak: (prev?.currentStreak || 0) + 1,
          checkedInToday: true
        }));
        // Could show toast or animation here
      })
      .catch(err => {
        console.error('Lỗi điểm danh:', err);
      });
  };

  return (
    <div className="profile-checkin fade-in">
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: "1px" }}>
          ĐIỂM DANH HẰNG NGÀY <i className="fa-regular fa-calendar-check text-warning"></i>
        </h4>
        <p className="text-muted mb-0 small">Điểm danh mỗi ngày để nhận điểm Loyalty và nhiều phần thưởng hấp dẫn!</p>
      </div>

      <div className="row g-4 mb-4">
        {/* Main Content (Left Column) */}
        <div className="col-lg-8">
          
          {/* Top 3 Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift text-center position-relative overflow-hidden">
                <div className="text-muted small fw-bold mb-2 text-uppercase text-start">Hôm nay</div>
                <div className="text-muted small mb-3 text-start">08/06/2026</div>
                
                {isCheckedIn ? (
                  <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-sm check-animation" style={{ width: "40px", height: "40px" }}>
                      <i className="fa-solid fa-check fs-5"></i>
                    </div>
                    <div className="fw-bold text-success mb-2" style={{ fontSize: "14px" }}>Bạn đã điểm danh<br/>thành công!</div>
                    <div className="text-muted" style={{ fontSize: "10px" }}>Chúc mừng! Bạn vừa nhận</div>
                    <div className="text-warning fw-bold small"><i className="fa-solid fa-star" style={{fontSize:"10px"}}></i> +20 điểm Loyalty</div>
                  </div>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 mt-2">
                    <button onClick={handleCheckIn} className="btn btn-warning rounded-pill fw-bold text-white shadow-sm px-4 py-2 pulse-btn">
                      ĐIỂM DANH NGAY
                    </button>
                    <div className="text-muted mt-2" style={{ fontSize: "10px" }}>Nhận ngay +20 điểm</div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift text-center">
                <div className="text-muted small fw-bold mb-2 text-uppercase text-start">Chuỗi hiện tại</div>
                <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="fa-solid fa-fire text-danger fire-animation" style={{ fontSize: "32px" }}></i>
                    <div className="fw-black text-danger" style={{ fontSize: "28px" }}>{checkinData ? checkinData.currentStreak : 12}</div>
                  </div>
                  <div className="fw-bold text-dark mb-2">ngày liên tiếp</div>
                  <div className="text-muted" style={{ fontSize: "10px" }}>Cố gắng duy trì để<br/>nhận phần thưởng lớn!</div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift text-center position-relative">
                <div className="text-muted small fw-bold mb-2 text-uppercase text-start">Phần thưởng tiếp theo</div>
                <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
                  <div className="text-muted" style={{ fontSize: "11px" }}>Bạn chỉ còn</div>
                  <div className="fw-black text-primary my-1" style={{ fontSize: "24px" }}>2 ngày</div>
                  <div className="text-muted mb-2" style={{ fontSize: "11px" }}>để nhận Voucher</div>
                  <div className="bg-primary-subtle text-primary fw-bold rounded px-3 py-1 border border-primary border-opacity-25 shadow-sm">
                    20% OFF
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar & 7-Day Streak */}
          <div className="row g-3 mb-4">
            <div className="col-md-5">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-uppercase" style={{ fontSize: "11px" }}>Lịch điểm danh Tháng 6/2026</h6>
                </div>
                
                <div className="calendar-grid">
                  <div className="d-flex justify-content-between text-muted fw-bold mb-2 text-center" style={{ fontSize: "10px" }}>
                    <div style={{width:"14%"}}>T2</div><div style={{width:"14%"}}>T3</div><div style={{width:"14%"}}>T4</div>
                    <div style={{width:"14%"}}>T5</div><div style={{width:"14%"}}>T6</div><div style={{width:"14%"}}>T7</div><div style={{width:"14%"}}>CN</div>
                  </div>
                  <div className="d-flex flex-wrap text-center" style={{ fontSize: "11px" }}>
                    {/* Empty slots for May */}
                    {[26, 27, 28, 29, 30, 31].map(d => <div key={`prev-${d}`} style={{width:"14%", padding:"5px 0"}} className="text-light">{d}</div>)}
                    {/* June days */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(d => {
                      let statusClass = "text-muted";
                      let icon = null;
                      if ([1, 2, 3, 5, 6].includes(d)) statusClass = "text-success fw-bold bg-success-subtle rounded-circle";
                      if (d === 4) { statusClass = "text-warning fw-bold bg-warning-subtle rounded-circle position-relative"; icon = <i className="fa-solid fa-star position-absolute text-warning" style={{fontSize:"8px", top:"-2px", right:"-2px"}}></i>; }
                      if (d === 7) statusClass = "text-danger fw-bold bg-danger-subtle rounded-circle";
                      if (d === 8) statusClass = "text-white fw-bold bg-success rounded-circle shadow-sm";
                      
                      return (
                        <div key={`curr-${d}`} style={{width:"14%", padding:"5px 0"}} className="d-flex justify-content-center align-items-center">
                          <div className={`${statusClass} d-flex align-items-center justify-content-center`} style={{width: "24px", height: "24px"}}>
                            {d}
                            {icon}
                          </div>
                        </div>
                      )
                    })}
                    {/* Empty slots for July */}
                    {[1, 2, 3, 4, 5, 6].map(d => <div key={`next-${d}`} style={{width:"14%", padding:"5px 0"}} className="text-light">{d}</div>)}
                  </div>
                </div>
                
                <div className="d-flex justify-content-between mt-3 text-muted" style={{ fontSize: "9px" }}>
                  <div><i className="fa-regular fa-circle-check text-success"></i> Đã điểm danh</div>
                  <div><i className="fa-solid fa-star text-warning"></i> Ngày may mắn (x2)</div>
                  <div><i className="fa-solid fa-circle-xmark text-danger"></i> Đã bỏ lỡ</div>
                  <div><span className="bg-success rounded-circle d-inline-block" style={{width:"8px", height:"8px"}}></span> Hôm nay</div>
                </div>
              </div>
            </div>

            <div className="col-md-7">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift text-center position-relative overflow-hidden">
                <h6 className="fw-bold mb-4 text-uppercase text-start" style={{ fontSize: "11px" }}>Thưởng chuỗi 7 ngày</h6>
                
                <div className="d-flex justify-content-between position-relative px-2 mt-2">
                  {/* Progress Line */}
                  <div className="position-absolute bg-light rounded-pill" style={{ height: "4px", width: "90%", left: "5%", top: "40%", zIndex: 0 }}></div>
                  <div className="position-absolute bg-success rounded-pill" style={{ height: "4px", width: "75%", left: "5%", top: "40%", zIndex: 1, transition: "width 1s ease-in-out" }}></div>
                  
                  {/* Days */}
                  {[
                    { day: "Ngày 1", pts: "+10 điểm", done: true },
                    { day: "Ngày 2", pts: "+10 điểm", done: true },
                    { day: "Ngày 3", pts: "+15 điểm", done: true },
                    { day: "Ngày 4", pts: "+15 điểm", done: true },
                    { day: "Ngày 5", pts: "+20 điểm", done: true },
                    { day: "Ngày 6", pts: "+20 điểm", done: true, current: true },
                    { day: "Ngày 7", pts: "Voucher 20%", done: false, gift: true },
                  ].map((item, i) => (
                    <div className="position-relative z-2 d-flex flex-column align-items-center bg-white px-1" key={i} style={{ width: "14%" }}>
                      <div className="text-muted fw-bold mb-2" style={{ fontSize: "9px" }}>{item.day}</div>
                      
                      {item.gift ? (
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${item.done ? 'bg-success text-white' : 'bg-danger text-white shadow-sm glow-danger'}`} style={{ width: "24px", height: "24px" }}>
                          <i className="fa-solid fa-gift" style={{ fontSize: "10px" }}></i>
                        </div>
                      ) : (
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${item.done ? 'bg-success text-white' : 'bg-light text-muted border'}`} style={{ width: "20px", height: "20px" }}>
                          {item.done ? <i className="fa-solid fa-check" style={{ fontSize: "10px" }}></i> : <div style={{width:"8px", height:"8px"}} className="bg-secondary rounded-circle"></div>}
                        </div>
                      )}
                      
                      <div className={`mt-2 fw-bold ${item.gift ? 'text-danger' : (item.done ? 'text-success' : 'text-muted')}`} style={{ fontSize: "9px" }}>{item.pts}</div>
                      
                      {item.current && (
                        <div className="position-absolute bg-warning-subtle text-warning border border-warning rounded px-1" style={{ fontSize: "8px", top: "-20px", whiteSpace: "nowrap" }}>
                          Hôm nay
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History & Monthly Stats */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-uppercase" style={{ fontSize: "11px" }}>Lịch sử điểm danh</h6>
                  <Link to="#" className="text-danger small text-decoration-none" style={{ fontSize: "10px" }}>Xem tất cả <i className="fa-solid fa-chevron-right"></i></Link>
                </div>
                
                <div className="d-flex flex-column gap-2 position-relative pt-2">
                  <div className="position-absolute bg-light h-100" style={{ width: "1px", left: "6px", top: "0", zIndex: 0 }}></div>
                  
                  {[
                    { date: '08/06/2026', title: 'Điểm danh thành công', pts: '+20 điểm', type: 'normal' },
                    { date: '07/06/2026', title: 'Điểm danh thành công', pts: '+20 điểm', type: 'normal' },
                    { date: '06/06/2026', title: 'Điểm danh thành công (Ngày may mắn)', pts: '+30 điểm', type: 'lucky' },
                    { date: '05/06/2026', title: 'Điểm danh thành công', pts: '+20 điểm', type: 'normal' },
                    { date: '04/06/2026', title: 'Điểm danh thành công', pts: '+15 điểm', type: 'normal' },
                  ].map((item, i) => (
                    <div className="d-flex gap-3 position-relative z-1 align-items-start" key={i}>
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mt-1 border border-white" style={{ width: "14px", height: "14px" }}>
                        <i className="fa-solid fa-check" style={{ fontSize: "6px" }}></i>
                      </div>
                      <div className="flex-grow-1 pb-2 border-bottom border-light">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-muted" style={{ fontSize: "10px" }}><i className="fa-regular fa-clock me-1"></i> {item.date}</span>
                          <span className={`fw-bold small ${item.type === 'lucky' ? 'text-warning' : 'text-success'}`}>{item.pts}</span>
                        </div>
                        <div className="text-dark fw-medium" style={{ fontSize: "11px" }}>
                          {item.title} {item.type === 'lucky' && <i className="fa-solid fa-star text-warning ms-1" style={{fontSize: "10px"}}></i>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift">
                <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "11px" }}>Thống kê tháng này</h6>
                
                <div className="row g-2">
                  <div className="col-6">
                    <div className="card bg-light border-0 rounded-3 p-2 d-flex flex-row align-items-center gap-2">
                      <div className="bg-white text-success rounded px-2 py-1 shadow-sm"><i className="fa-regular fa-calendar-check fs-5"></i></div>
                      <div>
                        <div className="text-muted" style={{ fontSize: "9px" }}>Số ngày điểm danh</div>
                        <div className="fw-bold text-dark" style={{ fontSize: "12px" }}>18 <span className="text-muted fw-normal" style={{ fontSize: "10px" }}>/ 30 ngày</span></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div className="card bg-light border-0 rounded-3 p-2 d-flex flex-row align-items-center gap-2">
                      <div className="bg-white text-warning rounded px-2 py-1 shadow-sm"><i className="fa-solid fa-star fs-5"></i></div>
                      <div>
                        <div className="text-muted" style={{ fontSize: "9px" }}>Tổng điểm nhận được</div>
                        <div className="fw-bold text-dark" style={{ fontSize: "12px" }}>350 <span className="text-muted fw-normal" style={{ fontSize: "10px" }}>điểm</span></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div className="card bg-light border-0 rounded-3 p-2 d-flex flex-row align-items-center gap-2">
                      <div className="bg-white text-primary rounded px-2 py-1 shadow-sm"><i className="fa-solid fa-ticket fs-5"></i></div>
                      <div>
                        <div className="text-muted" style={{ fontSize: "9px" }}>Voucher đã nhận</div>
                        <div className="fw-bold text-dark" style={{ fontSize: "12px" }}>2 <span className="text-muted fw-normal" style={{ fontSize: "10px" }}>Voucher</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="card bg-light border-0 rounded-3 p-2 d-flex flex-row align-items-center gap-2">
                      <div className="bg-white text-danger rounded px-2 py-1 shadow-sm"><i className="fa-solid fa-arrow-trend-up fs-5"></i></div>
                      <div>
                        <div className="text-muted" style={{ fontSize: "9px" }}>Chuỗi dài nhất</div>
                        <div className="fw-bold text-dark" style={{ fontSize: "12px" }}>12 <span className="text-muted fw-normal" style={{ fontSize: "10px" }}>ngày</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gamification Bottom Row */}
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift position-relative">
                <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "11px" }}><i className="fa-solid fa-bullseye text-danger me-1"></i> Nhiệm vụ hôm nay</h6>
                
                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="d-flex justify-content-between align-items-center bg-light rounded p-2 border border-success">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa-regular fa-calendar-check text-success"></i>
                      <div className="fw-bold text-dark" style={{ fontSize: "10px" }}>Điểm danh hàng ngày</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-success fw-bold" style={{ fontSize: "9px" }}>+20 điểm</span>
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "16px", height: "16px" }}><i className="fa-solid fa-check" style={{ fontSize: "8px" }}></i></div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center bg-light rounded p-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa-solid fa-bag-shopping text-muted"></i>
                      <div className="fw-bold text-dark" style={{ fontSize: "10px" }}>Đặt 1 đơn hàng</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-success fw-bold" style={{ fontSize: "9px" }}>+50 điểm</span>
                      <button className="btn btn-outline-danger btn-sm py-0 px-2 rounded" style={{ fontSize: "9px" }}>Đặt ngay</button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center bg-light rounded p-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa-solid fa-gamepad text-muted"></i>
                      <div className="fw-bold text-dark" style={{ fontSize: "10px" }}>Chơi Mini Game</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-success fw-bold" style={{ fontSize: "9px" }}>+30 điểm</span>
                      <button className="btn btn-outline-primary btn-sm py-0 px-2 rounded" style={{ fontSize: "9px" }}>Chơi ngay</button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <div className="progress rounded-pill bg-light" style={{ height: "6px" }}>
                    <div className="progress-bar bg-danger rounded-pill" style={{ width: "33%" }}></div>
                  </div>
                  <div className="text-center text-muted mt-1" style={{ fontSize: "9px" }}>2 / 3 nhiệm vụ hoàn thành</div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift text-center" style={{ backgroundImage: "linear-gradient(to bottom right, #ffffff, #fff9f0)" }}>
                <h6 className="fw-bold mb-1 text-uppercase text-warning" style={{ fontSize: "11px" }}><i className="fa-solid fa-star me-1"></i> Phần thưởng đặc biệt</h6>
                <div className="text-muted mb-3" style={{ fontSize: "9px" }}>Điểm danh đủ 30 ngày</div>
                
                <div className="position-relative mx-auto mb-2" style={{ width: "80px", height: "80px" }}>
                  <img src="https://minio.thecoffeehouse.com/image/admin/1690947854_binh-giu-nhiet.png" alt="Mystery Box" className="img-fluid drop-shadow mystery-box-animation" style={{ filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }} onError={(e) => e.target.style.display = 'none'} />
                  <i className="fa-solid fa-gift text-danger position-absolute top-50 start-50 translate-middle fs-1" style={{ display: "none" }} id="fallback-gift"></i>
                </div>
                
                <div className="fw-bold text-dark mb-1" style={{ fontSize: "12px" }}>Mở Mystery Box</div>
                <div className="text-muted mb-3" style={{ fontSize: "9px" }}>Nhận ngay phần thưởng ngẫu nhiên</div>
                
                <div className="d-flex justify-content-center gap-2 mt-auto">
                  <div className="bg-white rounded border px-2 py-1 shadow-sm d-flex align-items-center gap-1"><i className="fa-solid fa-mug-hot text-dark" style={{fontSize:"8px"}}></i> <span style={{fontSize:"8px"}} className="fw-bold">Coffee miễn phí</span></div>
                  <div className="bg-white rounded border px-2 py-1 shadow-sm d-flex align-items-center gap-1"><i className="fa-solid fa-ticket text-danger" style={{fontSize:"8px"}}></i> <span style={{fontSize:"8px"}} className="fw-bold">Voucher</span></div>
                  <div className="bg-white rounded border px-2 py-1 shadow-sm d-flex align-items-center gap-1"><i className="fa-solid fa-coins text-warning" style={{fontSize:"8px"}}></i> <span style={{fontSize:"8px"}} className="fw-bold">100 điểm</span></div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift">
                <h6 className="fw-bold mb-2 text-uppercase text-danger" style={{ fontSize: "11px" }}><i className="fa-solid fa-clover me-1"></i> Ngày may mắn</h6>
                <div className="text-muted mb-3" style={{ fontSize: "10px" }}>Một số ngày trong tháng sẽ là ngày may mắn!</div>
                
                <div className="bg-warning-subtle rounded-3 p-3 text-center border border-warning border-opacity-50 mb-3 flex-grow-1 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <i className="fa-solid fa-star text-warning fs-4 glow-warning"></i>
                    <div className="fw-bold text-dark" style={{ fontSize: "12px" }}>Điểm x2 <span className="text-muted fw-normal" style={{ fontSize: "10px" }}>trong ngày may mắn</span></div>
                  </div>
                </div>
                
                <div className="d-flex justify-content-between align-items-end mt-auto">
                  <div>
                    <div className="text-muted" style={{ fontSize: "9px" }}>Ngày may mắn tiếp theo</div>
                    <div className="fw-black text-danger" style={{ fontSize: "16px" }}>11/06/2026</div>
                  </div>
                  <div className="bg-light rounded p-2 text-center shadow-sm">
                    <div className="bg-danger text-white rounded-top fw-bold" style={{ fontSize: "8px", padding: "2px 5px" }}>THÁNG 6</div>
                    <div className="fw-black text-dark" style={{ fontSize: "16px" }}>11</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (Left Column is lg-8, this is lg-4) */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4">
            
            {/* Loyalty Points summary */}
            <div className="card border-0 rounded-4 p-4 bg-white shadow-sm hover-lift text-center position-relative overflow-hidden">
              <div className="position-absolute bg-warning opacity-10 rounded-circle" style={{ width: "100px", height: "100px", top: "-30px", right: "-30px" }}></div>
              <h6 className="fw-bold mb-3 text-uppercase text-start" style={{ fontSize: "11px" }}>Điểm Loyalty của bạn</h6>
              <div className="d-flex align-items-center justify-content-center gap-3 mb-2 z-1 position-relative">
                <div className="bg-warning rounded-circle text-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: "48px", height: "48px" }}>
                  <i className="fa-solid fa-crown fs-4"></i>
                </div>
                <div className="text-start">
                  <div className="fw-black text-danger lh-1" style={{ fontSize: "28px" }}>{points.toLocaleString("vi-VN")} <span className="text-muted fw-bold" style={{ fontSize: "14px" }}>điểm</span></div>
                  <div className="text-muted fw-medium" style={{ fontSize: "11px" }}>≈ {(points * 100).toLocaleString("vi-VN")}đ giá trị quy đổi</div>
                </div>
              </div>
              <button className="btn btn-outline-secondary btn-sm rounded-pill mt-3 w-100 fw-medium">Lịch sử điểm</button>
            </div>

            {/* Vouchers */}
            <div className="card border-0 rounded-4 p-4 bg-white shadow-sm hover-lift">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0 text-uppercase" style={{ fontSize: "11px" }}>Voucher của bạn</h6>
                <Link to="#" className="text-danger small text-decoration-none" style={{ fontSize: "10px" }}>Xem tất cả <i className="fa-solid fa-chevron-right"></i></Link>
              </div>
              
              <div className="d-flex flex-column gap-2">
                {[
                  { code: 'FREESHIP20', desc: 'Giảm 20% phí ship', date: '20/06/2026', bg: 'bg-primary-subtle' },
                  { code: 'WELCOME50', desc: 'Giảm 50.000đ đơn từ 200K', date: '25/06/2026', bg: 'bg-success-subtle' },
                  { code: 'BDAY100', desc: 'Giảm 100.000đ Sinh nhật', date: '30/06/2026', bg: 'bg-danger-subtle' }
                ].map((v, i) => (
                  <div className={`card border-0 rounded-3 p-2 d-flex flex-row align-items-center gap-3 ${v.bg}`} key={i}>
                    <div className="border-end border-dark border-opacity-10 pe-2 text-center" style={{ width: "40px" }}>
                      <i className="fa-solid fa-ticket text-dark opacity-50 fs-5"></i>
                    </div>
                    <div>
                      <div className="fw-bold text-dark" style={{ fontSize: "11px" }}>{v.code}</div>
                      <div className="text-dark fw-medium" style={{ fontSize: "10px" }}>{v.desc}</div>
                      <div className="text-muted" style={{ fontSize: "9px" }}>HSD: {v.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="card border-0 rounded-4 p-4 bg-white shadow-sm hover-lift">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0 text-uppercase" style={{ fontSize: "11px" }}>Thành tích của bạn</h6>
                <Link to="#" className="text-danger small text-decoration-none" style={{ fontSize: "10px" }}>Xem tất cả <i className="fa-solid fa-chevron-right"></i></Link>
              </div>
              
              <div className="row g-2 text-center">
                {[
                  { name: 'Check-in Master', icon: 'fa-calendar-check', color: 'danger', prog: '10 ngày' },
                  { name: 'Morning Coffee', icon: 'fa-sun', color: 'primary', prog: '7 ngày' },
                  { name: 'Reward Hunter', icon: 'fa-gift', color: 'success', prog: '5 lần' },
                  { name: 'Coffee Lover', icon: 'fa-mug-hot', color: 'warning', prog: '20 đơn' },
                ].map((b, i) => (
                  <div className="col-3" key={i}>
                    <div className={`bg-${b.color}-subtle rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 border border-white shadow-sm`} style={{ width: "36px", height: "36px" }}>
                      <i className={`fa-solid ${b.icon} text-${b.color}`}></i>
                    </div>
                    <div className="fw-bold text-dark lh-1 mb-1" style={{ fontSize: "9px" }}>{b.name}</div>
                    <div className="text-muted" style={{ fontSize: "8px" }}>{b.prog}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="card border-0 rounded-4 p-4 bg-white shadow-sm hover-lift">
              <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "11px" }}>Câu hỏi thường gặp</h6>
              <div className="accordion accordion-flush" id="faqAccordion">
                {[
                  { q: 'Điểm danh như thế nào?', a: 'Truy cập mục này mỗi ngày và bấm nút ĐIỂM DANH NGAY để nhận điểm.' },
                  { q: 'Tôi quên điểm danh thì sao?', a: 'Chuỗi điểm danh của bạn sẽ bị reset về 0. Bạn phải bắt đầu lại từ Ngày 1.' },
                  { q: 'Điểm danh có bị mất chuỗi không?', a: 'Nếu bạn bỏ lỡ 1 ngày, chuỗi 7 ngày liên tiếp sẽ bị đặt lại.' },
                  { q: 'Điểm có hết hạn không?', a: 'Điểm nhận được từ điểm danh sẽ hết hạn sau 12 tháng.' }
                ].map((faq, i) => (
                  <div className="accordion-item border-bottom" key={i}>
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed px-0 py-2 shadow-none fw-medium text-dark bg-transparent" type="button" data-bs-toggle="collapse" data-bs-target={`#faq-${i}`} style={{ fontSize: "11px" }}>
                        {faq.q}
                      </button>
                    </h2>
                    <div id={`faq-${i}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body px-0 py-2 text-muted" style={{ fontSize: "10px" }}>
                        {faq.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Footer Banner */}
      <div className="text-center mt-2 text-muted small pb-4">
        <i className="fa-solid fa-mug-hot text-danger me-2"></i> Điểm danh mỗi ngày - Nhận quà liền tay - Trở thành thành viên VIP ngay hôm nay!
      </div>

      <style>{`
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
        }
        .fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pulse-btn {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
        }
        .check-animation {
          animation: checkPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes checkPop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        .fire-animation {
          animation: flicker 1.5s infinite alternate;
        }
        @keyframes flicker {
          0%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 5px rgba(220, 53, 69, 0.5)); }
          50% { transform: scale(1.1); opacity: 0.8; filter: drop-shadow(0 0 10px rgba(220, 53, 69, 0.8)); }
        }
        .glow-danger {
          box-shadow: 0 0 15px rgba(220, 53, 69, 0.6) !important;
        }
        .glow-warning {
          filter: drop-shadow(0 0 10px rgba(255, 193, 7, 0.8));
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .mystery-box-animation {
          animation: floatBox 3s ease-in-out infinite;
        }
        @keyframes floatBox {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        /* Custom Accordion override */
        .accordion-button::after {
          width: 10px;
          height: 10px;
          background-size: 10px;
        }
      `}</style>
    </div>
  );
}

export default ProfileCheckin;
