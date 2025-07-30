import { getDashboardSales } from "@/services/dashboard";

import { queryOptions } from "@tanstack/react-query";

export default function createDashboardSalesQueryOptions(fromDate?: string, toDate?: string) {
  return queryOptions<Dashboard.Sales>({
    queryKey: ['dashboardSales', fromDate, toDate],
    queryFn: () => getDashboardSales(fromDate, toDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2
  })
}