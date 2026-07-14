import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import checkinApi from "../../../../api/checkinApi";

const PROGRAM_TYPES = [
  { value: "DAILY", label: "Hằng ngày" },
  { value: "CONSECUTIVE", label: "Chuỗi liên tiếp" },
  { value: "WEEKLY", label: "Theo tuần" },
  { value: "MONTHLY", label: "Theo tháng" },
  { value: "EVENT", label: "Sự kiện" },
  { value: "SPECIAL_DAY", label: "Ngày đặc biệt" },
];

const PROGRAM_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bản nháp" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "ENDED", label: "Kết thúc" },
];

const REPEAT_OPTIONS = [
  { value: "NONE", label: "Không lặp" },
  { value: "WEEKLY", label: "Lặp theo tuần" },
  { value: "MONTHLY", label: "Lặp theo tháng" },
];

const REWARD_TYPES = [
  { value: "POINTS", label: "Loyalty Point" },
  { value: "VOUCHER", label: "Voucher" },
  { value: "PRODUCT", label: "Sản phẩm miễn phí" },
  { value: "PERCENTAGE", label: "Giảm phần trăm" },
  { value: "AMOUNT", label: "Giảm cố định" },
  { value: "NONE", label: "Không thưởng" },
];

const DRAWER_STEPS = [
  "Thông tin chung",
  "Hình thức điểm danh",
  "Chuỗi phần thưởng",
  "Lucky Day",
  "Hiển thị người dùng",
];

const PAGE_SIZE = 6;

function isAbortError(error) {
  return error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
}

function createReward(dayNumber) {
  return {
    dayNumber,
    rewardType: "POINTS",
    rewardValue: dayNumber === 1 ? "10" : "",
    voucherId: "",
    productId: "",
    displayName: `Ngày ${dayNumber}`,
    description: "",
    iconUrl: "",
    status: "ACTIVE",
  };
}

function syncRewards(totalDays, rewards = []) {
  const safeDays = Math.max(1, Number(totalDays) || 1);
  const rewardMap = new Map((rewards || []).map((reward) => [Number(reward.dayNumber), reward]));
  const nextRewards = [];

  for (let day = 1; day <= safeDays; day += 1) {
    const current = rewardMap.get(day);
    nextRewards.push(
      current
        ? {
            ...createReward(day),
            ...current,
            dayNumber: day,
          }
        : createReward(day)
    );
  }

  return nextRewards;
}

function getDefaultProgramForm() {
  const totalDays = 7;
  return {
    id: null,
    code: "",
    name: "",
    description: "",
    imageUrl: "",
    programType: "CONSECUTIVE",
    totalDays,
    requireConsecutive: true,
    resetOnMiss: true,
    allowRepeat: false,
    repeatType: "NONE",
    startDate: "",
    endDate: "",
    checkinStartTime: "",
    checkinEndTime: "",
    timezone: "Asia/Ho_Chi_Minh",
    status: "DRAFT",
    heroTitle: "",
    heroDescription: "",
    buttonText: "Điểm danh ngay",
    checkedButtonText: "Đã điểm danh",
    confettiEnabled: true,
    animationEnabled: true,
    rewards: syncRewards(totalDays),
    luckyDays: [],
    stats: null,
  };
}

function mapProgramDetailToForm(detail) {
  const base = getDefaultProgramForm();
  const program = detail?.program || {};
  const totalDays = Math.max(1, Number(program.totalDays) || base.totalDays);

  return {
    ...base,
    ...program,
    id: program.id || null,
    totalDays,
    startDate: program.startDate || "",
    endDate: program.endDate || "",
    checkinStartTime: program.checkinStartTime || "",
    checkinEndTime: program.checkinEndTime || "",
    timezone: program.timezone || "Asia/Ho_Chi_Minh",
    rewards: syncRewards(totalDays, detail?.rewards || []),
    luckyDays: (detail?.luckyDays || []).map((item) => ({
      id: item.id || null,
      luckyDate: item.luckyDate || "",
      multiplier: item.multiplier ?? 1,
      bonusPoints: item.bonusPoints ?? 0,
      voucherId: item.voucherId || "",
      quantityLimit: item.quantityLimit ?? "",
      status: item.status || "ACTIVE",
    })),
    stats: detail?.stats || null,
  };
}

function formatProgramType(type) {
  return PROGRAM_TYPES.find((item) => item.value === type)?.label || type || "-";
}

function formatStatusLabel(status) {
  return PROGRAM_STATUS_OPTIONS.find((item) => item.value === status)?.label || status || "-";
}

function getStatusTone(status) {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "PAUSED":
      return "warning";
    case "ENDED":
      return "danger";
    default:
      return "muted";
  }
}

function formatRange(startDate, endDate) {
  if (!startDate && !endDate) {
    return "Chưa đặt lịch";
  }
  return `${startDate || "?"} - ${endDate || "?"}`;
}

