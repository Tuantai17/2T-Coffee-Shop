import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "../../../layouts/AdminLayout";
import {
  getAdminStoreContactInfo,
  updateAdminStoreContactInfo,
} from "../../../services/contactAdminService";

function AdminStoreContactPage() {
  const [form, setForm] = useState({
    phone: "",
    address: "",
    googleMapsUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const isRequestCanceled = (error) =>
    error?.code === "ERR_CANCELED" || error?.name === "CanceledError";

  const fetchStoreContact = async ({ signal } = {}) => {
    try {
      const res = await getAdminStoreContactInfo({ signal });
      if (res?.data) {
        setForm({
          phone: res.data.phone || "",
          address: res.data.address || "",
          googleMapsUrl: res.data.googleMapsUrl || "",
        });
      }
    } catch (err) {
      if (isRequestCanceled(err) || signal?.aborted) {
        return;
      }
      console.error("Lỗi tải cấu hình cửa hàng:", err);
      toast.error("Không thể tải cấu hình cửa hàng.");
    } finally {
      if (!signal?.aborted) {
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStoreContact({ signal: controller.signal });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "googleMapsUrl") {
      const match = value.match(/src="([^"]+)"/);
      if (match && match[1]) {
        value = match[1];
      }
    }
    setForm((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone.trim() || !form.address.trim()) {
      toast.error("Số điện thoại và địa chỉ không được để trống.");
      return;
    }

    setLoading(true);
    try {
      await updateAdminStoreContactInfo(form);
      toast.success("Cập nhật thông tin cửa hàng thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật cấu hình:", err);
      toast.error("Không thể cập nhật thông tin cửa hàng.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Thông tin cửa hàng</h4>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Ví dụ: 0901234567"
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Địa chỉ cửa hàng <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ đầy đủ"
                    disabled={loading}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Google Maps URL / Iframe Embed</label>
                  <textarea
                    className="form-control"
                    name="googleMapsUrl"
                    value={form.googleMapsUrl}
                    onChange={handleChange}
                    rows="4"
                    placeholder='Vào Google Maps > Chia sẻ > Nhúng bản đồ > Sao chép HTML và dán vào đây'
                    disabled={loading}
                  ></textarea>
                  <div className="form-text mt-2 text-primary fw-medium">
                    <i className="fa-solid fa-circle-info me-1"></i>
                    Hướng dẫn: Tại Google Maps, chọn "Chia sẻ" (Share) {'>'} Chọn qua tab "Nhúng bản đồ" (Embed a map) {'>'} Bấm "Sao chép HTML" và dán vào đây.
                    (Lưu ý: URL ngắn dạng maps.app.goo.gl sẽ không hiển thị được do chính sách của Google).
                  </div>
                </div>
              </div>

              <div className="mt-4 text-end">
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>ĐANG LƯU...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-save me-2"></i>LƯU THÔNG TIN
                    </>
                  )}
                </button>
              </div>
            </form>

            {form.googleMapsUrl && (
              <div className="mt-5 border-top pt-4">
                <h6 className="fw-bold mb-3">Bản xem trước Bản đồ:</h6>
                <div
                  className="rounded-3 overflow-hidden border shadow-sm"
                  style={{ height: "300px", maxWidth: "800px" }}
                >
                  <iframe
                    src={form.googleMapsUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps Preview"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminStoreContactPage;
