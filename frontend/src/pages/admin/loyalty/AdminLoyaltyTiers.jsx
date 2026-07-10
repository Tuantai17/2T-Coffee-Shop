import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from "../../../layouts/AdminLayout";
import adminLoyaltyApi from "../../../api/adminLoyaltyApi";

import TierStats from './components/TierStats';
import TierList from './components/TierList';
import TierFormModal from './components/TierFormModal';

function AdminLoyaltyTiers() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const response = await adminLoyaltyApi.getTiers();
      if (response && response.data) {
        // Ensure they are sorted by displayOrder
        const sorted = response.data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setTiers(sorted);
      } else {
        setTiers([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hạng thành viên:", error);
      setTiers([]);
      toast.error("Không thể tải dữ liệu hạng thành viên.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tier = null) => {
    setSelectedTier(tier);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTier(null);
  };

  const handleSaveTier = async (formData) => {
    try {
      setSaving(true);
      if (formData.id) {
        await adminLoyaltyApi.updateTier(formData.id, formData);
        toast.success(`Đã cập nhật hạng "${formData.name}" thành công`);
      } else {
        // Find max displayOrder to append at the end
        const maxOrder = tiers.length > 0 ? Math.max(...tiers.map(t => t.displayOrder || 0)) : 0;
        formData.displayOrder = maxOrder + 1;
        await adminLoyaltyApi.createTier(formData);
        toast.success(`Đã tạo hạng "${formData.name}" thành công`);
      }
      handleCloseModal();
      fetchTiers();
    } catch (error) {
      console.error("Lỗi khi lưu hạng:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi lưu hạng thành viên.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTier = async (tier) => {
    if (tier.members > 0) {
      toast.error(`Không thể xóa hạng "${tier.name}" vì đang có ${tier.members} thành viên sử dụng.`);
      return;
    }
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa hạng "${tier.name}" không?`)) {
      try {
        await adminLoyaltyApi.deleteTier(tier.id);
        toast.success(`Đã xóa hạng "${tier.name}"`);
        fetchTiers();
      } catch (error) {
        console.error("Lỗi khi xóa hạng:", error);
        toast.error("Không thể xóa hạng thành viên.");
      }
    }
  };

  const handleUpdateOrder = async (draggedIndex, dropIndex) => {
    if (draggedIndex === dropIndex) return;

    const newTiers = [...tiers];
    const [draggedItem] = newTiers.splice(draggedIndex, 1);
    newTiers.splice(dropIndex, 0, draggedItem);
    
    // Update local state immediately for smooth UI
    setTiers(newTiers);

    try {
      // Re-assign displayOrder based on array index
      const updatePromises = newTiers.map((tier, index) => {
        if (tier.displayOrder !== index + 1) {
          const updatedTier = { ...tier, displayOrder: index + 1 };
          // Need to construct full object for backend
          return adminLoyaltyApi.updateTier(tier.id, {
            code: updatedTier.code,
            name: updatedTier.name,
            minimumCompletedOrders: updatedTier.minimumCompletedOrders || 0,
            minimumEligibleSpending: updatedTier.min || updatedTier.minimumEligibleSpending || 0,
            evaluationMonths: updatedTier.evaluationMonths || 6,
            dailyCheckinPoints: updatedTier.dailyCheckinPoints || 0,
            dailySpinCount: updatedTier.dailySpinCount || 0,
            upgradeVoucherValue: updatedTier.upgradeVoucherValue || 0,
            birthdayVoucherValue: updatedTier.birthdayVoucherValue || 0,
            monthlyFreeshipCount: updatedTier.monthlyFreeshipCount || 0,
            prioritySupport: updatedTier.prioritySupport || false,
            active: updatedTier.active !== false,
            color: updatedTier.color,
            icon: updatedTier.icon,
            displayOrder: updatedTier.displayOrder
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      toast.success("Đã cập nhật thứ tự hạng");
    } catch (error) {
      console.error("Lỗi cập nhật thứ tự:", error);
      toast.error("Lỗi khi lưu thứ tự. Vui lòng tải lại trang.");
      fetchTiers(); // Revert to backend state
    }
  };

  const handleSyncMembers = async () => {
    try {
      setSyncing(true);
      await adminLoyaltyApi.syncMembersTiers();
      toast.success("Đã gửi yêu cầu đồng bộ hạng thành viên.");
      // Optional: Wait a bit and fetch tiers to see updated member counts
      setTimeout(fetchTiers, 1500);
    } catch (error) {
      console.error("Lỗi đồng bộ:", error);
      toast.error("Đồng bộ thất bại.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="loyalty-tiers fade-in position-relative">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-black mb-1 text-uppercase d-flex align-items-center gap-2" style={{ color: "#4a3525" }}>
              <i className="fa-solid fa-ranking-star text-danger"></i> QUẢN LÝ HẠNG THÀNH VIÊN
            </h4>
            <p className="text-muted small mb-0">Tạo và quản lý các hạng thành viên Loyalty</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-light bg-white border rounded-pill px-4 fw-bold shadow-sm text-primary" 
              onClick={handleSyncMembers}
              disabled={syncing}
            >
              {syncing ? <><span className="spinner-border spinner-border-sm me-1"></span> Đang đồng bộ...</> : <><i className="fa-solid fa-rotate me-1"></i> Cập nhật lại hạng</>}
            </button>
            <button 
              className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" 
              style={{ backgroundColor: "#5c3d2e", borderColor: "#5c3d2e" }}
              onClick={() => handleOpenModal()}
            >
              <i className="fa-solid fa-plus me-1"></i> Thêm hạng mới
            </button>
          </div>
        </div>

        {/* Stats */}
        <TierStats tiers={tiers} />

        {/* Info Alert */}
        <div className="alert alert-info py-2 px-3 small border-0 bg-info bg-opacity-10 d-flex gap-2 mb-3">
          <i className="fa-solid fa-circle-info mt-1"></i>
          <div>Kéo thả biểu tượng <i className="fa-solid fa-grip-vertical mx-1"></i> để sắp xếp lại thứ tự ưu tiên của các hạng (Hạng thấp nhất nên nằm ở đầu).</div>
        </div>

        {/* Tier List */}
        <TierList 
          tiers={tiers} 
          loading={loading} 
          onEdit={handleOpenModal} 
          onDelete={handleDeleteTier} 
          onUpdateOrder={handleUpdateOrder}
        />

        {/* Form Modal */}
        {showModal && (
          <TierFormModal 
            tier={selectedTier}
            onClose={handleCloseModal}
            onSave={handleSaveTier}
            saving={saving}
          />
        )}
      </div>

      <style>{`
        .action-btn { transition: all 0.2s; }
        .action-btn:hover { background-color: #f8f9fa; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </AdminLayout>
  );
}

export default AdminLoyaltyTiers;
