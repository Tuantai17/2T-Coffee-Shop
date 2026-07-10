import React, { useState, useEffect } from 'react';
import adminLoyaltyApi from '../../../../../api/adminLoyaltyApi';

const RuleTestModal = ({ show, onHide }) => {
  const [testData, setTestData] = useState({
    source: 'ORDER',
    orderValue: 150000,
    tier: 'Silver'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Clear result when modal opens/closes
  useEffect(() => {
    if (show) {
      setResult(null);
    }
  }, [show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestData(prev => ({ ...prev, [name]: value }));
  };

  const handleTest = async () => {
    try {
      setLoading(true);
      const res = await adminLoyaltyApi.testRule(testData);
      setResult(res.data);
    } catch (error) {
      setResult({ message: "Lỗi hệ thống khi kiểm tra", points: 0, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={!loading ? onHide : undefined}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div className="modal-header border-bottom bg-light">
              <h5 className="modal-title fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "14px" }}>
                <i className="fa-solid fa-vial-circle-check text-primary"></i> KIỂM TRA THỬ QUY TẮC
              </h5>
              <button type="button" className="btn-close shadow-none" onClick={onHide} disabled={loading}></button>
            </div>
            
            <div className="modal-body p-4 bg-white">
              <div className="text-muted small mb-4">
                Nhập thử các thông số để xem hệ thống sẽ tính toán cộng/trừ bao nhiêu điểm dựa trên các quy tắc đang hoạt động.
              </div>
              
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <label className="form-label small fw-medium">Loại hành động</label>
                  <select className="form-select" name="source" value={testData.source} onChange={handleChange}>
                    <option value="ORDER">Mua hàng (Thanh toán đơn)</option>
                    <option value="CHECKIN">Điểm danh hàng ngày</option>
                    <option value="MINIGAME">Chơi Mini Game</option>
                    <option value="BIRTHDAY">Sinh nhật</option>
                  </select>
                </div>

                {testData.source === 'ORDER' && (
                  <div className="col-12">
                    <label className="form-label small fw-medium">Giá trị đơn hàng (VNĐ)</label>
                    <input type="number" className="form-control" name="orderValue" value={testData.orderValue} onChange={handleChange} />
                  </div>
                )}

                <div className="col-12">
                  <label className="form-label small fw-medium">Hạng thẻ khách hàng</label>
                  <select className="form-select" name="tier" value={testData.tier} onChange={handleChange}>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Diamond">Diamond</option>
                  </select>
                </div>
              </div>

              <div className="d-grid gap-2 mb-4">
                <button className="btn btn-primary fw-bold py-2 rounded-pill shadow-sm" onClick={handleTest} disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
                  ) : (
                    <><i className="fa-solid fa-calculator me-2"></i>Tính thử kết quả</>
                  )}
                </button>
              </div>

              {result && (
                <div className={`alert ${result.error ? 'alert-danger' : 'alert-success'} border-0 shadow-sm mb-0`}>
                  <h6 className="fw-bold mb-2">Kết quả dự kiến:</h6>
                  <div className="d-flex align-items-center mb-1">
                    <span className="fs-1 fw-black text-dark me-2">{result.points > 0 ? `+${result.points}` : result.points}</span>
                    <span className="text-muted fw-bold">Điểm</span>
                  </div>
                  <p className="mb-0 small">{result.message}</p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default RuleTestModal;
