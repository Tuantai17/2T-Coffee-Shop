import EmptyState from "./EmptyState";
import { formatDateTime, formatNumber, statusBadgeClass } from "../minigameUtils";

export default function GameTable({
  games,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onEdit,
  onAnalytics,
  onRewards,
  onHistory,
  onClone,
  onToggleStatus,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="minigame-panel minigame-loading-panel">
        <div className="spinner-border text-warning" role="status"></div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table minigame-table align-middle mb-0">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={games.length > 0 && selectedIds.length === games.length}
                onChange={(event) => onToggleSelectAll(event.target.checked)}
              />
            </th>
            <th>Game</th>
            <th>Code</th>
            <th>Type</th>
            <th>Version</th>
            <th>Status</th>
            <th>Visible</th>
            <th>Featured</th>
            <th>Limit</th>
            <th>Players</th>
            <th>Plays</th>
            <th>Rewards</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {games.length === 0 ? (
            <tr>
              <td colSpan="14">
                <EmptyState title="Khong co game phu hop" description="Thu doi bo loc hoac tao game moi." icon="fa-gamepad" />
              </td>
            </tr>
          ) : games.map((game) => (
            <tr key={game.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(game.id)}
                  onChange={() => onToggleSelect(game.id)}
                />
              </td>
              <td>
                <div className="d-flex align-items-center gap-3">
                  <img className="minigame-table-thumb" src={game.thumbnailUrl || "/mykingdom_banner.png"} alt={game.name} />
                  <div>
                    <div className="fw-semibold">{game.name}</div>
                    <small className="text-muted">{game.slug}</small>
                  </div>
                </div>
              </td>
              <td>{game.code}</td>
              <td>{game.type}</td>
              <td>{game.version}</td>
              <td><span className={`minigame-status-badge ${statusBadgeClass(game.status)}`}>{game.status}</span></td>
              <td>{game.visible ? "Yes" : "No"}</td>
              <td>{game.featured ? "Yes" : "No"}</td>
              <td>{formatNumber(game.dailyPlayLimit)}</td>
              <td>{formatNumber(game.players)}</td>
              <td>{formatNumber(game.totalPlays)}</td>
              <td>{formatNumber(game.rewardCount)}</td>
              <td>{formatDateTime(game.updatedAt)}</td>
              <td>
                <div className="d-flex gap-2 flex-wrap">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => onView(game.id)} title="View">
                    <i className="fa-solid fa-eye"></i>
                  </button>
                  <button type="button" className="btn btn-light btn-sm" onClick={() => onEdit(game.id)} title="Edit">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button type="button" className="btn btn-light btn-sm" onClick={() => onAnalytics(game.id)} title="Analytics">
                    <i className="fa-solid fa-chart-line"></i>
                  </button>
                  <button type="button" className="btn btn-light btn-sm" onClick={() => onRewards(game.id)} title="Rewards">
                    <i className="fa-solid fa-gift"></i>
                  </button>
                  <button type="button" className="btn btn-light btn-sm" onClick={() => onHistory(game.id)} title="History">
                    <i className="fa-solid fa-clock-rotate-left"></i>
                  </button>
                  <button type="button" className="btn btn-light btn-sm" onClick={() => onClone(game)} title="Clone">
                    <i className="fa-regular fa-copy"></i>
                  </button>
                  <button type="button" className="btn btn-light btn-sm" onClick={() => onToggleStatus(game)} title="Enable or disable">
                    <i className={`fa-solid ${game.status === "ACTIVE" ? "fa-toggle-on" : "fa-toggle-off"}`}></i>
                  </button>
                  <button type="button" className="btn btn-light btn-sm text-danger" onClick={() => onDelete(game)} title="Delete">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
