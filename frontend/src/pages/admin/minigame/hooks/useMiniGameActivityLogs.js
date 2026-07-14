import { useMemo } from "react";

export function useMiniGameActivityLogs(analytics) {
  return useMemo(() => {
    if (!Array.isArray(analytics?.activityLogs)) {
      return [];
    }
    return analytics.activityLogs;
  }, [analytics]);
}
