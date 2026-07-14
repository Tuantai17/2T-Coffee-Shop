import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import miniGameApi from "../../../../api/miniGameApi";

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("vi-VN");
}

function ProfileMiniGame({ summary: initialSummary = null, unavailable = false }) {
  const [summary, setSummary] = useState(initialSummary);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(!initialSummary && !unavailable);
  const [serviceUnavailable, setServiceUnavailable] = useState(Boolean(unavailable));
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (unavailable) {
      setServiceUnavailable(true);
      setLoading(false);
      setSummary(initialSummary);
      setHistory([]);
      return;
    }

    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const requests = initialSummary
          ? [Promise.resolve({ data: initialSummary }), miniGameApi.getMyGameHistory()]
          : [miniGameApi.getMyGameSummary(), miniGameApi.getMyGameHistory()];
        const [summaryRes, historyRes] = await Promise.all(requests);
        if (!active) {
          return;
        }
        setServiceUnavailable(false);
        setSummary(summaryRes?.data || null);
        setHistory(Array.isArray(historyRes?.data) ? historyRes.data : []);
      } catch (error) {
        if (!active) {
          return;
        }
        setServiceUnavailable([404, 502, 503, 504].includes(error?.response?.status));
        setSummary(initialSummary);
        setHistory([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [initialSummary, unavailable]);

  if (loading) {
    return (
      <div className="card border-0 rounded-4 p-4 bg-white shadow-sm text-center">
        <div className="spinner-border text-warning mx-auto" role="status"></div>
        <div className="text-muted mt-3">Dang tai ho so mini game...</div>
      </div>
    );
  }

  const games = Array.isArray(summary?.games) ? summary.games : [];
  const recentHistory = history.length > 0 ? history : Array.isArray(summary?.recentHistory) ? summary.recentHistory : [];

  return (
    <div className="d-flex flex-column gap-4">
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card border-0 rounded-4 p-4 bg-white shadow-sm h-100">
            <div className="text-muted small text-uppercase fw-bold mb-2">Tong luot choi</div>
            <div className="fw-bold text-dark" style={{ fontSize: "32px" }}>
              {(summary?.totalPlays || 0).toLocaleString("vi-VN")}
            </div>
            <div className="text-muted small mt-2">Bao gom tat ca Memory Match va Lucky Spin</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 rounded-4 p-4 bg-white shadow-sm h-100">
            <div className="text-muted small text-uppercase fw-bold mb-2">Tong diem tu mini game</div>
            <div className="fw-bold text-dark" style={{ fontSize: "32px" }}>
              {(summary?.totalPoints || 0).toLocaleString("vi-VN")}
            </div>
            <div className="text-muted small mt-2">Diem da nhan qua cac luot trung thuong</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 rounded-4 p-4 bg-white shadow-sm h-100">
            <div className="text-muted small text-uppercase fw-bold mb-2">Voucher da nhan</div>
            <div className="fw-bold text-dark" style={{ fontSize: "32px" }}>
              {(summary?.totalVouchers || 0).toLocaleString("vi-VN")}
            </div>
            <div className="text-muted small mt-2">Lan choi gan nhat: {formatDateTime(summary?.lastPlayedAt)}</div>
          </div>
        </div>
      </div>

      {serviceUnavailable ? (
        <div className="alert alert-warning rounded-4 mb-0">
          Mini game service chua san sang tren backend. Frontend da render an toan, nhung de co du lieu that ban can khoi dong lai `mini-game-service` va gateway.
        </div>
      ) : null}

      <div className="card border-0 rounded-4 p-4 bg-white shadow-sm">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <div>
            <h5 className="fw-bold mb-1">Tien do theo tung game</h5>
            <div className="text-muted small">Dong bo luot con lai, diem va voucher ngay trong profile</div>
          </div>
          <Link to="/game" className="btn btn-outline-danger rounded-pill px-3">
            Den Game Center
          </Link>
        </div>
        <div className="row g-3">
          {games.length > 0 ? (
            games.map((game) => (
              <div className="col-md-6" key={game.gameId}>
                <div className="border rounded-4 p-3 h-100" style={{ borderColor: "#f0e4da", background: "#fcfaf7" }}>
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <div className="fw-bold text-dark">{game.gameName}</div>
                      <div className="text-muted small">{game.slug}</div>
                    </div>
                    <Link to={`/game/${game.slug}`} className="btn btn-sm btn-light rounded-pill">
                      Choi ngay
                    </Link>
                  </div>
                  <div className="row g-2 mt-2">
                    <div className="col-4">
                      <div className="text-muted small">Luot choi</div>
                      <div className="fw-semibold">{(game.plays || 0).toLocaleString("vi-VN")}</div>
                    </div>
                    <div className="col-4">
                      <div className="text-muted small">Diem</div>
                      <div className="fw-semibold">{(game.points || 0).toLocaleString("vi-VN")}</div>
                    </div>
                    <div className="col-4">
                      <div className="text-muted small">Con lai</div>
                      <div className="fw-semibold">{(game.remainingPlays || 0).toLocaleString("vi-VN")}</div>
                    </div>
                  </div>
                  <div className="text-muted small mt-3">Lan choi gan nhat: {formatDateTime(game.lastPlayedAt)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center text-muted py-4">
                Chua co du lieu mini game. Hay thu choi mot luot tai Game Center.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card border-0 rounded-4 p-4 bg-white shadow-sm">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <div>
            <h5 className="fw-bold mb-1">Lich su nhan thuong</h5>
            <div className="text-muted small">Bao gom ket qua, diem, voucher va thoi gian choi</div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Game</th>
                <th>Ket qua</th>
                <th>Diem</th>
                <th>Voucher</th>
                <th>Phan thuong</th>
                <th>Thoi gian</th>
              </tr>
            </thead>
            <tbody>
              {recentHistory.length > 0 ? (
                recentHistory.slice(0, 15).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-semibold">{item.gameName}</div>
                      <div className="text-muted small">{item.slug}</div>
                    </td>
                    <td>{item.result}</td>
                    <td>{item.pointEarned ? `${Number(item.pointEarned).toLocaleString("vi-VN")} diem` : "-"}</td>
                    <td>{item.voucherId || "-"}</td>
                    <td>{item.rewardName || "-"}</td>
                    <td>{formatDateTime(item.playedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    Chua co lich su mini game.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProfileMiniGame;
