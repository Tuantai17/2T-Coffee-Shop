import React from "react";

function BannerPreviewModal({ show, banner, onClose, onEdit }) {
  if (!show || !banner) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1100 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 bg-transparent shadow-none">
          
          {/* Header Action Bar */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-white mb-0 fw-bold">
              <i className="fa-solid fa-desktop me-2"></i> Xem trước kích thước thật
            </h5>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
                onClick={() => { onClose(); onEdit(banner); }}
              >
                <i className="fa-solid fa-pen me-2"></i> Sửa
              </button>
              <button 
                className="btn btn-dark rounded-circle border border-secondary shadow-sm" 
                style={{ width: "38px", height: "38px" }}
                onClick={onClose}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Banner Image Container */}
          <div className="position-relative w-100 overflow-hidden shadow-lg rounded-4 bg-white" style={{ aspectRatio: "16/5", maxWidth: "100%" }}>
            {banner.targetUrl ? (
              <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer" className="d-block w-100 h-100">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  className="w-100 h-100" 
                  style={{ objectFit: "cover" }} 
                />
              </a>
            ) : (
              <img 
                src={banner.imageUrl} 
                alt={banner.title} 
                className="w-100 h-100" 
                style={{ objectFit: "cover" }} 
              />
            )}
          </div>

          {/* Info Card */}
          <div className="card mt-4 border-0 rounded-4 shadow-sm neu-surface">
            <div className="card-body p-4 row g-3">
              <div className="col-md-6">
                <h6 className="fw-bold text-dark mb-1">Tiêu đề (Quản trị):</h6>
                <p className="text-muted mb-0">{banner.title}</p>
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold text-dark mb-1">Mô tả:</h6>
                <p className="text-muted mb-0">{banner.subtitle || "Không có mô tả"}</p>
              </div>
              <div className="col-md-4 mt-3">
                <h6 className="fw-bold text-dark mb-1">Link URL:</h6>
                {banner.targetUrl ? (
                  <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
                    {banner.targetUrl} <i className="fa-solid fa-arrow-up-right-from-square ms-1" style={{ fontSize: '10px' }}></i>
                  </a>
                ) : (
                  <span className="text-muted">Không gắn link</span>
                )}
              </div>
              <div className="col-md-4 mt-3">
                <h6 className="fw-bold text-dark mb-1">Vị trí & Thứ tự:</h6>
                <p className="text-muted mb-0">
                  <span className="badge bg-light text-dark border me-2">{banner.position}</span>
                  Thứ tự: <span className="fw-bold">{banner.sortOrder || 0}</span>
                </p>
              </div>
              <div className="col-md-4 mt-3">
                <h6 className="fw-bold text-dark mb-1">Trạng thái hiện tại:</h6>
                <p className="mb-0">
                  <span className={`badge ${banner.active ? "bg-success" : "bg-secondary"} px-3 py-2 rounded-pill`}>
                    {banner.active ? "Đang hiển thị" : "Đang ẩn"}
                  </span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default BannerPreviewModal;