function serializeProgramForm(formData) {
  return {
    code: formData.code.trim(),
    name: formData.name.trim(),
    description: formData.description?.trim() || null,
    imageUrl: formData.imageUrl?.trim() || null,
    programType: formData.programType,
    totalDays: Number(formData.totalDays),
    requireConsecutive: Boolean(formData.requireConsecutive),
    resetOnMiss: Boolean(formData.resetOnMiss),
    allowRepeat: Boolean(formData.allowRepeat),
    repeatType: formData.repeatType,
    startDate: formData.startDate || null,
    endDate: formData.endDate || null,
    checkinStartTime: formData.checkinStartTime || null,
    checkinEndTime: formData.checkinEndTime || null,
    timezone: formData.timezone || "Asia/Ho_Chi_Minh",
    status: formData.status,
    heroTitle: formData.heroTitle?.trim() || null,
    heroDescription: formData.heroDescription?.trim() || null,
    buttonText: formData.buttonText?.trim() || null,
    checkedButtonText: formData.checkedButtonText?.trim() || null,
    confettiEnabled: Boolean(formData.confettiEnabled),
    animationEnabled: Boolean(formData.animationEnabled),
    rewards: formData.rewards.map((reward) => ({
      dayNumber: Number(reward.dayNumber),
      rewardType: reward.rewardType,
      rewardValue: reward.rewardValue?.toString().trim() || null,
      voucherId: reward.voucherId?.trim() || null,
      productId: reward.productId?.trim() || null,
      displayName: reward.displayName?.trim() || null,
      description: reward.description?.trim() || null,
      iconUrl: reward.iconUrl?.trim() || null,
      status: reward.status || "ACTIVE",
    })),
    luckyDays: formData.luckyDays
      .filter((item) => item.luckyDate)
      .map((item) => ({
        luckyDate: item.luckyDate,
        multiplier: item.multiplier === "" ? 1 : Number(item.multiplier || 1),
        bonusPoints: item.bonusPoints === "" ? 0 : Number(item.bonusPoints || 0),
        voucherId: item.voucherId?.trim() || null,
        quantityLimit: item.quantityLimit === "" ? null : Number(item.quantityLimit),
        status: item.status || "ACTIVE",
      })),
  };
}

function validateProgramForm(formData) {
  const nextErrors = {};

  if (!formData.name.trim()) {
    nextErrors.name = "Vui lòng nhập tên chương trình.";
  }

  if (!formData.code.trim()) {
    nextErrors.code = "Vui lòng nhập mã chương trình.";
  }

  if (!Number(formData.totalDays) || Number(formData.totalDays) <= 0) {
    nextErrors.totalDays = "Số ngày phải lớn hơn 0.";
  }

  if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
    nextErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
  }

  const invalidReward = formData.rewards.find((reward) => {
    if (reward.rewardType === "POINTS" || reward.rewardType === "PERCENTAGE" || reward.rewardType === "AMOUNT") {
      return !reward.rewardValue;
    }
    if (reward.rewardType === "VOUCHER") {
      return !reward.rewardValue && !reward.voucherId;
    }
    return false;
  });

  if (invalidReward) {
    nextErrors.rewards = `Vui lòng nhập đủ dữ liệu cho thưởng ngày ${invalidReward.dayNumber}.`;
  }

  return nextErrors;
}

