import { useState } from "react";
import { Link } from "react-router-dom";
import { applyImageFallback, resolveImageUrl } from "../../../../utils/imageFallback";

const categoryStyles = [
  { color: "#ffd200", img: "https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=150" }, // LEGO
  { color: "#ff8da1", img: "https://images.unsplash.com/photo-1559251606-c623743a6d76?w=150" }, // Búp bê
  { color: "#3ba2ff", img: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=150" }, // Siêu xe
  { color: "#5cdb5c", img: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=150" }, // Giáo dục
  { color: "#a55cff", img: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=150" }  // Robot
];

function HomeCategorySlider({ categories }) {
  const [page, setPage] = useState(0);
  
  const itemsPerPage = 5; // Hiển thị 5 danh mục / lượt nhìn trên desktop
  const parentCategories = categories.filter(cat => !cat.parentId);
  const totalPages = Math.ceil(parentCategories.length / itemsPerPage);
  
  const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 0));
  const handleNextPage = () => setPage(prev => Math.min(prev + 1, totalPages - 1));

  const currentCategories = parentCategories.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h3 className="fw-extrabold text-danger mb-1" style={{ fontSize: "1.75rem" }}>DANH MỤC NỔI BẬT</h3>
      </div>
      
      <div className="position-relative px-md-5">
        {parentCategories.length > itemsPerPage && (
          <button
            className="btn btn-light rounded-circle shadow position-absolute start-0 top-50 translate-middle-y d-none d-md-flex align-items-center justify-content-center border"
            style={{ width: "45px", height: "45px", zIndex: 10, opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? "not-allowed" : "pointer" }}
            onClick={handlePrevPage}
            disabled={page === 0}
          >
            <i className="fa-solid fa-chevron-left text-danger fs-5"></i>
          </button>
        )}

        {/* Thêm overflow-auto cho mobile để có thể vuốt ngang nếu không dùng nút */}
        <div className="row justify-content-center text-center g-4 align-items-center flex-nowrap overflow-auto hide-scrollbar" style={{ paddingBottom: '10px' }}>
          {parentCategories.length === 0 ? (
            <div className="text-muted">Không có danh mục nào.</div>
          ) : (
            currentCategories.map((cat, idx) => {
              const absoluteIdx = page * itemsPerPage + idx;
              const style = categoryStyles[absoluteIdx % categoryStyles.length];
              return (
                <Link
                  to={`/products?category=${cat.id}`}
                  className="col-auto mx-lg-3 text-decoration-none category-item"
                  key={cat.id || absoluteIdx}
                  style={{ width: "160px", minWidth: "120px" }}
                >
                  <div className="category-circle mx-auto d-flex align-items-center justify-content-center transition-transform" 
                       style={{ backgroundColor: style.color + "25", width: "120px", height: "120px", borderRadius: "50%", transition: "transform 0.3s" }}
                       onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                       onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <img
                      src={resolveImageUrl(cat.imageUrl, style.img)}
                      alt={cat.name}
                      className="rounded-circle"
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                      onError={(event) => applyImageFallback(event, style.img)}
                    />
                  </div>
                  <span className="fw-bold text-dark d-block mt-3" style={{ fontSize: "1rem" }}>{cat.name}</span>
                </Link>
              );
            })
          )}
        </div>

        {parentCategories.length > itemsPerPage && (
          <button
            className="btn btn-light rounded-circle shadow position-absolute end-0 top-50 translate-middle-y d-none d-md-flex align-items-center justify-content-center border"
            style={{ width: "45px", height: "45px", zIndex: 10, opacity: page === totalPages - 1 ? 0.4 : 1, cursor: page === totalPages - 1 ? "not-allowed" : "pointer" }}
            onClick={handleNextPage}
            disabled={page === totalPages - 1}
          >
            <i className="fa-solid fa-chevron-right text-danger fs-5"></i>
          </button>
        )}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default HomeCategorySlider;
