import React, { useState, useMemo, useEffect } from "react";
import GameHeader from "./GameHeader";
import CountdownOverlay from "./CountdownOverlay";

const WHEEL_COLORS = ["#f07a24", "#f6b52f", "#df5a2c", "#884d1f", "#d64545", "#d38900"];

export default function LuckySpinEngine({ game, gameState, setGameState, onFinishGame, rewardId }) {
  const rewards = Array.isArray(game.rewards) ? game.rewards : [];
  const totalProbability = rewards.reduce((total, reward) => total + Number(reward.probability || 0), 0);
  
  const wheelItems = useMemo(() => {
    const base = rewards.map((reward, index) => ({
      key: reward.id,
      label: reward.rewardName,
      color: WHEEL_COLORS[index % WHEEL_COLORS.length],
      reward,
    }));
    if (totalProbability < 100) {
      base.push({
        key: "no-reward",
        label: "Chúc bạn may mắn",
        color: "#6f5a4d",
        reward: null,
      });
    }
    return base;
  }, [rewards, totalProbability]);

  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    if (gameState === "READY" || gameState === "COUNTDOWN") {
      setRotation(0);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === "PLAYING") {
      // Auto spin when game state becomes PLAYING (after countdown)
      const targetIndex = rewardId
        ? wheelItems.findIndex((item) => item.reward?.id === rewardId)
        : wheelItems.findIndex((item) => item.reward === null);
        
      const normalizedIndex = targetIndex >= 0 ? targetIndex : 0;
      const segmentAngle = 360 / Math.max(wheelItems.length, 1);
      
      // Calculate rotation to stop exactly at the center of the target segment
      const targetAngle = 360 * 6 + (360 - normalizedIndex * segmentAngle - segmentAngle / 2);
      
      setRotation(targetAngle);
      
      // The CSS transition takes 4 seconds. Add a tiny buffer before calling onFinishGame.
      const timer = window.setTimeout(() => {
        onFinishGame();
      }, 4200);

      return () => clearTimeout(timer);
    }
  }, [gameState, rewardId, wheelItems, onFinishGame]);

  return (
    <div className="position-relative">
      <GameHeader game={game} title="Lucky Spin" />
      
      <div className="mg-board-container shadow-sm d-flex justify-content-center align-items-center py-5">
        <CountdownOverlay 
          show={gameState === "COUNTDOWN"} 
          onComplete={() => setGameState("PLAYING")} 
        />
        
        <div className="lucky-wheel-wrap">
          <div className="lucky-wheel-pointer"></div>
          <div className="lucky-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
            {wheelItems.map((item, index) => {
              const angle = 360 / Math.max(wheelItems.length, 1);
              return (
                <div
                  key={item.key}
                  className="lucky-wheel-segment"
                  style={{
                    transform: `rotate(${index * angle}deg) skewY(${90 - angle}deg)`,
                    background: item.color,
                  }}
                >
                  <span style={{ transform: `skewY(-${90 - angle}deg) rotate(${angle / 2}deg)` }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
