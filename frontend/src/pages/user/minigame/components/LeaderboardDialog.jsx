import React, { useEffect, useState } from "react";
import miniGameApi from "../../../../api/miniGameApi";

export default function LeaderboardDialog({ show, onClose, games = [] }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("all");
  const [selectedGameId, setSelectedGameId] = useState(null);

  useEffect(() => {
    if (show && games.length > 0 && !selectedGameId) {
      setSelectedGameId(games[0].id);
    }
  }, [show, games, selectedGameId]);

  useEffect(() => {
    if (show && selectedGameId) {
      fetchLeaderboard();
    }
  }, [show, selectedGameId, period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await miniGameApi.getLeaderboard(selectedGameId, period);
      setData(res.data || []);
    } catch (error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header border-bottom-0 pb-0">
              <h4 className="modal-title fw-bold mg-card-title mb-0">
                <i className="fa-solid fa-crown text-warning me-2"></i>Bảng xếp hạng
              </h4>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body pt-3">
              
              {games.length > 0 && (
                <div className="mb-4">
                  <select 
                    className="form-select rounded-pill bg-light border-0 fw-bold px-4 py-2"
                    value={selectedGameId || ""}
                    onChange={(e) => setSelectedGameId(Number(e.target.value))}
                  >
                    {games.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="d-flex justify-content-center mb-4">
                <div className="btn-group bg-light rounded-pill p-1">
                  <button 
                    className={`btn rounded-pill px-4 btn-sm fw-bold ${period === 'weekly' ? 'btn-warning' : 'btn-light text-muted'}`}
                    onClick={() => setPeriod('weekly')}
                  >Hàng tuần</button>
                  <button 
                    className={`btn rounded-pill px-4 btn-sm fw-bold ${period === 'monthly' ? 'btn-warning' : 'btn-light text-muted'}`}
                    onClick={() => setPeriod('monthly')}
                  >Hàng tháng</button>
                  <button 
                    className={`btn rounded-pill px-4 btn-sm fw-bold ${period === 'all' ? 'btn-warning' : 'btn-light text-muted'}`}
                    onClick={() => setPeriod('all')}
                  >Tất cả</button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status"></div>
                </div>
              ) : data.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {data.map((user) => (
                    <div key={user.rank} className="d-flex align-items-center bg-white p-3 rounded-3 border">
                      <div className="text-center me-3" style={{ width: 30 }}>
                        {user.rank <= 3 ? (
                          <i className={`fa-solid fa-medal fs-4 ${user.rank === 1 ? 'text-warning' : user.rank === 2 ? 'text-secondary' : 'text-danger'}`}></i>
                        ) : (
                          <span className="fw-bold text-muted fs-5">{user.rank}</span>
                        )}
                      </div>
                      <div className="rounded-circle bg-light me-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                        <i className="fa-solid fa-user text-muted"></i>
                      </div>
                      <div className="flex-grow-1">
                        <strong className="d-block">{user.displayName || user.name}</strong>
                        <span className="text-muted small">Đã chơi: {user.playCount || 0} lần</span>
                      </div>
                      <div className="text-end">
                        <strong className="text-warning">{Number(user.score || user.points || 0).toLocaleString("vi-VN")}</strong>
                        <span className="text-muted small ms-1">điểm</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="fa-solid fa-ranking-star fs-1 mb-3 opacity-50"></i>
                  <p>Chưa có ai trong danh sách này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
