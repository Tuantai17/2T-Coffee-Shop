import React, { useState, useEffect } from 'react';
// Force Vite recompile
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../layouts/AdminLayout';
import { 
    getAdminPostCategories, 
    createAdminPostCategory, 
    updateAdminPostCategory, 
    deleteAdminPostCategory,
    updateAdminPostCategoryStatus
} from '../../../services/newsAdminService';

export default function AdminPostCategoryPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        slug: '',
        description: '',
        displayOrder: 0,
        status: true
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await getAdminPostCategories({ size: 100, keyword });
            setCategories(res.data.content);
        } catch (error) {
            toast.error("Không thể tải danh sách chuyên mục.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadCategories();
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

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'name' && !isEdit) {
            setFormData(prev => ({
                ...prev,
                name: value,
                slug: generateSlug(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const openAddModal = () => {
        setIsEdit(false);
        setFormData({ id: '', name: '', slug: '', description: '', displayOrder: 0, status: true });
        setShowModal(true);
    };

    const openEditModal = (cat) => {
        setIsEdit(true);
        setFormData({ ...cat });
        setShowModal(true);
    };

    const saveCategory = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.slug) {
            return toast.error("Tên và đường dẫn là bắt buộc.");
        }
        
        try {
            if (isEdit) {
                await updateAdminPostCategory(formData.id, formData);
                toast.success("Cập nhật chuyên mục thành công.");
            } else {
                await createAdminPostCategory(formData);
                toast.success("Thêm chuyên mục thành công.");
            }
            setShowModal(false);
            loadCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra.");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await updateAdminPostCategoryStatus(id, !currentStatus);
            toast.success("Cập nhật trạng thái thành công.");
            loadCategories();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật trạng thái.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa chuyên mục này?")) {
            try {
                await deleteAdminPostCategory(id);
                toast.success("Xóa chuyên mục thành công.");
                loadCategories();
            } catch (error) {
                if (error.response?.status === 409) {
                    toast.error(error.response.data); // Backend error message
                } else {
                    toast.error("Không thể xóa chuyên mục.");
                }
            }
        }
    };

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Quản lý chuyên mục bài viết</h2>
                    <p className="text-muted mb-0">Phân loại và tổ chức nội dung tin tức.</p>
                </div>
                <div>
                    <button className="btn btn-outline-secondary me-2" onClick={loadCategories}>
                        <i className="fa-solid fa-rotate-right me-2"></i> Làm mới
                    </button>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <i className="fa-solid fa-plus me-2"></i> Thêm chuyên mục
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="d-flex w-50">
                        <input 
                            type="text" 
                            className="form-control me-2" 
                            placeholder="Tìm kiếm chuyên mục..." 
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Tìm kiếm</button>
                    </form>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-3" style={{width: '40px'}}><input type="checkbox" className="form-check-input" /></th>
                                    <th>Tên chuyên mục</th>
                                    <th>Slug</th>
                                    <th>Số bài viết</th>
                                    <th>Thứ tự</th>
                                    <th>Trạng thái</th>
                                    <th className="text-end pe-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center py-4">Đang tải dữ liệu...</td></tr>
                                ) : categories.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-4 text-muted">Chưa có chuyên mục nào</td></tr>
                                ) : (
                                    categories.map(cat => (
                                        <tr key={cat.id}>
                                            <td className="ps-3"><input type="checkbox" className="form-check-input" /></td>
                                            <td className="fw-bold">{cat.name}</td>
                                            <td><span className="text-muted">{cat.slug}</span></td>
                                            <td><span className="badge bg-secondary">{cat.postCount || 0}</span></td>
                                            <td>{cat.displayOrder || 0}</td>
                                            <td>
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        checked={cat.status} 
                                                        onChange={() => handleToggleStatus(cat.id, cat.status)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="text-end pe-3">
                                                <div className="btn-group">
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(cat)} title="Sửa">
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat.id)} title="Xóa">
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
                </div>
            </div>

            {/* Modal Add/Edit */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">{isEdit ? 'Sửa chuyên mục' : 'Thêm chuyên mục mới'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={saveCategory}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Tên chuyên mục <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Đường dẫn (Slug) <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Mô tả</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="2"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                        ></textarea>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Thứ tự hiển thị</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                name="displayOrder"
                                                value={formData.displayOrder}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3 d-flex align-items-end pb-2">
                                            <div className="form-check form-switch">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    name="status"
                                                    id="catStatus"
                                                    checked={formData.status}
                                                    onChange={handleFormChange}
                                                />
                                                <label className="form-check-label fw-bold" htmlFor="catStatus">Kích hoạt</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn btn-primary">{isEdit ? 'Cập nhật' : 'Thêm mới'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
