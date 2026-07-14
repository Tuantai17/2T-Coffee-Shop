import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ADMIN_COLOR_SET } from "../constants";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";
import { formatDateTime, formatNumber } from "../minigameUtils";

export default function MiniGameDashboardPage({ loading, dashboard, derivedSummary }) {
  const summary = dashboard?.summary || {};
  const distribution = Array.isArray(dashboard?.distribution) ? dashboard.distribution : [];
  const topGames = Array.isArray(dashboard?.topGames) ? dashboard.topGames : [];
  const trendData = Array.isArray(dashboard?.playTrend)
    ? dashboard.playTrend.map((item, index) => ({
        date: item.date,
        plays: item.plays,
        players: dashboard?.playerTrend?.[index]?.players || 0,
      }))
    : [];

  if (loading) {
    return (
      <div className="minigame-panel minigame-loading-panel">
        <div className="spinner-border text-warning" role="status"></div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="minigame-stat-grid">
        <StatCard icon="fa-gamepad" label="Total Games" value={formatNumber(summary.totalGames)} note="Tong game hien co" />
        <StatCard icon="fa-bolt" label="Active" value={formatNumber(summary.activeGames)} note="Game dang hoat dong" />
        <StatCard icon="fa-power-off" label="Inactive" value={formatNumber(derivedSummary.inactiveGames)} note="Game tam dung" />
        <StatCard icon="fa-calendar-day" label="Today's Plays" value={formatNumber(derivedSummary.todayPlays)} note="Tong luot choi hom nay" />
        <StatCard icon="fa-calendar-week" label="Weekly Plays" value={formatNumber(derivedSummary.weeklyPlays)} note="Tong luot choi 7 ngay" />
        <StatCard icon="fa-users" label="MAU" value={formatNumber(derivedSummary.monthlyActiveUsers)} note="Nguoi choi 30 ngay" />
      </div>

      <div className="minigame-stat-grid">
        <StatCard icon="fa-play" label="Total Plays" value={formatNumber(summary.totalPlays)} note="Tong luot choi he thong" />
        <StatCard icon="fa-user-check" label="DAU" value={formatNumber(derivedSummary.dailyActiveUsers)} note="Nguoi choi hom nay" />
        <StatCard icon="fa-stopwatch" label="Avg Duration" value={`${formatNumber(derivedSummary.averagePlayTime)}s`} note="Thoi gian choi TB" />
        <StatCard icon="fa-ranking-star" label="Avg Score" value={formatNumber(derivedSummary.averageScore)} note="Diem TB co du lieu" />
        <StatCard icon="fa-gift" label="Rewards" value={formatNumber(derivedSummary.totalRewards)} note="Session co thuong" />
        <StatCard icon="fa-ticket" label="Vouchers" value={formatNumber(summary.voucherRewards)} note="Voucher da phat" />
      </div>

      <div className="minigame-chart-grid">
        <div className="minigame-panel">
          <div className="minigame-panel-head">
            <div>
              <h2>Daily / Weekly / Monthly Trend</h2>
              <p>Thong ke luot choi va nguoi choi tu dashboard API</p>
            </div>
          </div>
          <div className="minigame-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e4da" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="plays" stroke="#E56A16" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="players" stroke="#18864B" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="minigame-panel">
          <div className="minigame-panel-head">
            <div>
              <h2>Reward Types</h2>
              <p>Phan bo point, voucher va no reward tu play sessions</p>
            </div>
          </div>
          <div className="minigame-chart-box">
            {derivedSummary.rewardTypeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={derivedSummary.rewardTypeDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                    {derivedSummary.rewardTypeDistribution.map((item, index) => (
                      <Cell key={item.name} fill={ADMIN_COLOR_SET[index % ADMIN_COLOR_SET.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="Chua co du lieu reward" description="Se hien thi sau khi user choi game." icon="fa-gift" />
            )}
          </div>
        </div>
      </div>

      <div className="minigame-chart-grid">
        <div className="minigame-panel">
          <div className="minigame-panel-head">
            <div>
              <h2>Top Games</h2>
              <p>Xep hang game theo tong luot choi</p>
            </div>
          </div>
          <div className="minigame-top-game-list">
            {topGames.length > 0 ? topGames.map((game, index) => (
              <div key={game.id} className="minigame-top-game-item">
                <div className="minigame-top-game-rank">{index + 1}</div>
                <img src={game.thumbnailUrl || "/mykingdom_banner.png"} alt={game.name} />
                <div className="flex-grow-1">
                  <div className="fw-bold">{game.name}</div>
                  <small className="text-muted">{formatNumber(game.players)} players</small>
                </div>
                <div className="text-end">
                  <div className="fw-bold">{formatNumber(game.plays)}</div>
                  <small className={Number(game.growth) >= 0 ? "text-success" : "text-danger"}>
                    {Number(game.growth) >= 0 ? "+" : ""}{game.growth}%
                  </small>
                </div>
              </div>
            )) : (
              <EmptyState title="Chua co top game" description="Danh sach se cap nhat theo du lieu play." icon="fa-ranking-star" />
            )}
          </div>
        </div>

        <div className="minigame-panel">
          <div className="minigame-panel-head">
            <div>
              <h2>Peak Hours Heatmap</h2>
              <p>Khung gio co nhieu luot choi nhat</p>
            </div>
          </div>
          <div className="minigame-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={derivedSummary.hourHeatmap}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e4da" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} interval={2} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="plays" fill="#4A2618" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="minigame-chart-grid">
        <div className="minigame-panel">
          <div className="minigame-panel-head">
            <div>
              <h2>Top Players</h2>
              <p>Ranking user theo tan suat choi</p>
            </div>
          </div>
          <div className="d-flex flex-column gap-2">
            {derivedSummary.topPlayers.length > 0 ? derivedSummary.topPlayers.map((player) => (
              <div key={player.userId} className="minigame-inline-row">
                <div>
                  <div className="fw-semibold">User #{player.userId}</div>
                  <div className="text-muted small">{formatNumber(player.points)} diem</div>
                </div>
                <strong>{formatNumber(player.plays)} luot</strong>
              </div>
            )) : <EmptyState title="Chua co top player" description="Can co play session de ranking user." icon="fa-users" />}
          </div>
        </div>

        <div className="minigame-panel">
          <div className="minigame-panel-head">
            <div>
              <h2>Top Sessions</h2>
              <p>Luot choi co diem cao nhat</p>
            </div>
          </div>
          <div className="d-flex flex-column gap-2">
            {derivedSummary.topSessions.length > 0 ? derivedSummary.topSessions.map((session) => (
              <div key={session.id} className="minigame-inline-row">
                <div>
                  <div className="fw-semibold">{session.gameName} · User #{session.userId}</div>
                  <div className="text-muted small">{formatDateTime(session.playedAt)}</div>
                </div>
                <strong>{formatNumber(session.score)}</strong>
              </div>
            )) : <EmptyState title="Chua co top session" description="Se hien thi khi co score thuc te." icon="fa-trophy" />}
          </div>
        </div>
      </div>

      <div className="minigame-panel">
        <div className="minigame-panel-head">
          <div>
            <h2>Play Distribution</h2>
            <p>Ty trong luot choi theo tung game dang hoat dong</p>
          </div>
        </div>
        <div className="minigame-chart-box">
          {distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                  {distribution.map((item, index) => (
                    <Cell key={item.name} fill={ADMIN_COLOR_SET[index % ADMIN_COLOR_SET.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Chua co du lieu phan bo" description="Phan bo luot choi se hien thi sau khi co session." icon="fa-chart-pie" />
          )}
        </div>
      </div>
    </div>
  );
}
