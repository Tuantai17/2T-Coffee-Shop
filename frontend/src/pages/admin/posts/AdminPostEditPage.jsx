import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../layouts/AdminLayout';
import RichTextEditor from '../../../components/editor/RichTextEditor';
import { getAdminPostById, updateAdminPost, getAdminPostCategories } from '../../../services/newsAdminService';

export default function AdminPostEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initialSlug, setInitialSlug] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        summary: '',
        contentHtml: '',
        thumbnailUrl: '',
        categoryId: '',
        status: 'DRAFT',
        isFeatured: false,
        publishedAt: '',
        metaTitle: '',
        metaDescription: ''
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [catRes, postRes] = await Promise.all([
                getAdminPostCategories({ size: 100 }),
                getAdminPostById(id)
            ]);
            
            setCategories(catRes.data.content || []);
            
            const post = postRes.data;
            setInitialSlug(post.slug);
            setFormData({
                title: post.title || '',
                slug: post.slug || '',
                summary: post.summary || '',
                contentHtml: post.contentHtml || '',
                thumbnailUrl: post.thumbnailUrl || '',
                categoryId: post.categoryId || '',
                status: post.status || 'DRAFT',
                isFeatured: post.isFeatured || false,
                publishedAt: post.publishedAt ? post.publishedAt.substring(0, 16) : '',
                metaTitle: post.metaTitle || '',
                metaDescription: post.metaDescription || ''
            });
        } catch (error) {
            toast.error("Không thể tải thông tin bài viết.");
            navigate('/admin/posts');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (text) => {
        return text.toString().toLowerCase()
            .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
            .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
            .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
            .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
            .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
            .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
            .replace(/đ/gi, 'd')
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => {
            // Only auto-generate slug if it hasn't been manually edited or if it matched before
            const newSlug = (prev.slug === initialSlug || !prev.slug) ? generateSlug(title) : prev.slug;
            return { ...prev, title, slug: newSlug };
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, contentHtml: content }));
    };

    const handleThumbnailChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('file', file);
        
        try {
            const { default: axiosClient } = await import('../../../api/axiosClient');
            const res = await axiosClient.post('/api/admin/media/images', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, thumbnailUrl: res.data.url }));
            toast.success("Tải ảnh lên thành công");
        } catch (error) {
            toast.error("Không thể tải ảnh lên.");
        }
    };

    const removeThumbnail = () => {
        setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
    };

    const saveDraft = (e) => {
        e.preventDefault();
        submitForm('DRAFT');
    };

    const saveAndPublish = (e) => {
        e.preventDefault();
        submitForm('PUBLISHED');
    };

    const updateCurrent = (e) => {
        e.preventDefault();
        submitForm(formData.status);
    };

    const submitForm = async (status) => {
        if (!formData.title) return toast.error("Vui lòng nhập tiêu đề bài viết.");
        if (!formData.slug) return toast.error("Đường dẫn (slug) bắt buộc.");
        if (!formData.categoryId) return toast.error("Vui lòng chọn chuyên mục.");
        if (status === 'PUBLISHED' && !formData.contentHtml) return toast.error("Vui lòng nhập nội dung bài viết.");

        setSubmitting(true);
        try {
            const dataToSubmit = { ...formData, status };
            if (status === 'PUBLISHED' && !dataToSubmit.publishedAt) {
                dataToSubmit.publishedAt = new Date().toISOString();
            }
            
            await updateAdminPost(id, dataToSubmit);
            toast.success("Cập nhật bài viết thành công.");
            navigate('/admin/posts');
        } catch (error) {
            if (error.response?.data?.message === 'POST_SLUG_ALREADY_EXISTS' || error.response?.data === 'POST_SLUG_ALREADY_EXISTS') {
                toast.error("Đường dẫn bài viết đã tồn tại. Vui lòng sử dụng đường dẫn khác.");
            } else {
                toast.error("Không thể cập nhật bài viết.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <AdminLayout><div className="text-center py-5">Đang tải dữ liệu...</div></AdminLayout>;
    }

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Sửa bài viết</h2>
                <Link to="/admin/posts" className="btn btn-outline-secondary">
                    <i className="fa-solid fa-arrow-left me-2"></i> Quay lại
                </Link>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Tiêu đề bài viết <span className="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Nhập tiêu đề..." 
                                    name="title"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Đường dẫn (Slug) <span className="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                />
                                {formData.slug !== initialSlug && (
                                    <small className="text-warning"><i className="fa-solid fa-triangle-exclamation"></i> Cảnh báo: Việc thay đổi URL có thể ảnh hưởng đến SEO nếu bài viết đã được index.</small>
                                )}
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Mô tả ngắn</label>
                                <textarea 
                                    className="form-control" 
                                    rows="3" 
                                    placeholder="Tóm tắt nội dung bài viết..."
                                    name="summary"
                                    value={formData.summary}
                                    onChange={handleChange}
                                ></textarea>
                                <div className="text-end text-muted small">{formData.summary.length}/500 ký tự</div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold">Nội dung chi tiết <span className="text-danger">*</span></label>
                                <RichTextEditor 
                                    value={formData.contentHtml} 
                                    onChange={handleEditorChange} 
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Thẻ Meta Title (SEO)</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                />
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold">Thẻ Meta Description (SEO)</label>
                                <textarea 
                                    className="form-control" 
                                    rows="2"
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white fw-bold">Thông tin bài viết</div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Chuyên mục <span className="text-danger">*</span></label>
                                <select 
                                    className="form-select" 
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Chọn chuyên mục --</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Ảnh đại diện</label>
                                {formData.thumbnailUrl ? (
                                    <div className="position-relative mb-2 text-center border p-2 rounded">
                                        <img src={formData.thumbnailUrl} alt="Thumbnail" className="img-fluid rounded" style={{maxHeight: '200px'}} />
                                        <button 
                                            type="button" 
                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                                            onClick={removeThumbnail}
                                        >
                                            <i className="fa-solid fa-times"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border border-dashed p-4 text-center rounded bg-light mb-2">
                                        <i className="fa-solid fa-cloud-arrow-up fs-2 text-muted mb-2"></i>
                                        <p className="mb-1 small">Kéo thả ảnh hoặc click để chọn</p>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="form-control form-control-sm"
                                            onChange={handleThumbnailChange} 
                                        />
                                    </div>
                                )}
                                <small className="text-muted d-block mt-1">Kích thước khuyến nghị: 1200 × 675px. Tối đa 5MB.</small>
                            </div>

                            <div className="mb-3">
                                <div className="form-check form-switch">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id="isFeatured"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label fw-bold" htmlFor="isFeatured">Nổi bật trên trang chủ</label>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold">Trạng thái hiện tại</label>
                                <div>
                                    {formData.status === 'PUBLISHED' && <span className="badge bg-success mb-2 fs-6">Đã đăng</span>}
                                    {formData.status === 'DRAFT' && <span className="badge bg-warning text-dark mb-2 fs-6">Bản nháp</span>}
                                    {formData.status === 'HIDDEN' && <span className="badge bg-secondary mb-2 fs-6">Đã ẩn</span>}
                                </div>
                                <label className="form-label fw-bold mt-2">Ngày đăng (Tùy chọn)</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control"
                                    name="publishedAt"
                                    value={formData.publishedAt}
                                    onChange={handleChange}
                                />
                            </div>

                            <hr />
                            
                            <div className="d-grid gap-2">
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={updateCurrent}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang xử lý...' : <><i className="fa-solid fa-floppy-disk me-2"></i> Cập nhật bài viết</>}
                                </button>
                                {formData.status !== 'PUBLISHED' && (
                                    <button 
                                        type="button" 
                                        className="btn btn-success"
                                        onClick={saveAndPublish}
                                        disabled={submitting}
                                    >
                                        <i className="fa-solid fa-paper-plane me-2"></i> Đăng bài viết
                                    </button>
                                )}
                                <Link 
                                    to={`/admin/posts/${id}/preview`} 
                                    className="btn btn-outline-info"
                                >
                                    <i className="fa-solid fa-eye me-2"></i> Xem trước
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
