import EmptyState from "./EmptyState";
import { formatDateTime, formatNumber, statusBadgeClass } from "../minigameUtils";

export default function RewardTable({ rewards, loading, onEdit, onDuplicate, onDelete }) {
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
            <th>Game</th>
            <th>Reward</th>
            <th>Type</th>
            <th>Value</th>
            <th>Probability</th>
            <th>Total</th>
            <th>Remaining</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rewards.length === 0 ? (
            <tr>
              <td colSpan="10">
                <EmptyState title="Chua co phan thuong" description="Tao reward cho game de user nhan qua." icon="fa-gift" />
              </td>
            </tr>
          ) : rewards.map((reward) => (
            <tr key={reward.id}>
              <td>{reward.gameName}</td>
              <td>{reward.rewardName}</td>
              <td>{reward.rewardType}</td>
              <td>{reward.rewardType === "POINT" ? `${formatNumber(reward.pointValue)} diem` : reward.voucherId}</td>
              <td>{Number(reward.probability || 0).toFixed(2)}%</td>
              <td>{formatNumber(reward.totalQuantity)}</td>
              <td>{formatNumber(reward.remainingQuantity)}</td>
              <td><span className={`minigame-status-badge ${statusBadgeClass(reward.status)}`}>{reward.status}</span></td>
              <td>{formatDateTime(reward.updatedAt)}</td>
              <td>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => onEdit(reward)}>
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button type="button" className="btn btn-light btn-sm" onClick={() => onDuplicate(reward)}>
                    <i className="fa-regular fa-copy"></i>
                  </button>
                  <button type="button" className="btn btn-light btn-sm text-danger" onClick={() => onDelete(reward.id)}>
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
