import { useCallback, useState } from "react";
import miniGameApi from "../../../../api/miniGameApi";

export function useMiniGameAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState("");

  const refresh = useCallback(async (nextGameId) => {
    const effectiveGameId = nextGameId || gameId;
    if (!effectiveGameId) {
      setAnalytics(null);
      return;
    }
    try {
      setLoading(true);
      const response = await miniGameApi.getAdminAnalytics(effectiveGameId);
      setAnalytics(response?.data || null);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  return {
    analytics,
    loading,
    gameId,
    setGameId,
    refresh,
  };
}