function ProgramSkeleton() {
  return (
    <div className="checkin-section-card">
      <div className="checkin-card-body">
        <div className="d-flex flex-column gap-3">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="checkin-skeleton">
              <div className="checkin-skeleton-block long"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgramDrawer({
  mode,
  formData,
  formErrors,
  submitting,
  onClose,
  onSubmit,
  onFieldChange,
  onToggleField,
  onRewardChange,
  onAddDay,
  onRemoveDay,
  onDuplicateLastReward,
  onCopyPreviousReward,
  onAddLuckyDay,
  onLuckyDayChange,
  onRemoveLuckyDay,
}) {
  const isView = mode === "view";
  const drawerTitle = mode === "create" ? "Tạo chương trình điểm danh" : mode === "edit" ? "Chỉnh sửa chương trình" : "Chi tiết chương trình";

  const [activeStep, setActiveStep] = useState(0);
  const contentRef = useRef(null);

  const handleStepClick = (index) => {
    setActiveStep(index);
    const section = document.getElementById(`checkin-section-${index}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScroll = () => {
    if (!contentRef.current) return;
    const containerTop = contentRef.current.getBoundingClientRect().top;
    
    for (let i = DRAWER_STEPS.length - 1; i >= 0; i--) {
      const section = document.getElementById(`checkin-section-${i}`);
      if (section) {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop - containerTop <= 100) { // 100px offset threshold
          setActiveStep(i);
          break;
        }
      }
    }
  };

  return (
    <div className="checkin-drawer-backdrop" onClick={submitting ? undefined : onClose}>
      <div className="checkin-drawer" onClick={(event) => event.stopPropagation()}>
        <aside className="checkin-drawer-sidebar">
          <div className="checkin-step-list">
            {DRAWER_STEPS.map((step, index) => (
              <div 
                key={step} 
                className={`checkin-step-item ${activeStep === index ? "active" : ""}`}
                onClick={() => handleStepClick(index)}
                style={{ cursor: "pointer" }}
              >
                <span className="checkin-step-number">{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </aside>

        <div className="checkin-drawer-main">
          <div className="checkin-drawer-header">
            <div>
              <h2 className="checkin-drawer-title">{drawerTitle}</h2>
              <p className="checkin-drawer-subtitle">
                Cấu hình chương trình, reward từng ngày, lucky day và phần hiển thị phía người dùng.
              </p>
            </div>
            <button type="button" className="checkin-button checkin-button-secondary checkin-icon-button" onClick={onClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="checkin-drawer-content" ref={contentRef} onScroll={handleScroll}>
            {formData.stats && (
              <section className="checkin-drawer-section">
                <div className="checkin-drawer-section-header">
                  <h3>Tổng quan chương trình</h3>
                  <p>Chỉ số hiện tại được tổng hợp từ bản ghi check-in và tiến trình người dùng.</p>
                </div>
                <div className="checkin-summary-grid">
                  <div className="checkin-summary-tile">
                    <div className="checkin-summary-label">Người tham gia</div>
                    <div className="checkin-summary-value">{Number(formData.stats.participantCount || 0).toLocaleString("vi-VN")}</div>
                  </div>
                  <div className="checkin-summary-tile">
                    <div className="checkin-summary-label">Tỷ lệ hoàn thành</div>
                    <div className="checkin-summary-value">{Number(formData.stats.completionRate || 0).toLocaleString("vi-VN")}%</div>
                  </div>
                  <div className="checkin-summary-tile">
                    <div className="checkin-summary-label">Điểm đã phát</div>
                    <div className="checkin-summary-value">{Number(formData.stats.totalPointsAwarded || 0).toLocaleString("vi-VN")}</div>
                  </div>
                  <div className="checkin-summary-tile">
                    <div className="checkin-summary-label">Voucher đã phát</div>
                    <div className="checkin-summary-value">{Number(formData.stats.voucherAwardedCount || 0).toLocaleString("vi-VN")}</div>
                  </div>
                </div>
              </section>
            )}

            <section id="checkin-section-0" className="checkin-drawer-section">
              <div className="checkin-drawer-section-header">
                <h3>1. Thông tin chung</h3>
                <p>Thông tin nhận diện, thời gian vận hành và trạng thái của chương trình.</p>
              </div>
              <div className="checkin-form-grid">
                <div className="checkin-form-field">
                  <label className="checkin-label">Mã chương trình *</label>
                  <input
                    className="checkin-input"
                    value={formData.code}
                    onChange={(event) => onFieldChange("code", event.target.value)}
                    placeholder="VD: CHECKIN_7DAYS"
                    disabled={isView}
                  />
                  {formErrors.code && <div className="checkin-helper-text" style={{ color: "#D64545" }}>{formErrors.code}</div>}
                </div>
                <div className="checkin-form-field">
                  <label className="checkin-label">Tên chương trình *</label>
                  <input
                    className="checkin-input"
                    value={formData.name}
                    onChange={(event) => onFieldChange("name", event.target.value)}
                    placeholder="VD: Chuỗi điểm danh 7 ngày"
                    disabled={isView}
                  />
                  {formErrors.name && <div className="checkin-helper-text" style={{ color: "#D64545" }}>{formErrors.name}</div>}
                </div>
                <div className="checkin-form-field full">
                  <label className="checkin-label">Mô tả</label>
                  <textarea
                    className="checkin-textarea"
                    value={formData.description}
                    onChange={(event) => onFieldChange("description", event.target.value)}
                    placeholder="Mô tả ngắn gọn chương trình điểm danh"
                    disabled={isView}
                  />
                </div>
                <div className="checkin-form-field full">
                  <label className="checkin-label">Ảnh / URL banner</label>
                  <input
                    className="checkin-input"
                    value={formData.imageUrl}
                    onChange={(event) => onFieldChange("imageUrl", event.target.value)}
                    placeholder="https://..."
                    disabled={isView}
                  />
                </div>
                <div className="checkin-form-field">
                  <label className="checkin-label">Ngày bắt đầu</label>
                  <input
                    type="date"
                    className="checkin-input"
                    value={formData.startDate}
                    onChange={(event) => onFieldChange("startDate", event.target.value)}
                    disabled={isView}
                  />
                </div>
                <div className="checkin-form-field">
                  <label className="checkin-label">Ngày kết thúc</label>
                  <input
                    type="date"
                    className="checkin-input"
                    value={formData.endDate}
                    onChange={(event) => onFieldChange("endDate", event.target.value)}
                    disabled={isView}
                  />
                  {formErrors.endDate && <div className="checkin-helper-text" style={{ color: "#D64545" }}>{formErrors.endDate}</div>}
                </div>
                <div className="checkin-form-field">
                  <label className="checkin-label">Giờ bắt đầu</label>
                  <input
                    type="time"
                    className="checkin-input"
                    value={formData.checkinStartTime}
                    onChange={(event) => onFieldChange("checkinStartTime", event.target.value)}
                    disabled={isView}
                  />
                </div>
                <div className="checkin-form-field">
                  <label className="checkin-label">Giờ kết thúc</label>
                  <input
                    type="time"
                    className="checkin-input"
                    value={formData.checkinEndTime}
                    onChange={(event) => onFieldChange("checkinEndTime", event.target.value)}
                    disabled={isView}
                  />
                </div>
                <div className="checkin-form-field">
                  <label className="checkin-label">Múi giờ</label>
                  <input
                    className="checkin-input"
                    value={formData.timezone}
                    onChange={(event) => onFieldChange("timezone", event.target.value)}
                    disabled={isView}
                  />
                </div>
                <div className="checkin-form-field">
                  <label className="checkin-label">Trạng thái</label>
                  <select className="checkin-select" value={formData.status} onChange={(event) => onFieldChange("status", event.target.value)} disabled={isView}>
                    {PROGRAM_STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section id="checkin-section-1" className="checkin-drawer-section">
              <div className="checkin-drawer-section-header">
                <h3>2. Hình thức điểm danh</h3>
                <p>Quy tắc chu kỳ, số ngày và cách chương trình reset khi người dùng bỏ lỡ.</p>
              </div>
              <div className="checkin-form-grid">
                <div className="checkin-form-field">
                  <label className="checkin-label">Hình thức</label>
                  <select className="checkin-select" value={formData.programType} onChange={(event) => onFieldChange("programType", event.target.value)} disabled={isView}>
                    {PROGRAM_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="checkin-form-field">
                  <label className="checkin-label">Số ngày *</label>
                  <input
                    type="number"
                    min="1"
                    className="checkin-input"
                    value={formData.totalDays}
                    onChange={(event) => onFieldChange("totalDays", event.target.value)}
                    disabled={isView}
                  />
                  {formErrors.totalDays && <div className="checkin-helper-text" style={{ color: "#D64545" }}>{formErrors.totalDays}</div>}
                </div>
              </div>
              <div className="d-flex flex-column gap-3 mt-3">
                <div className="checkin-check-row">
                  <div className="checkin-check-main">
                    <div className="checkin-label">Bắt buộc liên tiếp</div>
                    <div className="checkin-helper-text">Người dùng phải điểm danh liên tục để giữ chuỗi.</div>
                  </div>
                  <label className="checkin-switch">
                    <input type="checkbox" checked={formData.requireConsecutive} onChange={() => onToggleField("requireConsecutive")} disabled={isView} />
                    <span className="checkin-switch-slider"></span>
                  </label>
                </div>
                <div className="checkin-check-row">
                  <div className="checkin-check-main">
                    <div className="checkin-label">Reset khi bỏ lỡ</div>
                    <div className="checkin-helper-text">Nếu bỏ lỡ một ngày, chuỗi sẽ quay về ngày 1.</div>
                  </div>
                  <label className="checkin-switch">
                    <input type="checkbox" checked={formData.resetOnMiss} onChange={() => onToggleField("resetOnMiss")} disabled={isView} />
                    <span className="checkin-switch-slider"></span>
                  </label>
                </div>
                <div className="checkin-check-row">
                  <div className="checkin-check-main">
                    <div className="checkin-label">Cho phép lặp lại</div>
                    <div className="checkin-helper-text">Cho phép người dùng quay lại ngày 1 sau khi hoàn thành đủ chu kỳ.</div>
                  </div>
                  <label className="checkin-switch">
                    <input type="checkbox" checked={formData.allowRepeat} onChange={() => onToggleField("allowRepeat")} disabled={isView} />
                    <span className="checkin-switch-slider"></span>
                  </label>
                </div>
              </div>
              <div className="checkin-form-grid mt-3">
                <div className="checkin-form-field">
                  <label className="checkin-label">Chu kỳ lặp</label>
                  <select className="checkin-select" value={formData.repeatType} onChange={(event) => onFieldChange("repeatType", event.target.value)} disabled={isView || !formData.allowRepeat}>
                    {REPEAT_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section id="checkin-section-2" className="checkin-drawer-section">
              <div className="checkin-drawer-section-header">
                <h3>3. Chuỗi phần thưởng</h3>
                <p>Reward được sinh động theo `totalDays`, không hardcode cố định 7 ngày.</p>
              </div>
              <div className="checkin-inline-actions" style={{ marginBottom: "16px" }}>
                <button type="button" className="checkin-button checkin-button-secondary" onClick={onAddDay} disabled={isView}>
                  <i className="fa-solid fa-plus"></i>
                  Thêm ngày
                </button>
                <button type="button" className="checkin-button checkin-button-secondary" onClick={onRemoveDay} disabled={isView || Number(formData.totalDays) <= 1}>
                  <i className="fa-solid fa-minus"></i>
                  Bớt ngày cuối
                </button>
                <button type="button" className="checkin-button checkin-button-secondary" onClick={onDuplicateLastReward} disabled={isView}>
                  <i className="fa-regular fa-copy"></i>
                  Nhân bản ngày cuối
                </button>
              </div>
              {formErrors.rewards && <div className="checkin-helper-text" style={{ color: "#D64545", marginBottom: "14px" }}>{formErrors.rewards}</div>}
              <div className="checkin-reward-grid">
                {formData.rewards.map((reward, index) => (
                  <div key={reward.dayNumber} className="checkin-reward-card">
                    <div className="checkin-reward-head">
                      <div className="checkin-reward-day">
                        <span className="checkin-reward-badge">{reward.dayNumber}</span>
                        Ngày {reward.dayNumber}
                      </div>
                      <div className="checkin-inline-actions">
                        <button
                          type="button"
                          className="checkin-button checkin-button-secondary checkin-icon-button"
                          title="Sao chép từ ngày trước"
                          onClick={() => onCopyPreviousReward(index)}
                          disabled={isView || index === 0}
                        >
                          <i className="fa-solid fa-arrow-up"></i>
                        </button>
                      </div>
                    </div>
                    <div className="checkin-form-field" style={{ marginBottom: "12px" }}>
                      <label className="checkin-label">Loại thưởng</label>
                      <select className="checkin-select" value={reward.rewardType} onChange={(event) => onRewardChange(index, "rewardType", event.target.value)} disabled={isView}>
                        {REWARD_TYPES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="checkin-form-grid">
                      <div className="checkin-form-field">
                        <label className="checkin-label">Giá trị</label>
                        <input
                          className="checkin-input"
                          value={reward.rewardValue || ""}
                          onChange={(event) => onRewardChange(index, "rewardValue", event.target.value)}
                          placeholder={reward.rewardType === "POINTS" ? "VD: 10" : "VD: 20%"}
                          disabled={isView || reward.rewardType === "NONE"}
                        />
                      </div>
                      <div className="checkin-form-field">
                        <label className="checkin-label">Voucher</label>
                        <input
                          className="checkin-input"
                          value={reward.voucherId || ""}
                          onChange={(event) => onRewardChange(index, "voucherId", event.target.value)}
                          placeholder="Mã voucher hoặc reward value"
                          disabled={isView}
                        />
                      </div>
                      <div className="checkin-form-field full">
                        <label className="checkin-label">Tên hiển thị</label>
                        <input
                          className="checkin-input"
                          value={reward.displayName || ""}
                          onChange={(event) => onRewardChange(index, "displayName", event.target.value)}
                          placeholder={`VD: Thưởng ngày ${reward.dayNumber}`}
                          disabled={isView}
                        />
                      </div>
                      <div className="checkin-form-field full">
                        <label className="checkin-label">Mô tả</label>
                        <textarea
                          className="checkin-textarea"
                          value={reward.description || ""}
                          onChange={(event) => onRewardChange(index, "description", event.target.value)}
                          placeholder="Mô tả ngắn cho reward"
                          disabled={isView}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="checkin-section-3" className="checkin-drawer-section">
              <div className="checkin-drawer-section-header">
                <h3>4. Lucky Day</h3>
                <p>Tạo các ngày đặc biệt với multiplier, bonus point hoặc voucher bổ sung.</p>
              </div>
              <div className="checkin-inline-actions" style={{ marginBottom: "16px" }}>
                <button type="button" className="checkin-button checkin-button-secondary" onClick={onAddLuckyDay} disabled={isView}>
                  <i className="fa-solid fa-calendar-plus"></i>
                  Thêm lucky day
                </button>
              </div>
              {formData.luckyDays.length === 0 ? (
                <div className="checkin-empty-state" style={{ paddingTop: "20px", paddingBottom: "20px" }}>
                  <p>Chưa có lucky day nào cho chương trình này.</p>
                </div>
              ) : (
                <div className="checkin-lucky-list">
                  {formData.luckyDays.map((item, index) => (
                    <div key={`${item.luckyDate || "new"}-${index}`} className="checkin-lucky-row">
                      <div className="checkin-form-field">
                        <label className="checkin-label">Ngày</label>
                        <input type="date" className="checkin-input" value={item.luckyDate} onChange={(event) => onLuckyDayChange(index, "luckyDate", event.target.value)} disabled={isView} />
                      </div>
                      <div className="checkin-form-field">
                        <label className="checkin-label">Multiplier</label>
                        <input className="checkin-input" value={item.multiplier} onChange={(event) => onLuckyDayChange(index, "multiplier", event.target.value)} disabled={isView} />
                      </div>
                      <div className="checkin-form-field">
                        <label className="checkin-label">Bonus điểm</label>
                        <input className="checkin-input" value={item.bonusPoints} onChange={(event) => onLuckyDayChange(index, "bonusPoints", event.target.value)} disabled={isView} />
                      </div>
                      <div className="checkin-form-field">
                        <label className="checkin-label">Voucher</label>
                        <input className="checkin-input" value={item.voucherId} onChange={(event) => onLuckyDayChange(index, "voucherId", event.target.value)} disabled={isView} />
                      </div>
                      <div className="checkin-form-field">
                        <label className="checkin-label">Giới hạn</label>
                        <input className="checkin-input" value={item.quantityLimit} onChange={(event) => onLuckyDayChange(index, "quantityLimit", event.target.value)} disabled={isView} />
                      </div>
                      <button type="button" className="checkin-button checkin-button-danger checkin-icon-button" onClick={() => onRemoveLuckyDay(index)} disabled={isView}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section id="checkin-section-4" className="checkin-drawer-section">
              <div className="checkin-drawer-section-header">
                <h3>5. Hiển thị phía người dùng</h3>
                <p>Tuỳ biến hero text, nút CTA và hiệu ứng hiển thị cho trang check-in phía user.</p>
              </div>
              <div className="checkin-form-grid">
                <div className="checkin-form-field">
                  <label className="checkin-label">Hero title</label>
                  <input className="checkin-input" value={formData.heroTitle || ""} onChange={(event) => onFieldChange("heroTitle", event.target.value)} disabled={isView} />
                </div>
                <div className="checkin-form-field">
                  <label className="checkin-label">Button text</label>
                  <input className="checkin-input" value={formData.buttonText || ""} onChange={(event) => onFieldChange("buttonText", event.target.value)} disabled={isView} />
                </div>
                <div className="checkin-form-field full">
                  <label className="checkin-label">Hero description</label>
                  <textarea className="checkin-textarea" value={formData.heroDescription || ""} onChange={(event) => onFieldChange("heroDescription", event.target.value)} disabled={isView} />
                </div>
                <div className="checkin-form-field">
                  <label className="checkin-label">Checked-in text</label>
                  <input className="checkin-input" value={formData.checkedButtonText || ""} onChange={(event) => onFieldChange("checkedButtonText", event.target.value)} disabled={isView} />
                </div>
              </div>
              <div className="d-flex flex-column gap-3 mt-3">
                <div className="checkin-check-row">
                  <div className="checkin-check-main">
                    <div className="checkin-label">Bật confetti</div>
                    <div className="checkin-helper-text">Cho phép hiệu ứng confetti sau khi user điểm danh thành công.</div>
                  </div>
                  <label className="checkin-switch">
                    <input type="checkbox" checked={formData.confettiEnabled} onChange={() => onToggleField("confettiEnabled")} disabled={isView} />
                    <span className="checkin-switch-slider"></span>
                  </label>
                </div>
                <div className="checkin-check-row">
                  <div className="checkin-check-main">
                    <div className="checkin-label">Bật animation</div>
                    <div className="checkin-helper-text">Cho phép animation nhẹ ở giao diện check-in phía khách hàng.</div>
                  </div>
                  <label className="checkin-switch">
                    <input type="checkbox" checked={formData.animationEnabled} onChange={() => onToggleField("animationEnabled")} disabled={isView} />
                    <span className="checkin-switch-slider"></span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          <div className="checkin-sticky-footer">
            <div className="checkin-helper-text">
              {isView ? "Chế độ xem chi tiết. Chuyển sang Sửa để cập nhật dữ liệu." : "Dữ liệu sẽ được lưu trực tiếp vào backend check-in hiện tại."}
            </div>
            <div className="checkin-inline-actions">
              <button type="button" className="checkin-button checkin-button-secondary" onClick={onClose}>
                {isView ? "Đóng" : "Hủy"}
              </button>
              {!isView && (
                <button type="button" className="checkin-button checkin-button-primary" onClick={onSubmit} disabled={submitting}>
                  {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                  {submitting ? "Đang lưu..." : "Lưu chương trình"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function DeleteConfirmModal({ program, deleting, onCancel, onConfirm }) {
  if (!program) {
    return null;
  }

  return (
    <div className="checkin-modal-backdrop" onClick={deleting ? undefined : onCancel}>
      <div className="checkin-modal" onClick={(event) => event.stopPropagation()}>
        <div className="checkin-modal-header">
          <h3 className="checkin-section-title">Xác nhận xóa chương trình</h3>
          <p className="checkin-section-description" style={{ marginBottom: 0 }}>
            Chỉ có thể xóa khi chương trình chưa phát sinh bản ghi điểm danh.
          </p>
        </div>
        <div className="checkin-modal-body">
          Bạn có chắc muốn xóa <strong>{program.name}</strong> ({program.code}) không?
        </div>
        <div className="checkin-modal-footer">
          <button type="button" className="checkin-button checkin-button-secondary" onClick={onCancel} disabled={deleting}>
            Hủy
          </button>
          <button type="button" className="checkin-button checkin-button-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-trash"></i>}
            {deleting ? "Đang xóa..." : "Xóa chương trình"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProgramsTab() {
  const [programs, setPrograms] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "ALL" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");
  const [formData, setFormData] = useState(getDefaultProgramForm());
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (drawerMode === "create" && drawerOpen) {
      localStorage.setItem("checkinProgramDraft", JSON.stringify(formData));
    }
  }, [formData, drawerMode, drawerOpen]);

  const fetchPrograms = async (signal, nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const response = await checkinApi.getPrograms(
        {
          search: nextFilters.search || undefined,
          status: nextFilters.status && nextFilters.status !== "ALL" ? nextFilters.status : undefined,
        },
        { signal }
      );
      setPrograms(response.data || []);
      setPage(1);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }
      setError("Không thể tải danh sách chương trình điểm danh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchPrograms(controller.signal, filters);
    return () => controller.abort();
  }, []);

  const openCreateDrawer = () => {
    setDrawerMode("create");
    try {
      const draft = localStorage.getItem("checkinProgramDraft");
      if (draft) {
        setFormData(JSON.parse(draft));
      } else {
        setFormData(getDefaultProgramForm());
      }
    } catch (err) {
      setFormData(getDefaultProgramForm());
    }
    setFormErrors({});
    setDrawerOpen(true);
  };

  const openProgramDrawer = async (programId, mode) => {
    setActingId(programId);
    try {
      const response = await checkinApi.getProgram(programId);
      setDrawerMode(mode);
      setFormData(mapProgramDetailToForm(response.data));
      setFormErrors({});
      setDrawerOpen(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không tải được chi tiết chương trình.");
    } finally {
      setActingId(null);
    }
  };

  const handleFilterSubmit = async (event) => {
    event.preventDefault();
    await fetchPrograms(undefined, filters);
  };

  const handleClearFilters = async () => {
    const nextFilters = { search: "", status: "ALL" };
    setFilters(nextFilters);
    await fetchPrograms(undefined, nextFilters);
  };

  const closeDrawer = () => {
    if (submitting) {
      return;
    }
    if (drawerMode === "create") {
      setFormErrors({});
      // Giữ nguyên formData để không bị mất draft khi lỡ đóng
    }
    setDrawerOpen(false);
  };

  const updateFormField = (field, value) => {
    setFormData((current) => {
      if (field === "totalDays") {
        const parsed = value === "" ? "" : Number(value);
        if (parsed !== "" && parsed < 1) return current;
        return {
          ...current,
          totalDays: parsed,
          rewards: syncRewards(parsed || 1, current.rewards),
        };
      }
      return { ...current, [field]: value };
    });
  };

  const toggleFormField = (field) => {
    setFormData((current) => ({ ...current, [field]: !current[field] }));
  };

  const updateRewardField = (index, field, value) => {
    setFormData((current) => {
      const nextRewards = current.rewards.map((reward, rewardIndex) =>
        rewardIndex === index ? { ...reward, [field]: value } : reward
      );
      return { ...current, rewards: nextRewards };
    });
  };

  const handleAddDay = () => {
    setFormData((current) => {
      const totalDays = Math.max(1, Number(current.totalDays) + 1);
      return {
        ...current,
        totalDays,
        rewards: syncRewards(totalDays, current.rewards),
      };
    });
  };

  const handleRemoveDay = () => {
    setFormData((current) => {
      const totalDays = Math.max(1, Number(current.totalDays) - 1);
      return {
        ...current,
        totalDays,
        rewards: syncRewards(totalDays, current.rewards),
      };
    });
  };

  const handleDuplicateLastReward = () => {
    setFormData((current) => {
      const totalDays = Number(current.totalDays) + 1;
      const lastReward = current.rewards[current.rewards.length - 1] || createReward(1);
      const nextRewards = syncRewards(totalDays, current.rewards);
      nextRewards[nextRewards.length - 1] = {
        ...lastReward,
        dayNumber: totalDays,
        displayName: lastReward.displayName || `Ngày ${totalDays}`,
      };
      return {
        ...current,
        totalDays,
        rewards: nextRewards,
      };
    });
  };

  const handleCopyPreviousReward = (index) => {
    if (index <= 0) {
      return;
    }
    setFormData((current) => {
      const previousReward = current.rewards[index - 1];
      const nextRewards = current.rewards.map((reward, rewardIndex) => {
        if (rewardIndex === index) {
          let nextDisplayName = previousReward.displayName;
          if (nextDisplayName === `Ngày ${previousReward.dayNumber}`) {
            nextDisplayName = `Ngày ${reward.dayNumber}`;
          }
          return { 
            ...previousReward, 
            dayNumber: reward.dayNumber,
            displayName: nextDisplayName 
          };
        }
        return reward;
      });
      return { ...current, rewards: nextRewards };
    });
  };

  const handleAddLuckyDay = () => {
    setFormData((current) => ({
      ...current,
      luckyDays: [
        ...current.luckyDays,
        {
          luckyDate: "",
          multiplier: 1,
          bonusPoints: 0,
          voucherId: "",
          quantityLimit: "",
          status: "ACTIVE",
        },
      ],
    }));
  };

  const handleLuckyDayChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      luckyDays: current.luckyDays.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveLuckyDay = (index) => {
    setFormData((current) => ({
      ...current,
      luckyDays: current.luckyDays.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmitProgram = async () => {
    const nextErrors = validateProgramForm(formData);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Vui lòng kiểm tra lại dữ liệu chương trình.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = serializeProgramForm(formData);
      if (drawerMode === "edit" && formData.id) {
        await checkinApi.updateProgram(formData.id, payload);
        toast.success("Đã cập nhật chương trình điểm danh.");
      } else {
        await checkinApi.createProgram(payload);
        toast.success("Đã tạo chương trình điểm danh mới.");
        localStorage.removeItem("checkinProgramDraft");
      }
      setDrawerOpen(false);
      await fetchPrograms();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể lưu chương trình.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (program) => {
    const nextStatus = program.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setActingId(program.id);
    try {
      await checkinApi.updateProgramStatus(program.id, nextStatus);
      toast.success(nextStatus === "ACTIVE" ? "Đã kích hoạt chương trình." : "Đã tạm dừng chương trình.");
      await fetchPrograms();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể cập nhật trạng thái.");
    } finally {
      setActingId(null);
    }
  };

  const handleDuplicateProgram = async (program) => {
    setActingId(program.id);
    try {
      await checkinApi.duplicateProgram(program.id);
      toast.success("Đã nhân bản chương trình.");
      await fetchPrograms();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể nhân bản chương trình.");
    } finally {
      setActingId(null);
    }
  };

  const handleDeleteProgram = async () => {
    if (!deleteTarget) {
      return;
    }
    setDeleting(true);
    try {
      await checkinApi.deleteProgram(deleteTarget.id);
      toast.success("Đã xóa chương trình.");
      setDeleteTarget(null);
      await fetchPrograms();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể xóa chương trình.");
    } finally {
      setDeleting(false);
    }
  };

  const paginatedPrograms = programs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(programs.length / PAGE_SIZE));

  if (loading) {
    return <ProgramSkeleton />;
  }

  if (error) {
    return (
      <div className="checkin-section-card checkin-error-state">
        <i className="fa-solid fa-circle-exclamation" style={{ color: "#D64545" }}></i>
        <h3>Lỗi tải dữ liệu chương trình</h3>
        <p>{error}</p>
        <div style={{ marginTop: "20px" }}>
          <button type="button" className="checkin-button checkin-button-primary" onClick={() => fetchPrograms()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="checkin-section-card">
        <div className="checkin-card-head">
          <div>
            <h2 className="checkin-section-title">Quản lý chương trình điểm danh</h2>
            <p className="checkin-section-description">
              Tạo, chỉnh sửa, nhân bản và điều phối trạng thái các chương trình daily check-in từ backend thật.
            </p>
          </div>
        </div>
        <div className="checkin-card-body">
          <form className="checkin-toolbar" onSubmit={handleFilterSubmit}>
            <div className="checkin-toolbar-group">
              <div className="checkin-filter-field">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  className="checkin-input"
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Tìm theo mã, tên hoặc mô tả"
                />
              </div>
              <select
                className="checkin-select"
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="ALL">Tất cả trạng thái</option>
                {PROGRAM_STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="checkin-button checkin-button-secondary">
                <i className="fa-solid fa-filter"></i>
                Lọc
              </button>
              <button type="button" className="checkin-button checkin-button-secondary" onClick={handleClearFilters}>
                <i className="fa-solid fa-rotate-left"></i>
                Xóa lọc
              </button>
            </div>
            <button type="button" className="checkin-button checkin-button-primary" onClick={openCreateDrawer}>
              <i className="fa-solid fa-plus"></i>
              Tạo chương trình
            </button>
          </form>

          {programs.length === 0 && (
            <div className="checkin-empty-state">
              <i className="fa-solid fa-calendar-xmark"></i>
              <h3>Chưa có chương trình điểm danh</h3>
              <p>Hiện chưa có chương trình nào. Hãy nhấn "Tạo chương trình" để bắt đầu.</p>
            </div>
          )}

          {programs.length > 0 && (
            <>
              <div className="checkin-data-table-wrap" style={{ marginTop: "18px" }}>
                <table className="checkin-data-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Tên chương trình</th>
                      <th>Hình thức</th>
                      <th>Số ngày</th>
                      <th>Thời gian</th>
                      <th>Người tham gia</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPrograms.map((program) => (
                      <tr key={program.id}>
                        <td>
                          <div className="checkin-table-primary">{program.code}</div>
                          <div className="checkin-table-secondary">Cập nhật: {program.updatedAt ? String(program.updatedAt).slice(0, 10) : "-"}</div>
                        </td>
                        <td>
                          <div className="checkin-table-primary">{program.name}</div>
                          <div className="checkin-table-secondary">{program.description || "Chưa có mô tả"}</div>
                        </td>
                        <td>{formatProgramType(program.programType)}</td>
                        <td>{program.totalDays} ngày</td>
                        <td>{formatRange(program.startDate, program.endDate)}</td>
                        <td>
                          <div className="checkin-table-primary">{Number(program.participantCount || 0).toLocaleString("vi-VN")}</div>
                          <div className="checkin-table-secondary">Hoàn thành {Number(program.completionRate || 0).toLocaleString("vi-VN")}%</div>
                        </td>
                        <td>
                          <span className={`checkin-pill ${getStatusTone(program.status)}`}>{formatStatusLabel(program.status)}</span>
                        </td>
                        <td>
                          <div className="checkin-table-actions">
                            <button
                              type="button"
                              className="checkin-button checkin-button-secondary checkin-icon-button"
                              title="Xem chi tiết"
                              onClick={() => openProgramDrawer(program.id, "view")}
                              disabled={actingId === program.id}
                            >
                              <i className="fa-regular fa-eye"></i>
                            </button>
                            <button
                              type="button"
                              className="checkin-button checkin-button-secondary checkin-icon-button"
                              title="Chỉnh sửa"
                              onClick={() => openProgramDrawer(program.id, "edit")}
                              disabled={actingId === program.id}
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              type="button"
                              className="checkin-button checkin-button-secondary checkin-icon-button"
                              title="Nhân bản"
                              onClick={() => handleDuplicateProgram(program)}
                              disabled={actingId === program.id}
                            >
                              <i className={`fa-regular ${actingId === program.id ? "fa-hourglass-half" : "fa-copy"}`}></i>
                            </button>
                            <button
                              type="button"
                              className="checkin-button checkin-button-secondary checkin-icon-button"
                              title={program.status === "ACTIVE" ? "Tạm dừng" : "Kích hoạt"}
                              onClick={() => handleToggleStatus(program)}
                              disabled={actingId === program.id}
                            >
                              <i className={`fa-solid ${actingId === program.id ? "fa-spinner fa-spin" : program.status === "ACTIVE" ? "fa-pause" : "fa-play"}`}></i>
                            </button>
                            <button
                              type="button"
                              className="checkin-button checkin-button-danger checkin-icon-button"
                              title="Xóa"
                              onClick={() => setDeleteTarget(program)}
                              disabled={actingId === program.id}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="checkin-pagination">
                <div className="checkin-helper-text">
                  Hiển thị {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, programs.length)} trên tổng {programs.length} chương trình
                </div>
                <div className="checkin-page-controls">
                  <button type="button" className="checkin-page-number" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      type="button"
                      className={`checkin-page-number ${page === index + 1 ? "active" : ""}`}
                      onClick={() => setPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button type="button" className="checkin-page-number" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {drawerOpen && (
        <ProgramDrawer
          mode={drawerMode}
          formData={formData}
          formErrors={formErrors}
          submitting={submitting}
          onClose={closeDrawer}
          onSubmit={handleSubmitProgram}
          onFieldChange={updateFormField}
          onToggleField={toggleFormField}
          onRewardChange={updateRewardField}
          onAddDay={handleAddDay}
          onRemoveDay={handleRemoveDay}
          onDuplicateLastReward={handleDuplicateLastReward}
          onCopyPreviousReward={handleCopyPreviousReward}
          onAddLuckyDay={handleAddLuckyDay}
          onLuckyDayChange={handleLuckyDayChange}
          onRemoveLuckyDay={handleRemoveLuckyDay}
        />
      )}

      <DeleteConfirmModal
        program={deleteTarget}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProgram}
      />
    </>
  );
}
