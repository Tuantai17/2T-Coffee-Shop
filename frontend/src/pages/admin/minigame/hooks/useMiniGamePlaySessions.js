import { useCallback, useMemo, useState } from "react";
import miniGameApi from "../../../../api/miniGameApi";

export function useMiniGamePlaySessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    gameId: "",
    userId: "",
    fromDate: "",
    toDate: "",
    limit: 200,
  });

  const refresh = useCallback(async (nextFilters) => {
    const effectiveFilters = nextFilters || filters;
    try {
      setLoading(true);
      const response = await miniGameApi.getAdminPlaySessions({
        gameId: effectiveFilters.gameId || undefined,
        userId: effectiveFilters.userId || undefined,
        fromDate: effectiveFilters.fromDate || undefined,
        toDate: effectiveFilters.toDate || undefined,
        limit: effectiveFilters.limit,
      });
      setSessions(Array.isArray(response?.data) ? response.data : []);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const groupedTopRewards = useMemo(() => {
    return Array.from(
      sessions.reduce((map, session) => {
        if (!session.rewardName) {
          return map;
        }
        map.set(session.rewardName, (map.get(session.rewardName) || 0) + 1);
        return map;
      }, new Map()).entries()
    )
      .map(([name, value]) => ({ name, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 5);
  }, [sessions]);

  return {
    sessions,
    loading,
    filters,
    setFilters,
    refresh,
    groupedTopRewards,
  };
}
