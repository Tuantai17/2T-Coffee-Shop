import React from "react";
import { Link } from "react-router-dom";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export default function GameCenterCard({ game }) {
  return (
    <Link to={`/game/${game.slug}`} className="gc-card text-decoration-none">
      <img src={game.bannerUrl || game.thumbnailUrl || "/mykingdom_banner.png"} alt={game.name} className="gc-banner" />
      <div className="gc-body">
        <div className="gc-title-row">
          <img src={game.thumbnailUrl || game.bannerUrl || "/mykingdom_banner.png"} alt={game.name} className="gc-thumb" />
          <div>
            <h3 className="gc-title">{game.name}</h3>
            <span className="gc-type">{game.type === "MEMORY_MATCH" ? "Memory Match" : game.type === "LUCKY_SPIN" ? "Lucky Spin" : game.type}</span>
          </div>
        </div>
        
        <p className="text-muted small mt-2 flex-grow-1">
          {game.shortDescription || "Khám phá mini game để nhận thưởng mỗi ngày."}
        </p>

        <div className="gc-meta">
          <div className="gc-meta-item">
            <span className="gc-meta-label">Lượt còn lại</span>
            <span className="gc-meta-val text-primary">{formatNumber(game.remainingPlays)}</span>
          </div>
          <div className="gc-meta-item border-start border-end">
            <span className="gc-meta-label">Giới hạn/ngày</span>
            <span className="gc-meta-val">{formatNumber(game.dailyPlayLimit)}</span>
          </div>
          <div className="gc-meta-item">
            <span className="gc-meta-label">Phần thưởng</span>
            <span className="gc-meta-val text-warning">{game.rewards?.length ? "Có" : "-"}</span>
          </div>
        </div>

        <button className="btn-mg-primary w-100 mt-2">CHƠI NGAY</button>
      </div>
    </Link>
  );
}
