import { getDashboardAnalytics } from "@/services/dashboard";

import { queryOptions } from "@tanstack/react-query";

export default function createDashboardAnalyticsQueryOptions() {
  return queryOptions<Dashboard.Analytics>({
    queryKey: ['dashboardAnalytics'],
    queryFn: getDashboardAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2
  })
}