import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../../../layouts/AdminLayout";
import adminLoyaltyApi from "../../../api/adminLoyaltyApi";
import "../../../styles/voucher-loyalty.css";

function AdminVoucherDashboardPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const toggleSelectAll = () => {
    if (selectedRowIds.length === filteredVouchers.length && filteredVouchers.length > 0) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredVouchers.map((v) => v.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await adminLoyaltyApi.getVouchers();
        setVouchers(Array.isArray(response?.data) ? response.data : []);
      } catch (error) { console.error(error);
        toast.error("Không tải được danh sách voucher");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      const q = search.trim().toLowerCase();
      const hitSearch = !q || [voucher.name, voucher.code, voucher.description].some((value) => String(value || "").toLowerCase().includes(q));
      const hitStatus = statusFilter === "ALL" || voucher.status === statusFilter;
      const hitSource = sourceFilter === "ALL" || voucher.source === sourceFilter;
      return hitSearch && hitStatus && hitSource;
    });
  }, [search, sourceFilter, statusFilter, vouchers]);

  const stats = {
    total: vouchers.length,
    active: vouchers.filter((voucher) => voucher.status === "ACTIVE").length,
    expired: vouchers.filter((voucher) => String(voucher.validRange || "").includes(" - ") && String(voucher.validRange).split(" - ")[1] !== "Open" && new Date(String(voucher.validRange).split(" - ")[1]) < new Date()).length,
    loyalty: vouchers.filter((voucher) => voucher.source === "LOYALTY").length,
    issued: vouchers.reduce((sum, voucher) => sum + Number(voucher.claimedQuantity || 0), 0),
    available: vouchers.reduce((sum, voucher) => sum + Number(voucher.remainingQuantity || 0), 0),
  };

  const handleDelete = async (voucherId) => {
    try {
      await adminLoyaltyApi.deleteVoucher(voucherId);
      setVouchers((prev) => prev.filter((voucher) => voucher.id !== voucherId));
      if (selectedVoucher?.id === voucherId) {
        setSelectedVoucher(null);
      }
      toast.success("Đã xóa voucher");
    } catch (error) { console.error(error);
      const msg = error.response?.data?.message || "Không xóa được voucher";
      toast.error(msg);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedRowIds.length} voucher đã chọn?`)) return;

    let successCount = 0;
    let failCount = 0;
    const initialSelected = [...selectedRowIds];

    for (const id of initialSelected) {
      try {
        await adminLoyaltyApi.deleteVoucher(id);
        successCount++;
        setVouchers((prev) => prev.filter((voucher) => voucher.id !== id));
        if (selectedVoucher?.id === id) {
          setSelectedVoucher(null);
        }
      } catch (error) {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Đã xóa thành công ${successCount} voucher`);
    }
    if (failCount > 0) {
      toast.error(`Không thể xóa ${failCount} voucher (đã cấp hoặc lỗi)`);
    }
    setSelectedRowIds([]);
  };

  return (
    <AdminLayout>
      <div className="voucher-loyalty-shell">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <div className="small text-muted mb-2">Trang chủ / Loyalty / Voucher</div>
            <h2 className="mb-1" style={{ color: "#3f281b", fontWeight: 800 }}>Quản lý Voucher</h2>
            <div className="text-muted">Dashboard voucher theo chuẩn enterprise, có tìm kiếm, lọc, drawer chi tiết và CRUD.</div>
          </div>
          <button className="btn vl-primary-btn px-4 py-3" onClick={() => navigate("/admin/vouchers/create")}>
            <i className="fa-solid fa-plus me-2"></i>Thêm voucher
          </button>
        </div>

        <div className="row g-3 mb-4">
          <StatCard label="Tổng voucher" value={stats.total} icon="fa-ticket" />
          <StatCard label="Đang hoạt động" value={stats.active} icon="fa-circle-check" />
          <StatCard label="Đã cấp" value={stats.issued} icon="fa-box-open" />
          <StatCard label="Còn lại" value={stats.available} icon="fa-layer-group" />
          <StatCard label="Nguồn loyalty" value={stats.loyalty} icon="fa-gift" />
          <StatCard label="Đã hết hạn" value={stats.expired} icon="fa-clock" />
        </div>

        <div className="vl-card p-4 mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-lg-5">
              <input className="form-control vl-filter-input" placeholder="Tìm theo tên, mã voucher..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="col-lg-3">
              <select className="form-select vl-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm ẩn</option>
              </select>
            </div>
            <div className="col-lg-3">
              <select className="form-select vl-filter-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="ALL">Tất cả nguồn</option>
                <option value="PUBLIC">Công khai</option>
                <option value="LOYALTY">Loyalty</option>
              </select>
            </div>
            <div className="col-lg-1 text-lg-end">
              <button className="btn vl-secondary-btn w-100" onClick={() => { setSearch(""); setStatusFilter("ALL"); setSourceFilter("ALL"); }}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="vl-card overflow-hidden">
          {selectedRowIds.length > 0 && (
            <div className="p-3 bg-light border-bottom d-flex align-items-center gap-3">
              <span className="fw-bold small text-primary">Đã chọn {selectedRowIds.length} voucher</span>
              <button className="btn btn-sm btn-outline-danger" onClick={handleBulkDelete}>Xóa hàng loạt</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedRowIds([])}>Bỏ chọn</button>
            </div>
          )}
          <div className="table-responsive">
            <table className="table vl-admin-table mb-0">
              <thead>
                <tr>
                  <th className="ps-4 py-3" style={{ width: "40px" }}>
                    <div className="form-check m-0">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={selectedRowIds.length === filteredVouchers.length && filteredVouchers.length > 0} 
                        onChange={toggleSelectAll} 
                      />
                    </div>
                  </th>
                  <th className="py-3">Voucher</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Đơn tối thiểu</th>
                  <th>Đã cấp / Còn lại</th>
                  <th>Trạng thái</th>
                  <th>Nguồn</th>
                  <th className="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="vl-empty-state">Đang tải dữ liệu voucher...</td>
                  </tr>
                ) : filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="vl-empty-state">Không có voucher nào phù hợp bộ lọc hiện tại.</td>
                  </tr>
                ) : (
                  filteredVouchers.map((voucher) => (
                    <tr key={voucher.id}>
                      <td className="ps-4 py-3">
                        <div className="form-check m-0">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={selectedRowIds.includes(voucher.id)} 
                            onChange={() => toggleSelectRow(voucher.id)} 
                          />
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <img src={voucher.image} alt={voucher.name} width="42" height="42" style={{ borderRadius: 12, objectFit: "cover", background: "#fbf4ee" }} />
                          <div>
                            <div className="fw-bold">{voucher.name}</div>
                            <div className="small text-muted">{voucher.code}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {voucher.type === "FREE_SHIPPING" ? "Freeship" :
                         voucher.type === "PERCENTAGE" ? "Giảm theo %" :
                         voucher.type === "FIXED_AMOUNT" ? "Giảm tiền" : voucher.type}
                      </td>
                      <td>{voucher.discountLabel}</td>
                      <td>{Number(voucher.minOrderValue || 0).toLocaleString("vi-VN")}đ</td>
                      <td>{Number(voucher.claimedQuantity || 0).toLocaleString("vi-VN")} / {voucher.remainingQuantity == null ? "∞" : Number(voucher.remainingQuantity).toLocaleString("vi-VN")}</td>
                      <td>
                        <span className={`vl-chip ${voucher.status === "ACTIVE" ? "success" : "muted"}`}>
                          {voucher.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ẩn"}
                        </span>
                      </td>
                      <td>
                        {voucher.type === "FREE_SHIPPING" ? "Freeship" : (voucher.source === "LOYALTY" ? "Loyalty" : "Công khai")}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-inline-flex gap-2">
                          <button className="btn btn-sm vl-secondary-btn" onClick={() => setSelectedVoucher(voucher)}>Xem</button>
                          <button className="btn btn-sm vl-secondary-btn" onClick={() => navigate(`/admin/vouchers/${voucher.id}/edit`)}>Sửa</button>
                          <button className="btn btn-sm btn-outline-danger rounded-4" onClick={() => handleDelete(voucher.id)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedVoucher && (
          <>
            <div className="modal-backdrop fade show" onClick={() => setSelectedVoucher(null)}></div>
            <div className="position-fixed top-0 end-0 h-100 vl-drawer-responsive" style={{ width: 480, zIndex: 1055 }}>
              <div className="vl-card h-100 rounded-0 rounded-start-5 p-4 overflow-auto">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <div className="small text-muted mb-1">Chi tiết voucher</div>
                    <h4 className="mb-0" style={{ fontWeight: 800 }}>{selectedVoucher.name}</h4>
                  </div>
                  <button className="btn-close" onClick={() => setSelectedVoucher(null)}></button>
                </div>

                <div className="vl-ticket p-3 mb-4">
                  <div className="d-flex gap-3 align-items-center">
                    <img src={selectedVoucher.image} alt={selectedVoucher.name} width="72" height="72" style={{ borderRadius: 18, background: "#f9f2ea", padding: 10 }} />
                    <div>
                      <div className="small text-muted">{selectedVoucher.code}</div>
                      <div className="fw-bold mb-1">{selectedVoucher.discountLabel}</div>
                      <span className={`vl-chip ${selectedVoucher.status === "ACTIVE" ? "success" : "muted"}`}>{selectedVoucher.status}</span>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <DrawerMetric label="Nguồn" value={selectedVoucher.source} />
                  <DrawerMetric label="Min order" value={`${Number(selectedVoucher.minOrderValue || 0).toLocaleString("vi-VN")}đ`} />
                  <DrawerMetric label="Đã cấp" value={selectedVoucher.claimedQuantity} />
                  <DrawerMetric label="Còn lại" value={selectedVoucher.remainingQuantity ?? "∞"} />
                </div>

                <div className="vl-soft-panel p-3 mb-3">
                  <div className="small text-muted mb-2">Mô tả</div>
                  <div>{selectedVoucher.description || "Chưa có mô tả chi tiết."}</div>
                </div>

                <div className="vl-soft-panel p-3">
                  <div className="small text-muted mb-2">Thời gian hiệu lực</div>
                  <div>{selectedVoucher.validRange}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="col-6 col-md-4 col-xl-2">
      <div className="vl-kpi-card p-3 h-100">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small text-muted">{label}</span>
          <i className={`fa-solid ${icon}`} style={{ color: "#a65d2a" }}></i>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#422b1b" }}>{value}</div>
      </div>
    </div>
  );
}

function DrawerMetric({ label, value }) {
  return (
    <div className="col-6">
      <div className="vl-soft-panel p-3 h-100">
        <div className="small text-muted">{label}</div>
        <div className="fw-bold">{value}</div>
      </div>
    </div>
  );
}

export default AdminVoucherDashboardPage;
