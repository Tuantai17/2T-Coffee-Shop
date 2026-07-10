import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../../../layouts/AdminLayout";
import adminLoyaltyApi from "../../../api/adminLoyaltyApi";
import "../../../styles/voucher-loyalty.css";

const emptyForm = {
  code: "",
  name: "",
  description: "",
  type: "FIXED_AMOUNT",
  discountAmount: 30000,
  discountPercentage: 10,
  maxDiscountAmount: 30000,
  minOrderValue: 150000,
  requiredTierCode: "",
  pointsRequired: 0,
  maxClaimsPerUser: 1,
  totalQuantity: 1500,
  claimedQuantity: 0,
  active: true,
  validFrom: "",
  validTo: "",
  bgColor: "#ff8f3d",
  imageUrl: "",
};

function VoucherStudioPage({ mode = "voucher" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id) && mode === "voucher";

  const [form, setForm] = useState({
    ...emptyForm,
    pointsRequired: mode === "reward" ? 180 : 0,
    selectedVoucherId: "",
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);

  useEffect(() => {
    if (mode === "reward") {
      const loadVouchers = async () => {
        try {
          const res = await adminLoyaltyApi.getVouchers();
          setAvailableVouchers(Array.isArray(res?.data) ? res.data.filter(v => v.status === "ACTIVE") : []);
        } catch (error) { console.error(error); }
      };
      loadVouchers();
    }
  }, [mode]);

  useEffect(() => {
    if (!isEdit) return;
    const loadVoucher = async () => {
      try {
        const response = await adminLoyaltyApi.getVoucherDetail(id);
        const voucher = response?.data || {};
        setForm({
          code: voucher.code || "",
          name: voucher.name || "",
          description: voucher.description || "",
          type: voucher.type || "FIXED_AMOUNT",
          discountAmount: voucher.discountAmount || 0,
          discountPercentage: voucher.discountPercentage || 0,
          maxDiscountAmount: voucher.maxDiscountAmount || 0,
          minOrderValue: voucher.minOrderValue || 0,
          requiredTierCode: voucher.requiredTierCode || "",
          pointsRequired: voucher.pointsRequired || 0,
          maxClaimsPerUser: voucher.maxClaimsPerUser || 1,
          totalQuantity: voucher.totalQuantity || 0,
          claimedQuantity: voucher.claimedQuantity || 0,
          active: voucher.status !== "INACTIVE",
          validFrom: toInputDate(voucher.validFrom),
          validTo: toInputDate(voucher.validTo),
          bgColor: voucher.bgColor || "#ff8f3d",
          imageUrl: voucher.imageUrl || "",
        });
      } catch (error) { console.error(error);
        toast.error("Không tải được thông tin voucher");
      } finally {
        setLoading(false);
      }
    };
    loadVoucher();
  }, [id, isEdit]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (publish = true) => {
    setSaving(true);
    try {
      if (mode === "reward") {
        const rewardPayload = {
          name: form.name,
          description: form.description,
          rewardType: "VOUCHER",
          voucherId: form.selectedVoucherId,
          pointsRequired: Number(form.pointsRequired || 0),
          stockQuantity: Number(form.totalQuantity || 0),
          limitPerMember: Number(form.maxClaimsPerUser || 1),
          tier: form.requiredTierCode || null,
          startDate: form.validFrom ? `${form.validFrom}T00:00:00` : null,
          endDate: form.validTo ? `${form.validTo}T23:59:59` : null,
          active: publish ? Boolean(form.active) : false,
        };
        await adminLoyaltyApi.createReward(rewardPayload);
        toast.success("Đã tạo reward loyalty");
        navigate("/admin/loyalty/rewards");
        return;
      }
      
      const payload = {
        ...form,
        validFrom: form.validFrom ? `${form.validFrom}T00:00:00` : null,
        validTo: form.validTo ? `${form.validTo}T23:59:59` : null,
        pointsRequired: Number(form.pointsRequired || 0),
        minOrderValue: Number(form.minOrderValue || 0),
        discountAmount: form.type === "FIXED_AMOUNT" ? Number(form.discountAmount || 0) : null,
        discountPercentage: form.type === "PERCENTAGE" ? Number(form.discountPercentage || 0) : null,
        maxDiscountAmount: form.type === "PERCENTAGE" ? Number(form.maxDiscountAmount || 0) : null,
        totalQuantity: Number(form.totalQuantity || 0),
        maxClaimsPerUser: Number(form.maxClaimsPerUser || 1),
        active: publish ? Boolean(form.active) : false,
      };

      if (isEdit) {
        await adminLoyaltyApi.updateVoucher(id, payload);
        toast.success("Đã cập nhật voucher");
        navigate("/admin/vouchers");
      } else {
        await adminLoyaltyApi.createVoucher(payload);
        toast.success("Đã tạo voucher");
        navigate("/admin/vouchers");
      }
    } catch (error) { console.error(error);
      toast.error(error?.response?.data?.message || "Không lưu được dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const headerTitle = mode === "reward"
    ? "Thêm phần thưởng Loyalty"
    : isEdit
      ? "Sửa voucher"
      : "Thêm voucher";

  const buildPreviewDiscount = () => {
    return form.type === "PERCENTAGE"
      ? `Giảm ${form.discountPercentage || 0}%`
      : form.type === "FREE_SHIPPING"
        ? "Miễn phí ship"
        : `${Number(form.discountAmount || 0).toLocaleString("vi-VN")}đ`;
  };

  return (
    <AdminLayout>
      <div className="voucher-loyalty-shell">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <div className="small text-muted mb-2">
              Trang chủ / Loyalty / {mode === "reward" ? "Đổi thưởng" : "Voucher"} / {headerTitle}
            </div>
            <h2 className="mb-1" style={{ color: "#3f281b", fontWeight: 800 }}>{headerTitle}</h2>
            <div className="text-muted">Biểu mẫu nhập liệu liền mạch, thay đổi sẽ hiển thị ngay trên thẻ Preview.</div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn vl-secondary-btn px-4 py-2" onClick={() => navigate(mode === "reward" ? "/admin/loyalty/rewards" : "/admin/vouchers")}>
              Hủy
            </button>
            {mode !== "reward" && (
              <button className="btn vl-secondary-btn px-4 py-2" disabled={saving} onClick={() => handleSubmit(false)}>
                Lưu nháp
              </button>
            )}
            <button className="btn vl-primary-btn px-4 py-2" disabled={saving} onClick={() => handleSubmit(true)}>
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tiếp tục"}
            </button>
          </div>
        </div>

        <div className="row g-4 vl-admin-sidebar-stack">
          <div className="col-xl-8">
            <div className="vl-card p-4 p-lg-5">
              {loading ? (
                <div className="vl-empty-state">Đang tải thông tin voucher...</div>
              ) : (
                <div className="d-flex flex-column gap-5">
                  {/* Section 1: Thông tin cơ bản */}
                  <section>
                    <h5 className="vl-section-title mb-3" style={{ borderBottom: "2px solid #f0e6dd", paddingBottom: "10px" }}>Thông tin cơ bản</h5>
                    <div className="row g-3">
                      <Field label="Tên">
                        <input className="form-control vl-filter-input" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
                      </Field>
                      <Field label="Mã">
                        <input className="form-control vl-filter-input" value={form.code} onChange={(e) => handleChange("code", e.target.value.toUpperCase())} />
                      </Field>
                      <Field label="Mô tả" full>
                        <textarea className="form-control vl-filter-textarea" rows="3" value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
                      </Field>
                    </div>
                  </section>

                  {/* Section 2: Cấu hình ưu đãi */}
                  <section>
                    <h5 className="vl-section-title mb-3" style={{ borderBottom: "2px solid #f0e6dd", paddingBottom: "10px" }}>
                      {mode === "reward" ? "Cấu hình phần thưởng" : "Cấu hình ưu đãi"}
                    </h5>
                    <div className="row g-3">
                      {mode === "voucher" ? (
                        <>
                          <Field label="Loại ưu đãi">
                            <select className="form-select vl-filter-select" value={form.type} onChange={(e) => handleChange("type", e.target.value)}>
                              <option value="FIXED_AMOUNT">Giảm tiền cố định</option>
                              <option value="PERCENTAGE">Giảm theo %</option>
                              <option value="FREE_SHIPPING">Miễn phí giao hàng</option>
                              <option value="FREE_ITEM">Quà tặng sản phẩm</option>
                            </select>
                          </Field>
                          
                          {form.type === "FIXED_AMOUNT" && (
                            <Field label="Số tiền giảm">
                              <input type="number" className="form-control vl-filter-input" value={form.discountAmount} onChange={(e) => handleChange("discountAmount", e.target.value)} />
                            </Field>
                          )}
                          
                          {form.type === "PERCENTAGE" && (
                            <>
                              <Field label="% giảm">
                                <input type="number" className="form-control vl-filter-input" value={form.discountPercentage} onChange={(e) => handleChange("discountPercentage", e.target.value)} />
                              </Field>
                              <Field label="Trần giảm">
                                <input type="number" className="form-control vl-filter-input" value={form.maxDiscountAmount} onChange={(e) => handleChange("maxDiscountAmount", e.target.value)} />
                              </Field>
                            </>
                          )}
                          
                          <Field label="Nguồn voucher">
                            <select className="form-select vl-filter-select" value={form.type === "FREE_SHIPPING" ? "FREESHIP" : (form.pointsRequired > 0 ? "LOYALTY" : "PUBLIC")} onChange={(e) => {
                              const val = e.target.value;
                              if (val === "FREESHIP") {
                                handleChange("type", "FREE_SHIPPING");
                              } else {
                                if (form.type === "FREE_SHIPPING") handleChange("type", "FIXED_AMOUNT");
                                handleChange("pointsRequired", val === "LOYALTY" ? 180 : 0);
                              }
                            }}>
                              <option value="PUBLIC">Công khai</option>
                              <option value="LOYALTY">Đổi điểm loyalty</option>
                              <option value="FREESHIP">Freeship</option>
                            </select>
                          </Field>
                          
                          {(form.pointsRequired > 0 || form.type === "FREE_SHIPPING") && (
                            <Field label="Điểm đổi (0 = Miễn phí)">
                              <input type="number" className="form-control vl-filter-input" value={form.pointsRequired || ""} onChange={(e) => handleChange("pointsRequired", e.target.value)} />
                            </Field>
                          )}
                        </>
                      ) : (
                        <>
                          <Field label="Chọn Voucher có sẵn" full>
                            <select className="form-select vl-filter-select" value={form.selectedVoucherId} onChange={(e) => handleChange("selectedVoucherId", e.target.value)}>
                              <option value="">-- Chọn voucher có sẵn --</option>
                              {availableVouchers.map(v => (
                                <option key={v.id} value={v.id}>{v.name} ({v.code}) - {v.discountLabel}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Điểm đổi yêu cầu">
                            <input type="number" className="form-control vl-filter-input" value={form.pointsRequired} onChange={(e) => handleChange("pointsRequired", e.target.value)} />
                          </Field>
                        </>
                      )}
                    </div>
                  </section>

                  {/* Section 3: Điều kiện áp dụng */}
                  <section>
                    <h5 className="vl-section-title mb-3" style={{ borderBottom: "2px solid #f0e6dd", paddingBottom: "10px" }}>Điều kiện áp dụng</h5>
                    <div className="row g-3">
                      <Field label="Đơn tối thiểu">
                        <input type="number" className="form-control vl-filter-input" value={form.minOrderValue} onChange={(e) => handleChange("minOrderValue", e.target.value)} />
                      </Field>
                      <Field label="Hạng áp dụng">
                        <select className="form-select vl-filter-select" value={form.requiredTierCode} onChange={(e) => handleChange("requiredTierCode", e.target.value)}>
                          <option value="">Tất cả thành viên</option>
                          <option value="SILVER">Silver</option>
                          <option value="GOLD">Gold</option>
                          <option value="PLATINUM">Platinum</option>
                          <option value="DIAMOND">Diamond</option>
                        </select>
                      </Field>
                    </div>
                  </section>

                  {/* Section 4: Thời gian & Giới hạn */}
                  <section>
                    <h5 className="vl-section-title mb-3" style={{ borderBottom: "2px solid #f0e6dd", paddingBottom: "10px" }}>Thời gian & Giới hạn</h5>
                    <div className="row g-3">
                      <Field label="Bắt đầu">
                        <input type="date" className="form-control vl-filter-input" value={form.validFrom} onChange={(e) => handleChange("validFrom", e.target.value)} />
                      </Field>
                      <Field label="Kết thúc">
                        <input type="date" className="form-control vl-filter-input" value={form.validTo} onChange={(e) => handleChange("validTo", e.target.value)} />
                      </Field>
                      <Field label="Tổng số lượng">
                        <input type="number" className="form-control vl-filter-input" value={form.totalQuantity} onChange={(e) => handleChange("totalQuantity", e.target.value)} />
                      </Field>
                      <Field label="Mỗi user (Lượt lưu tối đa)">
                        <input type="number" className="form-control vl-filter-input" value={form.maxClaimsPerUser} onChange={(e) => handleChange("maxClaimsPerUser", e.target.value)} />
                      </Field>
                      <Field label="Trạng thái hiển thị" full>
                        <div className="form-check form-switch mt-2">
                          <input className="form-check-input" type="checkbox" checked={form.active} onChange={(e) => handleChange("active", e.target.checked)} style={{ transform: "scale(1.2)", marginLeft: "-2.5em" }} />
                          <label className="form-check-label fw-bold ms-2" style={{ color: form.active ? "#a65d2a" : "#6c757d" }}>{form.active ? "Đang hoạt động" : "Tạm ẩn"}</label>
                        </div>
                      </Field>
                    </div>
                  </section>

                  {/* Section 5: Giao diện & Hình ảnh */}
                  <section>
                    <h5 className="vl-section-title mb-3" style={{ borderBottom: "2px solid #f0e6dd", paddingBottom: "10px" }}>Giao diện & Hình ảnh</h5>
                    <div className="row g-3">
                      <Field label="Màu nền thẻ">
                        <input type="color" className="form-control form-control-color vl-filter-input p-1" value={form.bgColor || "#ff8f3d"} onChange={(e) => handleChange("bgColor", e.target.value)} title="Chọn màu nền" style={{ width: "100%", height: "40px", cursor: "pointer", borderRadius: "8px" }} />
                      </Field>
                      <Field label="Link hình đại diện (Tùy chọn)" full>
                        <input type="text" className="form-control vl-filter-input" value={form.imageUrl || ""} onChange={(e) => handleChange("imageUrl", e.target.value)} placeholder="Nhập đường dẫn ảnh (URL) nếu muốn thay thế icon mặc định..." />
                      </Field>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>

          <div className="col-xl-4">
            <div className="vl-card p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0" style={{ fontWeight: 800, color: "#3f281b" }}>Live Preview</h6>
                <span className={`vl-chip ${form.active ? "success" : "muted"}`}>{form.active ? "Đang hoạt động" : "Tạm ẩn"}</span>
              </div>

              <div className="vl-ticket p-3 mb-3 shadow-sm border-0">
                <div className="row g-0 h-100 position-relative">
                  <div className="col-4 position-relative">
                    <div className="d-flex flex-column align-items-center justify-content-center p-3 text-white text-center h-100" style={{ background: form.bgColor || "#ff8f3d", minHeight: 150 }}>
                      {form.imageUrl && (
                        <img src={form.imageUrl} alt="preview" className="mb-2 rounded shadow-sm" style={{ width: "40px", height: "40px", objectFit: "cover", backgroundColor: "white", padding: "4px" }} />
                      )}
                      <div style={{ fontSize: 11, opacity: 0.9 }}>Ưu đãi</div>
                      <div className="fw-bold" style={{ fontSize: 16 }}>{buildPreviewDiscount()}</div>
                    </div>
                    {/* Vết cắt tròn */}
                    <div style={{ position: "absolute", top: -10, right: -10, width: 20, height: 20, borderRadius: "50%", backgroundColor: "#fff", boxShadow: "inset -2px -2px 5px rgba(0,0,0,0.03)" }}></div>
                  </div>
                  <div className="col-8 p-3 d-flex flex-column justify-content-center">
                    <div className="small text-muted mb-1">{mode === "reward" ? "Reward loyalty" : "Voucher"}</div>
                    <div className="fw-bold mb-2 text-truncate" style={{ fontSize: 16 }}>{form.name || "Tên voucher / reward"}</div>
                    <div className="text-muted small mb-2 text-truncate" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", whiteSpace: "normal" }}>{form.description || "Mô tả ưu đãi sẽ hiển thị tại đây"}</div>
                    <div className="small"><strong>Mã:</strong> {form.code || "SAVE30K"}</div>
                    <div className="small"><strong>Đơn tối thiểu:</strong> {Number(form.minOrderValue || 0).toLocaleString("vi-VN")}đ</div>
                    {mode === "reward" && (
                      <div className="small"><strong>Điểm đổi:</strong> {Number(form.pointsRequired || 0).toLocaleString("vi-VN")} điểm</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="vl-soft-panel p-3">
                <div className="small text-muted mb-2">Tóm tắt cấu hình</div>
                <div className="d-flex flex-column gap-2 small">
                  <span>Thời gian: {form.validFrom || "--"} đến {form.validTo || "--"}</span>
                  <span>Tier: {form.requiredTierCode || "Tất cả thành viên"}</span>
                  <span>Tổng lượt: {Number(form.totalQuantity || 0).toLocaleString("vi-VN")}</span>
                  <span>Mỗi user: {form.maxClaimsPerUser}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children, full = false }) {
  return (
    <div className={full ? "col-12" : "col-md-6"}>
      <label className="form-label small text-muted fw-semibold">{label}</label>
      {children}
    </div>
  );
}

function toInputDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default VoucherStudioPage;
