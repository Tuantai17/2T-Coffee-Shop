import React from "react";

export default function GameHeader({ game, title, moves, timer, score }) {
  return (
    <div className="mg-play-header shadow-sm">
      <h2 className="mg-play-header-title">{title || game?.name}</h2>
      
      <div className="mg-play-stats">
        {moves !== undefined && (
          <div className="mg-stat-box">
            <i className="fa-solid fa-shoe-prints"></i>
            <div>
              <span className="d-block" style={{ fontSize: 10, opacity: 0.8, marginBottom: -2 }}>Lượt lật</span>
              <span className="mg-stat-val">{moves}</span>
            </div>
          </div>
        )}
        
        {timer !== undefined && (
          <div className="mg-stat-box">
            <i className="fa-solid fa-stopwatch"></i>
            <div>
              <span className="d-block" style={{ fontSize: 10, opacity: 0.8, marginBottom: -2 }}>Thời gian</span>
              <span className="mg-stat-val">{timer}s</span>
            </div>
          </div>
        )}

        {score !== undefined && (
          <div className="mg-stat-box">
            <i className="fa-solid fa-star"></i>
            <div>
              <span className="d-block" style={{ fontSize: 10, opacity: 0.8, marginBottom: -2 }}>Điểm tạm</span>
              <span className="mg-stat-val">{score}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
