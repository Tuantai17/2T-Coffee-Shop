export default function ModalShell({ title, onClose, children, width = 960 }) {
  return (
    <div className="minigame-modal-backdrop" onClick={onClose}>
      <div
        className="minigame-modal-panel"
        style={{ maxWidth: `${width}px` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="minigame-modal-header">
          <div>
            <h3>{title}</h3>
          </div>
          <button type="button" className="btn btn-light btn-sm rounded-circle" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="minigame-modal-body">{children}</div>
      </div>
    </div>
  );
}
