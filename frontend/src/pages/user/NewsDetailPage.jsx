import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { getPublicPostBySlug, getRelatedPosts, incrementPostView } from '../../services/newsPublicService';
import { applyImageFallback, DEFAULT_IMAGE_FALLBACK, resolveImageUrl } from '../../utils/imageFallback';

export default function NewsDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cuộn lên đầu trang mỗi khi đổi bài viết
        window.scrollTo(0, 0);
        loadData();
    }, [slug]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [postRes, relatedRes] = await Promise.all([
                getPublicPostBySlug(slug),
                getRelatedPosts(slug)
            ]);
            
            setPost(postRes.data);
            setRelatedPosts(relatedRes.data || []);
            
            // Increment view in background
            incrementPostView(slug).catch(e => console.error(e));
        } catch (error) {
            console.error("Không tìm thấy bài viết", error);
            navigate('/news');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <UserLayout>
                <div className="container py-5 text-center">Đang tải bài viết...</div>
            </UserLayout>
        );
    }

    if (!post) return null;

    return (
        <UserLayout>
            <div className="container py-4">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/news" className="text-decoration-none text-muted">Tin tức</Link></li>
                        <li className="breadcrumb-item active fw-bold text-dark text-truncate" style={{maxWidth: '300px'}} aria-current="page">{post.title}</li>
                    </ol>
                </nav>

                <div className="row g-4">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                            <div className="card-body p-4 p-md-5">
                                <div className="mb-4">
                                    <span className="badge bg-danger mb-3 px-3 py-2">{post.categoryName}</span>
                                    <h1 className="fw-bolder mb-3" style={{ fontSize: '2rem', lineHeight: '1.3' }}>{post.title}</h1>
                                    
                                    <div className="d-flex align-items-center text-muted flex-wrap gap-3 pb-4 border-bottom border-danger border-opacity-25">
                                        <span><i className="fa-regular fa-user me-2 text-danger"></i> {post.authorName || 'Quản trị viên'}</span>
                                        <span><i className="fa-regular fa-calendar me-2 text-danger"></i> {new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                                        <span><i className="fa-regular fa-eye me-2 text-danger"></i> {post.viewCount || 0} lượt xem</span>
                                    </div>
                                </div>

                                {post.summary && (
                                    <p className="lead fw-bold mb-4" style={{ color: '#444' }}>{post.summary}</p>
                                )}

                                {/* Content HTML from CKEditor */}
                                <div 
                                    className="article-content ck-content" 
                                    style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#2b2b2b' }}
                                    dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                                />
                                
                                <div className="mt-5 pt-4 border-top">
                                    <h6 className="fw-bold mb-3">Chia sẻ bài viết:</h6>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-primary rounded-circle" style={{ width: '40px', height: '40px', padding: 0 }}>
                                            <i className="fa-brands fa-facebook-f"></i>
                                        </button>
                                        <button className="btn btn-info text-white rounded-circle" style={{ width: '40px', height: '40px', padding: 0 }}>
                                            <i className="fa-brands fa-twitter"></i>
                                        </button>
                                        <button className="btn btn-success rounded-circle" onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert("Đã copy link!");
                                        }} style={{ width: '40px', height: '40px', padding: 0 }}>
                                            <i className="fa-solid fa-link"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 sticky-lg-top" style={{ top: '20px', zIndex: 1 }}>
                            <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-danger border-opacity-25">
                                <h5 className="fw-bold mb-0 text-dark">BÀI VIẾT LIÊN QUAN</h5>
                            </div>
                            
                            {relatedPosts.length === 0 ? (
                                <p className="text-muted">Chưa có bài viết liên quan.</p>
                            ) : (
                                <div className="d-flex flex-column gap-4">
                                    {relatedPosts.map(rel => (
                                        <div key={rel.id} className="d-flex flex-column cursor-pointer group" onClick={() => navigate(`/news/${rel.slug}`)}>
                                            <div className="rounded-3 overflow-hidden mb-2" style={{ height: '180px' }}>
                                                <img 
                                                    src={resolveImageUrl(rel.thumbnailUrl)} 
                                                    alt={rel.title}
                                                    className="w-100 h-100 object-fit-cover transition-transform"
                                                    style={{ transition: 'transform 0.3s ease' }}
                                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                                    onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)}
                                                />
                                            </div>
                                            <span className="text-danger small fw-bold mb-1">{rel.categoryName}</span>
                                            <h6 className="fw-bold mb-2 hover-danger" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                                                {rel.title}
                                            </h6>
                                            <span className="text-muted small"><i className="fa-regular fa-calendar me-1"></i> {new Date(rel.publishedAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .article-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
                .article-content figure { margin: 2rem 0; text-align: center; }
                .article-content figure.image-style-side { float: right; max-width: 50%; margin-left: 2rem; margin-bottom: 1rem; }
                .article-content figcaption { color: #6c757d; font-size: 0.9em; margin-top: 0.5rem; font-style: italic; }
                .article-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
                .article-content table td, .article-content table th { border: 1px solid #dee2e6; padding: 0.75rem; }
                .article-content table th { background-color: #f8f9fa; }
                .article-content blockquote { border-left: 4px solid #dc3545; padding-left: 1.25rem; color: #495057; font-style: italic; background: #f8f9fa; padding-top: 1rem; padding-bottom: 1rem; margin-bottom: 1.5rem; border-radius: 0 8px 8px 0; }
                .article-content h2, .article-content h3, .article-content h4 { margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; color: #212529; }
                .article-content a { color: #0d6efd; text-decoration: none; }
                .article-content a:hover { text-decoration: underline; }
                .hover-danger:hover { color: #dc3545 !important; }
            `}</style>
        </UserLayout>
    );
}
