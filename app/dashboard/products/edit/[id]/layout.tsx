"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import DashboardLayout from "@/layouts/dashboard-layout";
import ProductLayout from "@/layouts/product-layout";
import { initializeProductData } from "@/store/ProductCreationSlice";
import { getProductById } from "@/services/dashboard";
import { useTranslation } from "@/contexts/i18n-context";

interface ProductImageData {
  url: string;
  name?: string;
  is_primary?: boolean;
  id?: string;
  size?: number;
}

export default function DashboardRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const productData = useSelector((state: any) => state.productCreation);
  // Check if params is a Promise and unwrap it if needed
  const productId = React.use(params).id;
  
  // Define query hook - must be called unconditionally
  const {
    data: product,
    isLoading: productLoading,
    isError: productError
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId
  });

  // Product data initialization effect
  useEffect(() => {
    if (product && !productData?.name) {
      // Extract category and subcategory IDs
      const categoryId = product.category?.id || '';
      const subCategoryId = product.category?.parent_id || '';
      
      // Extract tag information
      let tagTitle = '';
      let tagColor = '#2970FF';
      
      if (product.tag) {
        if (typeof product.tag === 'object' && product.tag !== null) {
          tagTitle = (product.tag as any).title || '';
          tagColor = (product.tag as any).color || '#2970FF';
        } else {
          tagTitle = product.tag;
        }
      }
      
      // Process images
      const productImages: {
        name: string;
        url: string;
        isPrimary: boolean;
        size: number;
        id: string;
      }[] = [];
      
      // Check if there are images in the product.images array first
      const additionalImages = (product as any).images;
      if (additionalImages && Array.isArray(additionalImages)) {
        additionalImages.forEach((img: string | ProductImageData, index: number) => {
          const imageObj = typeof img === 'string' 
            ? { url: img } 
            : img;
            
          productImages.push({
            name: imageObj.name || `image-${index}.jpg`,
            url: imageObj.url,
            isPrimary: Boolean(imageObj.is_primary),
            size: imageObj.size || 0,
            id: imageObj.id || `image-${index}`
          });
        });
      }
      
      // If no images in the array, check for single image field
      if (productImages.length === 0 && product.image) {
        productImages.push({
          name: 'main-image.jpg',
          url: product.image,
          isPrimary: true,
          size: 0, // We don't have size info for existing images
          id: 'main-image'
        });
      }
      
      dispatch(initializeProductData({
        name: product.name,
        subName: product.description || "",
        category: categoryId,
        subCategory: subCategoryId,
        productDetails: product.details || "",
        price: product.price?.toString() || "",
        discount: product.discount_percentage?.toString() || "",
        stock: product.stock?.toString() || "",
        tag: tagTitle,
        tagColor: tagColor,
        images: productImages
      }));
    }
  }, [product, dispatch]);

  const nonDashboardLayoutPages = [
    "/dashboard/products/add",
    "/dashboard/products/add/step-2",
    "/dashboard/products/add/step-3",
    "/dashboard/products/add/step-4",
    "/dashboard/prescriptions/requests",
    "/dashboard/prescriptions/approved",
    "/dashboard/prescriptions/order-history",
    "/dashboard/delivery/live-tracking",
    "/dashboard/delivery/history",
  ];

  const shouldExcludeFromDashboard =
    nonDashboardLayoutPages.includes(pathname) ||
    (pathname.startsWith("/dashboard/prescriptions/requests/") &&
      pathname !== "/dashboard/prescriptions/requests/") ||
    (pathname.startsWith("/dashboard/delivery/live-tracking/") &&
      pathname !== "/dashboard/delivery/live-tracking/") ||
    (pathname.startsWith("/dashboard/products/edit/") &&
      pathname !== "/dashboard/products/edit/");

  if (productLoading) {
    return (
      <ProductLayout>
        <div className="w-1/2 flex justify-center items-center h-full">
          <div>{t('products.loadingProductData')}</div>
        </div>
      </ProductLayout>
    );
  }

  if (productError) {
    return (
      <ProductLayout>
        <div className="w-1/2 flex justify-center items-center h-full">
          <div>{t('products.errorLoadingProductData')}</div>
        </div>
      </ProductLayout>
    );
  }

  if (shouldExcludeFromDashboard) {
    return <Provider store={store}>{children}</Provider>;
  }

  return (
    <Provider store={store}>
      <DashboardLayout>{children}</DashboardLayout>
    </Provider>
  );
} 