import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../../../../services/newsService";
import { applyImageFallback, DEFAULT_IMAGE_FALLBACK } from "../../../../utils/imageFallback";

function HomeNewsSection() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await getNews();
        setNews(res.data || []);
      } catch (error) {
        console.error("Lỗi lấy bài viết:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) return null;
  if (news.length === 0) return null;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2 border-danger border-opacity-25">
        <div>
          <h3 className="fw-extrabold text-dark mb-1" style={{ fontSize: "1.5rem" }}>TIN TỨC</h3>
        </div>
        <Link to="/blog" className="text-danger fw-bold text-decoration-none hover-opacity">
          Xem tất cả bài viết <i className="fa-solid fa-arrow-right-long ms-1"></i>
        </Link>
      </div>

      <div className="row g-4">
        {news.slice(0, 3).map((article) => (
          <div className="col-12 col-md-4" key={article.id}>
            <div className="card h-100 border shadow-sm rounded-4 overflow-hidden d-flex flex-row p-2 align-items-center" style={{ backgroundColor: "#fdfdfd" }}>
              <div className="rounded-3 overflow-hidden" style={{ width: "120px", height: "100px", flexShrink: 0 }}>
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-100 h-100" 
                  style={{ objectFit: "cover" }} 
                  onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)}
                />
              </div>
              <div className="card-body p-3 py-2 d-flex flex-column justify-content-center">
                <Link to={`/blog/${article.slug}`} className="text-decoration-none">
                  <h6 className="card-title fw-bold text-dark mb-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: "0.95rem" }}>
                    {article.title}
                  </h6>
                </Link>
                <p className="card-text text-muted mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: "0.85rem" }}>
                  {article.shortDescription}
                </p>
                <Link to={`/blog/${article.slug}`} className="text-danger fw-bold text-decoration-none" style={{ fontSize: "0.85rem" }}>
                  Đọc thêm <i className="fa-solid fa-angle-right"></i>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeNewsSection;
