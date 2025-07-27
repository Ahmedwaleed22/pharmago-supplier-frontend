"use client";

import DashboardLayout from "@/layouts/dashboard-layout";
import { usePathname, useRouter } from "next/navigation";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/store/store";
import React, { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/api";
import { initializeProductData } from "@/store/ProductCreationSlice";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/services/dashboard";
import ProductLayout from "@/layouts/product-layout";

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
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const productData = useSelector((state: any) => state.productCreation);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract productId early
  const productId =  React.use(params).id;
  
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

  // Authentication effect
  useEffect(() => {
    // Check authentication on client side
    if (!isAuthenticated()) {
      router.push("/");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // Product data initialization effect
  useEffect(() => {
    if (product && !productData?.name) {
      // Parse tag if needed
      let tagTitle = "";
      let tagColor = "#2970ff";
      
      try {
        if (typeof product.tag === 'string' && product.tag) {
          const parsedTag = JSON.parse(product.tag);
          tagTitle = parsedTag.title || "";
          tagColor = parsedTag.color || "#2970ff";
        } else if (product.tag && typeof product.tag === 'object') {
          const tag: Product.Tag = product.tag;
          tagTitle = tag.title || "";
          tagColor = tag.color || "#2970ff";
        }
      } catch (e) {
        console.error("Error parsing tag:", e);
      }

      // Get category info
      const categoryId = product.category?.parent_id || "";
      const subCategoryId = product.category?.id || "";
      
      // Process images
      const productImages: Array<{
        name: string;
        url: string;
        isPrimary: boolean;
        size: number;
        id: string;
      }> = [];
      
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

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

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
              <div>Loading product data...</div>
            </div>
          </ProductLayout>
        );
      }
    
      if (productError) {
        return (
          <ProductLayout>
            <div className="w-1/2 flex justify-center items-center h-full">
              <div>Error loading product data. Please try again.</div>
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