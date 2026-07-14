import { useCallback, useMemo, useState } from "react";
import miniGameApi from "../../../../api/miniGameApi";
import { parsePlayData } from "../minigameUtils";

function distinctCount(items, selector) {
  return new Set(items.map(selector).filter(Boolean)).size;
}

function average(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function useMiniGameDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [playSessions, setPlaySessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardRes, playSessionsRes] = await Promise.all([
        miniGameApi.getAdminDashboard(),
        miniGameApi.getAdminPlaySessions({ limit: 500 }),
      ]);
      setDashboard(dashboardRes?.data || null);
      setPlaySessions(Array.isArray(playSessionsRes?.data) ? playSessionsRes.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const derivedSummary = useMemo(() => {
    const today = new Date();
    const isToday = (value) => {
      const date = new Date(value);
      return date.toDateString() === today.toDateString();
    };
    const withinDays = (value, days) => {
      const date = new Date(value);
      const start = new Date();
      start.setDate(start.getDate() - (days - 1));
      start.setHours(0, 0, 0, 0);
      return date >= start;
    };

    const durations = playSessions
      .map((session) => Number(parsePlayData(session.playDataJson).durationSeconds || 0))
      .filter((value) => value > 0);
    const scores = playSessions.map((session) => Number(session.score || 0)).filter((value) => value > 0);
    const rewardedSessions = playSessions.filter((session) => session.rewardName || session.pointEarned || session.voucherId);

    return {
      inactiveGames: Math.max(0, Number(dashboard?.summary?.totalGames || 0) - Number(dashboard?.summary?.activeGames || 0)),
      todayPlays: playSessions.filter((session) => isToday(session.playedAt)).length,
      weeklyPlays: playSessions.filter((session) => withinDays(session.playedAt, 7)).length,
      monthlyPlays: playSessions.filter((session) => withinDays(session.playedAt, 30)).length,
      dailyActiveUsers: distinctCount(playSessions.filter((session) => isToday(session.playedAt)), (session) => session.userId),
      monthlyActiveUsers: distinctCount(playSessions.filter((session) => withinDays(session.playedAt, 30)), (session) => session.userId),
      averagePlayTime: Math.round(average(durations)),
      averageScore: Math.round(average(scores)),
      totalRewards: rewardedSessions.length,
      rewardTypeDistribution: [
        { name: "Point", value: playSessions.filter((session) => Number(session.pointEarned || 0) > 0).length },
        { name: "Voucher", value: playSessions.filter((session) => Boolean(session.voucherId)).length },
        { name: "No reward", value: playSessions.filter((session) => !session.voucherId && !session.pointEarned).length },
      ].filter((item) => item.value > 0),
      topPlayers: Array.from(
        playSessions.reduce((map, session) => {
          const previous = map.get(session.userId) || { userId: session.userId, plays: 0, points: 0 };
          previous.plays += 1;
          previous.points += Number(session.pointEarned || 0);
          map.set(session.userId, previous);
          return map;
        }, new Map()).values()
      )
        .sort((left, right) => right.plays - left.plays)
        .slice(0, 5),
      topSessions: [...playSessions]
        .sort((left, right) => Number(right.score || 0) - Number(left.score || 0))
        .slice(0, 5),
      hourHeatmap: Array.from({ length: 24 }, (_, hour) => ({
        hour: `${String(hour).padStart(2, "0")}:00`,
        plays: playSessions.filter((session) => new Date(session.playedAt).getHours() === hour).length,
      })),
    };
  }, [dashboard, playSessions]);

  return {
    dashboard,
    playSessions,
    loading,
    refresh,
    derivedSummary,
  };
}
