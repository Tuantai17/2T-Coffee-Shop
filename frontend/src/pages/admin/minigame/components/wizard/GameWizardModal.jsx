import { useState } from "react";
import ModalShell from "../ModalShell";
import ImageUploadField from "../ImageUploadField";
import MultiImageUploadField from "../MultiImageUploadField";
import { GAME_TYPES } from "../../constants";

export default function GameWizardModal({ initialValue, onClose, onSubmit, voucherOptions = [] }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    ...initialValue,
    pendingRewards: initialValue?.rewards || [],
    gameplayConfig: initialValue?.gameplayConfig || {
      gridSize: "4x4",
      timer: 60,
      attempts: 30,
      matchPoints: 100,
      missPoints: -5,
      animation: true,
      sound: true,
      cardImages: []
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingReward, setEditingReward] = useState(null);

  const setField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const setConfigField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      gameplayConfig: {
        ...previous.gameplayConfig,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    
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

  const renderStepIndicator = () => (
    <div className="d-flex justify-content-center mb-4">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="d-flex align-items-center">
          <div className={`rounded-circle d-flex align-items-center justify-content-center text-white ${step >= s ? 'bg-primary' : 'bg-secondary'}`} style={{width: 32, height: 32}}>
            {s}
          </div>
          {s < 4 && <div className={`mx-2 ${step > s ? 'bg-primary' : 'bg-secondary'}`} style={{height: 2, width: 40}}></div>}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label fw-semibold">Tên game</label>
        <input className="form-control" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Loại game</label>
        <select className="form-select" value={form.type} onChange={(e) => setField("type", e.target.value)}>
          {GAME_TYPES.filter((item) => item.value !== "ALL").map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Code</label>
        <input className="form-control" value={form.code} onChange={(e) => setField("code", e.target.value.toUpperCase())} required />
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Slug</label>
        <input className="form-control" value={form.slug} onChange={(e) => setField("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} required />
      </div>
      <div className="col-12">
        <label className="form-label fw-semibold">Mô tả ngắn</label>
        <textarea className="form-control" rows="2" value={form.shortDescription || ""} onChange={(e) => setField("shortDescription", e.target.value)} />
      </div>
      <div className="col-md-6">
        <ImageUploadField label="Thumbnail" value={form.thumbnailUrl} onChange={(value) => setField("thumbnailUrl", value)} />
      </div>
      <div className="col-md-6">
        <ImageUploadField label="Banner" value={form.bannerUrl} onChange={(value) => setField("bannerUrl", value)} />
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Lượt chơi / ngày</label>
        <input type="number" min="0" className="form-control" value={form.dailyPlayLimit} onChange={(e) => setField("dailyPlayLimit", e.target.value === "" ? "" : Number(e.target.value))} onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()} />
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Version</label>
        <input className="form-control" value={form.version} onChange={(e) => setField("version", e.target.value)} />
      </div>
    </div>
  );

  const getGridDimensions = (gridSize) => {
    const parts = gridSize.split('x');
    return { cols: parseInt(parts[0]) || 4, rows: parseInt(parts[1]) || 4 };
  };

  const renderStep2 = () => {
    if (form.type !== "MEMORY_MATCH") {
      return <div className="text-center p-5 text-muted">Không có cấu hình động cho loại game này.</div>;
    }
    return (
      <div className="row g-4">
        <div className="col-md-7">
          <h5 className="mb-3">Thiết lập luật chơi cho Memory Match</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Kích thước bàn chơi</label>
              <select className="form-select" value={form.gameplayConfig.gridSize} onChange={(e) => setConfigField("gridSize", e.target.value)}>
                <option value="4x4">4 x 4 (16 thẻ)</option>
                <option value="5x4">5 x 4 (20 thẻ)</option>
                <option value="6x6">6 x 6 (36 thẻ)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Thời gian (giây)</label>
              <input type="number" className="form-control" value={form.gameplayConfig.timer} onChange={(e) => setConfigField("timer", e.target.value === "" ? "" : Number(e.target.value))} onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Số lượt tối đa</label>
              <input type="number" className="form-control" value={form.gameplayConfig.attempts} onChange={(e) => setConfigField("attempts", e.target.value === "" ? "" : Number(e.target.value))} onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Điểm ghép đúng</label>
              <input type="number" className="form-control text-success" value={form.gameplayConfig.matchPoints} onChange={(e) => setConfigField("matchPoints", e.target.value === "" ? "" : Number(e.target.value))} onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Điểm sai</label>
              <input type="number" className="form-control text-danger" value={form.gameplayConfig.missPoints} onChange={(e) => setConfigField("missPoints", e.target.value === "" ? "" : Number(e.target.value))} onKeyDown={(e) => ["e", "E", "+", "."].includes(e.key) && e.preventDefault()} />
            </div>
            <div className="col-12 mt-4">
              <div className="form-check form-switch d-inline-block me-4">
                <input className="form-check-input" type="checkbox" checked={form.gameplayConfig.animation} onChange={(e) => setConfigField("animation", e.target.checked)} />
                <label className="form-check-label">Hiệu ứng lật thẻ</label>
              </div>
              <div className="form-check form-switch d-inline-block">
                <input className="form-check-input" type="checkbox" checked={form.gameplayConfig.sound} onChange={(e) => setConfigField("sound", e.target.checked)} />
                <label className="form-check-label">Âm thanh</label>
              </div>
            </div>
            
            <div className="col-12 border-top pt-3 mt-4">
              <MultiImageUploadField 
                label="Ảnh thẻ tùy chỉnh (tùy chọn)" 
                images={form.gameplayConfig.cardImages || []} 
                onChange={(urls) => setConfigField("cardImages", urls)} 
                maxImages={(getGridDimensions(form.gameplayConfig.gridSize).cols * getGridDimensions(form.gameplayConfig.gridSize).rows) / 2}
              />
              <div className="small text-muted mt-1">
                Lưu ý: Game sẽ cần đúng {(getGridDimensions(form.gameplayConfig.gridSize).cols * getGridDimensions(form.gameplayConfig.gridSize).rows) / 2} ảnh cho kích thước lưới {form.gameplayConfig.gridSize}. Nếu bạn không tải đủ, hệ thống sẽ tự bù bằng icon có sẵn.
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-5">
          <div className="card border-0 shadow-sm bg-dark text-white p-3 rounded-4" style={{minHeight: '300px'}}>
            <div className="text-center mb-3 text-muted small">Live Preview ({form.gameplayConfig.gridSize})</div>
            <div className="d-flex justify-content-center align-items-center h-100">
               <div style={{
                 display: 'grid', 
                 gridTemplateColumns: `repeat(${getGridDimensions(form.gameplayConfig.gridSize).cols}, 40px)`,
                 gap: '8px'
               }}>
                 {Array.from({length: getGridDimensions(form.gameplayConfig.gridSize).cols * getGridDimensions(form.gameplayConfig.gridSize).rows}).map((_, i) => (
                   <div key={i} className="bg-secondary rounded overflow-hidden" style={{width: '40px', height: '40px'}}>
                     {(form.gameplayConfig.cardImages && form.gameplayConfig.cardImages[Math.floor(i / 2)]) ? (
                       <img src={form.gameplayConfig.cardImages[Math.floor(i / 2)]} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                     ) : null}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const saveEditingReward = () => {
    const probability = Number(editingReward.probability || 0);
    const totalQuantity = Number(editingReward.totalQuantity || 0);
    const remainingQuantity = Number(editingReward.remainingQuantity || 0);
    const pointValue = editingReward.rewardType === "POINT" ? Number(editingReward.pointValue || 0) : null;
    
    if (!editingReward.rewardName) return alert("Vui lòng nhập tên phần thưởng");
    if (editingReward.rewardType === "VOUCHER" && !editingReward.voucherId) return alert("Vui lòng chọn voucher");

    const newReward = { ...editingReward, probability, totalQuantity, remainingQuantity, pointValue };
    
    setForm(prev => {
      let newRewards = [...(prev.pendingRewards || [])];
      if (newReward._index !== undefined) {
        newRewards[newReward._index] = newReward;
      } else {
        newRewards.push(newReward);
      }
      return { ...prev, pendingRewards: newRewards };
    });
    setEditingReward(null);
  };

  const deleteReward = (index) => {
    if (!window.confirm("Xóa phần thưởng này?")) return;
    setForm(prev => {
      let newRewards = [...(prev.pendingRewards || [])];
      if (newRewards[index].id) {
        newRewards[index] = { ...newRewards[index], _deleted: true };
      } else {
        newRewards.splice(index, 1);
      }
      return { ...prev, pendingRewards: newRewards };
    });
  };

  const renderStep3 = () => {
    if (editingReward) {
      return (
        <div className="p-3 border rounded shadow-sm bg-white">
          <h6 className="mb-3 fw-bold">{editingReward._index !== undefined ? "Sửa phần thưởng" : "Thêm phần thưởng"}</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small">Tên phần thưởng</label>
              <input className="form-control form-control-sm" value={editingReward.rewardName || ""} onChange={(e) => setEditingReward(prev => ({...prev, rewardName: e.target.value}))} />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Loại</label>
              <select className="form-select form-select-sm" value={editingReward.rewardType || "POINT"} onChange={(e) => setEditingReward(prev => ({...prev, rewardType: e.target.value}))}>
                <option value="POINT">Điểm (POINT)</option>
                <option value="VOUCHER">Voucher (VOUCHER)</option>
              </select>
            </div>
            {editingReward.rewardType === "POINT" || !editingReward.rewardType ? (
              <div className="col-md-6">
                <label className="form-label small">Số điểm thưởng</label>
                <input type="number" className="form-control form-control-sm" value={editingReward.pointValue || ""} onChange={(e) => setEditingReward(prev => ({...prev, pointValue: e.target.value}))} />
              </div>
            ) : (
              <div className="col-md-6">
                <label className="form-label small">Chọn Voucher</label>
                <select className="form-select form-select-sm" value={editingReward.voucherId || ""} onChange={(e) => setEditingReward(prev => ({...prev, voucherId: e.target.value}))}>
                  <option value="">-- Chọn --</option>
                  {voucherOptions.map(v => <option key={v.id || v.code} value={v.code}>{v.name} ({v.code})</option>)}
                </select>
              </div>
            )}
            <div className="col-md-6">
              <label className="form-label small">Xác suất (%)</label>
              <input type="number" step="0.01" className="form-control form-control-sm" value={editingReward.probability || ""} onChange={(e) => setEditingReward(prev => ({...prev, probability: e.target.value}))} />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Tổng số lượng</label>
              <input type="number" className="form-control form-control-sm" value={editingReward.totalQuantity || ""} onChange={(e) => setEditingReward(prev => ({...prev, totalQuantity: e.target.value}))} />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Còn lại</label>
              <input type="number" className="form-control form-control-sm" value={editingReward.remainingQuantity || ""} onChange={(e) => setEditingReward(prev => ({...prev, remainingQuantity: e.target.value}))} />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-sm btn-light" onClick={() => setEditingReward(null)}>Hủy</button>
            <button type="button" className="btn btn-sm btn-primary" onClick={saveEditingReward}>Lưu phần thưởng</button>
          </div>
        </div>
      );
    }

    const activeRewards = (form.pendingRewards || []).map((r, i) => ({...r, _index: i})).filter(r => !r._deleted);
    const totalProb = activeRewards.reduce((sum, r) => sum + (Number(r.probability) || 0), 0);

    return (
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Phần thưởng & Tỷ lệ</h5>
            <small className={`fw-bold ${totalProb > 100 ? "text-danger" : "text-muted"}`}>Tổng xác suất: {totalProb}%</small>
          </div>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => setEditingReward({ rewardType: "POINT", status: "ACTIVE" })}>
            <i className="fa-solid fa-plus me-1"></i> Thêm thưởng
          </button>
        </div>
        
        {activeRewards.length === 0 ? (
          <div className="text-center p-4 bg-light rounded text-muted">
            Chưa có phần thưởng nào. Game có thể không có thưởng.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Tên</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Xác suất</th>
                  <th>Số lượng</th>
                  <th className="text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {activeRewards.map(reward => (
                  <tr key={reward._index}>
                    <td className="fw-semibold">{reward.rewardName}</td>
                    <td><span className={`badge ${reward.rewardType === 'VOUCHER' ? 'bg-info' : 'bg-success'}`}>{reward.rewardType}</span></td>
                    <td>{reward.rewardType === 'POINT' ? `${reward.pointValue || 0} điểm` : reward.voucherId}</td>
                    <td>{reward.probability}%</td>
                    <td>{reward.remainingQuantity} / {reward.totalQuantity}</td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-light text-primary py-0 px-2 me-1" onClick={() => setEditingReward(reward)}><i className="fa-solid fa-pen"></i></button>
                      <button type="button" className="btn btn-sm btn-light text-danger py-0 px-2" onClick={() => deleteReward(reward._index)}><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="p-3">
      <h5 className="mb-4 text-center">Xem lại thông tin</h5>
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-3 mb-3">
            <h6 className="fw-bold mb-3">Thông tin cơ bản</h6>
            <p className="mb-1"><span className="text-muted me-2">Tên:</span>{form.name}</p>
            <p className="mb-1"><span className="text-muted me-2">Loại:</span>{form.type}</p>
            <p className="mb-1"><span className="text-muted me-2">Code:</span>{form.code}</p>
            <p className="mb-1"><span className="text-muted me-2">Lượt chơi/ngày:</span>{form.dailyPlayLimit}</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-3 mb-3">
            <h6 className="fw-bold mb-3">Cấu hình Gameplay</h6>
            {form.type === "MEMORY_MATCH" ? (
              <>
                <p className="mb-1"><span className="text-muted me-2">Grid:</span>{form.gameplayConfig.gridSize}</p>
                <p className="mb-1"><span className="text-muted me-2">Thời gian:</span>{form.gameplayConfig.timer}s</p>
                <p className="mb-1"><span className="text-muted me-2">Điểm đúng/sai:</span>{form.gameplayConfig.matchPoints} / {form.gameplayConfig.missPoints}</p>
                {form.gameplayConfig.cardImages && form.gameplayConfig.cardImages.length > 0 && (
                  <div className="mt-2">
                    <span className="text-muted me-2 d-block mb-1">Ảnh thẻ đã cấu hình:</span>
                    <div className="d-flex flex-wrap gap-2">
                      {form.gameplayConfig.cardImages.map((url, i) => (
                        <div key={i} className="d-flex align-items-center gap-1 border rounded p-1 bg-white">
                          <img src={url} alt="A" style={{width: 30, height: 30, objectFit: 'cover', borderRadius: 4}} />
                          <span className="text-muted small fw-bold">=</span>
                          <img src={url} alt="B" style={{width: 30, height: 30, objectFit: 'cover', borderRadius: 4}} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : <span className="text-muted">Mặc định</span>}
          </div>
        </div>
      </div>
      <div className="form-check form-switch mt-3 d-flex justify-content-center gap-4">
        <div>
          <input className="form-check-input" type="checkbox" checked={Boolean(form.visible)} onChange={(e) => setField("visible", e.target.checked)} />
          <label className="form-check-label ms-2">Hiển thị trên Game Center</label>
        </div>
        <div>
          <input className="form-check-input" type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setField("featured", e.target.checked)} />
          <label className="form-check-label ms-2">Game nổi bật</label>
        </div>
      </div>
    </div>
  );

  return (
    <ModalShell title={form.id ? "Chỉnh sửa game" : "Tạo game mới"} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="p-2">
        {renderStepIndicator()}
        
        <div className="mb-4" style={{minHeight: '350px'}}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        <div className="d-flex justify-content-between pt-3 border-top">
          <button type="button" className="btn btn-light px-4" onClick={() => step > 1 ? setStep(step - 1) : onClose()}>
            {step > 1 ? "Quay lại" : "Hủy"}
          </button>
          <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
            {submitting ? "Đang lưu..." : step < 4 ? "Tiếp tục" : (form.id ? "Cập nhật" : "Lưu Game")}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
