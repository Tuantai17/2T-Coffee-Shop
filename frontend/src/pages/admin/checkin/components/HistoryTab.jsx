import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import checkinApi from "../../../../api/checkinApi";

const PAGE_SIZE = 10;

function isAbortError(error) {
  return error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
}

function HistorySkeleton() {
  return (
    <div className="checkin-section-card">
      <div className="checkin-card-body">
        <div className="d-flex flex-column gap-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="checkin-skeleton">
              <div className="checkin-skeleton-block long"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatStatus(status) {
  switch (status) {
    case "SUCCESS":
      return { label: "Thành công", tone: "success" };
    case "FAILED":
      return { label: "Thất bại", tone: "danger" };
    case "DUPLICATE":
      return { label: "Trùng lặp", tone: "warning" };
    default:
      return { label: status || "Không rõ", tone: "muted" };
  }
}

export default function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    programId: "",
    status: "ALL",
    fromDate: "",
    toDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    initialize(controller.signal);
    return () => controller.abort();
  }, []);

  const initialize = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const [historyResponse, programsResponse] = await Promise.all([
        checkinApi.getHistory({}, { signal }),
        checkinApi.getPrograms({}, { signal }),
      ]);
      setHistory(historyResponse.data || []);
      setProgramOptions(programsResponse.data || []);
      setPage(1);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }
      setError("Không thể tải lịch sử điểm danh.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (signal, nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const response = await checkinApi.getHistory(
        {
          search: nextFilters.search || undefined,
          programId: nextFilters.programId || undefined,
          status: nextFilters.status && nextFilters.status !== "ALL" ? nextFilters.status : undefined,
          fromDate: nextFilters.fromDate || undefined,
          toDate: nextFilters.toDate || undefined,
        },
        { signal }
      );
      setHistory(response.data || []);
      setPage(1);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }
      setError("Không thể tải lịch sử điểm danh.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async (event) => {
    event.preventDefault();
    await fetchHistory(undefined, filters);
  };

  const handleClearFilters = async () => {
    const nextFilters = {
      search: "",
      programId: "",
      status: "ALL",
      fromDate: "",
      toDate: "",
    };
    setFilters(nextFilters);
    await fetchHistory(undefined, nextFilters);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await checkinApi.exportHistory({
        search: filters.search || undefined,
        programId: filters.programId || undefined,
        status: filters.status && filters.status !== "ALL" ? filters.status : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      });
      const fileName = `checkin-history-${new Date().toISOString().slice(0, 10)}.csv`;
      saveAs(new Blob([response.data], { type: "text/csv;charset=utf-8" }), fileName);
      toast.success("Đã xuất file lịch sử điểm danh.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể xuất file lịch sử.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch sử điểm danh này không? Việc này sẽ lùi chuỗi của user lại 1 ngày.")) return;
    try {
      await checkinApi.deleteHistory(id);
      toast.success("Đã xóa lịch sử điểm danh thành công.");
      await fetchHistory();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể xóa lịch sử điểm danh.");
    }
  };

  const paginatedRows = history.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));

  if (loading) {
    return <HistorySkeleton />;
  }

  if (error) {
    return (
      <div className="checkin-section-card checkin-error-state">
        <i className="fa-solid fa-circle-exclamation" style={{ color: "#D64545" }}></i>
        <h3>Lỗi tải lịch sử</h3>
        <p>{error}</p>
        <div style={{ marginTop: "20px" }}>
          <button type="button" className="checkin-button checkin-button-primary" onClick={() => fetchHistory()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-section-card">
      <div className="checkin-card-head">
        <div>
          <h2 className="checkin-section-title">Lịch sử điểm danh</h2>
          <p className="checkin-section-description">Tra cứu theo user, chương trình, trạng thái và xuất dữ liệu CSV từ backend.</p>
        </div>
      </div>
      <div className="checkin-card-body">
        <form className="checkin-toolbar" onSubmit={handleApplyFilters}>
          <div className="checkin-toolbar-group">
            <div className="checkin-filter-field">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                className="checkin-input"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="Tên người dùng, email hoặc mã chương trình"
              />
            </div>
            <select
              className="checkin-select"
              value={filters.programId}
              onChange={(event) => setFilters((current) => ({ ...current, programId: event.target.value }))}
            >
              <option value="">Tất cả chương trình</option>
              {programOptions.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <select
              className="checkin-select"
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILED">Thất bại</option>
              <option value="DUPLICATE">Trùng lặp</option>
            </select>
            <input
              type="date"
              className="checkin-input"
              value={filters.fromDate}
              onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))}
              aria-label="Từ ngày"
            />
            <input
              type="date"
              className="checkin-input"
              value={filters.toDate}
              onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))}
              aria-label="Đến ngày"
            />
          </div>
          <div className="checkin-toolbar-group">
            <button type="submit" className="checkin-button checkin-button-secondary">
              <i className="fa-solid fa-filter"></i>
              Lọc
            </button>
            <button type="button" className="checkin-button checkin-button-secondary" onClick={handleClearFilters}>
              <i className="fa-solid fa-rotate-left"></i>
              Xóa lọc
            </button>
            <button type="button" className="checkin-button checkin-button-primary" onClick={handleExport} disabled={exporting}>
              {exporting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-download"></i>}
              {exporting ? "Đang xuất..." : "Xuất CSV"}
            </button>
          </div>
        </form>

        {history.length === 0 ? (
          <div className="checkin-empty-state">
            <i className="fa-regular fa-calendar-xmark" style={{ color: "#D8C8BC" }}></i>
            <h3>Chưa có lịch sử điểm danh</h3>
            <p>Chưa tìm thấy bản ghi nào khớp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <>
            <div className="checkin-data-table-wrap" style={{ marginTop: "18px" }}>
              <table className="checkin-data-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Chương trình</th>
                    <th>Ngày điểm danh</th>
                    <th>Ngày thứ</th>
                    <th>Chuỗi</th>
                    <th>Điểm nhận</th>
                    <th>Voucher</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((record) => {
                    const status = formatStatus(record.status);
                    return (
                      <tr key={record.id}>
                        <td>
                          <div className="checkin-table-user">
                            <div className="checkin-avatar">{record.userName?.charAt(0)?.toUpperCase() || "U"}</div>
                            <div>
                              <div className="checkin-table-primary">{record.userName || `User ${record.userId}`}</div>
                              <div className="checkin-table-secondary">{record.email || `user-${record.userId}`}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="checkin-table-primary">{record.programName || "Chương trình"}</div>
                          <div className="checkin-table-secondary">{record.programCode}</div>
                        </td>
                        <td>
                          <div className="checkin-table-primary">{record.businessDate}</div>
                          <div className="checkin-table-secondary">{record.checkinTime ? String(record.checkinTime).slice(11, 19) : "-"}</div>
                        </td>
                        <td>{record.dayNumber || 0}</td>
                        <td>{record.streakAfter || 0} ngày</td>
                        <td>{Number(record.pointsAwarded || 0).toLocaleString("vi-VN")}</td>
                        <td>{record.voucherId || "-"}</td>
                        <td>
                          <span className={`checkin-pill ${status.tone}`}>{status.label}</span>
                        </td>
                        <td>
                          <div className="checkin-table-actions">
                            <button
                              type="button"
                              className="checkin-button checkin-button-secondary checkin-icon-button"
                              title="Sao chép user id"
                              onClick={async () => {
                                await navigator.clipboard.writeText(String(record.userId));
                                toast.success("Đã sao chép user id.");
                              }}
                            >
                              <i className="fa-regular fa-copy"></i>
                            </button>
                            <button
                              type="button"
                              className="checkin-button checkin-button-secondary checkin-icon-button"
                              title="Sao chép voucher"
                              disabled={!record.voucherId}
                              onClick={async () => {
                                await navigator.clipboard.writeText(record.voucherId || "");
                                toast.success("Đã sao chép mã voucher.");
                              }}
                            >
                              <i className="fa-solid fa-ticket"></i>
                            </button>
                            <button
                              type="button"
                              className="checkin-button checkin-button-secondary checkin-icon-button"
                              title="Xóa lịch sử này (Hỗ trợ test)"
                              onClick={() => handleDeleteRecord(record.id)}
                            >
                              <i className="fa-regular fa-trash-can" style={{ color: "#D64545" }}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="checkin-pagination">
              <div className="checkin-helper-text">
                Hiển thị {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, history.length)} trên tổng {history.length} bản ghi
              </div>
              <div className="checkin-page-controls">
                <button type="button" className="checkin-page-number" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    type="button"
                    className={`checkin-page-number ${page === index + 1 ? "active" : ""}`}
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button type="button" className="checkin-page-number" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
