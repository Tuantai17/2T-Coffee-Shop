import { useCallback, useMemo, useState } from "react";
import miniGameApi from "../../../../api/miniGameApi";

export function useMiniGameRewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    gameId: "",
    search: "",
    rewardType: "ALL",
    status: "ALL",
  });

  const refresh = useCallback(async (nextFilters) => {
    const effectiveFilters = nextFilters || filters;
    try {
      setLoading(true);
      const response = await miniGameApi.getAdminRewards({
        gameId: effectiveFilters.gameId || undefined,
        search: effectiveFilters.search || undefined,
        rewardType: effectiveFilters.rewardType,
        status: effectiveFilters.status,
      });
      setRewards(Array.isArray(response?.data) ? response.data : []);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const rewardProbabilityTotal = useMemo(
    () => rewards.reduce((total, reward) => total + Number(reward.probability || 0), 0),
    [rewards]
  );

  return {
    rewards,
    loading,
    filters,
    setFilters,
    refresh,
    rewardProbabilityTotal,
  };
}
