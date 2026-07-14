import { useState } from "react";
import { toast } from "react-hot-toast";
import uploadService from "../../../../services/uploadService";

export default function MultiImageUploadField({ label, images = [], onChange, folder = "mini-games", maxImages = 20 }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) {
      return;
    }
    
    // Check if total images exceed a reasonable limit
    if (images.length + files.length > maxImages) {
      toast.error(`Bạn chỉ có thể tải lên tối đa ${maxImages} ảnh cho cấu hình này`);
      return;
    }

    try {
      setUploading(true);
      const uploadPromises = files.map(file => uploadService.uploadImage(file, folder));
      const newUrls = await Promise.all(uploadPromises);
      onChange([...images, ...newUrls]);
      toast.success(`Đã tải lên thành công ${newUrls.length} ảnh`);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải ảnh lên");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (images.length >= maxImages) {
      toast.error(`Bạn chỉ có thể tải lên tối đa ${maxImages} ảnh cho cấu hình này`);
      return;
    }
    onChange([...images, urlInput.trim()]);
    setUrlInput("");
  };

  const handleUrlKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUrl();
    }
  };

  const removeImage = (indexToRemove) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="mt-3">
      <label className="form-label fw-semibold">{label}</label>
      
      <div className="d-flex flex-wrap gap-3 mb-2">
        {images.map((url, index) => (
          <div key={index} className="position-relative border rounded p-1 shadow-sm d-flex align-items-center gap-1 bg-white">
            <div className="rounded overflow-hidden" style={{width: 50, height: 50}}>
              <img src={url} alt={`Card ${index} A`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <div className="fw-bold text-muted px-1">=</div>
            <div className="rounded overflow-hidden" style={{width: 50, height: 50}}>
              <img src={url} alt={`Card ${index} B`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <button 
              type="button" 
              className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center translate-middle"
              style={{width: 20, height: 20, borderRadius: '50%'}}
              onClick={() => removeImage(index)}
              title="Xóa ảnh này"
            >
              <i className="fa-solid fa-times" style={{fontSize: 10}}></i>
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="border rounded d-flex align-items-center justify-content-center text-muted bg-light cursor-pointer shadow-sm" style={{width: 110, height: 60, cursor: 'pointer', borderStyle: 'dashed !important'}}>
            <input type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
            {uploading ? (
              <div className="spinner-border spinner-border-sm" role="status"></div>
            ) : (
              <div className="text-center">
                <i className="fa-solid fa-upload d-block mb-1"></i>
                <span style={{fontSize: 10}}>Tải file</span>
              </div>
            )}
          </label>
        )}
      </div>

      {images.length < maxImages && (
        <div className="d-flex gap-2 mb-2" style={{maxWidth: 400}}>
          <input 
            type="text" 
            className="form-control form-control-sm" 
            placeholder="Hoặc dán URL ảnh vào đây..." 
            value={urlInput} 
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleUrlKeyDown}
          />
          <button type="button" className="btn btn-secondary btn-sm px-3" onClick={handleAddUrl}>
            Thêm
          </button>
        </div>
      )}
      
      {images.length > 0 && (
        <div className="small text-muted mb-2">
          Đã tải lên {images.length} ảnh. Bạn có thể kéo thả để tải thêm nhiều ảnh cùng lúc.
        </div>
      )}
    </div>
  );
}
