import React, { useEffect, useState } from "react";
import checkinApi from "../../../../api/checkinApi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const KPI_CONFIG = [
  {
    key: "todayCheckIns",
    label: "Lượt điểm danh hôm nay",
    icon: "fa-user-check",
    note: "Số lượt check-in ghi nhận trong ngày hiện tại",
    iconStyle: { background: "rgba(229, 106, 22, 0.12)", color: "#E56A16" },
  },
  {
    key: "totalUsers",
    label: "Tổng người tham gia",
    icon: "fa-users",
    note: "Tổng user đã phát sinh ít nhất một lượt check-in",
    iconStyle: { background: "rgba(24, 134, 75, 0.12)", color: "#18864B" },
  },
  {
    key: "activePrograms",
    label: "Chương trình đang hoạt động",
    icon: "fa-play-circle",
    note: "Số chương trình ở trạng thái ACTIVE",
    iconStyle: { background: "rgba(74, 38, 24, 0.12)", color: "#4A2618" },
  },
  {
    key: "highestStreak",
    label: "Chuỗi dài nhất",
    icon: "fa-fire",
    note: "Longest streak từng được ghi nhận",
    format: (value) => `${value} ngày`,
    iconStyle: { background: "rgba(214, 69, 69, 0.12)", color: "#D64545" },
  },
  {
    key: "totalPointsAwarded",
    label: "Tổng điểm đã phát",
    icon: "fa-coins",
    note: "Điểm loyalty đã cấp qua check-in",
    format: (value) => Number(value || 0).toLocaleString("vi-VN"),
    iconStyle: { background: "rgba(232, 162, 10, 0.16)", color: "#B98000" },
  },
  {
    key: "totalVouchersAwarded",
    label: "Voucher đã phát",
    icon: "fa-ticket",
    note: "Voucher phát ra từ luồng điểm danh",
    format: (value) => Number(value || 0).toLocaleString("vi-VN"),
    iconStyle: { background: "rgba(125, 85, 211, 0.12)", color: "#7D55D3" },
  },
];

function isAbortError(error) {
  return error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
}

