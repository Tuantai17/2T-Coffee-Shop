import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import checkinApi from "../../../../api/checkinApi";

const DEFAULT_SETTINGS = {
  enabled: true,
  timezone: "Asia/Ho_Chi_Minh",
  allowStreakRestore: false,
  maxRestorePerMonth: 0,
  rateLimit: 1,
  reminderEnabled: false,
  reminderTime: "09:00",
  emailReminderEnabled: false,
};

function isAbortError(error) {
  return error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
}

function normalizeSettings(data) {
  return {
    enabled: data?.enabled ?? DEFAULT_SETTINGS.enabled,
    timezone: data?.timezone || DEFAULT_SETTINGS.timezone,
    allowStreakRestore: data?.allowStreakRestore ?? DEFAULT_SETTINGS.allowStreakRestore,
    maxRestorePerMonth: data?.maxRestorePerMonth ?? DEFAULT_SETTINGS.maxRestorePerMonth,
    rateLimit: data?.rateLimit ?? DEFAULT_SETTINGS.rateLimit,
    reminderEnabled: data?.reminderEnabled ?? DEFAULT_SETTINGS.reminderEnabled,
    reminderTime: data?.reminderTime || DEFAULT_SETTINGS.reminderTime,
    emailReminderEnabled: data?.emailReminderEnabled ?? DEFAULT_SETTINGS.emailReminderEnabled,
  };
}

