import {getDashboardAnalytics, getMainCategories, getSubCategories} from "@/services/dashboard";

import { queryOptions } from "@tanstack/react-query";

export function createMainCategoriesQueryOptions() {
  return queryOptions<Category.Category[]>({
    queryKey: ['mainCategories'],
    queryFn: getMainCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function createSubCategoriesQueryOptions(selectedCategoryId: string | null) {
  return queryOptions<Category.Category[]>({
    queryKey: ['subCategories', selectedCategoryId],
    queryFn: () => selectedCategoryId ? getSubCategories(selectedCategoryId) : Promise.resolve([]),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!selectedCategoryId,
  });
}