import { useState } from "react";
import ModalShell from "./ModalShell";
import ImageUploadField from "./ImageUploadField";
import { GAME_TYPES } from "../constants";

export default function GameFormModal({ initialValue, onClose, onSubmit }) {
  const [form, setForm] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit({
        ...form,
        dailyPlayLimit: Number(form.dailyPlayLimit || 0),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title={form.id ? "Chinh sua game" : "Tao game moi"} onClose={onClose}>
      <form className="minigame-form-grid" onSubmit={handleSubmit}>
        <div className="minigame-form-card">
          <h4>Thong tin co ban</h4>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Ten game</label>
              <input className="form-control" value={form.name} onChange={(event) => setField("name", event.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Code</label>
              <input className="form-control" value={form.code} onChange={(event) => setField("code", event.target.value.toUpperCase())} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Slug</label>
              <input className="form-control" value={form.slug} onChange={(event) => setField("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"))} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Loai game</label>
              <select className="form-select" value={form.type} onChange={(event) => setField("type", event.target.value)}>
                {GAME_TYPES.filter((item) => item.value !== "ALL").map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Mo ta ngan</label>
              <textarea className="form-control" rows="2" value={form.shortDescription || ""} onChange={(event) => setField("shortDescription", event.target.value)} />
            </div>
            <div className="col-md-6">
              <ImageUploadField label="Thumbnail" value={form.thumbnailUrl} onChange={(value) => setField("thumbnailUrl", value)} />
            </div>
            <div className="col-md-6">
              <ImageUploadField label="Banner" value={form.bannerUrl} onChange={(value) => setField("bannerUrl", value)} />
            </div>
          </div>
        </div>

        <div className="minigame-form-card">
          <h4>Cau hinh game</h4>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Luot choi / ngay</label>
              <input type="number" min="0" className="form-control" value={form.dailyPlayLimit} onChange={(event) => setField("dailyPlayLimit", event.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Trang thai</label>
              <select className="form-select" value={form.status} onChange={(event) => setField("status", event.target.value)}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Version</label>
              <input className="form-control" value={form.version} onChange={(event) => setField("version", event.target.value)} />
            </div>
            <div className="col-md-6">
              <div className="form-check form-switch pt-4">
                <input className="form-check-input" type="checkbox" checked={Boolean(form.visible)} onChange={(event) => setField("visible", event.target.checked)} />
                <label className="form-check-label fw-semibold">Hien thi tren Game Center</label>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-check form-switch pt-4">
                <input className="form-check-input" type="checkbox" checked={Boolean(form.featured)} onChange={(event) => setField("featured", event.target.checked)} />
                <label className="form-check-label fw-semibold">Game noi bat</label>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Mo ta chi tiet</label>
              <textarea className="form-control" rows="4" value={form.description || ""} onChange={(event) => setField("description", event.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Luat choi</label>
              <textarea className="form-control" rows="4" value={form.rules || ""} onChange={(event) => setField("rules", event.target.value)} />
            </div>
          </div>
        </div>

        <div className="minigame-form-actions">
          <button type="button" className="btn btn-light" onClick={onClose}>Huy</button>
          <button type="submit" className="btn btn-primary minigame-primary-button" disabled={submitting}>
            {submitting ? "Dang luu..." : form.id ? "Cap nhat" : "Xuat ban"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