function ChartCard({ title, data, dataKey, color, emptyMessage }) {
  const hasData = Array.isArray(data) && data.some((item) => Number(item?.[dataKey] || 0) > 0);

  return (
    <div className="checkin-chart-card">
      <div className="checkin-chart-header">
        <h3 className="checkin-chart-title">{title}</h3>
      </div>
      {hasData ? (
        <div className="checkin-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E4DA" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#7A6B63", fontSize: 12 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#7A6B63", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "#FBF3EC" }}
                contentStyle={{ borderRadius: "14px", border: "1px solid #E9DFD8", boxShadow: "0 18px 28px rgba(74, 38, 24, 0.12)" }}
              />
              <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="checkin-empty-state" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
          <i className="fa-regular fa-chart-bar" style={{ color: "#D8C8BC" }}></i>
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardTab() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboard(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchDashboard = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const response = await checkinApi.getDashboardStats({ signal });
      setDashboard(response.data);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }
      setError("Không thể tải dữ liệu tổng quan. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="checkin-section-card checkin-loading-state">
        <div className="checkin-loading-spinner"></div>
        <p>Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkin-section-card checkin-error-state">
        <i className="fa-solid fa-circle-exclamation" style={{ color: "#D64545" }}></i>
        <h3>Không thể hiển thị dashboard</h3>
        <p>{error}</p>
        <div style={{ marginTop: "20px" }}>
          <button type="button" onClick={() => fetchDashboard()} className="checkin-button checkin-button-primary">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const checkInTrend = dashboard?.checkInTrend || [];
  const pointsTrend = dashboard?.pointsTrend || [];
  const voucherTrend = dashboard?.voucherTrend || [];
  const recentActivities = dashboard?.recentActivities || [];
  const rewardCycle = dashboard?.rewardCycleCompletion || {};
  const hasDashboardData = KPI_CONFIG.some((item) => Number(summary?.[item.key] || 0) > 0);

  if (!hasDashboardData) {
    return (
      <div className="checkin-section-card checkin-empty-state">
        <i className="fa-solid fa-chart-simple" style={{ color: "#D8C8BC" }}></i>
        <h3>Chưa có dữ liệu điểm danh</h3>
        <p>Chưa phát sinh lượt check-in nào trong hệ thống để tạo báo cáo tổng quan.</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="checkin-kpi-grid">
        {KPI_CONFIG.map((item) => (
          <div key={item.key} className="checkin-kpi-card">
            <div className="checkin-kpi-icon" style={item.iconStyle}>
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <div className="checkin-kpi-meta">
              <div className="checkin-kpi-label">{item.label}</div>
              <div className="checkin-kpi-value">
                {item.format
                  ? item.format(summary?.[item.key] || 0)
                  : Number(summary?.[item.key] || 0).toLocaleString("vi-VN")}
              </div>
              <div className="checkin-kpi-note">{item.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="checkin-chart-grid">
        <ChartCard
          title="Lượt điểm danh 7 ngày gần nhất"
          data={checkInTrend}
          dataKey="checkIns"
          color="#E56A16"
          emptyMessage="Chưa có dữ liệu điểm danh trong khoảng thời gian này."
        />
        <ChartCard
          title="Điểm loyalty đã phát theo ngày"
          data={pointsTrend}
          dataKey="points"
          color="#18864B"
          emptyMessage="Chưa có dữ liệu điểm thưởng trong khoảng thời gian này."
        />
        <ChartCard
          title="Voucher đã phát theo ngày"
          data={voucherTrend}
          dataKey="vouchers"
          color="#7D55D3"
          emptyMessage="Chưa có dữ liệu voucher trong khoảng thời gian này."
        />
      </div>

      <div className="checkin-dashboard-bottom">
        <div className="checkin-section-card">
          <div className="checkin-card-head">
            <div>
              <h2 className="checkin-section-title">Hoạt động gần đây</h2>
              <p className="checkin-section-description">Các lượt check-in mới nhất được ghi nhận từ backend loyalty-service.</p>
            </div>
          </div>
          <div className="checkin-card-body">
            {recentActivities.length > 0 ? (
              <div className="checkin-activity-list">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="checkin-activity-item">
                    <div className="checkin-activity-user">
                      <div className="checkin-avatar">{activity.userName?.charAt(0)?.toUpperCase() || "U"}</div>
                      <div>
                        <div className="checkin-activity-name">{activity.userName || "Người dùng"}</div>
                        <div className="checkin-activity-note">
                          {activity.programName || "Chương trình"} · Chuỗi {activity.streakAfter || 0} ngày
                        </div>
                      </div>
                    </div>
                    <div className="checkin-activity-reward">
                      {activity.pointsAwarded ? `+${activity.pointsAwarded} điểm` : activity.voucherId ? activity.voucherId : "Không có thưởng"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="checkin-empty-state" style={{ paddingTop: "16px", paddingBottom: "16px" }}>
                <p>Chưa có hoạt động điểm danh gần đây.</p>
              </div>
            )}
          </div>
        </div>

        <div className="checkin-section-card">
          <div className="checkin-card-head">
            <div>
              <h2 className="checkin-section-title">Tỷ lệ hoàn thành chuỗi</h2>
              <p className="checkin-section-description">Theo dữ liệu `user_checkin_progress` hiện tại.</p>
            </div>
          </div>
          <div className="checkin-card-body">
            <div className="checkin-summary-grid">
              <div className="checkin-summary-tile">
                <div className="checkin-summary-label">Hoàn thành mốc 7 ngày</div>
                <div className="checkin-summary-value">{Number(rewardCycle.sevenDayRate || 0).toLocaleString("vi-VN")}%</div>
              </div>
              <div className="checkin-summary-tile">
                <div className="checkin-summary-label">Hoàn thành mốc 30 ngày</div>
                <div className="checkin-summary-value">{Number(rewardCycle.thirtyDayRate || 0).toLocaleString("vi-VN")}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
