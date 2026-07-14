import SearchToolbar from "../components/SearchToolbar";
import GameTable from "../components/GameTable";
import { BOOLEAN_FILTER_OPTIONS, GAME_TYPES, STATUS_OPTIONS } from "../constants";
import { formatNumber } from "../minigameUtils";

export default function MiniGameListPage({
  gamesPage,
  loading,
  filters,
  setFilters,
  onSearchSubmit,
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
  onBulkAction,
  onExport,
}) {
  return (
    <div className="d-flex flex-column gap-4">
      <SearchToolbar
        title="Game Management"
        description="Quan ly game, filter theo trang thai, visible, featured va type."
        actions={(
          <div className="d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-outline-secondary" onClick={onExport}>Export</button>
            <button type="button" className="btn btn-outline-secondary" disabled={selectedIds.length === 0} onClick={() => onBulkAction("ACTIVE")}>Enable</button>
            <button type="button" className="btn btn-outline-secondary" disabled={selectedIds.length === 0} onClick={() => onBulkAction("INACTIVE")}>Disable</button>
            <button type="button" className="btn btn-outline-danger" disabled={selectedIds.length === 0} onClick={() => onBulkAction("DELETE")}>Delete</button>
          </div>
        )}
      >
        <form className="minigame-filter-row" onSubmit={onSearchSubmit}>
          <input
            className="form-control"
            placeholder="Tim theo ten, slug, code..."
            value={filters.search}
            onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value }))}
          />
          <select className="form-select" value={filters.type} onChange={(event) => setFilters((previous) => ({ ...previous, type: event.target.value }))}>
            {GAME_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select className="form-select" value={filters.status} onChange={(event) => setFilters((previous) => ({ ...previous, status: event.target.value }))}>
            {STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select className="form-select" value={filters.visible} onChange={(event) => setFilters((previous) => ({ ...previous, visible: event.target.value }))}>
            {BOOLEAN_FILTER_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label} visible</option>)}
          </select>
          <select className="form-select" value={filters.featured} onChange={(event) => setFilters((previous) => ({ ...previous, featured: event.target.value }))}>
            {BOOLEAN_FILTER_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label} featured</option>)}
          </select>
          <button type="submit" className="btn btn-primary minigame-primary-button">
            <i className="fa-solid fa-filter me-2"></i>Loc
          </button>
        </form>
      </SearchToolbar>

      <div className="minigame-panel">
        <GameTable
          games={gamesPage.content}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onToggleSelectAll={onToggleSelectAll}
          onView={onView}
          onEdit={onEdit}
          onAnalytics={onAnalytics}
          onRewards={onRewards}
          onHistory={onHistory}
          onClone={onClone}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
        <div className="minigame-pagination-row">
          <div className="text-muted small">Tong {formatNumber(gamesPage.totalElements)} game</div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-light btn-sm"
              disabled={gamesPage.page <= 0}
              onClick={() => {
                const nextFilter = { ...filters, page: Math.max(0, gamesPage.page - 1) };
                setFilters(nextFilter);
                onSearchSubmit(null, nextFilter);
              }}
            >
              Truoc
            </button>
            <button
              type="button"
              className="btn btn-light btn-sm"
              disabled={gamesPage.page >= gamesPage.totalPages - 1}
              onClick={() => {
                const nextFilter = { ...filters, page: gamesPage.page + 1 };
                setFilters(nextFilter);
                onSearchSubmit(null, nextFilter);
              }}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
