import { useState } from "react";
import ModalShell from "./ModalShell";

export default function RewardFormModal({ initialValue, onClose, onSubmit, gameOptions, voucherOptions }) {
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
        pointValue: form.rewardType === "POINT" ? Number(form.pointValue || 0) : null,
        probability: Number(form.probability || 0),
        totalQuantity: Number(form.totalQuantity || 0),
        remainingQuantity: Number(form.remainingQuantity || 0),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title={form.id ? "Chinh sua phan thuong" : "Them phan thuong"} onClose={onClose} width={760}>
      <form className="minigame-form-grid" onSubmit={handleSubmit}>
        <div className="minigame-form-card">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Game</label>
              <select className="form-select" value={form.gameId || ""} onChange={(event) => setField("gameId", Number(event.target.value))} required>
                <option value="">Chon game</option>
                {gameOptions.map((game) => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Ten phan thuong</label>
              <input className="form-control" value={form.rewardName} onChange={(event) => setField("rewardName", event.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Loai</label>
              <select className="form-select" value={form.rewardType} onChange={(event) => setField("rewardType", event.target.value)}>
                <option value="POINT">POINT</option>
                <option value="VOUCHER">VOUCHER</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Xac suat (%)</label>
              <input type="number" min="0" max="100" step="0.01" className="form-control" value={form.probability} onChange={(event) => setField("probability", event.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Trang thai</label>
              <select className="form-select" value={form.status} onChange={(event) => setField("status", event.target.value)}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            {form.rewardType === "POINT" ? (
              <div className="col-md-6">
                <label className="form-label fw-semibold">So diem</label>
                <input type="number" min="0" className="form-control" value={form.pointValue} onChange={(event) => setField("pointValue", event.target.value)} />
              </div>
            ) : (
              <div className="col-md-6">
                <label className="form-label fw-semibold">Voucher</label>
                <select className="form-select" value={form.voucherId || ""} onChange={(event) => setField("voucherId", event.target.value)}>
                  <option value="">Chon voucher</option>
                  {voucherOptions.map((voucher) => (
                    <option key={voucher.id || voucher.code} value={voucher.code}>{voucher.name} ({voucher.code})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-3">
              <label className="form-label fw-semibold">Tong SL</label>
              <input type="number" min="0" className="form-control" value={form.totalQuantity} onChange={(event) => setField("totalQuantity", event.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Con lai</label>
              <input type="number" min="0" className="form-control" value={form.remainingQuantity} onChange={(event) => setField("remainingQuantity", event.target.value)} />
            </div>
          </div>
        </div>
        <div className="minigame-form-actions">
          <button type="button" className="btn btn-light" onClick={onClose}>Huy</button>
          <button type="submit" className="btn btn-primary minigame-primary-button" disabled={submitting}>
            {submitting ? "Dang luu..." : "Luu phan thuong"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
