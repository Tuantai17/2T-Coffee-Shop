import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import UserLayout from "../../layouts/UserLayout";
import miniGameApi from "../../api/miniGameApi";
import "./MiniGamePage.css";

import MemoryMatchEngine from "./minigame/components/MemoryMatchEngine";
import LuckySpinEngine from "./minigame/components/LuckySpinEngine";
import RewardDialog from "./minigame/components/RewardDialog";
import FailedDialog from "./minigame/components/FailedDialog";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export default function MiniGamePlayPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // STATE MACHINE: LOADING -> READY -> COUNTDOWN -> PLAYING -> COMPLETED -> SUBMITTING -> REWARDING / FAILED_DIALOG -> ERROR
  const [gameState, setGameState] = useState("LOADING");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [spinRewardId, setSpinRewardId] = useState(null);
  const [recentWinners, setRecentWinners] = useState([]);

  const fetchDetail = async () => {
    try {
      setLoadingConfig(true);
      const [response, winnersRes] = await Promise.all([
        miniGameApi.getGameDetail(slug),
        miniGameApi.getGameDetail(slug).then(r => miniGameApi.getRecentWinners(r.data.id)).catch(() => ({ data: [] }))
      ]);
      setGame(response.data);
      setRecentWinners(winnersRes.data || []);
      setGameState("READY");
      setErrorMessage("");
    } catch (error) {
      toast.error("Không thể tải chi tiết game");
      setGame(null);
      setGameState("ERROR");
      setErrorMessage("Không thể tải chi tiết game. Vui lòng thử lại sau.");
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [slug]);

  const submitPlay = async (payload) => {
    if (!game?.id) {
      throw new Error("Game không hợp lệ");
    }
    const response = await miniGameApi.playGame(game.id, payload);
    return response.data;
  };

  const handleStartGame = async () => {
    if (Number(game?.remainingPlays || 0) <= 0) {
      toast.error("Bạn đã hết lượt chơi hôm nay");
      return;
    }
    
    if (game.type === "LUCKY_SPIN") {
      // For Lucky Spin, fetch reward first before spinning
      setGameState("SUBMITTING");
      try {
        const res = await submitPlay({ 
          score: 0, 
          playData: { 
            completed: true,
            spinToken: "SPIN-" + Date.now(),
            spinCount: 1,
            durationSeconds: 5
          } 
        });
        setResult(res);
        setSpinRewardId(res.reward?.id || null);
        if (res.reward || res.pointEarned > 0) {
          setTimeout(() => window.dispatchEvent(new Event("profileUpdated")), 1500);
        }
        setGameState("COUNTDOWN");
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Lỗi khi chơi");
        toast.error(error.response?.data?.message || "Lỗi khi chơi");
        setGameState("ERROR");
      }
    } else {
      // For Memory Match, start countdown and play immediately
      setResult(null);
      setGameState("COUNTDOWN");
    }
  };

  const handleFinishMemoryMatch = (completed, moves, matchedPairs, durationSeconds) => {
    setGameState("COMPLETED");
    setTimeout(async () => {
      setGameState("SUBMITTING");
      try {
        const score = completed ? Math.max(10, 1000 - moves * 12 - durationSeconds * 5) : 0;
        const res = await submitPlay({
          score,
          playData: {
            completed,
            moves,
            timeTakenSeconds: durationSeconds,
            matchedPairs,
            totalPairs: game.gameplayConfig?.gridSize === "6x6" ? 18 : game.gameplayConfig?.gridSize === "5x4" ? 10 : 8,
            attempts: moves,
            durationSeconds,
          },
        });
        setResult(res);
        if (res.reward || res.pointEarned > 0) {
          setTimeout(() => window.dispatchEvent(new Event("profileUpdated")), 1500);
        }
        setGameState(res.status === "FAILED" ? "FAILED_DIALOG" : "REWARDING");
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Lỗi khi nộp kết quả");
        toast.error(error.response?.data?.message || "Lỗi khi nộp kết quả");
        setGameState("ERROR");
      }
    }, 1500); // Tạm dừng 1.5s ở màn hình COMPLETED
  };

  const handleFinishLuckySpin = () => {
    setGameState("COMPLETED");
    setTimeout(() => {
      setGameState(result?.status === "FAILED" ? "FAILED_DIALOG" : "REWARDING");
    }, 1000);
  };

  const handlePlayAgain = () => {
    fetchDetail(); // Reload game details to get fresh remaining plays
    setResult(null);
    setGameState("READY");
  };

  if (loadingConfig || !game) {
    return (
      <UserLayout>
        <div className="container py-5">
          <div className="minigame-user-panel d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (gameState === "ERROR" && !game) {
    return (
      <UserLayout>
        <div className="container py-5">
          <div className="minigame-user-panel d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
            <i className="fa-solid fa-triangle-exclamation text-danger mb-3" style={{ fontSize: "4rem" }}></i>
            <h3 className="text-muted mb-4">{errorMessage || "Đã xảy ra lỗi"}</h3>
            <button className="btn btn-outline-primary" onClick={handlePlayAgain}>
              <i className="fa-solid fa-rotate-right me-2"></i>Thử lại
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container py-4 py-lg-5">
        
        {/* GAME DETAIL MODE (READY STATE) */}
        {gameState === "READY" && (
          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <section className="minigame-detail-hero">
                <div className="position-relative z-3">
                  <Link to="/game" className="minigame-back-link d-inline-block mb-3">
                    <i className="fa-solid fa-arrow-left me-2"></i>Quay lại Game Center
                  </Link>
                  <br/>
                  <span className="minigame-badge">{game.type}</span>
                  <h1>{game.name}</h1>
                  <p className="mb-4">{game.shortDescription || "Mini game đang sẵn sàng để bạn trải nghiệm."}</p>
                  
                  <button className="btn-mg-primary px-5 py-3 fs-5" onClick={handleStartGame}>
                    <i className="fa-solid fa-play me-2"></i>BẮT ĐẦU CHƠI
                  </button>
                </div>
                <div className="minigame-hero-art" style={{ backgroundImage: `url(${game.bannerUrl || game.thumbnailUrl || '/mykingdom_banner.png'})` }}></div>
              </section>
            </div>
            
            <div className="col-lg-4">
              <div className="mg-card h-100 d-flex flex-column justify-content-center text-center mb-4">
                <div className="mb-4 mt-3">
                  <span className="d-block text-muted mb-1">Lượt còn lại của bạn</span>
                  <strong className="fs-1 text-primary">{formatNumber(game.remainingPlays)}</strong>
                </div>
                <div className="mb-4">
                  <span className="d-block text-muted mb-1">Giới hạn trong ngày</span>
                  <strong className="fs-3">{formatNumber(game.dailyPlayLimit)}</strong>
                </div>
                <div className="mb-3">
                  <span className="d-block text-muted mb-1">Cơ cấu giải thưởng</span>
                  <strong className="fs-5 text-warning">{game.rewardRange}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GAMEPLAY MODE */}
        {(gameState !== "READY" && gameState !== "LOADING") && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {gameState === "SUBMITTING" && (
                <div className="mg-board-container shadow-sm d-flex flex-column justify-content-center align-items-center py-5">
                  <div className="spinner-border text-warning mb-3" style={{ width: "3rem", height: "3rem" }}></div>
                  <h4 className="text-muted">Đang xử lý kết quả...</h4>
                </div>
              )}

              {gameState === "COMPLETED" && (
                <div className="mg-board-container shadow-sm d-flex flex-column justify-content-center align-items-center py-5">
                  <div className="text-success mb-3">
                    <i className="fa-solid fa-check-circle" style={{ fontSize: "4rem" }}></i>
                  </div>
                  <h3 className="text-muted">Hoàn thành xuất sắc!</h3>
                </div>
              )}

              {gameState === "ERROR" && (
                <div className="mg-board-container shadow-sm d-flex flex-column justify-content-center align-items-center py-5">
                  <i className="fa-solid fa-circle-exclamation text-danger mb-3" style={{ fontSize: "3rem" }}></i>
                  <h4 className="text-muted mb-4">{errorMessage || "Đã xảy ra lỗi"}</h4>
                  <button className="btn btn-outline-primary" onClick={handlePlayAgain}>
                    Quay lại màn hình chính
                  </button>
                </div>
              )}

              {(gameState !== "SUBMITTING" && gameState !== "COMPLETED" && gameState !== "ERROR") && game.type === "LUCKY_SPIN" && (
                <LuckySpinEngine 
                  game={game} 
                  gameState={gameState} 
                  setGameState={setGameState}
                  onFinishGame={handleFinishLuckySpin}
                  rewardId={spinRewardId}
                />
              )}

              {(gameState !== "SUBMITTING" && gameState !== "COMPLETED" && gameState !== "ERROR") && game.type !== "LUCKY_SPIN" && (
                <MemoryMatchEngine 
                  game={game} 
                  gameState={gameState} 
                  setGameState={setGameState}
                  onFinishGame={handleFinishMemoryMatch}
                />
              )}
            </div>
          </div>
        )}

        {/* BOTTOM METADATA (Always visible) */}
        <div className="row g-4 mt-2">
          <div className="col-lg-8">
            <div className="mg-card-alt h-100">
              <h3 className="mg-card-title">Luật chơi</h3>
              <p className="text-muted mb-0" style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                {game.rules || "Admin chưa cấu hình luật chơi cho game này."}
              </p>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="mg-card-alt mb-4">
              <h3 className="mg-card-title">Người trúng thưởng gần đây</h3>
              <div className="d-flex flex-column gap-2">
                {recentWinners.length > 0 ? (
                  recentWinners.map((winner) => (
                    <div key={winner.id} className="d-flex align-items-center justify-content-between border-bottom pb-2 pt-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className="fa-solid fa-user-circle text-muted fs-4"></i>
                        <span className="fw-bold small">Người chơi #{winner.id.toString().slice(-4)}</span>
                      </div>
                      <span className="badge bg-warning text-dark px-2 py-1"><i className="fa-solid fa-gift me-1"></i>{winner.rewardName}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small mb-0">Chưa có dữ liệu.</p>
                )}
              </div>
            </div>

            <div className="mg-card-alt h-100">
              <h3 className="mg-card-title">Phần thưởng</h3>
              <div className="d-flex flex-column gap-3">
                {Array.isArray(game.rewards) && game.rewards.length > 0 ? (
                  game.rewards.map((reward) => (
                    <div key={reward.id} className="d-flex align-items-center bg-white p-3 rounded-3 shadow-sm border">
                      <div className="rounded-circle bg-light me-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                        <i className={`fa-solid ${reward.rewardType === 'VOUCHER' ? 'fa-ticket text-primary' : 'fa-coins text-warning'} fs-4`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <strong className="d-block">{reward.rewardName}</strong>
                        <span className="text-muted small">Tỷ lệ: {Number(reward.probability || 0).toFixed(2)}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">Đang cập nhật phần thưởng.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* DIALOGS */}
      <RewardDialog 
        show={gameState === "REWARDING"} 
        result={result} 
        onPlayAgain={handlePlayAgain}
        onBackToHome={() => navigate("/game")}
        onShowHistory={() => navigate("/game")}
      />

      <FailedDialog
        show={gameState === "FAILED_DIALOG"}
        result={result}
        onPlayAgain={handlePlayAgain}
        onGameCenter={() => navigate("/game")}
      />
    </UserLayout>
  );
}
