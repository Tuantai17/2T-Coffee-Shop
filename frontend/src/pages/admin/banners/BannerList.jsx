import React from "react";

function BannerList({
  banners,
  loading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onToggleActive,
  onPreview,
  onEdit,
  onDelete,
}) {
  const isAllSelected = banners.length > 0 && banners.every(b => selectedIds.includes(b.id));
  const isIndeterminate = !isAllSelected && banners.some(b => selectedIds.includes(b.id));

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    onSelectAll(checked, banners);
  };

  return (
    <div className="neu-card overflow-hidden mb-4">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ minWidth: "1000px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface)", borderBottom: "2px solid rgba(0,0,0,0.05)" }}>
              <th className="px-4 py-3" style={{ width: "40px" }}>
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  style={{ cursor: "pointer" }}
                  checked={isAllSelected}
                  ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                  onChange={handleSelectAllChange}
                />
              </th>
              <th className="py-3 text-muted small fw-bold" style={{ width: "160px" }}>Ảnh banner</th>
              <th className="py-3 text-muted small fw-bold">Tiêu đề <i className="fa-solid fa-arrow-down-a-z ms-1"></i></th>
              <th className="py-3 text-muted small fw-bold">Mô tả</th>
              <th className="py-3 text-muted small fw-bold">Link URL</th>
              <th className="py-3 text-muted small fw-bold text-center" style={{ width: "100px" }}>Thứ tự <i className="fa-solid fa-arrow-down-1-9 ms-1"></i></th>
              <th className="py-3 text-muted small fw-bold text-center" style={{ width: "120px" }}>Trạng thái</th>
              <th className="py-3 text-muted small fw-bold" style={{ width: "140px" }}>Cập nhật</th>
              <th className="py-3 text-muted small fw-bold text-center" style={{ width: "140px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan="9" className="px-4 py-3">
                    <div className="placeholder-glow d-flex gap-3 align-items-center">
                      <span className="placeholder rounded" style={{ width: "120px", height: "40px" }}></span>
                      <span className="placeholder rounded col-3"></span>
                      <span className="placeholder rounded col-4"></span>
                    </div>
                  </td>
                </tr>
              ))
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-5 text-muted">
                  <i className="fa-regular fa-image fs-1 mb-3"></i>
                  <p className="mb-0">Không tìm thấy banner nào.</p>
                </td>
              </tr>
            ) : (
              banners.map(banner => (
                <tr key={banner.id} style={{ borderBottom: "1px dashed rgba(0,0,0,0.05)" }}>
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      style={{ cursor: "pointer" }}
                      checked={selectedIds.includes(banner.id)}
                      onChange={(e) => onSelectOne(banner.id, e.target.checked)}
                    />
                  </td>
                  <td className="py-3 cursor-pointer" onClick={() => onPreview(banner)}>
                    <div 
                      className="rounded-3 shadow-sm bg-white"
                      style={{ 
                        width: "120px", 
                        height: "45px",
                        backgroundImage: `url(${banner.imageUrl || "https://placehold.co/1200x400?text=No+Image"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        border: "1px solid rgba(0,0,0,0.05)"
                      }}
                    />
                  </td>
                  <td className="py-3">
                    <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: "180px" }} title={banner.title}>
                      {banner.title}
                    </div>
                  </td>
                  <td className="py-3 text-muted small text-truncate" style={{ maxWidth: "200px" }} title={banner.subtitle}>
                    {banner.subtitle || "-"}
                  </td>
                  <td className="py-3 text-muted small text-truncate" style={{ maxWidth: "180px" }}>
                    {banner.targetUrl ? (
                      <span className="text-primary text-decoration-none d-flex align-items-center gap-1" title={banner.targetUrl}>
                        {banner.targetUrl}
                        {banner.targetUrl.startsWith('http') && (
                          <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer" className="text-primary" onClick={e=>e.stopPropagation()}>
                            <i className="fa-solid fa-arrow-up-right-from-square ms-1" style={{ fontSize: '10px' }}></i>
                          </a>
                        )}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="py-3 text-center">
                    <span className="badge bg-light text-dark border px-3 py-2 rounded-pill shadow-sm">
                      {banner.sortOrder || 0}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="form-check form-switch d-flex justify-content-center mb-0">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        role="switch" 
                        style={{ cursor: "pointer", width: "40px", height: "20px" }}
                        checked={banner.active}
                        onChange={(e) => onToggleActive(banner, e.target.checked)}
                      />
                    </div>
                  </td>
                  <td className="py-3 text-muted small">
                    <div>22/06/2026</div>
                    <div className="text-black-50">10:30</div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button className="btn btn-sm btn-light text-secondary rounded-circle shadow-sm" style={{ width: "32px", height: "32px" }} title="Xem trước" onClick={() => onPreview(banner)}>
                        <i className="fa-regular fa-eye"></i>
                      </button>
                      <button className="btn btn-sm btn-light text-primary rounded-circle shadow-sm" style={{ width: "32px", height: "32px" }} title="Sửa" onClick={() => onEdit(banner)}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="btn btn-sm btn-light text-danger rounded-circle shadow-sm" style={{ width: "32px", height: "32px" }} title="Xóa" onClick={() => onDelete(banner)}>
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BannerList;
