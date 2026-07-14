import axiosClient from "./axiosClient";
import { getAuthSession, getAuthStorageScopeFromPath } from "../utils/authStorage";

const gatewayBaseUrl = axiosClient.defaults.baseURL || "";
const directMiniGameBaseUrl = (
  import.meta.env.VITE_MINI_GAME_SERVICE_URL
  || gatewayBaseUrl.replace(":8900", ":8820")
  || "http://localhost:8820"
).replace(/\/$/, "");

function shouldFallbackToDirectService(error) {
  return error?.response?.status === 404;
}

function getMiniGameIdentityHeaders() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const scope = getAuthStorageScopeFromPath(pathname);
  const { userId } = getAuthSession(scope);

  if (!userId) {
    return {};
  }

  return {
    "X-User-Id": String(userId),
  };
}

function buildDirectConfig(config = {}) {
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      ...getMiniGameIdentityHeaders(),
    },
  };
}

function withMiniGameFallback(primaryRequest, fallbackRequest) {
  return primaryRequest().catch((error) => {
    if (!shouldFallbackToDirectService(error)) {
      throw error;
    }
    return fallbackRequest();
  });
}

function get(path, config = {}) {
  return withMiniGameFallback(
    () => axiosClient.get(path, config),
    () => axiosClient.get(`${directMiniGameBaseUrl}${path}`, buildDirectConfig(config))
  );
}

function post(path, payload = {}, config = {}) {
  return withMiniGameFallback(
    () => axiosClient.post(path, payload, config),
    () => axiosClient.post(`${directMiniGameBaseUrl}${path}`, payload, buildDirectConfig(config))
  );
}

function put(path, payload = {}, config = {}) {
  return withMiniGameFallback(
    () => axiosClient.put(path, payload, config),
    () => axiosClient.put(`${directMiniGameBaseUrl}${path}`, payload, buildDirectConfig(config))
  );
}

function patch(path, payload = {}, config = {}) {
  return withMiniGameFallback(
    () => axiosClient.patch(path, payload, config),
    () => axiosClient.patch(`${directMiniGameBaseUrl}${path}`, payload, buildDirectConfig(config))
  );
}

function remove(path, config = {}) {
  return withMiniGameFallback(
    () => axiosClient.delete(path, config),
    () => axiosClient.delete(`${directMiniGameBaseUrl}${path}`, buildDirectConfig(config))
  );
}

const miniGameApi = {
  getAdminDashboard: () => get("/api/admin/mini-games/dashboard"),
  getAdminGames: (params = {}) => get("/api/admin/mini-games", { params }),
  getAdminGame: (id) => get(`/api/admin/mini-games/${id}`),
  createAdminGame: (payload) => post("/api/admin/mini-games", payload),
  updateAdminGame: (id, payload) => put(`/api/admin/mini-games/${id}`, payload),
  updateAdminGameStatus: (id, status) => patch(`/api/admin/mini-games/${id}/status`, { status }),
  deleteAdminGame: (id) => remove(`/api/admin/mini-games/${id}`),
  getAdminAnalytics: (id) => get(`/api/admin/mini-games/${id}/analytics`),
  getAdminRewards: (params = {}) => get("/api/admin/mini-games/rewards", { params }),
  exportAdminRewards: (params = {}) => get("/api/admin/mini-games/rewards/export", { params, responseType: "blob" }),
  createAdminReward: (gameId, payload) => post(`/api/admin/mini-games/${gameId}/rewards`, payload),
  updateAdminReward: (rewardId, payload) => put(`/api/admin/mini-games/rewards/${rewardId}`, payload),
  deleteAdminReward: (rewardId) => remove(`/api/admin/mini-games/rewards/${rewardId}`),
  getAdminPlaySessions: (params = {}) => get("/api/admin/mini-games/play-sessions", { params }),
  exportAdminPlaySessions: (params = {}) => get("/api/admin/mini-games/play-sessions/export", { params, responseType: "blob" }),
  exportAdminActivityLogs: (gameId) => get(`/api/admin/mini-games/${gameId}/activity-logs/export`, { responseType: "blob" }),

  getGames: () => get("/api/games"),
  getGameDetail: (slug) => get(`/api/games/${slug}`),
  getMyGameSummary: () => get("/api/games/me/summary"),
  getMyGameHistory: () => get("/api/games/me/history"),
  playGame: (id, payload = {}) => post(`/api/games/${id}/play`, payload),
  getLeaderboard: (id, period = "all") => get(`/api/games/${id}/leaderboard`, { params: { period } }),
  getRecentWinners: (id) => get(`/api/games/${id}/recent-winners`),
  getGameStatistics: (id) => get(`/api/games/${id}/statistics`),
  getTopRewards: (id) => get(`/api/games/${id}/top-rewards`),
  getMyMissions: () => get("/api/games/me/missions"),
};

export default miniGameApi;
