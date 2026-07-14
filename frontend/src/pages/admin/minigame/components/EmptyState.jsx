export default function EmptyState({ title, description, icon = "fa-box-open", action }) {
  return (
    <div className="minigame-empty-state">
      <i className={`fa-solid ${icon}`}></i>
      <h3>{title}</h3>
      <p>{description}</p>
      {action || null}
    </div>
  );
}
