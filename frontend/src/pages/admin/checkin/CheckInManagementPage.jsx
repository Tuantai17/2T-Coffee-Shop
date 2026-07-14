import React, { useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import DashboardTab from "./components/DashboardTab";
import ProgramsTab from "./components/ProgramsTab";
import HistoryTab from "./components/HistoryTab";
import SettingsTab from "./components/SettingsTab";
import "./CheckInManagementPage.css";

export default function CheckInManagementPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Tổng quan", icon: "fa-chart-pie" },
    { id: "programs", label: "Quản lý chương trình", icon: "fa-calendar-check" },
    { id: "history", label: "Lịch sử điểm danh", icon: "fa-clock-rotate-left" },
    { id: "settings", label: "Cấu hình chung", icon: "fa-sliders" },
  ];

  return (
    <AdminLayout>
      <div className="checkin-admin-page">
        <div className="checkin-admin-header">
          <h1 className="checkin-admin-title">Điểm danh hằng ngày</h1>
          <p className="checkin-admin-subtitle">
            Quản lý chương trình daily check-in, cấu hình phần thưởng và theo dõi lịch sử điểm danh trên cùng một màn hình.
          </p>
        </div>

        <div className="checkin-admin-tabs" role="tablist" aria-label="Điều hướng module check-in">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`checkin-admin-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "programs" && <ProgramsTab />}
          {activeTab === "history" && <HistoryTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </AdminLayout>
  );
}
