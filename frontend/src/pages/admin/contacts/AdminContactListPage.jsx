import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { toast } from "react-hot-toast";
import AdminLayout from "../../../layouts/AdminLayout";
import {
  deleteAdminContactMessage,
  getAdminContactMessages,
  updateAdminContactMessageStatus,
} from "../../../services/contactAdminService";

dayjs.locale("vi");

function AdminContactListPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchVersion, setSearchVersion] = useState(0);
  const [filter, setFilter] = useState({
    keyword: "",
    status: "",
  });
  const [selectedMessage, setSelectedMessage] = useState(null);

  const isRequestCanceled = (error) =>
    error?.code === "ERR_CANCELED" || error?.name === "CanceledError";

  const fetchMessages = async ({ signal } = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        sort: "createdAt,desc",
      };

      if (filter.keyword) params.keyword = filter.keyword;
      if (filter.status) params.status = filter.status;

      const res = await getAdminContactMessages(params, { signal });
      if (res?.data) {
        setMessages(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      if (isRequestCanceled(err) || signal?.aborted) {
        return;
      }
      console.error("Lỗi tải danh sách liên hệ:", err);
      toast.error("Không thể tải danh sách liên hệ.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages({ signal: controller.signal });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter.status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearchVersion((prev) => prev + 1);
  };

  const handleReset = () => {
    setFilter({ keyword: "", status: "" });
    setPage(0);
    setSearchVersion((prev) => prev + 1);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAdminContactMessageStatus(id, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );
      setSelectedMessage((prev) =>
        prev?.id === id ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      toast.error("Không thể cập nhật trạng thái.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa liên hệ này?")) return;

    try {
      await deleteAdminContactMessage(id);
      toast.success("Xóa liên hệ thành công");
      if (messages.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        setSearchVersion((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Lỗi xóa liên hệ:", err);
      toast.error("Không thể xóa liên hệ.");
    }
  };

  const openModal = (msg) => {
    setSelectedMessage(msg);
    if (msg.status === "NEW") {
      handleStatusChange(msg.id, "VIEWED");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "NEW":
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
            Mới
          </span>
        );
      case "VIEWED":
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
            Đã xem
          </span>
        );
      case "PROCESSED":
        return (
          <span className="badge bg-success-subtle text-success border border-success-subtle">
            Đã xử lý
          </span>
        );
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid p-4">
        <h4 className="fw-bold mb-4">Danh sách liên hệ</h4>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-3">
            <form onSubmit={handleSearch} className="row g-3 align-items-center">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Tìm kiếm theo tên, email, sđt..."
                    value={filter.keyword}
                    onChange={(e) =>
                      setFilter((prev) => ({ ...prev, keyword: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filter.status}
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="">Trạng thái: Tất cả</option>
                  <option value="NEW">Mới</option>
                  <option value="VIEWED">Đã xem</option>
                  <option value="PROCESSED">Đã xử lý</option>
                </select>
              </div>
              <div className="col-md-4 d-flex gap-2">
                <button type="submit" className="btn btn-primary px-3">
                  Tìm kiếm
                </button>
                <button
                  type="button"
                  className="btn btn-light border px-3"
                  onClick={handleReset}
                >
                  Làm mới
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-3 ps-4">STT</th>
                    <th className="py-3">Họ và tên</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Số điện thoại</th>
                    <th className="py-3">Ngày gửi</th>
                    <th className="py-3 text-center">Trạng thái</th>
                    <th className="py-3 pe-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Đang tải...</span>
                        </div>
                      </td>
                    </tr>
                  ) : messages.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        Không tìm thấy liên hệ nào.
                      </td>
                    </tr>
                  ) : (
                    messages.map((msg, idx) => (
                      <tr
                        key={msg.id}
                        style={{
                          backgroundColor: msg.status === "NEW" ? "#fff9f9" : "transparent",
                        }}
                      >
                        <td className="ps-4 text-muted">{page * 10 + idx + 1}</td>
                        <td className="fw-semibold">{msg.fullName}</td>
                        <td>{msg.email}</td>
                        <td>{msg.phone}</td>
                        <td className="text-muted small">
                          {dayjs(msg.createdAt).format("DD/MM/YYYY HH:mm")}
                        </td>
                        <td className="text-center">{getStatusBadge(msg.status)}</td>
                        <td className="pe-4 text-center">
                          <button
                            className="btn btn-sm btn-light text-primary me-2 shadow-sm border"
                            onClick={() => openModal(msg)}
                            data-bs-toggle="modal"
                            data-bs-target="#contactDetailModal"
                            title="Xem chi tiết"
                          >
                            <i className="fa-regular fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-light text-success me-2 shadow-sm border"
                            onClick={() => handleStatusChange(msg.id, "PROCESSED")}
                            disabled={msg.status === "PROCESSED"}
                            title="Đánh dấu đã xử lý"
                          >
                            <i className="fa-solid fa-check"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-light text-danger shadow-sm border"
                            onClick={() => handleDelete(msg.id)}
                            title="Xóa"
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && totalPages > 1 && (
            <div className="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
              <span className="text-muted small">
                Hiển thị {page * 10 + 1} đến {Math.min((page + 1) * 10, totalElements)} trong
                tổng số {totalElements}
              </span>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((prev) => prev - 1)}>
                    &laquo;
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(i)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((prev) => prev + 1)}>
                    &raquo;
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="modal fade" id="contactDetailModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-bottom-0 p-4 pb-3">
                <h5 className="modal-title fw-bold">Chi tiết liên hệ</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              {selectedMessage && (
                <div className="modal-body p-4 pt-0">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h6 className="fw-bold mb-1">{selectedMessage.fullName}</h6>
                      <div className="text-muted small d-flex gap-3">
                        <span>
                          <i className="fa-regular fa-envelope me-1"></i>
                          {selectedMessage.email}
                        </span>
                        <span>
                          <i className="fa-solid fa-phone me-1"></i>
                          {selectedMessage.phone}
                        </span>
                      </div>
                    </div>
                    <div>{getStatusBadge(selectedMessage.status)}</div>
                  </div>

                  <div className="bg-light rounded-3 p-3 mb-4">
                    <span className="text-muted small d-block mb-2">Nội dung:</span>
                    <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div className="d-flex justify-content-between align-items-center text-muted small">
                    <span>
                      <i className="fa-regular fa-calendar me-1"></i>
                      {" "}
                      {dayjs(selectedMessage.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                    </span>
                  </div>
                </div>
              )}
              <div className="modal-footer border-top-0 p-4 pt-2">
                <button type="button" className="btn btn-light px-4" data-bs-dismiss="modal">
                  Đóng
                </button>
                {selectedMessage && selectedMessage.status !== "PROCESSED" && (
                  <button
                    type="button"
                    className="btn btn-success px-4"
                    onClick={() => handleStatusChange(selectedMessage.id, "PROCESSED")}
                    data-bs-dismiss="modal"
                  >
                    <i className="fa-solid fa-check me-2"></i>
                    Đánh dấu đã xử lý
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminContactListPage;