function SettingsSkeleton() {
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

export default function SettingsTab() {
  const [formData, setFormData] = useState(DEFAULT_SETTINGS);
  const [initialData, setInitialData] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchSettings(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchSettings = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const response = await checkinApi.getSettings({ signal });
      const normalized = normalizeSettings(response.data);
      setFormData(normalized);
      setInitialData(normalized);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }
      setError("Không thể tải cấu hình check-in.");
    } finally {
      setLoading(false);
    }
  };

  const dirty = JSON.stringify(formData) !== JSON.stringify(initialData);
  const valid = formData.timezone.trim() && Number(formData.rateLimit) > 0 && Number(formData.maxRestorePerMonth) >= 0;

  const handleSave = async () => {
    if (!valid) {
      toast.error("Vui lòng kiểm tra lại dữ liệu cấu hình.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        rateLimit: Number(formData.rateLimit),
        maxRestorePerMonth: Number(formData.maxRestorePerMonth),
        reminderTime: formData.reminderEnabled ? formData.reminderTime || "09:00" : null,
        emailReminderEnabled: Boolean(formData.emailReminderEnabled),
      };
      const response = await checkinApi.updateSettings(payload);
      const normalized = normalizeSettings(response.data);
      setFormData(normalized);
      setInitialData(normalized);
      toast.success("Đã lưu cấu hình daily check-in.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể lưu cấu hình.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (error) {
    return (
      <div className="checkin-section-card checkin-error-state">
        <i className="fa-solid fa-circle-exclamation" style={{ color: "#D64545" }}></i>
        <h3>Lỗi tải cấu hình</h3>
        <p>{error}</p>
        <div style={{ marginTop: "20px" }}>
          <button type="button" className="checkin-button checkin-button-primary" onClick={() => fetchSettings()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-section-card">
      <div className="checkin-card-head">
        <div>
          <h2 className="checkin-section-title">Cấu hình hệ thống điểm danh</h2>
          <p className="checkin-section-description">Các trường dưới đây đang ghi trực tiếp vào bảng `checkin_settings` trong loyalty-service.</p>
        </div>
      </div>
      <div className="checkin-card-body d-flex flex-column gap-4">
        <section className="checkin-drawer-section">
          <div className="checkin-drawer-section-header">
            <h3>1. Trạng thái hệ thống</h3>
            <p>Bật hoặc tắt toàn bộ tính năng daily check-in cho phía người dùng.</p>
          </div>
          <div className="checkin-check-row">
            <div className="checkin-check-main">
              <div className="checkin-label">Bật tính năng daily check-in</div>
              <div className="checkin-helper-text">Nếu tắt, user-side sẽ không thể thực hiện check-in cho chương trình đang hoạt động.</div>
            </div>
            <label className="checkin-switch">
              <input type="checkbox" checked={formData.enabled} onChange={() => setFormData((current) => ({ ...current, enabled: !current.enabled }))} />
              <span className="checkin-switch-slider"></span>
            </label>
          </div>
        </section>

        <section className="checkin-drawer-section">
          <div className="checkin-drawer-section-header">
            <h3>2. Quy tắc điểm danh</h3>
            <p>Múi giờ và giới hạn số lượt check-in mỗi ngày được áp dụng theo settings hiện tại.</p>
          </div>
          <div className="checkin-form-grid">
            <div className="checkin-form-field">
              <label className="checkin-label">Múi giờ hệ thống</label>
              <input className="checkin-input" value={formData.timezone} onChange={(event) => setFormData((current) => ({ ...current, timezone: event.target.value }))} />
            </div>
            <div className="checkin-form-field">
              <label className="checkin-label">Giới hạn điểm danh mỗi ngày</label>
              <input
                type="number"
                min="1"
                className="checkin-input"
                value={formData.rateLimit}
                onChange={(event) => setFormData((current) => ({ ...current, rateLimit: event.target.value }))}
              />
            </div>
            <div className="checkin-form-field full">
              <label className="checkin-label">Chống điểm danh trùng</label>
              <div className="checkin-helper-text">
                Luồng backend hiện đang được bảo vệ bởi unique constraint `uk_program_user_date` và logic kiểm tra record theo ngày.
              </div>
            </div>
          </div>
        </section>

        <section className="checkin-drawer-section">
          <div className="checkin-drawer-section-header">
            <h3>3. Tính năng nâng cao</h3>
            <p>Cấu hình khả năng khôi phục streak trong tháng theo dữ liệu thật đang có trên backend.</p>
          </div>
          <div className="checkin-check-row" style={{ marginBottom: "16px" }}>
            <div className="checkin-check-main">
              <div className="checkin-label">Cho phép khôi phục chuỗi</div>
              <div className="checkin-helper-text">Bật quyền restore streak ở tầng cấu hình hệ thống.</div>
            </div>
            <label className="checkin-switch">
              <input
                type="checkbox"
                checked={formData.allowStreakRestore}
                onChange={() => setFormData((current) => ({ ...current, allowStreakRestore: !current.allowStreakRestore }))}
              />
              <span className="checkin-switch-slider"></span>
            </label>
          </div>
          <div className="checkin-form-grid">
            <div className="checkin-form-field">
              <label className="checkin-label">Số lần khôi phục tối đa / tháng</label>
              <input
                type="number"
                min="0"
                className="checkin-input"
                value={formData.maxRestorePerMonth}
                onChange={(event) => setFormData((current) => ({ ...current, maxRestorePerMonth: event.target.value }))}
                disabled={!formData.allowStreakRestore}
              />
            </div>
          </div>
        </section>

        <section className="checkin-drawer-section">
          <div className="checkin-drawer-section-header">
            <h3>4. Thông báo và nhắc nhở</h3>
            <p>Bật nhắc lịch check-in và điều chỉnh thời gian gửi thông báo.</p>
          </div>
          <div className="checkin-check-row" style={{ marginBottom: "16px" }}>
            <div className="checkin-check-main">
              <div className="checkin-label">Bật nhắc điểm danh</div>
              <div className="checkin-helper-text">Dùng cho scheduler / notification-service đọc cấu hình nhắc nhở.</div>
            </div>
            <label className="checkin-switch">
              <input
                type="checkbox"
                checked={formData.reminderEnabled}
                onChange={() => setFormData((current) => ({ ...current, reminderEnabled: !current.reminderEnabled }))}
              />
              <span className="checkin-switch-slider"></span>
            </label>
          </div>
          <div className="checkin-check-row" style={{ marginBottom: "16px" }}>
            <div className="checkin-check-main">
              <div className="checkin-label">Gửi Email nhắc nhở</div>
              <div className="checkin-helper-text">Hệ thống sẽ gửi thông báo đến hòm thư email của người dùng.</div>
            </div>
            <label className="checkin-switch">
              <input
                type="checkbox"
                checked={formData.emailReminderEnabled}
                onChange={() => setFormData((current) => ({ ...current, emailReminderEnabled: !current.emailReminderEnabled }))}
              />
              <span className="checkin-switch-slider"></span>
            </label>
          </div>
          <div className="checkin-form-grid">
            <div className="checkin-form-field">
              <label className="checkin-label">Giờ nhắc</label>
              <input
                type="time"
                className="checkin-input"
                value={formData.reminderTime || "09:00"}
                onChange={(event) => setFormData((current) => ({ ...current, reminderTime: event.target.value }))}
                disabled={!formData.reminderEnabled}
              />
            </div>
          </div>
        </section>

        <div className="checkin-sticky-footer" style={{ borderTop: "none", padding: 0 }}>
          <div className="checkin-helper-text">
            {dirty ? "Bạn có thay đổi chưa lưu." : "Dữ liệu đang đồng bộ với cấu hình hiện có trên backend."}
          </div>
          <div className="checkin-inline-actions">
            <button
              type="button"
              className="checkin-button checkin-button-secondary"
              onClick={() => setFormData(initialData)}
              disabled={!dirty || saving}
            >
              Hủy
            </button>
            <button
              type="button"
              className="checkin-button checkin-button-secondary"
              onClick={() => setFormData(DEFAULT_SETTINGS)}
              disabled={saving}
            >
              Khôi phục mặc định
            </button>
            <button
              type="button"
              className="checkin-button checkin-button-primary"
              onClick={handleSave}
              disabled={!dirty || saving || !valid}
            >
              {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
