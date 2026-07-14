import ModalShell from "./ModalShell";
import EmptyState from "./EmptyState";
import ActivityTimeline from "./ActivityTimeline";
import PlaySessionTable from "./PlaySessionTable";
import { formatNumber, statusBadgeClass } from "../minigameUtils";

export default function GameDetailModal({ gameDetail, playSessions, onClose }) {
  const analytics = gameDetail?.analytics || {};
  const summary = analytics.summary || {};
  const rewards = Array.isArray(gameDetail?.rewards) ? gameDetail.rewards : [];

  return (
    <ModalShell title={gameDetail?.name || "Chi tiet game"} onClose={onClose} width={1120}>
      <div className="d-flex flex-column gap-4">
        <div className="minigame-detail-hero">
          <img src={gameDetail?.thumbnailUrl || "/mykingdom_banner.png"} alt={gameDetail?.name} />
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between gap-3 flex-wrap">
              <div>
                <div className="minigame-eyebrow mb-2">Game Detail</div>
                <h2 className="mb-2">{gameDetail?.name}</h2>
                <div className="text-muted">{gameDetail?.shortDescription || "Chua co mo ta ngan"}</div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <span className={`minigame-status-badge ${statusBadgeClass(gameDetail?.status)}`}>{gameDetail?.status}</span>
                <span className="minigame-status-badge">{gameDetail?.type}</span>
                <span className="minigame-status-badge">v{gameDetail?.version}</span>
              </div>
            </div>
            <div className="minigame-detail-kpis">
              <div><strong>{formatNumber(summary.totalPlays)}</strong><span>Total plays</span></div>
              <div><strong>{formatNumber(summary.players)}</strong><span>Players</span></div>
              <div><strong>{formatNumber(summary.totalPoints)}</strong><span>Points</span></div>
              <div><strong>{formatNumber(summary.voucherRewards)}</strong><span>Vouchers</span></div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="minigame-form-card h-100">
              <h4>Thong tin game</h4>
              <div className="minigame-detail-grid">
                <div><span>Slug</span><strong>{gameDetail?.slug}</strong></div>
                <div><span>Code</span><strong>{gameDetail?.code}</strong></div>
                <div><span>Visible</span><strong>{gameDetail?.visible ? "Yes" : "No"}</strong></div>
                <div><span>Featured</span><strong>{gameDetail?.featured ? "Yes" : "No"}</strong></div>
                <div><span>Daily limit</span><strong>{formatNumber(gameDetail?.dailyPlayLimit)}</strong></div>
                <div><span>Reward count</span><strong>{formatNumber(gameDetail?.rewardCount)}</strong></div>
              </div>
              <div className="mt-3">
                <div className="fw-semibold mb-2">Rules</div>
                <div className="text-muted small">{gameDetail?.rules || "Chua co rules"}</div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="minigame-form-card h-100">
              <h4>Rewards</h4>
              {rewards.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {rewards.slice(0, 5).map((reward) => (
                    <div key={reward.id} className="minigame-inline-row">
                      <div>
                        <div className="fw-semibold">{reward.rewardName}</div>
                        <div className="text-muted small">{reward.rewardType}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold">{Number(reward.probability || 0).toFixed(2)}%</div>
                        <div className="text-muted small">Con lai {formatNumber(reward.remainingQuantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Chua co reward" description="Them reward de xem preview tai day." icon="fa-gift" />
              )}
            </div>
          </div>
        </div>

        <div className="minigame-form-card">
          <h4>Recent play history</h4>
          <PlaySessionTable sessions={playSessions} loading={false} />
        </div>

        <div className="minigame-form-card">
          <h4>Recent activity</h4>
          <ActivityTimeline logs={gameDetail?.activityLogs || []} />
        </div>
      </div>
    </ModalShell>
  );
}
