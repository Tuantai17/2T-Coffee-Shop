import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import DashboardHeading from "./components/DashboardHeading";
import MenuSummaryCards from "./menus/MenuSummaryCards";
import MenuFilterBar from "./menus/MenuFilterBar";
import MenuTreeTable from "./menus/MenuTreeTable";
import MenuFormDrawer from "./menus/MenuFormDrawer";
import * as menuService from "../../services/menuService";

function AdminMenuPage() {
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for Table
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  // States for Form Drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    level: "all",
    status: "all",
    sort: "order_asc"
  });

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const res = await menuService.getAdminMenus();
      setMenus(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách menu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Compute parent options (can be any menu)
  const parentOptions = useMemo(() => menus, [menus]);

  // Handle Filtering
  const filteredMenus = useMemo(() => {
    let result = [...menus];
    
    // Level filter
    if (filters.level === "1") {
      result = result.filter(m => !m.parentId);
    } else if (filters.level === "2") {
      result = result.filter(m => m.parentId);
      // Ensure parents are included to show the tree properly
      const parentIds = new Set(result.map(m => m.parentId));
      const requiredParents = menus.filter(m => parentIds.has(m.id));
      result = [...new Set([...requiredParents, ...result])];
    }

    // Status filter
    if (filters.status === "active") {
      result = result.filter(m => m.isActive);
    } else if (filters.status === "inactive") {
      result = result.filter(m => !m.isActive);
    }

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(m => 
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.path && m.path.toLowerCase().includes(q)) ||
        (m.slug && m.slug.toLowerCase().includes(q))
      );
      // Auto expand to show search results
      if (q.length > 0) {
        const newExpanded = {};
        result.forEach(m => {
          if (m.parentId) newExpanded[m.parentId] = true;
        });
        setExpandedRows(prev => ({ ...prev, ...newExpanded }));
      }
    }

    // Sort (Sort applied mostly to parents, and children within parents)
    result.sort((a, b) => {
      if (filters.sort === "order_asc") return (a.displayOrder || 0) - (b.displayOrder || 0);
      if (filters.sort === "order_desc") return (b.displayOrder || 0) - (a.displayOrder || 0);
      if (filters.sort === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (filters.sort === "name_desc") return (b.name || "").localeCompare(a.name || "");
      if (filters.sort === "updated_desc") {
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [menus, filters]);

  const handleFilterChange = (key, value) => {
    if (key === "clear") {
      setFilters({ search: "", level: "all", status: "all", sort: "order_asc" });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleExpandAll = () => {
    const newExpanded = {};
    parentOptions.forEach(p => newExpanded[p.id] = true);
    setExpandedRows(newExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedRows({});
  };

  const handleToggleExpand = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Selection
  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleSelectAll = (checked, allFilteredIds) => {
    if (checked) {
      setSelectedIds(allFilteredIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Actions
  const handleToggleStatus = async (id, isActive) => {
    try {
      await menuService.updateMenuStatus(id, isActive);
      setMenus(prev => prev.map(m => m.id === id ? { ...m, isActive } : m));
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  const handleDelete = async (menu) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa menu '${menu.name}'? Các menu con (nếu có) cũng sẽ bị xóa theo. Thao tác này không thể hoàn tác.`)) {
      try {
        await menuService.deleteMenu(menu.id);
        fetchMenus();
        setSelectedIds(prev => prev.filter(id => id !== menu.id));
      } catch (err) {
        alert(err.response?.data?.error || "Lỗi khi xóa menu!");
      }
    }
  };

  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} menu đã chọn? Các menu con của chúng cũng sẽ bị xóa theo.`)) {
      try {
        await menuService.deleteBulkMenus(selectedIds);
        fetchMenus();
        setSelectedIds([]);
      } catch (err) {
        alert("Lỗi khi xóa hàng loạt!");
      }
    }
  };

  const handleSaveMenu = async (formData) => {
    try {
      if (menuToEdit) {
        await menuService.updateMenu(menuToEdit.id, formData);
      } else {
        await menuService.createMenu(formData);
      }
      setShowDrawer(false);
      fetchMenus();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi lưu menu!");
    }
  };

  const openAddForm = () => {
    setMenuToEdit(null);
    setShowDrawer(true);
  };

  const openEditForm = (menu) => {
    setMenuToEdit(menu);
    setShowDrawer(true);
  };

  return (
    <AdminLayout>
      <div className="container-fluid px-0">
        <DashboardHeading 
          title="Quản lý menu" 
          subtitle="Quản lý cấu trúc điều hướng, thứ tự hiển thị và trạng thái menu trên website."
        />

        {/* Toolbar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div className="d-flex gap-2">
            <button className="btn btn-light shadow-sm fw-semibold" onClick={fetchMenus}>
              <i className="fa-solid fa-arrows-rotate me-2 text-muted"></i> Làm mới
            </button>
            <button 
              className={`btn btn-outline-danger shadow-sm fw-semibold ${selectedIds.length === 0 ? 'disabled opacity-50' : ''}`}
              onClick={handleDeleteBulk}
            >
              <i className="fa-regular fa-trash-can me-2"></i> Xóa đã chọn {selectedIds.length > 0 && `(${selectedIds.length})`}
            </button>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light shadow-sm fw-semibold" onClick={() => window.open('/', '_blank')}>
              <i className="fa-regular fa-eye me-2 text-muted"></i> Xem trước
            </button>
            <button className="btn btn-primary shadow-sm fw-semibold px-4" onClick={openAddForm}>
              <i className="fa-solid fa-plus me-2"></i> Thêm menu
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center gap-3">
            <i className="fa-solid fa-triangle-exclamation fs-4"></i>
            <div>
              <p className="mb-0 fw-semibold">{error}</p>
              <button className="btn btn-sm btn-outline-danger mt-2" onClick={fetchMenus}>Thử lại</button>
            </div>
          </div>
        ) : (
          <>
            <MenuSummaryCards menus={menus} />

            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <MenuFilterBar 
                  filters={filters} 
                  onFilterChange={handleFilterChange} 
                  onExpandAll={handleExpandAll}
                  onCollapseAll={handleCollapseAll}
                />

                {selectedIds.length > 0 && (
                  <div className="alert alert-primary py-2 px-3 mb-3 d-flex align-items-center justify-content-between border-0 shadow-sm" style={{ backgroundColor: "#e7f1ff" }}>
                    <div className="d-flex align-items-center gap-2 text-primary fw-semibold">
                      <div className="form-check custom-checkbox mb-0">
                        <input className="form-check-input mt-0" type="checkbox" checked={true} readOnly />
                      </div>
                      Đã chọn {selectedIds.length} menu
                    </div>
                    <button className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold" onClick={handleClearSelection}>
                      Bỏ chọn tất cả
                    </button>
                  </div>
                )}

                <MenuTreeTable 
                  menus={filteredMenus}
                  expandedRows={expandedRows}
                  onToggleExpand={handleToggleExpand}
                  selectedIds={selectedIds}
                  onSelectRow={handleSelectRow}
                  onSelectAll={handleSelectAll}
                  onToggleStatus={handleToggleStatus}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <MenuFormDrawer 
        show={showDrawer}
        onClose={() => setShowDrawer(false)}
        menuToEdit={menuToEdit}
        onSave={handleSaveMenu}
        parentOptions={parentOptions}
      />
    </AdminLayout>
  );
}

export default AdminMenuPage;
