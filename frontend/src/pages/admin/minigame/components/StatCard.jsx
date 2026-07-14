export default function StatCard({ icon, label, value, note }) {
  return (
    <div className="minigame-stat-card">
      <div className="minigame-stat-icon">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <div className="minigame-stat-label">{label}</div>
        <div className="minigame-stat-value">{value}</div>
        <div className="minigame-stat-note">{note}</div>
      </div>
    </div>
  );
}
