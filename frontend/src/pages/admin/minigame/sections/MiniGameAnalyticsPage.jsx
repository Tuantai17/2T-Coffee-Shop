import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ADMIN_COLOR_SET } from "../constants";
import EmptyState from "../components/EmptyState";
import PlaySessionTable from "../components/PlaySessionTable";
import ActivityTimeline from "../components/ActivityTimeline";
import StatCard from "../components/StatCard";
import { formatNumber } from "../minigameUtils";

export default function MiniGameAnalyticsPage({
  analytics,
  loading,
  gameId,
  setGameId,
  gameOptions,
  onExportPlaySessions,
  onExportActivityLogs,
}) {
  return (
    <div className="d-flex flex-column gap-4">
      <div className="minigame-panel">
        <div className="minigame-panel-head minigame-panel-head-wrap">
          <div>
            <h2>Game Analytics</h2>
            <p>Chi tiet analytics, play history va activity theo tung game</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <select className="form-select minigame-analytics-select" value={gameId} onChange={(event) => setGameId(event.target.value)}>
              <option value="">Chon game</option>
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
            <button type="button" className="btn btn-outline-secondary" onClick={onExportPlaySessions}>Export Sessions</button>
            <button type="button" className="btn btn-outline-secondary" onClick={onExportActivityLogs}>Export Logs</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="minigame-panel minigame-loading-panel">
          <div className="spinner-border text-warning" role="status"></div>
        </div>
      ) : !analytics ? (
        <div className="minigame-panel">
          <EmptyState title="Chua chon game" description="Hay chon game de xem thong ke chi tiet." icon="fa-chart-line" />
        </div>
      ) : (
        <>
          <div className="minigame-stat-grid">
            <StatCard icon="fa-play" label="Total Plays" value={formatNumber(analytics.summary?.totalPlays)} note="Tong luot choi game" />
            <StatCard icon="fa-users" label="Players" value={formatNumber(analytics.summary?.players)} note="Distinct users" />
            <StatCard icon="fa-coins" label="Points" value={formatNumber(analytics.summary?.totalPoints)} note="Point reward da phat" />
            <StatCard icon="fa-ticket" label="Vouchers" value={formatNumber(analytics.summary?.voucherRewards)} note="Voucher reward da phat" />
          </div>

          <div className="minigame-chart-grid">
            <div className="minigame-panel">
              <div className="minigame-panel-head">
                <div>
                  <h2>Play Trend</h2>
                  <p>Luot choi 30 ngay gan nhat</p>
                </div>
              </div>
              <div className="minigame-chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.playTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e4da" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="plays" radius={[8, 8, 0, 0]} fill="#E56A16" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="minigame-panel">
              <div className="minigame-panel-head">
                <div>
                  <h2>Reward Distribution</h2>
                  <p>Phan bo thuong theo reward thuc te</p>
                </div>
              </div>
              <div className="minigame-chart-box">
                {analytics.rewardDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.rewardDistribution} dataKey="value" nameKey="name" outerRadius={90}>
                        {analytics.rewardDistribution.map((item, index) => (
                          <Cell key={item.name} fill={ADMIN_COLOR_SET[index % ADMIN_COLOR_SET.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="Chua co reward usage" description="Reward distribution hien sau khi co luot trung thuong." icon="fa-award" />
                )}
              </div>
            </div>
          </div>

          <div className="minigame-chart-grid">
            <div className="minigame-panel">
              <div className="minigame-panel-head">
                <div>
                  <h2>Device Distribution</h2>
                  <p>Thiet bi tham gia choi game</p>
                </div>
              </div>
              <div className="minigame-chart-box">
                {analytics.deviceDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.deviceDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e4da" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#18864B" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="Chua co du lieu thiet bi" description="Can co session de phan tich device." icon="fa-mobile-screen" />
                )}
              </div>
            </div>

            <div className="minigame-panel">
              <div className="minigame-panel-head">
                <div>
                  <h2>Recent Activity</h2>
                  <p>Audit timeline cua game dang chon</p>
                </div>
              </div>
              <ActivityTimeline logs={analytics.activityLogs || []} />
            </div>
          </div>

          <div className="minigame-panel">
            <div className="minigame-panel-head">
              <div>
                <h2>Recent Play Sessions</h2>
                <p>Lich su luot choi gan day cua game dang chon</p>
              </div>
            </div>
            <PlaySessionTable sessions={analytics.recentPlaySessions || analytics.history || []} loading={false} />
          </div>
        </>
      )}
    </div>
  );
}
