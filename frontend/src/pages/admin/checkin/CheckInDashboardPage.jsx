import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import axiosClient from '../../../api/axiosClient';

function CheckInDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API từ backend
    axiosClient.get('/api/admin/check-ins/dashboard')
      .then(res => {
        setStats(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu dashboard", err);
        setLoading(false);
      });
  }, []);

  const StatCard = ({ title, value, icon, color, delay }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="col-xl-3 col-lg-6 mb-4"
    >
      <div 
        className="card h-100 border-0" 
        style={{ 
          background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="card-body d-flex align-items-center">
          <div 
            className={`rounded-circle d-flex align-items-center justify-content-center text-white`}
            style={{ 
              width: '56px', height: '56px', 
              background: `linear-gradient(135deg, ${color})`,
              boxShadow: `0 4px 15px rgba(0,0,0,0.2)`
            }}
          >
            <i className={`fa-solid ${icon} fs-4`}></i>
          </div>
          <div className="ms-3">
            <h6 className="text-muted mb-1" style={{ fontSize: '14px', fontWeight: '500' }}>{title}</h6>
            <h3 className="mb-0 fw-bold text-white">
              {loading ? <span className="spinner-border spinner-border-sm"></span> : value}
            </h3>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const checkInTrend = stats?.checkInTrend || [];
  const voucherTrend = stats?.voucherTrend || [];
  
  const EmptyState = () => (
    <div className="d-flex flex-column justify-content-center align-items-center w-100" style={{ height: '320px', color: 'rgba(255,255,255,0.5)' }}>
      <i className="fa-solid fa-chart-line mb-3" style={{ fontSize: '48px' }}></i>
      <p className="mb-3">Chưa có dữ liệu điểm danh trong khoảng thời gian này.</p>
      <button className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={() => window.location.reload()}>
        <i className="fa-solid fa-rotate-right me-2"></i> Làm mới
      </button>
    </div>
  );

  return (
    <AdminLayout>
      <style>{`
        .chart-card {
          min-width: 0;
          overflow: hidden;
          background: rgba(30, 30, 40, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .chart-container {
          width: 100%;
          min-width: 0;
          height: 320px;
          position: relative;
        }
      `}</style>
      <div className="container-fluid py-4" style={{ backgroundColor: 'var(--admin-bg)', minHeight: '100vh', color: '#fff' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="fw-bold mb-1"
              style={{
                background: '-webkit-linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Dashboard Điểm Danh
            </motion.h2>
            <p className="text-muted mb-0">Theo dõi tương tác và gamification của người dùng</p>
          </div>
          <div>
            <button className="btn btn-outline-light rounded-pill px-4 me-2">
              <i className="fa-solid fa-download me-2"></i> Xuất Báo Cáo
            </button>
            <button className="btn rounded-pill px-4" style={{ background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)', color: '#fff', border: 'none' }}>
              <i className="fa-solid fa-gear me-2"></i> Cài đặt nhanh
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="row">
          <StatCard 
            title="Lượt điểm danh hôm nay" 
            value={stats?.summary?.todayCheckIns?.toLocaleString() || 0} 
            icon="fa-calendar-check" 
            color="#FF6B6B, #FF8E53" 
            delay={0.1} 
          />
          <StatCard 
            title="Tỷ lệ hoàn thành" 
            value={`${stats?.summary?.todayCompletionRate || 0}%`} 
            icon="fa-chart-pie" 
            color="#4ECDC4, #556270" 
            delay={0.2} 
          />
          <StatCard 
            title="Điểm đã cấp (Tháng)" 
            value={stats?.summary?.monthlyPointsIssued?.toLocaleString() || 0} 
            icon="fa-coins" 
            color="#F4D03F, #16A085" 
            delay={0.3} 
          />
          <StatCard 
            title="Chuỗi cao nhất" 
            value={`${stats?.summary?.highestStreak || 0} ngày`} 
            icon="fa-fire" 
            color="#8E44AD, #3498DB" 
            delay={0.4} 
          />
        </div>

        {/* Charts Row */}
        <div className="row mt-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="col-lg-8 mb-4"
          >
            <div className="chart-card p-4 h-100">
              <h5 className="fw-bold mb-4">Biểu đồ tương tác 7 ngày qua</h5>
              <div className="chart-container">
                {checkInTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={checkInTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="checkIns" stroke="#4ECDC4" fillOpacity={1} fill="url(#colorCheckins)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState />
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-lg-4 mb-4"
          >
            <div className="chart-card p-4 h-100">
              <h5 className="fw-bold mb-4">Voucher đã phát</h5>
              <div className="chart-container">
                {voucherTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={voucherTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', border: 'none', borderRadius: '8px' }}
                      />
                      <Bar dataKey="vouchers" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default CheckInDashboardPage;
