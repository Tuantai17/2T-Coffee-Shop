import React, { useState, useEffect } from "react";

function AddressFormModal({ show, onClose, onSave, address, isSaving }) {
  const [form, setForm] = useState({
    receiverName: "",
    phoneNumber: "",
    province: "",
    district: "",
    ward: "",
    addressLine: "",
    label: "Nhà riêng",
    default: false,
    saveToAddressBook: true, // Only useful for checkout
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState({ p: false, d: false, w: false });
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
          receiverName: address.receiverName || "",
          phoneNumber: address.phoneNumber || address.phone || "",
          province: address.province || address.provinceName || "",
          district: address.district || address.districtName || "",
          ward: address.ward || address.wardName || "",
          addressLine: address.addressLine || address.detailAddress || "",
          label: address.label || address.addressType || "Nhà riêng",
          default: address.default || address.isDefault || false,
          saveToAddressBook: true,
        });
        
        // Try to load districts/wards if province/district are pre-selected
        // In a perfect scenario, we would match codes, but here we match names
        if (address.province || address.provinceName) {
           loadDistrictsByProvinceName(address.province || address.provinceName, address.district || address.districtName);
        }
      } else {
        setForm({
          receiverName: "",
          phoneNumber: "",
          province: "",
          district: "",
          ward: "",
          addressLine: "",
          label: "Nhà riêng",
          default: false,
          saveToAddressBook: true,
        });
        setDistricts([]);
        setWards([]);
      }
      setError("");
    }
  }, [show, address]);

  const fetchProvinces = async () => {
    try {
      setLoadingLocations(prev => ({ ...prev, p: true }));
      const res = await fetch("https://provinces.open-api.vn/api/p/");
      const data = await res.json();
      setProvinces(data);
    } catch (err) {
      console.error("Lỗi tải tỉnh thành:", err);
    } finally {
      setLoadingLocations(prev => ({ ...prev, p: false }));
    }
  };

  const loadDistrictsByProvinceName = async (provinceName, presetDistrict) => {
    try {
      setLoadingLocations(prev => ({ ...prev, d: true }));
      // Fetch all provinces with districts to find the matching one
      const res = await fetch("https://provinces.open-api.vn/api/?depth=2");
      const allData = await res.json();
      const matchedProv = allData.find(p => p.name === provinceName);
      if (matchedProv) {
        setDistricts(matchedProv.districts || []);
        if (presetDistrict) {
            const matchedDist = matchedProv.districts.find(d => d.name === presetDistrict);
            if(matchedDist) {
                loadWardsByDistrictCode(matchedDist.code);
            }
        }
      }
    } catch (err) {
      console.error("Lỗi tải quận huyện:", err);
    } finally {
      setLoadingLocations(prev => ({ ...prev, d: false }));
    }
  };

  const loadDistricts = async (provinceCode) => {
    try {
      setLoadingLocations(prev => ({ ...prev, d: true }));
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await res.json();
      setDistricts(data.districts || []);
      setWards([]); // Reset wards when province changes
      setForm(prev => ({ ...prev, district: "", ward: "" }));
    } catch (err) {
      console.error("Lỗi tải quận huyện:", err);
    } finally {
      setLoadingLocations(prev => ({ ...prev, d: false }));
    }
  };

  const loadWardsByDistrictCode = async (districtCode) => {
    try {
      setLoadingLocations(prev => ({ ...prev, w: true }));
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await res.json();
      setWards(data.wards || []);
    } catch (err) {
      console.error("Lỗi tải phường xã:", err);
    } finally {
      setLoadingLocations(prev => ({ ...prev, w: false }));
    }
  };

  const loadWards = async (districtCode) => {
    try {
      setLoadingLocations(prev => ({ ...prev, w: true }));
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await res.json();
      setWards(data.wards || []);
      setForm(prev => ({ ...prev, ward: "" }));
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

  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setForm(prev => ({ ...prev, province: provinceName }));
    const selectedOption = e.target.options[e.target.selectedIndex];
    const code = selectedOption.getAttribute('data-code');
    if (code) {
      loadDistricts(code);
    } else {
      setDistricts([]);
      setWards([]);
    }
    setError("");
  };

  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    setForm(prev => ({ ...prev, district: districtName }));
    const selectedOption = e.target.options[e.target.selectedIndex];
    const code = selectedOption.getAttribute('data-code');
    if (code) {
      loadWards(code);
    } else {
      setWards([]);
    }
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.receiverName.trim()) {
      setError("Vui lòng nhập họ và tên người nhận."); return;
    }
    if (!form.phoneNumber.trim()) {
      setError("Vui lòng nhập số điện thoại."); return;
    }
    if (!/^[0-9+]{9,15}$/.test(form.phoneNumber.replace(/\s+/g, ""))) {
      setError("Số điện thoại không hợp lệ."); return;
    }
    if (!form.province || !form.district || !form.ward) {
      setError("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã."); return;
    }
    if (!form.addressLine.trim()) {
      setError("Vui lòng nhập địa chỉ chi tiết."); return;
    }
    
    // Add isDefault mapped value for Java backend compatibility
    onSave({ ...form, isDefault: form.default });
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
                      <input className="form-check-input" type="radio" name="label" id="typeHome" value="Nhà riêng" checked={form.label === "Nhà riêng"} onChange={handleChange} />
                      <label className="form-check-label small" htmlFor="typeHome"><i className="fa-solid fa-house me-1 text-muted"></i> Nhà riêng</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="label" id="typeWork" value="Công ty" checked={form.label === "Công ty"} onChange={handleChange} />
                      <label className="form-check-label small" htmlFor="typeWork"><i className="fa-solid fa-briefcase me-1 text-muted"></i> Công ty</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="label" id="typeOther" value="Khác" checked={form.label !== "Nhà riêng" && form.label !== "Công ty"} onChange={handleChange} />
                      <label className="form-check-label small" htmlFor="typeOther"><i className="fa-solid fa-location-dot me-1 text-muted"></i> Khác</label>
                    </div>
                  </div>
                  {form.label !== "Nhà riêng" && form.label !== "Công ty" && (
                     <input type="text" name="label" className="form-control rounded-3 mt-2 form-control-sm" placeholder="Nhập tên loại địa chỉ (VD: Nhà người thân)" value={form.label} onChange={handleChange} />
                  )}
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Họ và tên người nhận <span className="text-danger">*</span></label>
                    <input type="text" name="receiverName" className="form-control rounded-3" placeholder="Nhập họ và tên" value={form.receiverName} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Số điện thoại <span className="text-danger">*</span></label>
                    <input type="tel" name="phoneNumber" className="form-control rounded-3" placeholder="Nhập số điện thoại" value={form.phoneNumber} onChange={handleChange} />
                  </div>
                </div>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-dark">Tỉnh / Thành phố <span className="text-danger">*</span></label>
                    <select name="province" className="form-select rounded-3" value={form.province} onChange={handleProvinceChange} disabled={loadingLocations.p}>
                      <option value="">Chọn Tỉnh/Thành</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.name} data-code={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-dark">Quận / Huyện <span className="text-danger">*</span></label>
                    <select name="district" className="form-select rounded-3" value={form.district} onChange={handleDistrictChange} disabled={!form.province || loadingLocations.d}>
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map(d => (
                        <option key={d.code} value={d.name} data-code={d.code}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-dark">Phường / Xã <span className="text-danger">*</span></label>
                    <select name="ward" className="form-select rounded-3" value={form.ward} onChange={handleChange} disabled={!form.district || loadingLocations.w}>
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map(w => (
                        <option key={w.code} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">Địa chỉ chi tiết <span className="text-danger">*</span></label>
                  <input type="text" name="addressLine" className="form-control rounded-3" placeholder="Số nhà, tên đường, tòa nhà..." value={form.addressLine} onChange={handleChange} />
                </div>
                
                <div className="mb-4 d-flex flex-column gap-2">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="isDefault" name="default" checked={form.default} onChange={handleChange} />
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
