import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminLayout from "../../../layouts/AdminLayout";
import adminLoyaltyApi from "../../../api/adminLoyaltyApi";

const moneyFormatter = new Intl.NumberFormat("vi-VN");

function formatValue(value) {
  if (typeof value === "number") {
    return moneyFormatter.format(value);
  }
  return value ?? "-";
}

function AdminLoyaltyDashboard() {
  const [stats, setStats] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [charts, setCharts] = useState({
    pointsOverview: [],
    tierDistribution: [],
    topMembers: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [responseStats, responseTiers, responseCharts] = await Promise.all([
        adminLoyaltyApi.getDashboardStats(),
        adminLoyaltyApi.getTiers(),
        adminLoyaltyApi.getDashboardCharts(),
      ]);

      setStats(Array.isArray(responseStats?.data) ? responseStats.data : []);
      setTiers(Array.isArray(responseTiers?.data) ? responseTiers.data : []);
      setCharts({
        pointsOverview: Array.isArray(responseCharts?.data?.pointsOverview)
          ? responseCharts.data.pointsOverview
          : [],
        tierDistribution: Array.isArray(responseCharts?.data?.tierDistribution)
          ? responseCharts.data.tierDistribution
          : [],
        topMembers: Array.isArray(responseCharts?.data?.topMembers)
          ? responseCharts.data.topMembers
          : [],
      });
    } catch (error) {
      console.error("Loi khi tai du lieu loyalty dashboard:", error);
      setStats([]);
      setTiers([]);
      setCharts({ pointsOverview: [], tierDistribution: [], topMembers: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const hasChartData = useMemo(
    () =>
      charts.pointsOverview.length > 0 ||
      charts.tierDistribution.length > 0 ||
      charts.topMembers.length > 0,
    [charts]
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="loyalty-admin-dashboard fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4
              className="fw-black mb-1 text-uppercase d-flex align-items-center gap-2"
              style={{ color: "#4a3525" }}
            >
              <i className="fa-solid fa-crown text-warning"></i> LOYALTY DASHBOARD
            </h4>
            <p className="text-muted small mb-0">Tong quan chuong trinh khach hang than thiet</p>
          </div>
          <div className="d-flex gap-2">
            <div
              className="bg-white rounded-pill px-3 py-2 text-muted fw-bold shadow-sm d-flex align-items-center"
              style={{ fontSize: "12px" }}
            >
              Live data <i className="fa-solid fa-signal ms-2"></i>
            </div>
            <button
              className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"
              style={{ backgroundColor: "#5c3d2e", borderColor: "#5c3d2e" }}
              onClick={fetchDashboardData}
            >
              <i className="fa-solid fa-rotate-right me-1"></i> Lam moi
            </button>
          </div>
        </div>

        {stats.length > 0 ? (
          <div className="row g-3 mb-4">
            {stats.map((item, index) => (
              <div className="col-md-2" key={`${item.title}-${index}`}>
                <div className="card border-0 rounded-4 p-3 h-100 bg-white shadow-sm hover-lift text-center position-relative overflow-hidden">
                  <div
                    className={`position-absolute bg-${item.color} opacity-10 rounded-circle`}
                    style={{ width: "40px", height: "40px", top: "-10px", right: "-10px" }}
                  ></div>
                  <div className="text-muted fw-medium mb-2" style={{ fontSize: "10px" }}>
                    <i className={`fa-solid ${item.icon} text-${item.color} me-1`}></i> {item.title}
                  </div>
                  <div className="fw-black text-dark mb-1" style={{ fontSize: "18px" }}>
                    {formatValue(item.val)}
                  </div>
                  <div className="text-success fw-bold" style={{ fontSize: "9px" }}>
                    <i className="fa-solid fa-caret-up"></i> {item.diff}{" "}
                    <span className="text-muted fw-normal">so voi ky truoc</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-light border shadow-sm text-center text-muted mb-4">
            <i className="fa-solid fa-database mb-2 fs-4"></i>
            <p className="mb-0 small">Chua co du lieu thong ke tu API.</p>
          </div>
        )}

        {hasChartData ? (
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="card border-0 rounded-4 p-4 h-100 bg-white shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-bold text-dark">Phan bo diem</div>
                    <div className="text-muted small">Tong hop tu loyalty_accounts</div>
                  </div>
                  <i className="fa-solid fa-chart-pie text-warning"></i>
                </div>
                <div style={{ height: "250px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.pointsOverview}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {charts.pointsOverview.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => moneyFormatter.format(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="d-flex flex-column gap-2 mt-3">
                  {charts.pointsOverview.map((entry) => (
                    <div className="d-flex justify-content-between align-items-center" key={entry.name}>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="rounded-circle"
                          style={{ width: "10px", height: "10px", backgroundColor: entry.color }}
                        ></span>
                        <span className="small text-muted">{entry.name}</span>
                      </div>
                      <span className="fw-bold text-dark small">{moneyFormatter.format(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 rounded-4 p-4 h-100 bg-white shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-bold text-dark">Phan bo hang thanh vien</div>
                    <div className="text-muted small">So member theo tung tier</div>
                  </div>
                  <i className="fa-solid fa-chart-column text-primary"></i>
                </div>
                <div style={{ height: "280px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.tierDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => [`${value} thanh vien`, "So luong"]} />
                      <Bar dataKey="members" radius={[8, 8, 0, 0]}>
                        {charts.tierDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="card border-0 rounded-4 p-4 h-100 bg-white shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-bold text-dark">Top thanh vien</div>
                    <div className="text-muted small">Xep hang theo diem hien co</div>
                  </div>
                  <i className="fa-solid fa-ranking-star text-danger"></i>
                </div>
                <div className="d-flex flex-column gap-3">
                  {charts.topMembers.map((member, index) => (
                    <div className="d-flex align-items-center gap-3" key={`${member.userId}-${index}`}>
                      <div className="fw-black text-muted" style={{ width: "18px" }}>
                        {index + 1}
                      </div>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="rounded-circle border"
                        style={{ width: "38px", height: "38px", objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                          {member.name}
                        </div>
                        <div className="text-muted small">{member.tier}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-black text-danger">{moneyFormatter.format(member.points)}</div>
                        <div className="text-muted" style={{ fontSize: "10px" }}>
                          diem
                        </div>
                      </div>
                    </div>
                  ))}
                  {charts.topMembers.length === 0 && (
                    <div className="text-muted small">Chua co top member de hien thi.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="alert alert-light border shadow-sm text-center text-muted mb-4">
            <i className="fa-solid fa-chart-line mb-2 fs-4"></i>
            <p className="mb-0 small">API charts da co nhung hien chua co du lieu de ve bieu do.</p>
          </div>
        )}

        <h6 className="fw-bold mb-3" style={{ fontSize: "14px" }}>
          Tong quan hang thanh vien
        </h6>
        {tiers.length > 0 ? (
          <div className="row g-3">
            {tiers.map((tier) => (
              <div className="col-md-3" key={tier.id}>
                <div
                  className="card border-0 rounded-4 p-4 h-100 shadow-sm hover-lift d-flex flex-column"
                  style={{ backgroundColor: tier.bg || "#f8f9fa" }}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: "45px", height: "45px" }}
                    >
                      <i
                        className={`fa-solid ${tier.icon || "fa-star"} fs-4`}
                        style={{ color: tier.styleColor || "var(--bs-primary)" }}
                      ></i>
                    </div>
                    <div>
                      <div
                        className="fw-black mb-1"
                        style={{ fontSize: "14px", color: tier.styleColor || "var(--bs-primary)" }}
                      >
                        {tier.name}
                      </div>
                      <div className="text-muted" style={{ fontSize: "10px" }}>
                        {tier.pts}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-50 rounded p-2 mb-3 flex-grow-1">
                    <div className="fw-bold text-dark mb-2" style={{ fontSize: "10px" }}>
                      Quyen loi chinh:
                    </div>
                    <ul className="list-unstyled mb-0 text-muted" style={{ fontSize: "9px" }}>
                      {tier.benefits?.map((benefit, benefitIndex) => (
                        <li key={`${tier.id}-${benefitIndex}`} className="mb-1">
                          <i className="fa-solid fa-check text-success me-1"></i> {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mt-auto">
                    <div>
                      <div className="fw-black text-dark lh-1" style={{ fontSize: "18px" }}>
                        {tier.members}
                      </div>
                      <div className="text-muted" style={{ fontSize: "9px" }}>
                        Thanh vien
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-secondary btn-sm bg-white rounded-pill px-3"
                      style={{ fontSize: "10px" }}
                    >
                      Quan ly
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-light border shadow-sm text-center text-muted">
            <i className="fa-solid fa-box-open mb-2 fs-4"></i>
            <p className="mb-0 small">Khong co du lieu hang thanh vien tu API.</p>
          </div>
        )}
      </div>

      <style>{`
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important; }
        .fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </AdminLayout>
  );
}

export default AdminLoyaltyDashboard;
