import React from "react";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getCurrency, getPharmacy } from "@/store/authSlice";
import { formatPrice } from "@/helpers/products";
import { createMainCategoriesQueryOptions } from "@/query-options/categories-query-options";
import { useQuery } from "@tanstack/react-query";
import { createSubCategoriesQueryOptions } from "@/query-options/categories-query-options";
import Image from "next/image";

interface ProductPreviewProps {
  className?: string;
}

function ProductPreview({ className }: ProductPreviewProps) {
  const productData = useSelector((state: any) => state.productCreation);
  const currency = useSelector(getCurrency);
  const pharmacy = useSelector(getPharmacy);
  const router = useRouter();

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError
  } = useQuery<Category.Category[]>(createMainCategoriesQueryOptions());

  const {
    data: subCategories = [],
    isLoading: subCategoriesLoading,
    isError: subCategoriesError
  } = useQuery<Category.Category[]>(createSubCategoriesQueryOptions(productData.category));


  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat: any) => cat.id === categoryId);
    return category ? category.name : "Main Category";
  };

  const getSubCategoryName = (subCategoryId: string) => {
    const subCategory = subCategories.find((subCat: any) => subCat.id === subCategoryId);
    return subCategory ? subCategory.name : "Sub-Category";
  };

  const getPrimaryImageUrl = () => {
    if (productData.images && productData.images.length > 0) {
      const primaryImage = productData.images.find((img: any) => img.isPrimary);
      if (primaryImage) {
        return primaryImage.url;
      }
      // If no primary image is found, use the first image
      return productData.images[0].url;
    }
    // Fall back to the legacy image field
    return productData.image || "";
  };

  const imageUrl = getPrimaryImageUrl();

  // Determine the path for the image editing page based on the current route
  const getImageEditPath = () => {
    // Default to the add flow
    let path = "/dashboard/products/add/step-3";
    
    // Try to detect if we're in the edit flow by checking the URL
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/product/edit/')) {
        // Extract the product ID from the URL
        const matches = currentPath.match(/\/product\/edit\/([^/]+)/);
        if (matches && matches[1]) {
          path = `/dashboard/products/edit/${matches[1]}/step-3`;
        }
      }
    }
    
    return path;
  };

  return (
    <div className={cn("w-1/2 max-w-[407px]", className)}>
      <h2 className="mb-2 text-xl font-semibold text-[#414651]">Preview</h2>
      <p className="mb-6 text-[#717171]">
        This is how your product will appear.
      </p>

      <div className="rounded-lg bg-white p-6 max-w-[407px] shadow-sm">
        <div 
          onClick={() => router.push(getImageEditPath())} 
          className={`mb-6 flex items-center justify-center rounded-lg bg-white min-h-[250px] ${!imageUrl ? "p-8 border border-dashed border-[#afafaf] cursor-pointer" : ""}`}
          style={{ 
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {imageUrl ? (
            <div style={{ width: '100%', height: '100%', minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={imageUrl} 
                alt={productData.name || "Product"}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#afafaf]">
                  <Plus className="h-5 w-5 text-[#717171]" />
                </div>
              </div>
              <div className="text-sm text-[#717171]">
                Product Image
                <br />
                800×800
              </div>
            </div>
          )}
        </div>

        <div className="mb-2 flex items-center">
          <div className="text-sm text-[#717171]">
            {getCategoryName(productData.category) || "Main Category"} · {getSubCategoryName(productData.subCategory) || "Sub-Category"}
          </div>
          <div className="ml-auto flex items-center">
            {pharmacy?.logo && (
              <Image className="h-8 w-auto" src={pharmacy?.logo} alt={pharmacy?.name || ""} width={100} height={32} />
            )}
          </div>
        </div>

        <div className="mb-1 text-lg font-medium text-[#414651]">
          {productData.name || "Product Name will show here"}
        </div>
        <div className="mb-4 text-sm text-[#717171]">
          {productData.subName || "Sub-Name will show here"}
        </div>

        <div className="mb-4 flex items-baseline">
          <div className="text-2xl font-bold text-[#2970ff]">
            {productData.price ? `${formatPrice(productData.price - (productData.price * productData.discount / 100), currency)}` : `${formatPrice(0, currency)}`}
          </div>
          {productData.discount > 0 && (
            <>
              <div className="ml-2 text-sm text-[#a0a0a0]">
                {productData.price ? `${formatPrice(productData.price || 0, currency)}` : `${formatPrice(0.00, currency)}`}
              </div>
              <div className="ml-2 rounded bg-[#f4f4f5] px-2 py-0.5 text-xs text-[#717171]">
                -{productData.discount}%
              </div>
            </>
          )}
        </div>

        <div>
          <div className="mb-1 text-sm font-medium text-[#414651]">
            Product Details
          </div>
          <div className="text-sm text-[#717171]">
            {productData.productDetails || "Your Description will show here"}
          </div>
          {productData.tag && productData.tagColor && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span
                className={`rounded-md px-2 py-0.5 text-xs text-white`}
                style={{ backgroundColor: productData.tagColor }}
              >
                {productData.tag}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPreview;
