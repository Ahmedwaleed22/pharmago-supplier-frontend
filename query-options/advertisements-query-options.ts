import { fetchAdvertisements, deleteAdvertisement, setPrimaryAdvertisement } from "@/services/advertisements";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

export function createAdvertisementsQueryOptions() {
  return queryOptions<Advertisement.Advertisement[]>({
    queryKey: ['advertisements'],
    queryFn: fetchAdvertisements,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Custom hook for delete with confirmation and toast
export function useDeleteAdvertisementMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAdvertisement,
    onSuccess: () => {
      // Invalidate and refetch advertisements list
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
    onError: (error: any) => {
      console.error('Error deleting advertisement:', error);
    },
  });
}

// Custom hook for set primary with toast
export function useSetPrimaryAdvertisementMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: setPrimaryAdvertisement,
    onSuccess: () => {
      // Invalidate and refetch advertisements list
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
    onError: (error: any) => {
      console.error('Error setting primary advertisement:', error);
    },
  });
} 