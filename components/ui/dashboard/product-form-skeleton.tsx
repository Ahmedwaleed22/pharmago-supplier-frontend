import { Skeleton } from "@/components/ui/skeleton";

interface ProductFormSkeletonProps {
  showImageUpload?: boolean;
  showPriceFields?: boolean;
  showReviewButtons?: boolean;
}

export function ProductFormSkeleton({ 
  showImageUpload = false, 
  showPriceFields = false, 
  showReviewButtons = false 
}: ProductFormSkeletonProps) {
  return (
    <div className="w-full xl:w-1/2">
      {/* Header */}
      <div className="mb-2">
        <Skeleton className="h-6 xl:h-8 w-64" />
      </div>
      <div className="mb-6 xl:mb-8">
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="space-y-4 xl:space-y-6">
        {/* Basic form fields for step 1 */}
        {!showImageUpload && !showPriceFields && !showReviewButtons && (
          <>
            {/* Product Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Sub Category */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Product Details */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </>
        )}

        {/* Price fields for step 2 */}
        {showPriceFields && (
          <>
            {/* Price */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Tag */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
          </>
        )}

        {/* Image upload for step 3 */}
        {showImageUpload && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-16 w-16 rounded" />
              <Skeleton className="h-16 w-16 rounded" />
              <Skeleton className="h-16 w-16 rounded" />
            </div>
          </div>
        )}

        {/* Review buttons for step 4 */}
        {showReviewButtons ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 w-full sm:w-1/2" />
            <Skeleton className="h-10 w-full sm:w-1/2" />
          </div>
        ) : (
          <Skeleton className="h-10 w-full" />
        )}
      </div>
    </div>
  );
}

export function ProductPreviewSkeleton() {
  return (
    <div className="w-full xl:w-1/2 max-w-[407px]">
      {/* Header */}
      <div className="mb-2">
        <Skeleton className="h-5 xl:h-6 w-20" />
      </div>
      <div className="mb-4 xl:mb-6">
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Preview Card */}
      <div className="rounded-lg bg-white p-4 xl:p-6 w-full max-w-[407px] shadow-sm">
        {/* Image */}
        <div className="mb-6">
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </div>

        {/* Category and Logo */}
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>

        {/* Product Name */}
        <div className="mb-1">
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Product Description */}
        <div className="mb-4">
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Price */}
        <div className="mb-4 flex items-baseline gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-1">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="mt-2">
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
} 