import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import UserLayout from "../../layouts/UserLayout";
import miniGameApi from "../../api/miniGameApi";
import "./MiniGamePage.css";

import GameCenterCard from "./minigame/components/GameCenterCard";
import ProfileStats from "./minigame/components/ProfileStats";
import HistoryDialog from "./minigame/components/HistoryDialog";
import LeaderboardDialog from "./minigame/components/LeaderboardDialog";

export default function GameCenterPage() {
  const [games, setGames] = useState([]);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [showHistory, setShowHistory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesResponse, summaryResponse, historyResponse] = await Promise.all([
        miniGameApi.getGames(),
        miniGameApi.getMyGameSummary(),
        miniGameApi.getMyGameHistory(),
      ]);
      setGames(Array.isArray(gamesResponse.data) ? gamesResponse.data : []);
      setSummary(summaryResponse.data || null);
      setHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
    } catch (error) {
      toast.error("Không thể tải game center");
      setGames([]);
      setSummary(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <UserLayout>
        <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="mg-skeleton" style={{ width: "100%", height: 300, maxWidth: 800 }}></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container py-4 py-lg-5">
        
        {/* HERO BANNER */}
        <section className="minigame-hero mb-4">
          <div className="row align-items-center position-relative z-3">
            <div className="col-lg-7">
              <span className="minigame-badge">
                <i className="fa-solid fa-fire me-2 text-danger"></i>
                LỄ HỘI CÀ PHÊ MÙA HÈ
              </span>
              <h1>Chơi game - Nhận quà cực đã</h1>
              <p className="mb-4">
                Khám phá bộ sưu tập Mini game độc quyền của Brew Moments. Tích điểm Loyalty, nhận hàng ngàn Voucher giảm giá mỗi ngày!
              </p>
              <div className="d-flex gap-3 mt-2">
                <button type="button" className="btn-mg-outline text-white border-white" onClick={() => setShowHistory(true)}>
                  <i className="fa-solid fa-clock-rotate-left me-2"></i> Lịch sử
                </button>
                <button type="button" className="btn-mg-outline text-white border-white" onClick={() => setShowLeaderboard(true)}>
                  <i className="fa-solid fa-crown me-2"></i> Bảng xếp hạng
                </button>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block text-end">
              <img src="/mykingdom_banner.png" alt="Festival" className="img-fluid rounded-4 shadow-lg" style={{ maxHeight: 220, objectFit: 'cover' }} />
            </div>
          </div>
          <div className="minigame-hero-art" style={{ backgroundImage: 'url(/mykingdom_banner.png)' }}></div>
        </section>

        {/* MAIN LAYOUT: GAMES & PROFILE */}
        <div className="row g-4">
          <div className="col-xl-8">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <h2 className="mg-card-title mb-1">Mini Games</h2>
                <p className="text-muted small mb-0">Hệ thống đang mở {games.length} trò chơi</p>
              </div>
            </div>
            <div className="row g-4">
              {games.map((game) => (
                <div key={game.id} className="col-md-6">
                  <GameCenterCard game={game} />
                </div>
              ))}
            </div>
          </div>

          <div className="col-xl-4">
            <div className="sticky-top" style={{ top: 100 }}>
              <ProfileStats summary={summary} />
            </div>
          </div>
        </div>

      </div>

      <HistoryDialog show={showHistory} onClose={() => setShowHistory(false)} history={history} />
      <LeaderboardDialog show={showLeaderboard} onClose={() => setShowLeaderboard(false)} games={games} />
    </UserLayout>
  );
}
