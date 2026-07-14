import SearchToolbar from "../components/SearchToolbar";
import RewardTable from "../components/RewardTable";
import { REWARD_TYPE_OPTIONS, STATUS_OPTIONS } from "../constants";

export default function RewardManagementPage({
  filters,
  setFilters,
  rewards,
  loading,
  probabilityTotal,
  gameOptions,
  onRefresh,
  onCreate,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
}) {
  return (
    <div className="d-flex flex-column gap-4">
      <SearchToolbar
        title="Reward CMS"
        description={`Tong xac suat hien tai: ${probabilityTotal.toFixed(2)}%`}
        actions={(
          <div className="d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-outline-secondary" onClick={onExport}>
              <i className="fa-solid fa-file-arrow-down me-2"></i>Export CSV
            </button>
            <button type="button" className="btn btn-primary minigame-primary-button" onClick={onCreate}>
              <i className="fa-solid fa-plus me-2"></i>Them phan thuong
            </button>
          </div>
        )}
      >
        <div className="minigame-filter-row">
          <input
            className="form-control"
            placeholder="Tim reward, voucher..."
            value={filters.search}
            onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value }))}
          />
          <select className="form-select" value={filters.gameId} onChange={(event) => setFilters((previous) => ({ ...previous, gameId: event.target.value }))}>
            <option value="">Tat ca game</option>
            {gameOptions.map((game) => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
          <select className="form-select" value={filters.rewardType} onChange={(event) => setFilters((previous) => ({ ...previous, rewardType: event.target.value }))}>
            {REWARD_TYPE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select className="form-select" value={filters.status} onChange={(event) => setFilters((previous) => ({ ...previous, status: event.target.value }))}>
            {STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <button type="button" className="btn btn-primary minigame-primary-button" onClick={onRefresh}>
            <i className="fa-solid fa-filter me-2"></i>Loc
          </button>
        </div>
      </SearchToolbar>

      <div className="minigame-panel">
        <RewardTable rewards={rewards} loading={loading} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
      </div>
    </div>
  );
}
