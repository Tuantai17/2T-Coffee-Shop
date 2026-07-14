import SearchToolbar from "../components/SearchToolbar";
import PlaySessionTable from "../components/PlaySessionTable";

export default function MiniGamePlaySessionPage({
  filters,
  setFilters,
  loading,
  sessions,
  groupedTopRewards,
  gameOptions,
  onRefresh,
  onExport,
}) {
  return (
    <div className="d-flex flex-column gap-4">
      <SearchToolbar
        title="Play Session CMS"
        description="Quan ly lich su choi game, tra reward va thong tin session."
        actions={(
          <button type="button" className="btn btn-outline-secondary" onClick={onExport}>
            <i className="fa-solid fa-file-arrow-down me-2"></i>Export CSV
          </button>
        )}
      >
        <div className="minigame-filter-row">
          <select className="form-select" value={filters.gameId} onChange={(event) => setFilters((previous) => ({ ...previous, gameId: event.target.value }))}>
            <option value="">Tat ca game</option>
            {gameOptions.map((game) => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
          <input className="form-control" placeholder="User ID" value={filters.userId} onChange={(event) => setFilters((previous) => ({ ...previous, userId: event.target.value }))} />
          <input type="date" className="form-control" value={filters.fromDate} onChange={(event) => setFilters((previous) => ({ ...previous, fromDate: event.target.value }))} />
          <input type="date" className="form-control" value={filters.toDate} onChange={(event) => setFilters((previous) => ({ ...previous, toDate: event.target.value }))} />
          <button type="button" className="btn btn-primary minigame-primary-button" onClick={onRefresh}>
            <i className="fa-solid fa-filter me-2"></i>Loc
          </button>
        </div>
      </SearchToolbar>

      <div className="minigame-chart-grid">
        <div className="minigame-panel">
          <div className="minigame-panel-head">
            <div>
              <h2>Top Rewards</h2>
              <p>Reward duoc nhan nhieu nhat tu play sessions</p>
            </div>
          </div>
          <div className="d-flex flex-column gap-2">
            {groupedTopRewards.length > 0 ? groupedTopRewards.map((reward) => (
              <div key={reward.name} className="minigame-inline-row">
                <span className="fw-semibold">{reward.name}</span>
                <strong>{reward.value}</strong>
              </div>
            )) : <div className="text-muted small">Chua co reward usage.</div>}
          </div>
        </div>
        <div className="minigame-panel">
          <div className="minigame-panel-head">
            <div>
              <h2>Total Sessions</h2>
              <p>So luot choi tra ve theo bo loc hien tai</p>
            </div>
          </div>
          <div className="minigame-stat-value">{sessions.length}</div>
        </div>
      </div>

      <div className="minigame-panel">
        <PlaySessionTable sessions={sessions} loading={loading} />
      </div>
    </div>
  );
}
