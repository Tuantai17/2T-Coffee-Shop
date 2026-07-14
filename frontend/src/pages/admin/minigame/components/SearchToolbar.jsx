export default function SearchToolbar({ title, description, children, actions }) {
  return (
    <div className="minigame-panel">
      <div className="minigame-panel-head minigame-panel-head-wrap">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {actions || null}
      </div>
      {children}
    </div>
  );
}
