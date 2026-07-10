import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

function CheckInCalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editEvent, setEditEvent] = useState({
    type: 'NORMAL',
    basePoints: 10,
    multiplier: 1.0,
    bonusPoints: 0,
    displayText: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/check-ins/calendar-events');
      setEvents(res);
    } catch (error) {
      toast.error('Lỗi tải dữ liệu lịch');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const openDrawer = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    
    // Find existing event
    const existing = events.find(e => e.eventDate === dateStr);
    if (existing) {
      setEditEvent(existing);
    } else {
      setEditEvent({
        eventDate: dateStr,
        type: 'NORMAL',
        basePoints: 10,
        multiplier: 1.0,
        bonusPoints: 0,
        displayText: ''
      });
    }
    
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDate(null);
  };

  const handleSaveEvent = async () => {
    try {
      if (editEvent.id) {
        await axiosClient.put(`/api/admin/check-ins/calendar-events/${editEvent.id}`, editEvent);
      } else {
        await axiosClient.post('/api/admin/check-ins/calendar-events', editEvent);
      }
      toast.success('Lưu sự kiện thành công');
      fetchEvents();
      closeDrawer();
    } catch (error) {
      toast.error('Lưu thất bại');
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    let firstDay = getFirstDayOfMonth(year, month);
    
    // Adjust to Monday = 0, Sunday = 6
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    // Header
    weekdays.forEach(day => {
      days.push(
        <div key={`h-${day}`} className="text-center fw-bold text-muted py-2">
          {day}
        </div>
      );
    });

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e-${i}`} className="p-2 border border-light bg-light" style={{ minHeight: '100px', opacity: 0.5 }}></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const event = events.find(e => e.eventDate === dateStr);
      
      let bgClass = "bg-white";
      let borderClass = "border-light";
      if (event) {
        if (event.type === 'LUCKY_DAY') bgClass = "bg-warning bg-opacity-10";
        if (event.type === 'VOUCHER_DAY') bgClass = "bg-danger bg-opacity-10";
      }
      
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      if (isToday) borderClass = "border-primary border-2";

      days.push(
        <div 
          key={`d-${d}`} 
          className={`p-2 border ${borderClass} ${bgClass} position-relative cursor-pointer hover-shadow`} 
          style={{ minHeight: '100px', transition: 'all 0.2s', cursor: 'pointer' }}
          onClick={() => openDrawer(d)}
        >
          <div className="d-flex justify-content-between align-items-start">
            <span className={`fw-bold ${isToday ? 'text-primary' : ''}`}>{d}</span>
            {event && event.type === 'LUCKY_DAY' && <i className="fa-solid fa-star text-warning"></i>}
            {event && event.type === 'VOUCHER_DAY' && <i className="fa-solid fa-ticket text-danger"></i>}
          </div>
          {event && (
            <div className="mt-2" style={{ fontSize: '11px' }}>
              <div className="text-truncate fw-bold text-primary">{event.displayText || 'Sự kiện'}</div>
              {event.multiplier > 1 && <div className="text-success">x{event.multiplier} Điểm</div>}
              {event.bonusPoints > 0 && <div className="text-success">+{event.bonusPoints} Điểm</div>}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', position: 'relative' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Lịch và Ngày May Mắn</h3>
            <p className="text-muted mb-0">Quản lý sự kiện điểm danh theo tháng</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">
              Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
            </h5>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm rounded-circle" onClick={handlePrevMonth}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setCurrentDate(new Date())}>
                Hôm nay
              </button>
              <button className="btn btn-outline-secondary btn-sm rounded-circle" onClick={handleNextMonth}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div className="card-body p-4">
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              renderCalendar()
            )}
          </div>
        </div>
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
        <div 
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px',
            backgroundColor: '#fff', boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
            zIndex: 1050, display: 'flex', flexDirection: 'column'
          }}
        >
          <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
            <h5 className="fw-bold mb-0">Thiết lập ngày {selectedDate}</h5>
            <button className="btn-close" onClick={closeDrawer}></button>
          </div>
          <div className="p-4 flex-grow-1 overflow-auto">
            <div className="mb-3">
              <label className="form-label fw-bold">Loại ngày</label>
              <select 
                className="form-select" 
                value={editEvent.type} 
                onChange={(e) => setEditEvent({...editEvent, type: e.target.value})}
              >
                <option value="NORMAL">Ngày bình thường</option>
                <option value="LUCKY_DAY">Ngày may mắn (Lucky Day)</option>
                <option value="VOUCHER_DAY">Ngày phát Voucher</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Điểm cơ bản</label>
              <input type="number" className="form-control" value={editEvent.basePoints} onChange={(e) => setEditEvent({...editEvent, basePoints: parseInt(e.target.value)})} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Hệ số nhân (Multiplier)</label>
              <input type="number" step="0.1" className="form-control" value={editEvent.multiplier} onChange={(e) => setEditEvent({...editEvent, multiplier: parseFloat(e.target.value)})} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Điểm thưởng thêm (Bonus)</label>
              <input type="number" className="form-control" value={editEvent.bonusPoints} onChange={(e) => setEditEvent({...editEvent, bonusPoints: parseInt(e.target.value)})} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Dòng chữ hiển thị</label>
              <input type="text" className="form-control" value={editEvent.displayText} onChange={(e) => setEditEvent({...editEvent, displayText: e.target.value})} placeholder="Vd: x2 Điểm thưởng!" />
            </div>
          </div>
          <div className="p-4 border-top d-flex justify-content-end gap-2 bg-light">
            <button className="btn btn-secondary" onClick={closeDrawer}>Hủy</button>
            <button className="btn btn-primary" onClick={handleSaveEvent}>Lưu thiết lập</button>
          </div>
        </div>
      )}
      {/* Backdrop */}
      {isDrawerOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
          onClick={closeDrawer}
        ></div>
      )}
    </AdminLayout>
  );
}

export default CheckInCalendarPage;
