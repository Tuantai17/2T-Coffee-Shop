import { useState } from "react";
import { toast } from "react-hot-toast";
import uploadService from "../../../../services/uploadService";

export default function ImageUploadField({ label, value, onChange, folder = "mini-games" }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      setUploading(true);
      const url = await uploadService.uploadImage(file, folder);
      onChange(url);
      toast.success("Tai anh thanh cong");
    } catch (error) {
      toast.error("Khong the tai anh");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div>
      <label className="form-label fw-semibold">{label}</label>
      <div className="minigame-image-picker">
        <div className="minigame-image-preview">
          {value ? (
            <img src={value} alt={label} />
          ) : (
            <div className="minigame-image-placeholder">
              <i className="fa-regular fa-image"></i>
            </div>
          )}
        </div>
        <div className="d-flex flex-column gap-2 flex-grow-1">
          <input
            type="text"
            className="form-control"
            value={value || ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Dan URL anh hoac tai file"
          />
          <label className="btn btn-outline-secondary btn-sm align-self-start mb-0">
            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
            <i className="fa-solid fa-upload me-2"></i>
            {uploading ? "Dang tai..." : "Tai anh"}
          </label>
        </div>
      </div>
    </div>
  );
}
