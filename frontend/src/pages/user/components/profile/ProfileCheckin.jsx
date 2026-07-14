import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import checkinApi from '../../../../api/checkinApi';
function ProfileCheckin({ profile, onUpdateSuccess }) {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [checkinData, setCheckinData] = useState(null);
  const [showSuccessGif, setShowSuccessGif] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [awardedPoints, setAwardedPoints] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [checkedInDates, setCheckedInDates] = useState([]);

  useEffect(() => {
    // Fetch real checkin data
    checkinApi.getCheckinStatus()
      .then(res => {
        setCheckinData(res.data);
        setIsCheckedIn(res.data.checkedInToday);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi lấy dữ liệu điểm danh:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    checkinApi.getUserCheckinHistory(calendarYear, calendarMonth).then(res => {
      const dates = res.data.map(record => {
        const date = new Date(record.businessDate);
        return date.getDate();
      });
      setCheckedInDates(dates);
    }).catch(err => console.error("Error fetching history", err));
  }, [calendarYear, calendarMonth, isCheckedIn]);

  const points = profile?.loyaltyPoints ?? 2450;
  
  // Handlers
  const handleCheckIn = () => {
    if (!checkinData || !checkinData.program || isSubmitting) return;
    
    setIsSubmitting(true);
    setErrorMsg("");
    
    checkinApi.performCheckin(checkinData.program.id)
      .then(res => {
        setIsCheckedIn(true);
        setCheckinData(prev => ({
          ...prev,
          currentStreak: (prev?.currentStreak || 0) + 1,
          checkedInToday: true
        }));
        
        if (res?.data?.pointsAwarded) {
          setAwardedPoints(res.data.pointsAwarded);
        } else if (res?.pointsAwarded) {
          setAwardedPoints(res.pointsAwarded);
        }
        
        setShowSuccessGif(true);
        setTimeout(() => setShowSuccessGif(false), 3000);
        
        if (onUpdateSuccess) onUpdateSuccess(false); // Pass false to load silently without spinner
        window.dispatchEvent(new Event("profileUpdated"));
      })
      .catch(err => {
        console.error('Lỗi điểm danh:', err);
        if (err.response && err.response.status === 429) {
          setErrorMsg("Bạn thao tác quá nhanh! Vui lòng đợi một lát rồi thử lại.");
        } else {
          setErrorMsg(err.response?.data?.message || "Đã xảy ra lỗi khi điểm danh. Vui lòng thử lại sau.");
        }
      })
      .finally(() => {
        // Prevent immediate clicking again
        setTimeout(() => setIsSubmitting(false), 2000);
      });
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth - 1, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInPrevMonth = new Date(calendarYear, calendarMonth - 1, 0).getDate();
  
  const prevMonthDays = Array.from({length: adjustedFirstDay}, (_, i) => daysInPrevMonth - adjustedFirstDay + i + 1);
  const currentMonthDays = Array.from({length: daysInMonth}, (_, i) => i + 1);
  
  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthDays = Array.from({length: nextMonthDaysCount}, (_, i) => i + 1);

  return (
    <div className="profile-checkin fade-in">
      {/* Success Overlay */}
      {showSuccessGif && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <img src="/images/placidplace-congratulations-7600.gif" alt="Success" style={{ width: '300px', borderRadius: '15px' }} />
          <h2 className="text-white mt-3 fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Điểm danh thành công!</h2>
          <p className="text-warning fs-5 fw-bold">+{awardedPoints} điểm Loyalty</p>
        </div>
      )}
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: "1px" }}>
          ĐIỂM DANH HẰNG NGÀY <i className="fa-regular fa-calendar-check text-warning"></i>
        </h4>
        <p className="text-muted mb-0 small">Điểm danh mỗi ngày để nhận điểm Loyalty và nhiều phần thưởng hấp dẫn!</p>
      </div>

      <div className="row g-4 mb-4">
        {/* Main Content */}
        <div className="col-12">
          
          {/* Top Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift text-center position-relative overflow-hidden">
                <div className="text-muted small fw-bold mb-2 text-uppercase text-start">Hôm nay</div>
                <div className="text-muted small mb-3 text-start">{new Date().toLocaleDateString('vi-VN')}</div>
                
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
                    <button onClick={handleCheckIn} disabled={isSubmitting} className="btn btn-warning rounded-pill fw-bold text-white shadow-sm px-4 py-2 pulse-btn">
                      {isSubmitting ? "ĐANG XỬ LÝ..." : "ĐIỂM DANH NGAY"}
                    </button>
                    {errorMsg && <div className="text-danger mt-2 fw-bold" style={{ fontSize: "10px" }}>{errorMsg}</div>}
                    {!errorMsg && <div className="text-muted mt-2" style={{ fontSize: "10px" }}>Nhận ngay +20 điểm</div>}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-3">
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

            <div className="col-md-3">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift">
                <h6 className="fw-bold mb-2 text-uppercase text-danger" style={{ fontSize: "11px" }}><i className="fa-solid fa-clover me-1"></i> Ngày may mắn</h6>
                <div className="text-muted mb-3" style={{ fontSize: "10px" }}>Một số ngày trong tháng sẽ là ngày may mắn!</div>
                
                <div className="bg-warning-subtle rounded-3 p-3 text-center border border-warning border-opacity-50 mb-3 flex-grow-1 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <i className="fa-solid fa-star text-warning fs-4 glow-warning"></i>
                    <div className="fw-bold text-dark" style={{ fontSize: "12px" }}>Điểm x2 <span className="text-muted fw-normal" style={{ fontSize: "10px" }}>trong ngày may mắn</span></div>
                  </div>
                </div>
                
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const luckyDaysList = checkinData?.luckyDays || [];
                  let nextLucky = luckyDaysList.find(d => {
                    const lDate = new Date(d.luckyDate);
                    lDate.setHours(0, 0, 0, 0);
                    return lDate >= today && d.status === "ACTIVE";
                  });
                  // Fallback to first active lucky day if all are in past
                  if (!nextLucky && luckyDaysList.length > 0) {
                     nextLucky = luckyDaysList.find(d => d.status === "ACTIVE") || luckyDaysList[0];
                  }

                  const lDate = nextLucky ? new Date(nextLucky.luckyDate) : null;
                  
                  return (
                    <div className="d-flex justify-content-between align-items-end mt-auto">
                      <div>
                        <div className="text-muted" style={{ fontSize: "9px" }}>Ngày may mắn tiếp theo</div>
                        <div className="fw-black text-danger" style={{ fontSize: "16px" }}>{lDate ? `${lDate.getDate().toString().padStart(2, '0')}/${(lDate.getMonth()+1).toString().padStart(2, '0')}/${lDate.getFullYear()}` : "--/--/----"}</div>
                      </div>
                      <div className="bg-light rounded p-2 text-center shadow-sm">
                        <div className="bg-danger text-white rounded-top fw-bold" style={{ fontSize: "8px", padding: "2px 5px" }}>THÁNG {lDate ? lDate.getMonth() + 1 : "--"}</div>
                        <div className="fw-black text-dark" style={{ fontSize: "16px" }}>{lDate ? lDate.getDate() : "--"}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Loyalty Points summary moved to Top Row */}
            <div className="col-md-3">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift text-center position-relative overflow-hidden">
                <div className="position-absolute bg-warning opacity-10 rounded-circle" style={{ width: "100px", height: "100px", top: "-30px", right: "-30px" }}></div>
                <h6 className="fw-bold mb-3 text-uppercase text-start" style={{ fontSize: "11px" }}>Điểm Loyalty của bạn</h6>
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2 z-1 position-relative">
                  <div className="bg-warning rounded-circle text-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: "40px", height: "40px" }}>
                    <i className="fa-solid fa-crown fs-5"></i>
                  </div>
                  <div className="text-start flex-grow-1">
                    <div className="fw-black text-danger lh-1" style={{ fontSize: "24px" }}>{points.toLocaleString("vi-VN")} <span className="text-muted fw-bold" style={{ fontSize: "12px" }}>điểm</span></div>
                    <div className="text-muted fw-medium mt-1" style={{ fontSize: "10px" }}>≈ {points.toLocaleString("vi-VN")}đ</div>
                  </div>
                </div>
                <div className="mt-auto pt-2 border-top">
                  <button onClick={() => setShowHistoryModal(true)} className="btn btn-outline-secondary btn-sm rounded-pill w-100 fw-medium" style={{ fontSize: "11px" }}>Lịch sử điểm</button>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar & 7-Day Streak */}
          <div className="row g-3 mb-4">
            <div className="col-md-5">
              <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-uppercase" style={{ fontSize: "11px" }}>Lịch điểm danh Tháng {calendarMonth}/{calendarYear}</h6>
                  <div>
                    <button className="btn btn-sm btn-light border p-1 py-0 me-1" onClick={handlePrevMonth}><i className="fa-solid fa-chevron-left" style={{fontSize: '9px'}}></i></button>
                    <button className="btn btn-sm btn-light border p-1 py-0" onClick={handleNextMonth}><i className="fa-solid fa-chevron-right" style={{fontSize: '9px'}}></i></button>
                  </div>
                </div>
                
                <div className="calendar-grid">
                  <div className="d-flex justify-content-between text-muted fw-bold mb-2 text-center" style={{ fontSize: "10px" }}>
                    <div style={{width:"14%"}}>T2</div><div style={{width:"14%"}}>T3</div><div style={{width:"14%"}}>T4</div>
                    <div style={{width:"14%"}}>T5</div><div style={{width:"14%"}}>T6</div><div style={{width:"14%"}}>T7</div><div style={{width:"14%"}}>CN</div>
                  </div>
                  <div className="d-flex flex-wrap text-center" style={{ fontSize: "11px" }}>
                    {prevMonthDays.map(d => <div key={`prev-${d}`} style={{width:"14%", padding:"5px 0"}} className="text-light">{d}</div>)}
                    
                    {currentMonthDays.map(d => {
                      let statusClass = "text-muted";
                      let icon = null;
                      
                      const today = new Date();
                      const isToday = today.getDate() === d && today.getMonth() + 1 === calendarMonth && today.getFullYear() === calendarYear;
                      const hasCheckedIn = checkedInDates.includes(d);
                      
                      if (hasCheckedIn) {
                         statusClass = "text-white fw-bold bg-success rounded-circle shadow-sm";
                      } else if (isToday) {
                         statusClass = "text-warning fw-bold bg-warning-subtle rounded-circle position-relative"; 
                         icon = <i className="fa-solid fa-star position-absolute text-warning" style={{fontSize:"8px", top:"-2px", right:"-2px"}}></i>;
                      }
                      
                      return (
                        <div key={`curr-${d}`} style={{width:"14%", padding:"5px 0"}} className="d-flex justify-content-center align-items-center">
                          <div className={`${statusClass} d-flex align-items-center justify-content-center`} style={{width: "24px", height: "24px"}}>
                            {d}
                            {icon}
                          </div>
                        </div>
                      )
                    })}
                    
                    {nextMonthDays.map(d => <div key={`next-${d}`} style={{width:"14%", padding:"5px 0"}} className="text-light">{d}</div>)}
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
                  {((checkinData?.rewards?.length > 0 ? checkinData.rewards : null) || [
                    { displayName: "Ngày 1", rewardValue: "10" },
                    { displayName: "Ngày 2", rewardValue: "10" },
                    { displayName: "Ngày 3", rewardValue: "15" },
                    { displayName: "Ngày 4", rewardValue: "15" },
                    { displayName: "Ngày 5", rewardValue: "20" },
                    { displayName: "Ngày 6", rewardValue: "20" },
                    { displayName: "Ngày 7", rewardValue: "Voucher", rewardType: "VOUCHER" },
                  ]).map((reward, i) => {
                    const isDone = checkinData ? (i + 1 <= checkinData.currentStreak) : false;
                    const isCurrent = checkinData ? (i + 1 === checkinData.currentStreak + (isCheckedIn ? 0 : 1)) : false;
                    const item = {
                      day: reward.displayName || `Ngày ${i + 1}`,
                      pts: reward.rewardType === 'VOUCHER' ? 'Voucher' : `+${reward.rewardValue} điểm`,
                      gift: reward.rewardType === 'VOUCHER'
                    };
                    return (
                    <div className="position-relative z-2 d-flex flex-column align-items-center bg-white px-1" key={i} style={{ width: "14%" }}>
                      <div className="text-muted fw-bold mb-2" style={{ fontSize: "9px" }}>{item.day}</div>
                      
                      {item.gift ? (
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${isDone ? 'bg-success text-white' : 'bg-danger text-white shadow-sm glow-danger'}`} style={{ width: "24px", height: "24px" }}>
                          <i className="fa-solid fa-gift" style={{ fontSize: "10px" }}></i>
                        </div>
                      ) : (
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${isDone ? 'bg-success text-white' : 'bg-light text-muted border'}`} style={{ width: "20px", height: "20px" }}>
                          {isDone ? <i className="fa-solid fa-check" style={{ fontSize: "10px" }}></i> : <div style={{width:"8px", height:"8px"}} className="bg-secondary rounded-circle"></div>}
                        </div>
                      )}
                      
                    <div className={`mt-2 fw-bold ${item.gift ? 'text-danger' : (isDone ? 'text-success' : 'text-muted')}`} style={{ fontSize: "9px" }}>{item.pts}</div>
                      
                      {isCurrent && (
                        <div className="position-absolute bg-warning-subtle text-warning border border-warning rounded px-1" style={{ fontSize: "8px", top: "-20px", whiteSpace: "nowrap" }}>
                          Hôm nay
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* History Modal */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div className="bg-white rounded-4 p-4 shadow-lg position-relative" style={{ width: '90%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setShowHistoryModal(false)}
              className="btn btn-sm btn-light rounded-circle position-absolute" 
              style={{ top: '15px', right: '15px', width: '30px', height: '30px', padding: 0 }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h5 className="fw-bold mb-3 text-uppercase"><i className="fa-solid fa-clock-rotate-left text-danger me-2"></i> Lịch sử điểm danh</h5>
            
            <div className="d-flex flex-column gap-3 overflow-auto pe-2 flex-grow-1" style={{ maxHeight: '100%' }}>
              {(checkinData?.history || []).map((item, i) => {
                const dateStr = item.businessDate;
                const timeStr = item.checkinTime;
                const displayDate = dateStr ? new Date(dateStr + "T00:00:00").toLocaleDateString("vi-VN") : "--";
                const displayTime = timeStr ? new Date(timeStr).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'}) : "--:--";
                const pts = item.pointsAwarded || 0;
                
                // Find base reward for this dayNumber from rewards list
                const rewards = checkinData?.rewards || [];
                const dayReward = rewards.find(r => r.dayNumber === item.dayNumber);
                const basePoints = dayReward ? parseInt(dayReward.rewardValue) : 0;
                const isLucky = checkinData?.luckyDays?.some(d => d.luckyDate === dateStr && d.status === "ACTIVE") || (pts >= basePoints * 2 && basePoints > 0);
                const luckyBonus = isLucky ? basePoints : 0;
                const tierBonus = pts - basePoints - luckyBonus;
                
                return (
                <div className="d-flex gap-3 position-relative z-1 align-items-start" key={i}>
                  <div className={`rounded-circle d-flex align-items-center justify-content-center mt-1 border border-white flex-shrink-0 ${isLucky ? 'bg-warning text-white' : 'bg-success text-white'}`} style={{ width: "22px", height: "22px" }}>
                    <i className={`fa-solid ${isLucky ? 'fa-star' : 'fa-check'}`} style={{ fontSize: "10px" }}></i>
                  </div>
                  <div className="flex-grow-1 pb-3 border-bottom border-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted fw-bold" style={{ fontSize: "12px" }}><i className="fa-regular fa-calendar-check me-1"></i> {displayDate}</span>
                      <span className={`fw-black ${isLucky ? 'text-warning' : 'text-success'}`} style={{ fontSize: "15px" }}>+{pts} điểm</span>
                    </div>
                    <div className="text-muted mb-1" style={{ fontSize: "11px" }}>
                      <i className="fa-regular fa-clock me-1"></i> Điểm danh lúc {displayTime} · Ngày {item.dayNumber || '--'}
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                      <span className="badge bg-success-subtle text-success border border-success border-opacity-25 fw-medium" style={{ fontSize: "10px" }}>
                        <i className="fa-solid fa-gift me-1"></i> Điểm danh: +{basePoints || pts} điểm
                      </span>
                      {isLucky && (
                        <span className="badge bg-warning-subtle text-warning border border-warning border-opacity-25 fw-medium" style={{ fontSize: "10px" }}>
                          <i className="fa-solid fa-star me-1"></i> Ngày may mắn x2: +{luckyBonus} điểm bonus
                        </span>
                      )}
                      {tierBonus > 0 && (
                        <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 fw-medium" style={{ fontSize: "10px" }}>
                          <i className="fa-solid fa-crown me-1"></i> Thưởng hạng thành viên: +{tierBonus} điểm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
              {(!checkinData?.history || checkinData.history.length === 0) && (
                <div className="text-muted text-center my-4 py-4">
                  <i className="fa-regular fa-calendar-xmark fs-1 mb-2 text-light"></i>
                  <p className="mb-0">Chưa có lịch sử điểm danh</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
