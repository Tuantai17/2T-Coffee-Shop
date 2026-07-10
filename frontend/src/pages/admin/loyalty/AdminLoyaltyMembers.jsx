import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminLayout from "../../../layouts/AdminLayout";
import adminLoyaltyApi from "../../../api/adminLoyaltyApi";

import LoyaltyMemberFilters from "./components/LoyaltyMemberFilters";
import LoyaltyMemberStats from "./components/LoyaltyMemberStats";
import TopLoyaltyMembers from "./components/TopLoyaltyMembers";
import LoyaltyMembersTable from "./components/LoyaltyMembersTable";
import LoyaltyMemberDetailDrawer from "./components/LoyaltyMemberDetailDrawer";
import LoyaltyPointAdjustModal from "./components/LoyaltyPointAdjustModal";

function AdminLoyaltyMembers() {
  // Global Data State
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("Tat ca");
  const [statusFilter, setStatusFilter] = useState("Tat ca");
  const [sortOption, setSortOption] = useState("default");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer / Detail State
  const [showDrawer, setShowDrawer] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Point Adjust Modal State
  const [showPointModal, setShowPointModal] = useState(false);
  const [savingAdjustment, setSavingAdjustment] = useState(false);
  const [userToAdjust, setUserToAdjust] = useState(null);

  // Top Members Modal
  const [showTopMembers, setShowTopMembers] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tierFilter, statusFilter, sortOption]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await adminLoyaltyApi.getMembers();
      setMembers(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách thành viên:", error);
      setMembers([]);
      toast.error("Không thể tải danh sách thành viên loyalty.");
    } finally {
      setLoading(false);
    }
  };

  const processedMembers = useMemo(() => {
    // 1. Filter
    let filtered = members.filter((user) => {
      const normalizedKeyword = searchTerm.trim().toLowerCase();
      const matchesKeyword =
        !normalizedKeyword ||
        [user.name, user.email, user.phone]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedKeyword));

      const matchesTier = tierFilter === "Tat ca" || user.tier === tierFilter;
      const matchesStatus =
        statusFilter === "Tat ca" || user.status === statusFilter;

      return matchesKeyword && matchesTier && matchesStatus;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "points_desc":
          return (b.points || 0) - (a.points || 0);
        case "points_asc":
          return (a.points || 0) - (b.points || 0);
        case "join_desc":
          return new Date(b.date || 0) - new Date(a.date || 0);
        case "join_asc":
          return new Date(a.date || 0) - new Date(b.date || 0);
        case "tier_desc": {
          const tierRank = { diamond: 4, platinum: 3, gold: 2, silver: 1 };
          const aRank = tierRank[(a.tier || "").toLowerCase()] || 0;
          const bRank = tierRank[(b.tier || "").toLowerCase()] || 0;
          return bRank - aRank;
        }
        case "tier_asc": {
          const tierRank = { diamond: 4, platinum: 3, gold: 2, silver: 1 };
          const aRank = tierRank[(a.tier || "").toLowerCase()] || 0;
          const bRank = tierRank[(b.tier || "").toLowerCase()] || 0;
          return aRank - bRank;
        }
        default:
          return 0; // default (id or fetched order)
      }
    });

    return filtered;
  }, [members, searchTerm, tierFilter, statusFilter, sortOption]);

  const handleOpenDrawer = async (user) => {
    setShowDrawer(true);
    setDetailLoading(true);
    setSelectedUser(user);

    try {
      const response = await adminLoyaltyApi.getMemberDetail(user.userId || user.id);
      setSelectedUser(response?.data || user);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết thành viên:", error);
      toast.error("Không thể tải chi tiết thành viên.");
      setSelectedUser(user);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenPointModal = (user) => {
    setUserToAdjust(user);
    setShowPointModal(true);
  };

  const handleSubmitPointAdjustment = async (formData) => {
    if (!userToAdjust?.userId && !userToAdjust?.id) return;
    const userId = userToAdjust.userId || userToAdjust.id;

    try {
      setSavingAdjustment(true);
      await adminLoyaltyApi.adjustMemberPoint(userId, {
        adjustType: formData.adjustType,
        points: formData.points,
        reason: formData.note?.trim()
          ? `${formData.reason} - ${formData.note.trim()}`
          : formData.reason,
      });

      toast.success("Đã cập nhật điểm thành công.");
      setShowPointModal(false);
      await fetchMembers(); // Refresh list

      // Refresh detail drawer if it is open and the adjusted user is the selected user
      if (showDrawer && selectedUser && (selectedUser.userId === userId || selectedUser.id === userId)) {
        const detailResponse = await adminLoyaltyApi.getMemberDetail(userId);
        setSelectedUser(detailResponse?.data || selectedUser);
      }
    } catch (error) {
      console.error("Lỗi khi điều chỉnh điểm:", error);
      toast.error("Không thể cập nhật điểm cho thành viên.");
    } finally {
      setSavingAdjustment(false);
    }
  };

  return (
    <AdminLayout>
      <div className="loyalty-members fade-in position-relative overflow-hidden">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4
              className="fw-black mb-1 text-uppercase d-flex align-items-center gap-2"
              style={{ color: "#4a3525" }}
            >
              <i className="fa-solid fa-users-gear text-danger"></i> THÀNH VIÊN
            </h4>
            <p className="text-muted small mb-0">
              Quản lý danh sách thành viên Loyalty
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-light bg-white border rounded-pill px-3 fw-medium shadow-sm"
              style={{ fontSize: "12px" }}
            >
              <i className="fa-solid fa-file-export me-1 text-success"></i> Xuất Excel
            </button>
            <button
              className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"
              style={{ backgroundColor: "#5c3d2e", borderColor: "#5c3d2e" }}
              onClick={fetchMembers}
            >
              <i className="fa-solid fa-rotate-right me-1"></i> Tải lại
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <LoyaltyMemberStats
          members={members}
          onOpenTopMembers={() => setShowTopMembers(true)}
        />

        {/* Filter Section */}
        <LoyaltyMemberFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          tierFilter={tierFilter}
          setTierFilter={setTierFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />

        {/* Table Section */}
        <LoyaltyMembersTable
          members={processedMembers}
          loading={loading}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          sortOption={sortOption}
          setSortOption={setSortOption}
          onOpenDetail={handleOpenDrawer}
          onOpenPointModal={handleOpenPointModal}
        />

        {/* Top Members Modal */}
        {showTopMembers && (
          <TopLoyaltyMembers
            members={members}
            onClose={() => setShowTopMembers(false)}
            onOpenDetail={handleOpenDrawer}
          />
        )}

        {/* Detail Drawer */}
        <LoyaltyMemberDetailDrawer
          showDrawer={showDrawer}
          onClose={() => setShowDrawer(false)}
          selectedUser={selectedUser}
          detailLoading={detailLoading}
          onOpenPointModal={handleOpenPointModal}
        />

        {/* Point Adjust Modal */}
        {showPointModal && userToAdjust && (
          <LoyaltyPointAdjustModal
            selectedUser={userToAdjust}
            onClose={() => setShowPointModal(false)}
            onSubmit={handleSubmitPointAdjustment}
            savingAdjustment={savingAdjustment}
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

export default AdminLoyaltyMembers;
