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

// Define interfaces for image types
interface ProductImageData {
  url: string;
  is_primary?: boolean;
  id?: string;
  size?: number;
}

function ProductEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const productData = useSelector((state: any) => state.productCreation);
  const productId = params.id;

  // Fetch product data
  const {
    data: product,
    isLoading: productLoading,
    isError: productError
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId
  });

  // Initialize the product data once we have the product
  useEffect(() => {
    if (product) {
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
      
      // Add main image if exists
      if (product.image) {
        productImages.push({
          name: "product-image.jpg",
          url: product.image,
          isPrimary: true,
          size: 0, // Size unknown for existing images
          id: "main-image"
        });
      }
      
      // Add additional images if they exist - using optional chaining for safety
      const additionalImages = (product as any).images;
      if (additionalImages && Array.isArray(additionalImages)) {
        additionalImages.forEach((img: string | ProductImageData, index: number) => {
          const imageObj = typeof img === 'string' 
            ? { url: img } 
            : img;
            
          productImages.push({
            name: `image-${index}.jpg`,
            url: imageObj.url,
            isPrimary: Boolean(imageObj.is_primary) && !productImages.some(img => img.isPrimary),
            size: imageObj.size || 0,
            id: imageObj.id || `image-${index}`
          });
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

  // Navigate to the next page in the edit flow
  const NextPage = () => {
    router.push(`/dashboard/product/edit/${productId}/step-2`);
  };

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

  return (
    <ProductLayout>
      <div className="w-1/2">
        <h1 className="mb-2 text-2xl font-semibold text-[#414651]">
          Edit Product Details
        </h1>
        <p className="mb-8 text-[#717171]">
          Update your product information
        </p>

        <div className="space-y-6">
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