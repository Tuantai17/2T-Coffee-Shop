import React, { useState, useEffect } from "react";
import { getUserAddresses } from "../../../../services/addressService";
import { getAuthSession, AUTH_SCOPES } from "../../../../utils/authStorage";

function AddressSelectorModal({ show, onClose, onSelect, currentAddressId, onAddNew }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(currentAddressId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      loadAddresses();
      setSelectedAddressId(currentAddressId);
    }
  }, [show, currentAddressId]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError("");
      const { userId } = getAuthSession(AUTH_SCOPES.USER);
      if (!userId) {
        setError("Không tìm thấy thông tin đăng nhập.");
        return;
      }
      const response = await getUserAddresses(userId);
      const data = response.data || [];
      // Sort: Default first
      const sorted = [...data].sort((a, b) => {
        const aDefault = a.default || a.isDefault;
        const bDefault = b.default || b.isDefault;
        if (aDefault && !bDefault) return -1;
        if (!aDefault && bDefault) return 1;
        return 0;
      });
      setAddresses(sorted);
    } catch (err) {
      console.error("Lỗi tải danh sách địa chỉ:", err);
      setError("Không thể tải danh sách địa chỉ.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (addr) => {
    setSelectedAddressId(addr.id);
  };

  const handleConfirm = () => {
    if (!selectedAddressId) {
      setError("Vui lòng chọn địa chỉ nhận hàng.");
      return;
    }
    const addr = addresses.find(a => a.id === selectedAddressId);
    if (addr) {
      onSelect(addr);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} role="dialog" aria-modal="true" aria-labelledby="addressSelectorTitle">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-bottom-0 p-4 pb-3">
              <h4 className="modal-title fw-bold" id="addressSelectorTitle">Chọn địa chỉ nhận hàng</h4>
              <button type="button" className="btn-close shadow-none" onClick={onClose} aria-label="Đóng hộp thoại"></button>
            </div>
            
            <div className="modal-body p-4 pt-0" style={{ maxHeight: "65vh", overflowY: "auto" }}>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <div className="mb-3"><i className="fa-regular fa-map text-secondary" style={{fontSize: '3rem'}}></i></div>
                  <p>Bạn chưa có địa chỉ nhận hàng nào.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const isDefault = addr.default || addr.isDefault;
                    const fullAddr = [addr.addressLine, addr.ward, addr.district, addr.province].filter(Boolean).join(", ");
                    
                    return (
                      <div 
                        key={addr.id} 
                        className={`card rounded-4 border p-3 cursor-pointer ${isSelected ? 'border-primary bg-primary-subtle' : 'shadow-sm'}`}
                        onClick={() => handleSelect(addr)}
                        style={{ cursor: 'pointer', borderColor: isSelected ? '#0d6efd' : '#dee2e6', backgroundColor: isSelected ? '#f8faff' : '#fff' }}
                      >
                        <div className="d-flex gap-3">
                          <div className="mt-1">
                            <input 
                              type="radio" 
                              className="form-check-input" 
                              name="addressSelection" 
                              checked={isSelected}
                              onChange={() => handleSelect(addr)}
                              style={{ transform: 'scale(1.2)' }}
                              aria-label={`Chọn địa chỉ ${addr.label}`}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                                {addr.label || addr.addressType || "Nhà riêng"}
                                {isDefault && <span className="badge bg-success-subtle text-success rounded-pill px-2 fw-semibold border border-success-subtle" style={{fontSize: '0.7rem'}}>Mặc định</span>}
                              </h6>
                            </div>
                            <div className="text-dark fw-medium mb-1">
                              {addr.receiverName} <span className="text-muted fw-normal mx-1">•</span> {addr.phoneNumber}
                            </div>
                            <p className="text-muted mb-0 small">
                              {fullAddr}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="modal-footer border-top-0 px-4 py-3 pb-4 d-flex justify-content-between align-items-center">
              <button 
                type="button" 
                className="btn btn-link text-primary fw-bold text-decoration-none p-0 d-flex align-items-center gap-1"
                onClick={onAddNew}
              >
                <i className="fa-solid fa-plus"></i> THÊM ĐỊA CHỈ MỚI
              </button>
              
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-light border px-4 py-2 rounded-3 fw-bold" onClick={onClose}>HỦY</button>
                <button 
                  type="button" 
                  className="btn btn-danger px-4 py-2 rounded-3 fw-bold" 
                  onClick={handleConfirm}
                  disabled={addresses.length > 0 && !selectedAddressId}
                >
                  CHỌN ĐỊA CHỈ NÀY
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddressSelectorModal;
