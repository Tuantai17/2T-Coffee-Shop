import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "../../../layouts/AdminLayout";
import adminLoyaltyApi from "../../../api/adminLoyaltyApi";
import miniGameApi from "../../../api/miniGameApi";
import {
  EMPTY_GAME_FORM,
  EMPTY_REWARD_FORM,
  TAB_OPTIONS,
} from "./constants";
import { downloadBlobFile, downloadCsv } from "./minigameUtils";
import { useMiniGameDashboard } from "./hooks/useMiniGameDashboard";
import { useMiniGameGames } from "./hooks/useMiniGameGames";
import { useMiniGameRewards } from "./hooks/useMiniGameRewards";
import { useMiniGameAnalytics } from "./hooks/useMiniGameAnalytics";
import { useMiniGamePlaySessions } from "./hooks/useMiniGamePlaySessions";
import { useMiniGameActivityLogs } from "./hooks/useMiniGameActivityLogs";
import GameWizardModal from "./components/wizard/GameWizardModal";
import RewardFormModal from "./components/RewardFormModal";
import GameDetailModal from "./components/GameDetailModal";
import MiniGameDashboardPage from "./sections/MiniGameDashboardPage";
import MiniGameListPage from "./sections/MiniGameListPage";
import RewardManagementPage from "./sections/RewardManagementPage";
import MiniGameAnalyticsPage from "./sections/MiniGameAnalyticsPage";
import MiniGamePlaySessionPage from "./sections/MiniGamePlaySessionPage";
import MiniGameActivityLogPage from "./sections/MiniGameActivityLogPage";
import "./MiniGameManagementPage.css";

