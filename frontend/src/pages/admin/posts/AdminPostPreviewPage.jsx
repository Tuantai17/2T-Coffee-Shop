import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { getAdminPostById } from '../../../services/newsAdminService';

export default function AdminPostPreviewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id === 'preview-draft') {
            const draft = sessionStorage.getItem('post_preview');
            if (draft) {
                setPost(JSON.parse(draft));
                setLoading(false);
            } else {
                navigate('/admin/posts');
            }
        } else {
            loadPost();
        }
    }, [id]);

    const loadPost = async () => {
        try {
            const res = await getAdminPostById(id);
            setPost(res.data);
        } catch (error) {
            console.error("Error loading post", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <AdminLayout><div className="text-center py-5">Đang tải bản xem trước...</div></AdminLayout>;
    if (!post) return <AdminLayout><div className="text-center py-5 text-danger">Không tìm thấy bài viết.</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0">Xem trước bài viết</h2>
                    <span className="badge bg-info text-dark">Chế độ xem trước</span>
                </div>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-xmark me-2"></i> Đóng xem trước
                </button>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">
                    {/* Render style similar to user public view */}
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="mb-4">
                            <span className="text-uppercase text-primary fw-bold small">{post.categoryName || 'Chuyên mục'}</span>
                            <h1 className="fw-bold mt-2 mb-3">{post.title}</h1>
                            
                            <div className="d-flex align-items-center text-muted small mb-4">
                                <span><i className="fa-regular fa-user me-1"></i> {post.authorName || 'Quản trị viên'}</span>
                                <span className="mx-2">•</span>
                                <span><i className="fa-regular fa-calendar me-1"></i> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Chưa đăng'}</span>
                            </div>

                            {post.summary && (
                                <p className="lead fw-bold mb-4">{post.summary}</p>
                            )}

                            {post.thumbnailUrl && (
                                <img src={post.thumbnailUrl} alt={post.title} className="img-fluid rounded mb-5 w-100" />
                            )}
                        </div>

                        {/* Content */}
                        <div 
                            className="article-content ck-content" 
                            style={{ lineHeight: '1.8', fontSize: '1.1rem' }}
                            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                        />
                    </div>
                </div>
            </div>
            
            <style>{`
                .article-content img { max-width: 100%; height: auto; border-radius: 8px; }
                .article-content figure { margin: 2rem 0; text-align: center; }
                .article-content figure.image-style-side { float: right; max-width: 50%; margin-left: 2rem; }
                .article-content figcaption { color: #6c757d; font-size: 0.9em; margin-top: 0.5rem; }
                .article-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
                .article-content table td, .article-content table th { border: 1px solid #dee2e6; padding: 0.75rem; }
                .article-content blockquote { border-left: 4px solid #ced4da; padding-left: 1rem; color: #6c757d; font-style: italic; }
            `}</style>
        </AdminLayout>
    );
}
