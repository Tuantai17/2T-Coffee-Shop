import EmptyState from "./EmptyState";
import { formatDateTime, formatNumber, parsePlayData } from "../minigameUtils";

export default function PlaySessionTable({ sessions, loading }) {
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
            <th>Player</th>
            <th>Game</th>
            <th>Result</th>
            <th>Reward</th>
            <th>Point</th>
            <th>Voucher</th>
            <th>Attempts</th>
            <th>Duration</th>
            <th>Device</th>
            <th>IP</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sessions.length === 0 ? (
            <tr>
              <td colSpan="11">
                <EmptyState title="Chua co luot choi" description="Play session se hien thi tai day." icon="fa-clock-rotate-left" />
              </td>
            </tr>
          ) : sessions.map((session) => {
            const playData = parsePlayData(session.playDataJson);
            return (
              <tr key={session.id}>
                <td>#{session.userId}</td>
                <td>{session.gameName}</td>
                <td>{session.result}</td>
                <td>{session.rewardName || "-"}</td>
                <td>{session.pointEarned ? `${formatNumber(session.pointEarned)} diem` : "-"}</td>
                <td>{session.voucherId || "-"}</td>
                <td>{playData.attempts || playData.spinCount || "-"}</td>
                <td>{playData.durationSeconds ? `${playData.durationSeconds}s` : "-"}</td>
                <td>{session.deviceInfo || "-"}</td>
                <td>{session.ipAddress || "-"}</td>
                <td>{formatDateTime(session.playedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
