"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import ProductLayout from "@/layouts/product-layout";
import LabeledInput from "@/components/labeled-input";
import ProductPreview from "@/components/product-preview";
import { 
  setName, 
  setSubName, 
  setCategory, 
  setSubCategory, 
  setProductDetails,
  setNotes,
  initializeProductData
} from "@/store/ProductCreationSlice";
import { getProductById } from "@/services/dashboard";
import {
  createMainCategoriesQueryOptions,
  createSubCategoriesQueryOptions
} from "@/query-options/categories-query-options";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFormSkeleton, ProductPreviewSkeleton } from "@/components/ui/dashboard/product-form-skeleton";

function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const productData = useSelector((state: any) => state.productCreation);
  // Check if params is a Promise and unwrap it if needed
  const productId = React.use(params).id;

  // Fetch existing product data
  const {
    data: existingProduct,
    isLoading: productLoading,
    isError: productError
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError
  } = useQuery<Category.Category[]>(createMainCategoriesQueryOptions());

  // Fetch subcategories when a category is selected
  const {
    data: subCategories = [],
    isLoading: subCategoriesLoading,
    isError: subCategoriesError,
    refetch: refetchSubCategories
  } = useQuery<Category.Category[]>(createSubCategoriesQueryOptions(productData.category));

  // Initialize product data when existing product loads
  useEffect(() => {
    if (existingProduct && !productData.name) {
      // Map the product data to match the expected format
      const mappedProductData = {
        name: existingProduct.name || '',
        subName: existingProduct.description || '',
        category: existingProduct.category?.id || '',
        subCategory: existingProduct.category?.parent_id || '',
        productDetails: existingProduct.details || '',
        price: existingProduct.price?.toString() || '',
        discount: existingProduct.discount_percentage?.toString() || '0',
        tag: typeof existingProduct.tag === 'object' && existingProduct.tag !== null 
          ? (existingProduct.tag as any).title || '' 
          : existingProduct.tag || '',
        tagColor: typeof existingProduct.tag === 'object' && existingProduct.tag !== null 
          ? (existingProduct.tag as any).color || '#2970FF' 
          : '#2970FF',
        images: (() => {
          const productImages: Array<{
            name: string;
            url: string;
            isPrimary: boolean;
            size: number;
            id: string;
          }> = [];
          
          // Check if there are images in the product.images array first
          const additionalImages = (existingProduct as any).images;
          if (additionalImages && Array.isArray(additionalImages)) {
            additionalImages.forEach((img: string | any, index: number) => {
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
          if (productImages.length === 0 && existingProduct.image) {
            productImages.push({
              name: 'main-image.jpg',
              url: existingProduct.image,
              isPrimary: true,
              size: 0,
              id: 'main-image'
            });
          }
          
          return productImages;
        })(),
        notes: existingProduct.notes || '',
        stock: existingProduct.stock?.toString() || '0'
      };
      dispatch(initializeProductData(mappedProductData));
    }
  }, [existingProduct, productData.name, dispatch]);

  // Navigate to the next page in the edit flow
  const NextPage = () => {
    router.push(`/dashboard/products/edit/${productId}/step-2`);
  };

  // Show full skeleton if data is loading
  if (categoriesLoading || productLoading) {
    return (
      <ProductLayout>
        <ProductFormSkeleton />
        <ProductPreviewSkeleton />
      </ProductLayout>
    );
  }

  // Show error state if product failed to load
  if (productError) {
    return (
      <ProductLayout>
        <div className="w-full xl:w-1/2">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Product</h2>
            <p className="text-gray-600 mb-4">We couldn't load the product details. Please try again.</p>
            <button 
              onClick={() => router.push('/dashboard/products')}
              className="px-4 py-2 bg-[#2970ff] text-white rounded-md hover:bg-blue-600"
            >
              Back to Products
            </button>
          </div>
        </div>
        <ProductPreviewSkeleton />
      </ProductLayout>
    );
  }

  return (
    <ProductLayout>
      <div className="w-full xl:w-1/2">
        <h1 className="mb-2 text-xl xl:text-2xl font-semibold text-[#414651]">
          Edit Product Details
        </h1>
        <p className="mb-6 xl:mb-8 text-[#717171]">
          Update your product information
        </p>

        <div className="space-y-4 xl:space-y-6">
          <LabeledInput
            id="product-name"
            label="Product Name"
            placeholder="Product Name"
            value={productData.name}
            onChange={(value) => dispatch(setName(value))}
          />

          <LabeledInput
            id="product-short-description"
            label="Product Short Description"
            placeholder="Product Short Description"
            value={productData.subName}
            onChange={(value) => dispatch(setSubName(value))}
          />
          
          <LabeledInput
            id="category"
            label="Category"
            type="select"
            value={productData.category}
            onChange={(value) => dispatch(setCategory(value))}
            options={[
              {
                label: "Select Category",
                value: "",
                disabled: true
              },
              ...categories.map((category) => ({
                label: category.name,
                value: category.id
              }))
            ]}
          />

          {subCategoriesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <LabeledInput
              id="sub-category"
              label="Sub-Category"
              type="select"
              value={productData.subCategory}
              onChange={(value) => dispatch(setSubCategory(value))}
              options={subCategories.map((subCategory) => ({
                label: subCategory.name,
                value: subCategory.id
              }))}
            />
          )}

          <LabeledInput
            id="product-details"
            label="Product Description"
            type="textarea"
            placeholder="Descriptions here"
            value={productData.productDetails}
            onChange={(value) => dispatch(setProductDetails(value))}
          />

          <button
            onClick={NextPage}
            className="w-full rounded-md bg-[#2970ff] py-2 text-center font-semibold text-white hover:bg-blue-600 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <ProductPreview />
    </ProductLayout>
  );
}

export default ProductEditPage; 