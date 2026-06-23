import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

function DashboardChart({ loading }) {
  const [filter, setFilter] = useState("7 ngày");

  // Mock data for the chart based on the image structure
  const mockData = [
    { name: "16/06", revenue: 150000000, orders: 130 },
    { name: "17/06", revenue: 180000000, orders: 170 },
    { name: "18/06", revenue: 195000000, orders: 140 },
    { name: "19/06", revenue: 185000000, orders: 185 },
    { name: "20/06", revenue: 265000000, orders: 280 },
    { name: "21/06", revenue: 240000000, orders: 190 },
    { name: "22/06", revenue: 190000000, orders: 145 },
  ];

  const moneyFormatter = new Intl.NumberFormat("vi-VN");

  return (
    <div className="neu-card p-4 h-100">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h5 className="fw-bold mb-1">Doanh thu và đơn hàng</h5>
          <small className="text-muted">Thống kê hoạt động kinh doanh theo thời gian</small>
        </div>
        
        <div className="neu-pill p-1 d-flex gap-1">
          {["7 ngày", "30 ngày", "3 tháng", "1 năm"].map((item) => (
            <div 
              key={item}
              className="rounded-pill px-3 py-1 cursor-pointer"
              style={{
                fontSize: "0.85rem",
                fontWeight: filter === item ? "600" : "400",
                color: filter === item ? "var(--admin-primary)" : "var(--admin-muted)",
                backgroundColor: filter === item ? "var(--admin-bg)" : "transparent",
                boxShadow: filter === item ? "inset 2px 2px 5px var(--admin-shadow-dark), inset -2px -2px 5px var(--admin-shadow-light)" : "none",
                transition: "all 0.2s ease"
              }}
              onClick={() => setFilter(item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div style={{ height: "300px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mockData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--admin-success)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--admin-success)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--admin-muted)", fontSize: 12 }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "var(--admin-muted)", fontSize: 12 }} tickFormatter={(val) => `${val / 1000000}M`} dx={-10} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "var(--admin-muted)", fontSize: 12 }} dx={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}
                formatter={(value, name) => [name === "Doanh thu (VNĐ)" ? moneyFormatter.format(value) + "đ" : value, name]}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar yAxisId="left" dataKey="revenue" name="Doanh thu (VNĐ)" fill="var(--admin-success)" radius={[6, 6, 0, 0]} barSize={24} />
              <Area yAxisId="right" type="monotone" dataKey="orders" name="Số đơn hàng" stroke="var(--admin-primary)" strokeWidth={3} fill="none" dot={{ r: 4, strokeWidth: 2, fill: "var(--admin-surface)" }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="d-flex mt-3 gap-4 pt-3" style={{ borderTop: "1px dashed rgba(0,0,0,0.1)" }}>
        <div className="d-flex align-items-center gap-3">
          <div className="neu-circle" style={{ width: "36px", height: "36px", color: "var(--admin-success)" }}>
            <i className="fa-solid fa-chart-simple"></i>
          </div>
          <div>
            <div className="small text-muted">Doanh thu trung bình</div>
            <div className="fw-bold fs-5">179.540.000đ</div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="neu-circle" style={{ width: "36px", height: "36px", color: "var(--admin-primary)" }}>
            <i className="fa-solid fa-arrow-trend-up"></i>
          </div>
          <div>
            <div className="small text-muted">Đơn hàng trung bình</div>
            <div className="fw-bold fs-5">406 đơn</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardChart;
