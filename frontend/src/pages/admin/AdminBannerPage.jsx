import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { createBanner, deleteBanner, getBanners, updateBanner } from "../../services/productService";
import BannerFilterBar from "./banners/BannerFilterBar";
import BannerList from "./banners/BannerList";
import BannerPagination from "./banners/BannerPagination";
import BannerFormModal from "./banners/BannerFormModal";
import BannerPreviewModal from "./banners/BannerPreviewModal";

function AdminBannerPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filtering
  const [filters, setFilters] = useState({ sort: "asc" });
  const [appliedFilters, setAppliedFilters] = useState({ sort: "asc" });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewingBanner, setPreviewingBanner] = useState(null);

  // Status message
  const [statusMsg, setStatusMsg] = useState(null);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const response = await getBanners({ activeOnly: false });
      setBanners(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi lấy banner:", error);
      showStatus("Lỗi khi tải dữ liệu banner.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const showStatus = (message, type = "success") => {
    setStatusMsg({ message, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // --- Filter and Sort Logic ---
  const handleApplyFilter = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setFilters({ sort: "asc" });
    setAppliedFilters({ sort: "asc" });
    setCurrentPage(1);
  };

  const filteredAndSortedBanners = useMemo(() => {
    let result = [...banners];
    const { search, status, sort } = appliedFilters;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b => 
        (b.title || "").toLowerCase().includes(q) ||
        (b.subtitle || "").toLowerCase().includes(q) ||
        (b.targetUrl || "").toLowerCase().includes(q)
      );
    }

    if (status) {
      if (status === "active") result = result.filter(b => b.active === true);
      if (status === "inactive") result = result.filter(b => b.active === false);
    }

    if (sort) {
      result.sort((a, b) => {
        if (sort === "asc") return (a.sortOrder || 0) - (b.sortOrder || 0);
        if (sort === "desc") return (b.sortOrder || 0) - (a.sortOrder || 0);
        if (sort === "newest") return (b.id || 0) - (a.id || 0); // fallback to id if no updatedAt
        if (sort === "oldest") return (a.id || 0) - (b.id || 0);
        return 0;
      });
    }

    return result;
  }, [banners, appliedFilters]);

  // Pagination slice
  const paginatedBanners = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedBanners.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedBanners, currentPage, pageSize]);

  // --- Selection Actions ---
  const handleSelectAll = (checked, visibleBanners) => {
    if (checked) {
      setSelectedIds(visibleBanners.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} banner đã chọn? Thao tác này không thể hoàn tác.`)) return;
    
    setLoading(true);
    let successCount = 0;
    for (const id of selectedIds) {
      try {
        await deleteBanner(id);
        successCount++;
      } catch (e) {
        console.error(`Failed to delete ${id}`, e);
      }
    }
    
    showStatus(`Đã xóa thành công ${successCount}/${selectedIds.length} banner.`);
    setSelectedIds([]);
    loadBanners();
  };

  // --- Row Actions ---
  const handleToggleActive = async (banner, checked) => {
    // Optimistic UI update
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, active: checked } : b));
    try {
      await updateBanner(banner.id, {
        ...banner,
        active: checked
      });
      showStatus(checked ? "Đã bật hiển thị banner." : "Đang ẩn banner.");
    } catch (e) {
      console.error(e);
      // Rollback on fail
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, active: !checked } : b));
      showStatus("Không thể cập nhật trạng thái banner.", "error");
    }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa banner '${banner.title}'? Thao tác này không thể hoàn tác.`)) return;
    try {
      await deleteBanner(banner.id);
      showStatus("Xóa banner thành công!");
      setSelectedIds(prev => prev.filter(i => i !== banner.id));
      loadBanners();
    } catch (error) {
      showStatus("Xóa banner thất bại!", "error");
    }
  };

  // --- Form Actions ---
  const handleSubmitForm = async (formData) => {
    try {
      const payload = {
        ...formData,
        sortOrder: Number(formData.sortOrder || 0),
        active: Boolean(formData.active),
      };
      
      if (editingBanner) {
        await updateBanner(editingBanner.id, payload);
        showStatus("Cập nhật banner thành công!");
      } else {
        await createBanner(payload);
        showStatus("Thêm banner mới thành công!");
      }
      setShowFormModal(false);
      setEditingBanner(null);
      loadBanners();
    } catch (error) {
      console.error(error);
      showStatus("Lưu banner thất bại!", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid px-0">
        
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: "var(--admin-text)" }}>Quản lý banner</h3>
            <p className="mb-0 text-muted">Quản lý hình ảnh, liên kết, thứ tự và trạng thái hiển thị banner trên website.</p>
          </div>
          <div className="d-flex gap-3 align-items-center">
            {statusMsg && (
              <div className={`badge bg-${statusMsg.type === 'error' ? 'danger' : 'success'} px-3 py-2 rounded-pill shadow-sm animate__animated animate__fadeIn`}>
                {statusMsg.message}
              </div>
            )}
            <button className="neu-pill text-decoration-none" onClick={loadBanners} title="Làm mới">
              <i className="fa-solid fa-rotate-right me-2"></i> Làm mới
            </button>
            {selectedIds.length > 0 && (
              <button className="neu-pill text-danger text-decoration-none border-danger" onClick={handleDeleteSelected}>
                <i className="fa-regular fa-trash-can me-2"></i> Xóa đã chọn ({selectedIds.length})
              </button>
            )}
            <button 
              className="neu-pill text-decoration-none" 
              style={{ backgroundColor: "var(--admin-primary)", color: "#fff" }}
              onClick={() => { setEditingBanner(null); setShowFormModal(true); }}
            >
              <i className="fa-solid fa-plus me-2"></i> Thêm banner
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <BannerFilterBar 
          filters={filters} 
          setFilters={setFilters} 
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />

        {/* Selection Info */}
        {selectedIds.length > 0 && (
          <div className="mb-3 text-primary fw-semibold small">
            Đã chọn {selectedIds.length} banner.
          </div>
        )}

        {/* Banner List Table */}
        <BannerList 
          banners={paginatedBanners}
          loading={loading}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onToggleActive={handleToggleActive}
          onPreview={(banner) => { setPreviewingBanner(banner); setShowPreviewModal(true); }}
          onEdit={(banner) => { setEditingBanner(banner); setShowFormModal(true); }}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {!loading && filteredAndSortedBanners.length > 0 && (
          <BannerPagination 
            currentPage={currentPage}
            totalItems={filteredAndSortedBanners.length}
            pageSize={pageSize}
            setPageSize={(size) => { setPageSize(size); setCurrentPage(1); }}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Modals */}
        <BannerFormModal 
          show={showFormModal}
          onClose={() => { setShowFormModal(false); setEditingBanner(null); }}
          initialData={editingBanner}
          onSubmit={handleSubmitForm}
        />

        <BannerPreviewModal 
          show={showPreviewModal}
          banner={previewingBanner}
          onClose={() => { setShowPreviewModal(false); setPreviewingBanner(null); }}
          onEdit={(banner) => { 
            setShowPreviewModal(false); 
            setPreviewingBanner(null); 
            setEditingBanner(banner); 
            setShowFormModal(true); 
          }}
        />

      </div>
    </AdminLayout>
  );
}

export default AdminBannerPage;
