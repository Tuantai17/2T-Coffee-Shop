import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const FILTER_OPTIONS = ["7 ngay", "30 ngay", "3 thang", "1 nam"];

function DashboardChart({ loading, orders = [] }) {
  const [filter, setFilter] = useState("7 ngay");
  const chartContainerRef = useRef(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current || typeof ResizeObserver === "undefined") {
      setChartReady(true);
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setChartReady(entry.contentRect.width > 0 && entry.contentRect.height > 0);
    });

    observer.observe(chartContainerRef.current);

    return () => observer.disconnect();
  }, []);

  const processChartData = (ordersList, filterType) => {
    const now = new Date();
    let daysToSubtract = 7;

    if (filterType === "30 ngay") daysToSubtract = 30;
    else if (filterType === "3 thang") daysToSubtract = 90;
    else if (filterType === "1 nam") daysToSubtract = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract + 1);
    startDate.setHours(0, 0, 0, 0);

    const filteredOrders = (ordersList || []).filter((order) => {
      const dateStr = order.orderedDate || order.createdAt;
      if (!dateStr) return false;

      let orderDate;
      if (Array.isArray(dateStr)) {
        const [year, month, day] = dateStr;
        orderDate = new Date(year, month - 1, day);
      } else {
        orderDate = new Date(dateStr);
      }

      return orderDate >= startDate && orderDate <= now;
    });

    const dateMap = new Map();
    for (let index = 0; index < daysToSubtract; index += 1) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + index);

      let key = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (filterType === "1 nam") {
        key = `${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()}`;
      }

      if (!dateMap.has(key)) {
        dateMap.set(key, { name: key, revenue: 0, orders: 0 });
      }
    }

    filteredOrders.forEach((order) => {
      const dateStr = order.orderedDate || order.createdAt;
      let orderDate;
      if (Array.isArray(dateStr)) {
        const [year, month, day] = dateStr;
        orderDate = new Date(year, month - 1, day);
      } else {
        orderDate = new Date(dateStr);
      }

      let key = `${orderDate.getDate().toString().padStart(2, "0")}/${(orderDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (filterType === "1 nam") {
        key = `${(orderDate.getMonth() + 1).toString().padStart(2, "0")}/${orderDate.getFullYear()}`;
      }

      if (dateMap.has(key)) {
        const data = dateMap.get(key);
        data.orders += 1;
        data.revenue += Number(order.total || 0);
      }
    });

    if (filterType === "1 nam") {
      const monthlyData = [];
      const uniqueMonths = new Set();

      dateMap.forEach((value) => {
        if (!uniqueMonths.has(value.name)) {
          uniqueMonths.add(value.name);
          monthlyData.push(value);
        }
      });

      return monthlyData;
    }

    return Array.from(dateMap.values());
  };

  const chartData = useMemo(() => processChartData(orders, filter), [orders, filter]);
  const avgRevenue = chartData.length
    ? chartData.reduce((sum, item) => sum + item.revenue, 0) / chartData.length
    : 0;
  const avgOrders = chartData.length
    ? chartData.reduce((sum, item) => sum + item.orders, 0) / chartData.length
    : 0;
  const moneyFormatter = new Intl.NumberFormat("vi-VN");

  return (
    <div className="neu-card p-4 h-100">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h5 className="fw-bold mb-1">Doanh thu va don hang</h5>
          <small className="text-muted">Thong ke hoat dong kinh doanh theo thoi gian</small>
        </div>

        <div className="neu-pill p-1 d-flex gap-1">
          {FILTER_OPTIONS.map((item) => (
            <div
              key={item}
              className="rounded-pill px-3 py-1 cursor-pointer"
              style={{
                fontSize: "0.85rem",
                fontWeight: filter === item ? "600" : "400",
                color: filter === item ? "var(--admin-primary)" : "var(--admin-muted)",
                backgroundColor: filter === item ? "var(--admin-bg)" : "transparent",
                boxShadow:
                  filter === item
                    ? "inset 2px 2px 5px var(--admin-shadow-dark), inset -2px -2px 5px var(--admin-shadow-light)"
                    : "none",
                transition: "all 0.2s ease",
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
        <div ref={chartContainerRef} style={{ height: "300px", width: "100%", minWidth: 0 }}>
          {chartReady ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--admin-success)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--admin-success)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--admin-muted)", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--admin-muted)", fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                  dx={-10}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--admin-muted)", fontSize: 12 }}
                  dx={10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value, name) => [
                    name === "Doanh thu (VND)" ? `${moneyFormatter.format(value)}d` : value,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Doanh thu (VND)"
                  fill="var(--admin-success)"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="So don hang"
                  stroke="var(--admin-primary)"
                  strokeWidth={3}
                  fill="none"
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--admin-surface)" }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      )}

      <div className="d-flex mt-3 gap-4 pt-3" style={{ borderTop: "1px dashed rgba(0,0,0,0.1)" }}>
        <div className="d-flex align-items-center gap-3">
          <div className="neu-circle" style={{ width: "36px", height: "36px", color: "var(--admin-success)" }}>
            <i className="fa-solid fa-chart-simple"></i>
          </div>
          <div>
            <div className="small text-muted">Doanh thu trung binh</div>
            <div className="fw-bold fs-5">{moneyFormatter.format(avgRevenue)}d</div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="neu-circle" style={{ width: "36px", height: "36px", color: "var(--admin-primary)" }}>
            <i className="fa-solid fa-arrow-trend-up"></i>
          </div>
          <div>
            <div className="small text-muted">Don hang trung binh</div>
            <div className="fw-bold fs-5">{Math.round(avgOrders)} don</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardChart;
