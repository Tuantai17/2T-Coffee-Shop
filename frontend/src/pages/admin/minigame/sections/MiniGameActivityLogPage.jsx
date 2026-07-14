import SearchToolbar from "../components/SearchToolbar";
import ActivityTimeline from "../components/ActivityTimeline";

export default function MiniGameActivityLogPage({
  logs,
  gameId,
  setGameId,
  gameOptions,
  onExport,
}) {
  return (
    <div className="d-flex flex-column gap-4">
      <SearchToolbar
        title="Activity Log UI"
        description="Timeline thao tac admin mini game dua tren audit log hien co."
        actions={(
          <button type="button" className="btn btn-outline-secondary" disabled={!gameId} onClick={onExport}>
            <i className="fa-solid fa-file-arrow-down me-2"></i>Export CSV
          </button>
        )}
      >
        <div className="minigame-filter-row">
          <select className="form-select" value={gameId} onChange={(event) => setGameId(event.target.value)}>
            <option value="">Chon game</option>
            {gameOptions.map((game) => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>
      </SearchToolbar>

      <div className="minigame-panel">
        <ActivityTimeline logs={logs} />
      </div>
    </div>
  );
}
