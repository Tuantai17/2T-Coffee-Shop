import { useCallback, useMemo, useState } from "react";
import miniGameApi from "../../../../api/miniGameApi";
import { normalizeBooleanFilter } from "../minigameUtils";

export function useMiniGameGames() {
  const [gamesPage, setGamesPage] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "ALL",
    status: "ALL",
    visible: "ALL",
    featured: "ALL",
    page: 0,
    size: 10,
  });
  const [selectedIds, setSelectedIds] = useState([]);

  const refresh = useCallback(async (nextFilters) => {
    const effectiveFilters = nextFilters || filters;
    try {
      setLoading(true);
      const backendParams = {
        search: effectiveFilters.search,
        type: effectiveFilters.type,
        status: effectiveFilters.status,
        visible: normalizeBooleanFilter(effectiveFilters.visible),
        page: effectiveFilters.page,
        size: effectiveFilters.size,
      };
      const response = await miniGameApi.getAdminGames(backendParams);
      const payload = response?.data || {};
      const content = Array.isArray(payload.content) ? payload.content : [];
      const featuredFilter = normalizeBooleanFilter(effectiveFilters.featured);
      const filteredContent = featuredFilter === null
        ? content
        : content.filter((game) => Boolean(game.featured) === featuredFilter);
      setGamesPage({
        content: filteredContent,
        page: payload.page || 0,
        totalPages: payload.totalPages || 0,
        totalElements: featuredFilter === null ? payload.totalElements || 0 : filteredContent.length,
      });
      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const selectedGames = useMemo(
    () => gamesPage.content.filter((game) => selectedIds.includes(game.id)),
    [gamesPage.content, selectedIds]
  );

  return {
    gamesPage,
    loading,
    filters,
    setFilters,
    refresh,
    selectedIds,
    setSelectedIds,
    selectedGames,
  };
}
