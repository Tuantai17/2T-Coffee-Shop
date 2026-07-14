import EmptyState from "./EmptyState";
import { formatDateTime } from "../minigameUtils";

export default function ActivityTimeline({ logs }) {
  if (!logs?.length) {
    return <EmptyState title="Chua co activity log" description="Timeline thao tac admin se hien thi tai day." icon="fa-timeline" />;
  }

  return (
    <div className="minigame-timeline">
      {logs.map((log) => (
        <div key={log.id} className="minigame-timeline-item">
          <div className="minigame-timeline-dot"></div>
          <div className="minigame-timeline-content">
            <div className="d-flex justify-content-between gap-3 flex-wrap">
              <div>
                <div className="fw-bold">{log.actionType}</div>
                <div className="text-muted small">{log.actionDetail || "Khong co mo ta"}</div>
              </div>
              <div className="text-muted small">#{log.actorId || "system"} · {formatDateTime(log.createdAt)}</div>
            </div>
            {log.metadataJson ? (
              <pre className="minigame-json-preview mb-0">{log.metadataJson}</pre>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