export default function MiniGameManagementPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [voucherOptions, setVoucherOptions] = useState([]);
  const [gameModalState, setGameModalState] = useState(null);
  const [rewardModalState, setRewardModalState] = useState(null);
  const [detailState, setDetailState] = useState({ game: null, sessions: [], open: false });

  const dashboardHook = useMiniGameDashboard();
  const gamesHook = useMiniGameGames();
  const rewardsHook = useMiniGameRewards();
  const analyticsHook = useMiniGameAnalytics();
  const sessionsHook = useMiniGamePlaySessions();
  const activityLogs = useMiniGameActivityLogs(analyticsHook.analytics);

  const gameOptions = useMemo(() => gamesHook.gamesPage.content || [], [gamesHook.gamesPage.content]);

  const runSafe = async (action, message) => {
    try {
      await action();
    } catch (error) {
      toast.error(message || error?.response?.data?.message || error?.response?.data?.error || "Co loi xay ra");
    }
  };

  useEffect(() => {
    void runSafe(async () => {
      await Promise.all([dashboardHook.refresh(), gamesHook.refresh()]);
      const voucherRes = await adminLoyaltyApi.getVouchers();
      setVoucherOptions(Array.isArray(voucherRes?.data) ? voucherRes.data : []);
    }, "Khong the tai mini game CMS");
  }, []);

  useEffect(() => {
    if (!gameOptions.length) {
      return;
    }
    const defaultGameId = String(gameOptions[0].id);
    if (!rewardsHook.filters.gameId) {
      rewardsHook.setFilters((previous) => ({ ...previous, gameId: defaultGameId }));
    }
    if (!analyticsHook.gameId) {
      analyticsHook.setGameId(defaultGameId);
    }
    if (!sessionsHook.filters.gameId) {
      sessionsHook.setFilters((previous) => ({ ...previous, gameId: defaultGameId }));
    }
  }, [gameOptions]);

  useEffect(() => {
    if (activeTab === "rewards") {
      void runSafe(() => rewardsHook.refresh(), "Khong the tai reward CMS");
    }
    if (activeTab === "analytics" && analyticsHook.gameId) {
      void runSafe(() => analyticsHook.refresh(), "Khong the tai analytics");
    }
    if (activeTab === "sessions") {
      void runSafe(() => sessionsHook.refresh(), "Khong the tai play sessions");
    }
    if (activeTab === "activity" && analyticsHook.gameId) {
      void runSafe(() => analyticsHook.refresh(), "Khong the tai activity logs");
    }
  }, [activeTab, rewardsHook.filters.gameId, analyticsHook.gameId, sessionsHook.filters.gameId]);

  const refreshAll = async () => {
    await Promise.all([
      dashboardHook.refresh(),
      gamesHook.refresh(),
      rewardsHook.refresh(),
      analyticsHook.refresh(),
      sessionsHook.refresh(),
    ]);
  };

  const openGameDetail = async (gameId) => {
    await runSafe(async () => {
      const [gameRes, sessionsRes] = await Promise.all([
        miniGameApi.getAdminGame(gameId),
        miniGameApi.getAdminPlaySessions({ gameId, limit: 20 }),
      ]);
      setDetailState({
        open: true,
        game: gameRes?.data || null,
        sessions: Array.isArray(sessionsRes?.data) ? sessionsRes.data : [],
      });
    }, "Khong the tai chi tiet game");
  };

  const saveGame = async (payload) => {
    await runSafe(async () => {
      let gameId = payload.id;
      if (gameId) {
        await miniGameApi.updateAdminGame(gameId, payload);
        toast.success("Da cap nhat game");
      } else {
        const res = await miniGameApi.createAdminGame(payload);
        gameId = res.data.id;
        toast.success("Da tao game");
      }

      if (payload.pendingRewards && payload.pendingRewards.length > 0) {
        for (const reward of payload.pendingRewards) {
          if (reward.id) {
            if (reward._deleted) {
              await miniGameApi.deleteAdminReward(reward.id);
            } else {
              await miniGameApi.updateAdminReward(reward.id, { ...reward, gameId });
            }
          } else if (!reward._deleted) {
            await miniGameApi.createAdminReward(gameId, { ...reward, gameId });
          }
        }
      }

      setGameModalState(null);
      await Promise.all([gamesHook.refresh(), dashboardHook.refresh(), rewardsHook.refresh()]);
    }, "Khong the luu game");
  };

  const saveReward = async (payload) => {
    await runSafe(async () => {
      if (payload.id) {
        await miniGameApi.updateAdminReward(payload.id, payload);
        toast.success("Da cap nhat phan thuong");
      } else {
        await miniGameApi.createAdminReward(payload.gameId, payload);
        toast.success("Da tao phan thuong");
      }
      setRewardModalState(null);
      await Promise.all([rewardsHook.refresh(), dashboardHook.refresh(), analyticsHook.refresh()]);
    }, "Khong the luu phan thuong");
  };

  const performBulkAction = async (action) => {
    if (!gamesHook.selectedGames.length) return;
    await runSafe(async () => {
      if (action === "DELETE") {
        await Promise.all(gamesHook.selectedGames.map((game) => miniGameApi.deleteAdminGame(game.id)));
      } else {
        await Promise.all(gamesHook.selectedGames.map((game) => miniGameApi.updateAdminGameStatus(game.id, action)));
      }
      toast.success("Da thuc hien bulk action");
      await Promise.all([gamesHook.refresh(), dashboardHook.refresh()]);
    }, "Khong the thuc hien bulk action");
  };

  const exportGameList = () => {
    downloadCsv(
      [
        ["Game", "Slug", "Code", "Type", "Version", "Status", "Visible", "Featured", "Daily Limit", "Players", "Plays", "Rewards"],
        ...gamesHook.gamesPage.content.map((game) => [
          game.name, game.slug, game.code, game.type, game.version, game.status, game.visible, game.featured,
          game.dailyPlayLimit, game.players, game.totalPlays, game.rewardCount,
        ]),
      ],
      "minigame-games.csv"
    );
    toast.success("Da export game list");
  };

  return (
    <AdminLayout>
      <div className="minigame-admin-page">
        <div className="minigame-admin-hero">
          <div>
            <p className="minigame-eyebrow">Mini Game CMS</p>
            <h1>Quan tri Memory Match va Lucky Spin tren cung mot module</h1>
            <p className="minigame-subtitle">
              Sprint 2 mo rong admin dashboard, game CMS, reward CMS, analytics, play session va activity log
              dua tren API that cua mini-game-service.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-primary minigame-primary-button" onClick={() => setGameModalState(EMPTY_GAME_FORM)}>
              <i className="fa-solid fa-plus me-2"></i>Tao game moi
            </button>
            <button type="button" className="btn btn-light" onClick={() => void runSafe(refreshAll, "Khong the lam moi du lieu")}>
              <i className="fa-solid fa-rotate-right me-2"></i>Lam moi
            </button>
          </div>
        </div>

        <div className="minigame-tab-row" role="tablist" aria-label="Mini game tabs">
          {TAB_OPTIONS.map((tab) => (
            <button key={tab.id} type="button" className={`minigame-tab ${activeTab === tab.id ? "is-active" : ""}`} onClick={() => setActiveTab(tab.id)}>
              <i className={`fa-solid ${tab.icon}`}></i>{tab.label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && <MiniGameDashboardPage loading={dashboardHook.loading} dashboard={dashboardHook.dashboard} derivedSummary={dashboardHook.derivedSummary} />}
        {activeTab === "games" && (
          <MiniGameListPage
            gamesPage={gamesHook.gamesPage}
            loading={gamesHook.loading}
            filters={gamesHook.filters}
            setFilters={gamesHook.setFilters}
            onSearchSubmit={(event, nextFilters) => {
              if (event?.preventDefault) event.preventDefault();
              const effectiveFilters = nextFilters || { ...gamesHook.filters, page: 0 };
              gamesHook.setFilters(effectiveFilters);
              void runSafe(() => gamesHook.refresh(effectiveFilters), "Khong the tai danh sach game");
            }}
            selectedIds={gamesHook.selectedIds}
            onToggleSelect={(id) => gamesHook.setSelectedIds((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id])}
            onToggleSelectAll={(checked) => gamesHook.setSelectedIds(checked ? gamesHook.gamesPage.content.map((game) => game.id) : [])}
            onView={openGameDetail}
            onEdit={(id) => void runSafe(async () => setGameModalState((await miniGameApi.getAdminGame(id))?.data), "Khong the tai game")}
            onAnalytics={(id) => { analyticsHook.setGameId(String(id)); setActiveTab("analytics"); }}
            onRewards={(id) => { rewardsHook.setFilters((previous) => ({ ...previous, gameId: String(id) })); setActiveTab("rewards"); }}
            onHistory={(id) => { sessionsHook.setFilters((previous) => ({ ...previous, gameId: String(id) })); setActiveTab("sessions"); }}
            onClone={(game) => setGameModalState({ ...game, id: null, name: `${game.name} Copy`, slug: `${game.slug}-copy`, code: `${game.code}_COPY` })}
            onToggleStatus={(game) => void runSafe(async () => {
              await miniGameApi.updateAdminGameStatus(game.id, game.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
              await Promise.all([gamesHook.refresh(), dashboardHook.refresh()]);
            }, "Khong the doi trang thai")}
            onDelete={(game) => void runSafe(async () => {
              if (!window.confirm(`Xoa mem game "${game.name}"?`)) return;
              await miniGameApi.deleteAdminGame(game.id);
              await Promise.all([gamesHook.refresh(), dashboardHook.refresh()]);
            }, "Khong the xoa game")}
            onBulkAction={performBulkAction}
            onExport={exportGameList}
          />
        )}
        {activeTab === "rewards" && (
          <RewardManagementPage
            filters={rewardsHook.filters}
            setFilters={rewardsHook.setFilters}
            rewards={rewardsHook.rewards}
            loading={rewardsHook.loading}
            probabilityTotal={rewardsHook.rewardProbabilityTotal}
            gameOptions={gameOptions}
            onRefresh={() => void runSafe(() => rewardsHook.refresh(), "Khong the tai rewards")}
            onCreate={() => setRewardModalState({ ...EMPTY_REWARD_FORM, gameId: rewardsHook.filters.gameId ? Number(rewardsHook.filters.gameId) : null })}
            onEdit={(reward) => setRewardModalState({ ...reward, gameId: reward.gameId })}
            onDuplicate={(reward) => setRewardModalState({ ...reward, id: null, rewardName: `${reward.rewardName} Copy` })}
            onDelete={(rewardId) => void runSafe(async () => {
              if (!window.confirm("Xoa phan thuong nay?")) return;
              await miniGameApi.deleteAdminReward(rewardId);
              await Promise.all([rewardsHook.refresh(), dashboardHook.refresh(), analyticsHook.refresh()]);
            }, "Khong the xoa phan thuong")}
            onExport={() => void runSafe(async () => {
              const response = await miniGameApi.exportAdminRewards(rewardsHook.filters);
              downloadBlobFile(response.data, "minigame-rewards-report.csv");
            }, "Khong the export reward")}
          />
        )}
        {activeTab === "analytics" && (
          <MiniGameAnalyticsPage
            analytics={analyticsHook.analytics}
            loading={analyticsHook.loading}
            gameId={analyticsHook.gameId}
            setGameId={(value) => { analyticsHook.setGameId(value); void runSafe(() => analyticsHook.refresh(value), "Khong the tai analytics"); }}
            gameOptions={gameOptions}
            onExportPlaySessions={() => void runSafe(async () => {
              const response = await miniGameApi.exportAdminPlaySessions({ gameId: analyticsHook.gameId, limit: 500 });
              downloadBlobFile(response.data, "minigame-play-sessions.csv");
            }, "Khong the export play sessions")}
            onExportActivityLogs={() => void runSafe(async () => {
              const response = await miniGameApi.exportAdminActivityLogs(analyticsHook.gameId);
              downloadBlobFile(response.data, "minigame-activity-log.csv");
            }, "Khong the export activity logs")}
          />
        )}
        {activeTab === "sessions" && (
          <MiniGamePlaySessionPage
            filters={sessionsHook.filters}
            setFilters={sessionsHook.setFilters}
            loading={sessionsHook.loading}
            sessions={sessionsHook.sessions}
            groupedTopRewards={sessionsHook.groupedTopRewards}
            gameOptions={gameOptions}
            onRefresh={() => void runSafe(() => sessionsHook.refresh(), "Khong the tai sessions")}
            onExport={() => void runSafe(async () => {
              const response = await miniGameApi.exportAdminPlaySessions(sessionsHook.filters);
              downloadBlobFile(response.data, "minigame-play-sessions.csv");
            }, "Khong the export sessions")}
          />
        )}
        {activeTab === "activity" && (
          <MiniGameActivityLogPage
            logs={activityLogs}
            gameId={analyticsHook.gameId}
            setGameId={(value) => { analyticsHook.setGameId(value); void runSafe(() => analyticsHook.refresh(value), "Khong the tai activity logs"); }}
            gameOptions={gameOptions}
            onExport={() => void runSafe(async () => {
              const response = await miniGameApi.exportAdminActivityLogs(analyticsHook.gameId);
              downloadBlobFile(response.data, "minigame-activity-log.csv");
            }, "Khong the export activity")}
          />
        )}

        {gameModalState && (
          <GameWizardModal
            initialValue={{ ...EMPTY_GAME_FORM, ...gameModalState }}
            onClose={() => setGameModalState(null)}
            onSubmit={saveGame}
            voucherOptions={voucherOptions}
          />
        )}
        {rewardModalState && <RewardFormModal initialValue={{ ...EMPTY_REWARD_FORM, ...rewardModalState }} onClose={() => setRewardModalState(null)} onSubmit={saveReward} gameOptions={gameOptions} voucherOptions={voucherOptions} />}
        {detailState.open && <GameDetailModal gameDetail={detailState.game} playSessions={detailState.sessions} onClose={() => setDetailState({ game: null, sessions: [], open: false })} />}
      </div>
    </AdminLayout>
  );
}
