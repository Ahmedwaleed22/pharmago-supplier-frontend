import { getNotifications } from "@/services/dashboard";

import { queryOptions } from "@tanstack/react-query";

export function createNotificationsQueryOptions(skip: number = 0, limit: number = 3, locale: string = 'en') {
  return queryOptions<Dashboard.NotificationResponse>({
    queryKey: ['notifications', skip, limit],
    queryFn: async () => {
      console.log(`Fetching notifications with skip: ${skip}, limit: ${limit}...`);
      const result = await getNotifications(skip, limit, locale);
      console.log("Notifications fetched:", result);
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds instead of 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}