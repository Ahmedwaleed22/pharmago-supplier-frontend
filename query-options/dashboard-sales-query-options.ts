import { getDashboardSales } from "@/services/dashboard";

import { queryOptions } from "@tanstack/react-query";

export default function createDashboardSalesQueryOptions() {
  return queryOptions<Dashboard.Sales>({
    queryKey: ['dashboardSales'],
    queryFn: getDashboardSales,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2
  })
}