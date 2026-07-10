import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../layouts/AdminLayout';
import { 
    getAdminPosts, 
    publishAdminPost, 
    unpublishAdminPost, 
    toggleAdminPostFeatured, 
    deleteAdminPost,
    getAdminPostCategories 
} from '../../../services/newsAdminService';

export default function AdminPostListPage() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    
    const [filter, setFilter] = useState({
        keyword: '',
        categoryId: '',
        status: '',
        isFeatured: ''
    });

    useEffect(() => {
        loadCategories();
        loadPosts();
    }, [page, size]);

    const loadCategories = async () => {
        try {
            const res = await getAdminPostCategories({ size: 100 });
            setCategories(res.data.content || []);
        } catch (error) {
            console.error("Lỗi tải danh mục bài viết", error);
        }
    };

    const loadPosts = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                size,
                ...filter
            };
            const res = await getAdminPosts(params);
            setPosts(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            toast.error("Không thể tải danh sách bài viết.");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    const applyFilter = () => {
        setPage(0);
        loadPosts();
    };

    const clearFilter = () => {
        setFilter({ keyword: '', categoryId: '', status: '', isFeatured: '' });
        setPage(0);
        setTimeout(() => loadPosts(), 0);
    };

    const handlePublish = async (id, isPublished) => {
        try {
            if (isPublished) {
                await unpublishAdminPost(id);
                toast.success("Gỡ bài viết thành công.");
            } else {
                await publishAdminPost(id);
                toast.success("Đăng bài viết thành công.");
            }
            loadPosts();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật trạng thái.");
        }
    };

    const handleToggleFeatured = async (id, currentVal) => {
        try {
            await toggleAdminPostFeatured(id, !currentVal);
            toast.success("Cập nhật hiển thị trang chủ thành công.");
            loadPosts();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật hiển thị.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bài viết sẽ bị ẩn khỏi website và chuyển sang trạng thái đã xóa. Bạn có chắc muốn xóa?")) {
            try {
                await deleteAdminPost(id);
                toast.success("Xóa bài viết thành công.");
                loadPosts();
            } catch (error) {
                toast.error("Không thể xóa bài viết.");
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PUBLISHED': return <span className="badge bg-success">Đã đăng</span>;
            case 'DRAFT': return <span className="badge bg-warning text-dark">Bản nháp</span>;
            case 'HIDDEN': return <span className="badge bg-secondary">Đã ẩn</span>;
            default: return <span className="badge bg-secondary">{status}</span>;
        }
    };

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Quản lý bài viết</h2>
                    <p className="text-muted mb-0">Quản lý nội dung tin tức, bài viết và trạng thái hiển thị trên website.</p>
                </div>
                <div>
                    <button className="btn btn-outline-secondary me-2" onClick={loadPosts}>
                        <i className="fa-solid fa-rotate-right me-2"></i> Làm mới
                    </button>
                    <Link to="/admin/posts/create" className="btn btn-primary">
                        <i className="fa-solid fa-plus me-2"></i> Thêm bài viết
                    </Link>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Tìm kiếm tiêu đề, slug..." 
                                name="keyword"
                                value={filter.keyword}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" name="categoryId" value={filter.categoryId} onChange={handleFilterChange}>
                                <option value="">Tất cả chuyên mục</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" name="status" value={filter.status} onChange={handleFilterChange}>
                                <option value="">Tất cả trạng thái</option>
                                <option value="DRAFT">Bản nháp</option>
                                <option value="PUBLISHED">Đã đăng</option>
                                <option value="HIDDEN">Đã ẩn</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" name="isFeatured" value={filter.isFeatured} onChange={handleFilterChange}>
                                <option value="">Hiển thị trang chủ</option>
                                <option value="true">Có</option>
                                <option value="false">Không</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex gap-2">
                            <button className="btn btn-primary flex-grow-1" onClick={applyFilter}>Áp dụng</button>
                            <button className="btn btn-light flex-grow-1" onClick={clearFilter}>Xóa lọc</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-3" style={{width: '40px'}}><input type="checkbox" className="form-check-input" /></th>
                                    <th>Ảnh</th>
                                    <th>Tiêu đề</th>
                                    <th>Chuyên mục</th>
                                    <th>Trạng thái</th>
                                    <th>Trang chủ</th>
                                    <th>Lượt xem</th>
                                    <th>Ngày đăng</th>
                                    <th className="text-end pe-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="9" className="text-center py-4">Đang tải dữ liệu...</td></tr>
                                ) : posts.length === 0 ? (
                                    <tr><td colSpan="9" className="text-center py-4 text-muted">Chưa có bài viết nào</td></tr>
                                ) : (
                                    posts.map(post => (
                                        <tr key={post.id}>
                                            <td className="ps-3"><input type="checkbox" className="form-check-input" /></td>
                                            <td>
                                                <img src={post.thumbnailUrl || 'https://via.placeholder.com/80x50'} alt="thumbnail" 
                                                     style={{width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                                            </td>
                                            <td>
                                                <div className="fw-bold text-truncate" style={{maxWidth: '250px'}} title={post.title}>{post.title}</div>
                                                <small className="text-muted text-truncate d-block" style={{maxWidth: '250px'}}>{post.slug}</small>
                                            </td>
                                            <td>{post.categoryName}</td>
                                            <td>{getStatusBadge(post.status)}</td>
                                            <td>
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        checked={post.isFeatured} 
                                                        onChange={() => handleToggleFeatured(post.id, post.isFeatured)}
                                                    />
                                                </div>
                                            </td>
                                            <td>{post.viewCount || 0}</td>
                                            <td>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : '-'}</td>
                                            <td className="text-end pe-3">
                                                <div className="btn-group">
                                                    {post.status === 'DRAFT' || post.status === 'HIDDEN' ? (
                                                        <button className="btn btn-sm btn-outline-success" onClick={() => handlePublish(post.id, false)} title="Đăng bài">
                                                            <i className="fa-solid fa-paper-plane"></i>
                                                        </button>
                                                    ) : (
                                                        <button className="btn btn-sm btn-outline-warning" onClick={() => handlePublish(post.id, true)} title="Gỡ bài">
                                                            <i className="fa-solid fa-eye-slash"></i>
                                                        </button>
                                                    )}
                                                    <Link to={`/admin/posts/${post.id}/preview`} className="btn btn-sm btn-outline-info" title="Xem trước">
                                                        <i className="fa-solid fa-eye"></i>
                                                    </Link>
                                                    <Link to={`/admin/posts/${post.id}/edit`} className="btn btn-sm btn-outline-primary" title="Sửa">
                                                        <i className="fa-solid fa-pen"></i>
                                                    </Link>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(post.id)} title="Xóa">
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center p-3 border-top">
                            <div className="text-muted small">
                                Hiển thị trang {page + 1} / {totalPages}
                            </div>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(page - 1)}>Trước</button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setPage(i)}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(page + 1)}>Sau</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
