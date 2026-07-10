import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

function CheckInFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFaq, setEditFaq] = useState({
    question: '',
    answer: '',
    category: 'GENERAL',
    displayOrder: 1
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/check-ins/faq');
      setFaqs(res);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách FAQ');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/api/admin/check-ins/faq/${id}/status`, { status });
      toast.success('Cập nhật trạng thái thành công');
      fetchFaqs();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const deleteFaq = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      try {
        await axiosClient.delete(`/api/admin/check-ins/faq/${id}`);
        toast.success('Xóa câu hỏi thành công');
        fetchFaqs();
      } catch (error) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const openModal = (faq = null) => {
    if (faq) {
      setEditFaq(faq);
    } else {
      setEditFaq({
        question: '',
        answer: '',
        category: 'GENERAL',
        displayOrder: faqs.length + 1
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    try {
      if (editFaq.id) {
        await axiosClient.put(`/api/admin/check-ins/faq/${editFaq.id}`, editFaq);
      } else {
        await axiosClient.post('/api/admin/check-ins/faq', editFaq);
      }
      toast.success('Lưu FAQ thành công');
      fetchFaqs();
      closeModal();
    } catch (error) {
      toast.error('Lưu thất bại');
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Câu hỏi thường gặp (FAQ)</h3>
            <p className="text-muted mb-0">Quản lý nội dung hướng dẫn điểm danh cho người dùng</p>
          </div>
          <button className="btn btn-primary rounded-pill px-4" onClick={() => openModal()}>
            <i className="fa-solid fa-plus me-2"></i> Thêm câu hỏi
          </button>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center p-5 text-muted">
                <i className="fa-regular fa-circle-question fs-1 mb-3"></i>
                <h5>Chưa có câu hỏi nào</h5>
                <p>Hãy thêm các câu hỏi thường gặp để hỗ trợ người dùng tốt hơn.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Thứ tự</th>
                      <th>Phân loại</th>
                      <th>Câu hỏi</th>
                      <th>Trạng thái</th>
                      <th className="text-end pe-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map(faq => (
                      <tr key={faq.id}>
                        <td className="ps-4 fw-bold">{faq.displayOrder}</td>
                        <td>
                          <span className="badge bg-light text-dark border">{faq.category}</span>
                        </td>
                        <td>
                          <div className="fw-bold">{faq.question}</div>
                          <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>{faq.answer}</div>
                        </td>
                        <td>
                          {faq.status === 'ACTIVE' ? (
                            <span className="badge bg-success">Hiển thị</span>
                          ) : (
                            <span className="badge bg-secondary">Đã ẩn</span>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          <div className="dropdown">
                            <button className="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown">
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                              <li><button className="dropdown-item" onClick={() => openModal(faq)}><i className="fa-solid fa-pen me-2 text-muted"></i>Chỉnh sửa</button></li>
                              {faq.status === 'INACTIVE' ? (
                                <li><button className="dropdown-item" onClick={() => updateStatus(faq.id, 'ACTIVE')}><i className="fa-solid fa-eye me-2 text-success"></i>Hiển thị</button></li>
                              ) : (
                                <li><button className="dropdown-item" onClick={() => updateStatus(faq.id, 'INACTIVE')}><i className="fa-solid fa-eye-slash me-2 text-warning"></i>Ẩn</button></li>
                              )}
                              <li><hr className="dropdown-divider" /></li>
                              <li><button className="dropdown-item text-danger" onClick={() => deleteFaq(faq.id)}><i className="fa-solid fa-trash me-2"></i>Xóa</button></li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">{editFaq.id ? 'Chỉnh sửa Câu hỏi' : 'Thêm Câu hỏi mới'}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-4">
                <form id="faqForm" onSubmit={handleSaveFaq}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-bold">Danh mục</label>
                      <select className="form-select" value={editFaq.category} onChange={(e) => setEditFaq({...editFaq, category: e.target.value})}>
                        <option value="GENERAL">Chung</option>
                        <option value="RULES">Luật chơi</option>
                        <option value="REWARDS">Phần thưởng</option>
                        <option value="ISSUES">Sự cố</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Thứ tự hiển thị</label>
                      <input type="number" className="form-control" value={editFaq.displayOrder} onChange={(e) => setEditFaq({...editFaq, displayOrder: parseInt(e.target.value)})} min="1" />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Câu hỏi (Question) <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" value={editFaq.question} onChange={(e) => setEditFaq({...editFaq, question: e.target.value})} required placeholder="Vd: Làm sao để nhận điểm?" />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Câu trả lời (Answer) <span className="text-danger">*</span></label>
                      <textarea className="form-control" rows="5" value={editFaq.answer} onChange={(e) => setEditFaq({...editFaq, answer: e.target.value})} required placeholder="Nội dung trả lời chi tiết..."></textarea>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4 border" onClick={closeModal}>Hủy</button>
                <button type="submit" form="faqForm" className="btn btn-primary rounded-pill px-4">Lưu Câu Hỏi</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default CheckInFaqPage;
