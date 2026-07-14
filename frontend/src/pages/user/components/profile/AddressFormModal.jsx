import React, { useState, useEffect } from "react";
import Select from "react-select";

function AddressFormModal({ show, onClose, onSave, address, isSaving }) {
  const [form, setForm] = useState({
    recipientName: "",
    phone: "",
    provinceCode: "",
    provinceName: "",
    wardCode: "",
    wardName: "",
    detailAddress: "",
    addressType: "HOME",
    isDefault: false,
    saveToAddressBook: true, // Only useful for checkout
  });

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState({ p: false, w: false });
  const [error, setError] = useState("");

  // Fetch provinces on mount
  useEffect(() => {
    if (show) {
      fetchProvinces();
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      if (address) {
        setForm({
          recipientName: address.recipientName || address.receiverName || "",
          phone: address.phone || address.phoneNumber || "",
          provinceCode: address.provinceCode || "",
          provinceName: address.provinceName || address.province || "",
          wardCode: address.wardCode || "",
          wardName: address.wardName || address.ward || "",
          detailAddress: address.detailAddress || address.addressLine || "",
          addressType: address.addressType || address.label || "HOME",
          isDefault: address.isDefault || address.default || false,
          saveToAddressBook: true,
        });
        
        if (address.provinceCode) {
           loadWards(address.provinceCode);
        }
      } else {
        setForm({
          recipientName: "",
          phone: "",
          provinceCode: "",
          provinceName: "",
          wardCode: "",
          wardName: "",
          detailAddress: "",
          addressType: "HOME",
          isDefault: false,
          saveToAddressBook: true,
        });
        setWards([]);
      }
      setError("");
    }
  }, [show, address]);

  const fetchProvinces = async () => {
    try {
      setLoadingLocations(prev => ({ ...prev, p: true }));
      const res = await fetch("https://provinces.open-api.vn/api/v2/p/");
      const data = await res.json();
      setProvinces(data);
    } catch (err) {
      console.error("Lỗi tải tỉnh thành:", err);
    } finally {
      setLoadingLocations(prev => ({ ...prev, p: false }));
    }
  };

  const loadWards = async (provinceCode) => {
    try {
      setLoadingLocations(prev => ({ ...prev, w: true }));
      const res = await fetch(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`);
      const data = await res.json();
      setWards(data.wards || []);
    } catch (err) {
      console.error("Lỗi tải phường xã:", err);
    } finally {
      setLoadingLocations(prev => ({ ...prev, w: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setError("");
  };

  const handleProvinceChange = (selectedOption) => {
    if (selectedOption) {
      setForm(prev => ({ 
        ...prev, 
        provinceCode: selectedOption.value, 
        provinceName: selectedOption.label,
        wardCode: "", 
        wardName: "" 
      }));
      loadWards(selectedOption.value);
    } else {
      setForm(prev => ({ ...prev, provinceCode: "", provinceName: "", wardCode: "", wardName: "" }));
      setWards([]);
    }
    setError("");
  };

  const handleWardChange = (selectedOption) => {
    if (selectedOption) {
        setForm(prev => ({ ...prev, wardCode: selectedOption.value, wardName: selectedOption.label }));
    } else {
        setForm(prev => ({ ...prev, wardCode: "", wardName: "" }));
    }
    setError("");
  };

  const provinceOptions = provinces.map(p => ({ value: p.code, label: p.name }));
  const wardOptions = wards.map(w => ({ value: w.code, label: w.name }));

  const selectedProvince = provinceOptions.find(opt => opt.value === form.provinceCode) || null;
  const selectedWard = wardOptions.find(opt => opt.value === form.wardCode) || null;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.5rem",
      borderColor: state.isFocused ? "#86b7fe" : "#dee2e6",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(13,110,253,.25)" : "none",
      minHeight: "38px",
      padding: "2px",
      fontSize: "0.875rem",
      "&:hover": {
        borderColor: state.isFocused ? "#86b7fe" : "#dee2e6",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: "0.5rem",
      boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
      fontSize: "0.875rem",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.recipientName.trim()) {
      setError("Vui lòng nhập họ và tên người nhận."); return;
    }
    if (!form.phone.trim()) {
      setError("Vui lòng nhập số điện thoại."); return;
    }
    if (!/^[0-9+]{9,15}$/.test(form.phone.replace(/\s+/g, ""))) {
      setError("Số điện thoại không hợp lệ."); return;
    }
    if (!form.provinceCode || !form.wardCode) {
      setError("Vui lòng chọn đầy đủ Tỉnh/Thành, Phường/Xã."); return;
    }
    if (!form.detailAddress.trim()) {
      setError("Vui lòng nhập địa chỉ chi tiết."); return;
    }
    
    const payload = {
      recipientName: form.recipientName,
      phone: form.phone,
      addressType: form.addressType,
      provinceCode: String(form.provinceCode),
      provinceName: form.provinceName,
      wardCode: String(form.wardCode),
      wardName: form.wardName,
      detailAddress: form.detailAddress,
      isDefault: form.isDefault
    };
    onSave(payload);
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-light border-bottom-0 p-4 pb-3">
              <h5 className="modal-title fw-bold">{address ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</h5>
              <button type="button" className="btn-close shadow-none" onClick={onClose} disabled={isSaving}></button>
            </div>
            
            <div className="modal-body p-4 pt-3" style={{ maxHeight: "80vh", overflowY: "auto" }}>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark d-block">Loại địa chỉ</label>
                  <div className="d-flex gap-3 flex-wrap">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="addressType" id="typeHome" value="HOME" checked={form.addressType === "HOME"} onChange={handleChange} />
                      <label className="form-check-label small" htmlFor="typeHome"><i className="fa-solid fa-house me-1 text-muted"></i> Nhà riêng</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="addressType" id="typeWork" value="OFFICE" checked={form.addressType === "OFFICE"} onChange={handleChange} />
                      <label className="form-check-label small" htmlFor="typeWork"><i className="fa-solid fa-briefcase me-1 text-muted"></i> Công ty</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="addressType" id="typeOther" value="OTHER" checked={form.addressType !== "HOME" && form.addressType !== "OFFICE"} onChange={handleChange} />
                      <label className="form-check-label small" htmlFor="typeOther"><i className="fa-solid fa-location-dot me-1 text-muted"></i> Khác</label>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Họ và tên người nhận <span className="text-danger">*</span></label>
                    <input type="text" name="recipientName" className="form-control rounded-3" placeholder="Nhập họ và tên" value={form.recipientName} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Số điện thoại <span className="text-danger">*</span></label>
                    <input type="tel" name="phone" className="form-control rounded-3" placeholder="Nhập số điện thoại" value={form.phone} onChange={handleChange} />
                  </div>
                </div>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Tỉnh / Thành phố <span className="text-danger">*</span></label>
                    <Select
                      options={provinceOptions}
                      value={selectedProvince}
                      onChange={handleProvinceChange}
                      isDisabled={loadingLocations.p}
                      placeholder="Chọn Tỉnh/Thành"
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                      isClearable
                      noOptionsMessage={() => "Không tìm thấy"}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Phường / Xã <span className="text-danger">*</span></label>
                    <Select
                      options={wardOptions}
                      value={selectedWard}
                      onChange={handleWardChange}
                      isDisabled={!form.provinceCode || loadingLocations.w}
                      placeholder="Chọn Phường/Xã"
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                      isClearable
                      noOptionsMessage={() => "Không tìm thấy"}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">Địa chỉ chi tiết <span className="text-danger">*</span></label>
                  <input type="text" name="detailAddress" className="form-control rounded-3" placeholder="Số nhà, tên đường, tòa nhà..." value={form.detailAddress} onChange={handleChange} />
                </div>
                
                <div className="mb-4 d-flex flex-column gap-2">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="isDefault" name="isDefault" checked={form.isDefault} onChange={handleChange} />
                    <label className="form-check-label fw-medium ms-1" htmlFor="isDefault">
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="saveToAddressBook" name="saveToAddressBook" checked={form.saveToAddressBook} onChange={handleChange} />
                    <label className="form-check-label fw-medium ms-1" htmlFor="saveToAddressBook">
                      Lưu thay đổi vào sổ địa chỉ (nếu bỏ chọn, chỉ áp dụng cho đơn hàng này)
                    </label>
                  </div>
                </div>
                
                <div className="d-flex gap-2 justify-content-end pt-3 border-top">
                  <button type="button" className="btn btn-light border px-4 rounded-pill fw-bold" onClick={onClose} disabled={isSaving}>Hủy</button>
                  <button type="submit" className="btn btn-danger px-4 rounded-pill fw-bold d-flex align-items-center gap-2" disabled={isSaving}>
                    {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : null}
                    {isSaving ? "Đang lưu..." : (address ? "Cập nhật" : "Lưu địa chỉ")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddressFormModal;
