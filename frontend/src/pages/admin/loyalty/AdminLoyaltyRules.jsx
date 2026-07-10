import React, { useState, useEffect } from 'react';
import AdminLayout from "../../../layouts/AdminLayout";
import adminLoyaltyApi from "../../../api/adminLoyaltyApi";
import RuleList from './components/rules/RuleList';
import RuleFormModal from './components/rules/RuleFormModal';
import RuleTestModal from './components/rules/RuleTestModal';

function AdminLoyaltyRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showForm, setShowForm] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await adminLoyaltyApi.getRules();
      if (response && response.data) {
        setRules(response.data);
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách quy tắc:", error);
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingRule(null);
    setShowForm(true);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn vô hiệu hóa quy tắc này (Xóa mềm)?")) {
      try {
        await adminLoyaltyApi.deleteRule(id);
        fetchRules();
      } catch (error) {
        console.error("Lỗi khi xóa quy tắc:", error);
        alert("Có lỗi xảy ra khi xóa.");
      }
    }
  };

  const handleToggleStatus = async (rule) => {
    try {
      const payload = { ...rule, status: !rule.status };
      await adminLoyaltyApi.updateRule(rule.id, payload);
      fetchRules();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  const handleSaveForm = async (payload) => {
    try {
      if (payload.id) {
        await adminLoyaltyApi.updateRule(payload.id, payload);
      } else {
        await adminLoyaltyApi.createRule(payload);
      }
      setShowForm(false);
      fetchRules();
    } catch (error) {
      console.error("Lỗi khi lưu quy tắc:", error);
      alert("Lưu thất bại!");
    }
  };

  const handleExportCsv = () => {
    if (rules.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }
    const headers = ["ID", "Ten quy tac", "Loai", "Nguon", "Diem", "Trang thai", "Dieu kien", "Ngay tao"];
    const csvRows = [headers.join(",")];
    
    rules.forEach(r => {
      const values = [
        r.id,
        `"${(r.name || "").replace(/"/g, '""')}"`,
        r.type,
        r.source,
        r.point,
        r.status ? "Hoat dong" : "Tam dung",
        `"${(r.condition || "").replace(/"/g, '""')}"`,
        r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : ""
      ];
      csvRows.push(values.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Loyalty_Rules_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="loyalty-rules fade-in position-relative">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h4 className="fw-black mb-1 text-uppercase d-flex align-items-center gap-2" style={{ color: "#4a3525" }}>
              <i className="fa-solid fa-scale-balanced text-primary"></i> QUẢN LÝ QUY TẮC TÍCH ĐIỂM
            </h4>
            <p className="text-muted small mb-0">Thiết lập quy tắc tích và trừ điểm cho toàn hệ thống</p>
          </div>
          <div className="d-flex gap-2">
            <button onClick={() => setShowTest(true)} className="btn btn-outline-primary rounded-pill px-3 fw-medium bg-white">
              <i className="fa-solid fa-vial me-1"></i> Tính thử
            </button>
            <button onClick={handleExportCsv} className="btn btn-outline-success rounded-pill px-3 fw-medium bg-white">
              <i className="fa-solid fa-file-csv me-1"></i> Xuất CSV
            </button>
            <button onClick={handleCreateNew} className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" style={{ backgroundColor: "#5c3d2e", borderColor: "#5c3d2e" }}>
              <i className="fa-solid fa-plus me-1"></i> Thêm quy tắc
            </button>
          </div>
        </div>

        {/* Rules Table Component */}
        {loading ? (
          <div className="text-center py-5 text-muted bg-white rounded-4 shadow-sm">
            <div className="spinner-border text-danger mb-2" role="status"></div>
            <div>Đang tải dữ liệu...</div>
          </div>
        ) : (
          <RuleList 
            rules={rules} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onToggleStatus={handleToggleStatus}
          />
        )}

      </div>

      {/* Modals */}
      <RuleFormModal 
        show={showForm} 
        onHide={() => setShowForm(false)} 
        rule={editingRule} 
        onSave={handleSaveForm} 
      />

      <RuleTestModal 
        show={showTest} 
        onHide={() => setShowTest(false)} 
      />

      <style>{`
        .action-btn { transition: all 0.2s; }
        .action-btn:hover { background-color: #f8f9fa; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .form-check-input:checked { background-color: #198754; border-color: #198754; }
      `}</style>
    </AdminLayout>
  );
}

export default AdminLoyaltyRules;
