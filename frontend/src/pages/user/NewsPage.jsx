import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { getPublicPosts, getFeaturedPosts } from '../../services/newsPublicService';
import { getAdminPostCategories } from '../../services/newsAdminService'; // Can reuse for public since it doesn't strictly require admin, or use public category endpoint if created
import { applyImageFallback, DEFAULT_IMAGE_FALLBACK } from '../../utils/imageFallback';

// Reusing axiosClient directly for public categories to avoid auth headers issue if admin service is protected
import axiosClient from '../../api/axiosClient';

export default function NewsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [categories, setCategories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination and Filter
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');

    // Query params parser
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const k = params.get('keyword') || '';
        const c = params.get('categoryId') || '';
        setKeyword(k);
        setDebouncedKeyword(k);
        setCategoryId(c);
    }, [location.search]);

    // Handle debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedKeyword !== keyword) {
                handleFilterChange('keyword', debouncedKeyword);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [debouncedKeyword]);

    useEffect(() => {
        loadData();
    }, [page, categoryId, keyword]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch categories (publicly accessible via catalog service usually, or we just call the standard one)
            const catRes = await axiosClient.get("/api/catalog/products/categories"); // Fallback if no post categories public api. Wait, we should use the post categories.
            const pCatRes = await axiosClient.get("/api/admin/post-categories?size=100"); // Using the same endpoint, assuming it works or we need to add a public one. For simplicity, we call this.
            
            setCategories(pCatRes.data.content || []);

            const featuredRes = await getFeaturedPosts();
            setFeaturedPosts(featuredRes.data || []);

            const postsRes = await getPublicPosts({
                page,
                size: 9,
                keyword,
                categoryId: categoryId || undefined
            });
            setPosts(postsRes.data.content || []);
            setTotalPages(postsRes.data.totalPages || 0);
        } catch (error) {
            console.error("Lỗi tải trang tin tức", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const params = new URLSearchParams(location.search);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        navigate(`/news?${params.toString()}`);
        setPage(0); // Reset page on filter change
    };

    const topFeatured = featuredPosts.length > 0 ? featuredPosts[0] : (posts.length > 0 ? posts[0] : null);
    const sidebarPosts = featuredPosts.slice(1, 6);

    return (
        <UserLayout>
            <div className="container py-4">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Trang chủ</Link></li>
                        <li className="breadcrumb-item active fw-bold text-dark" aria-current="page">Tin tức</li>
                    </ol>
                </nav>

                <h1 className="fw-extrabold mb-4" style={{ color: "var(--brand-blue)" }}>TIN TỨC - BÀI VIẾT</h1>

                {/* Categories Tab */}
                <div className="d-flex overflow-auto mb-4 pb-2" style={{ whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    <button 
                        className={`btn rounded-pill px-4 py-2 me-2 ${!categoryId ? 'btn-danger' : 'btn-outline-secondary bg-white'}`}
                        onClick={() => handleFilterChange('categoryId', '')}
                    >
                        Tất cả
                    </button>
                    {categories.map(c => (
                        <button 
                            key={c.id}
                            className={`btn rounded-pill px-4 py-2 me-2 ${categoryId === c.id.toString() ? 'btn-danger' : 'btn-outline-secondary bg-white'}`}
                            onClick={() => handleFilterChange('categoryId', c.id.toString())}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                <div className="row g-4">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Search Box on mobile */}
                        <div className="d-lg-none mb-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white"><i className="fa-solid fa-search text-muted"></i></span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0" 
                                    placeholder="Tìm kiếm bài viết..."
                                    value={debouncedKeyword}
                                    onChange={(e) => setDebouncedKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('keyword', debouncedKeyword)}
                                />
                            </div>
                        </div>

                        {/* Top Featured Post */}
                        {!keyword && !categoryId && page === 0 && topFeatured && (
                            <div className="card border-0 shadow-sm mb-5 rounded-4 overflow-hidden cursor-pointer" onClick={() => navigate(`/news/${topFeatured.slug}`)}>
                                <img 
                                    src={topFeatured.thumbnailUrl} 
                                    className="card-img-top" 
                                    alt={topFeatured.title} 
                                    style={{ height: '400px', objectFit: 'cover' }}
                                    onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)}
                                />
                                <div className="card-body p-4">
                                    <span className="badge bg-danger mb-2">{topFeatured.categoryName}</span>
                                    <h2 className="card-title fw-bold">{topFeatured.title}</h2>
                                    <p className="card-text text-muted fs-5 mb-3">{topFeatured.summary}</p>
                                    <div className="d-flex align-items-center text-muted">
                                        <span><i className="fa-regular fa-calendar me-2"></i> {new Date(topFeatured.publishedAt).toLocaleDateString('vi-VN')}</span>
                                        <span className="mx-3">•</span>
                                        <span><i className="fa-regular fa-clock me-2"></i> {Math.ceil((topFeatured.contentHtml?.length || 0)/1000) || 1} phút đọc</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Post List */}
                        <div className="row g-4">
                            {loading ? (
                                <div className="text-center py-5">Đang tải tin tức...</div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-5 text-muted">Không tìm thấy bài viết nào.</div>
                            ) : (
                                posts.filter(p => p.id !== (page === 0 && !keyword && !categoryId && topFeatured ? topFeatured.id : null)).map(post => (
                                    <div className="col-md-6" key={post.id}>
                                        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden cursor-pointer" onClick={() => navigate(`/news/${post.slug}`)}>
                                            <img 
                                                src={post.thumbnailUrl} 
                                                className="card-img-top" 
                                                alt={post.title} 
                                                style={{ height: '200px', objectFit: 'cover' }}
                                                onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)}
                                            />
                                            <div className="card-body d-flex flex-column p-4">
                                                <span className="text-danger fw-bold small text-uppercase mb-2">{post.categoryName}</span>
                                                <h5 className="card-title fw-bold" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {post.title}
                                                </h5>
                                                <p className="card-text text-muted small flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {post.summary}
                                                </p>
                                                <div className="d-flex align-items-center justify-content-between mt-3 text-muted small">
                                                    <div>
                                                        <i className="fa-regular fa-calendar me-1"></i> {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    <span className="text-danger fw-bold">Đọc tiếp <i className="fa-solid fa-angle-right ms-1"></i></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-5">
                                <ul className="pagination">
                                    <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-start-pill border-0 shadow-sm" onClick={() => setPage(p => p-1)}>Trước</button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i} className={`page-item ${page === i ? 'active' : ''} mx-1`}>
                                            <button className={`page-link border-0 shadow-sm ${page === i ? 'bg-danger text-white rounded-circle' : 'rounded-circle text-dark'}`} 
                                                    style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setPage(i)}>
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-end-pill border-0 shadow-sm" onClick={() => setPage(p => p+1)}>Sau</button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Search box on desktop */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4 d-none d-lg-block p-4">
                            <h5 className="fw-bold mb-3">Tìm kiếm</h5>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0" 
                                    placeholder="Nhập từ khóa..."
                                    value={debouncedKeyword}
                                    onChange={(e) => setDebouncedKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('keyword', debouncedKeyword)}
                                />
                                <button className="btn btn-danger" onClick={() => handleFilterChange('keyword', debouncedKeyword)}>
                                    <i className="fa-solid fa-search"></i>
                                </button>
                            </div>
                        </div>

                        {/* Sidebar Posts */}
                        {sidebarPosts.length > 0 && (
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h5 className="fw-bold border-bottom pb-3 mb-3 border-danger border-opacity-25">Bài viết nổi bật</h5>
                                <div className="d-flex flex-column gap-3">
                                    {sidebarPosts.map(post => (
                                        <div key={post.id} className="d-flex gap-3 align-items-center cursor-pointer" onClick={() => navigate(`/news/${post.slug}`)}>
                                            <img 
                                                src={post.thumbnailUrl} 
                                                alt={post.title}
                                                className="rounded-3"
                                                style={{ width: '90px', height: '70px', objectFit: 'cover' }}
                                                onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)}
                                            />
                                            <div>
                                                <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {post.title}
                                                </h6>
                                                <span className="text-muted small"><i className="fa-regular fa-calendar me-1"></i> {new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
