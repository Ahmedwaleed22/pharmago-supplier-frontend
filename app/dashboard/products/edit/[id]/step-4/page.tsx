"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductLayout from "@/layouts/product-layout";
import ProductPreview from "@/components/product-preview";
import { resetProductCreation } from "@/store/ProductCreationSlice";
import axios from "axios";
import { getAuthHeader, getAuthToken } from "@/lib/api";
import { useTranslation } from "@/contexts/i18n-context";
import { ProductFormSkeleton, ProductPreviewSkeleton } from "@/components/ui/dashboard/product-form-skeleton";

function ProductEditStep4Page({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const productData = useSelector((state: any) => state.productCreation);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Check if params is a Promise and unwrap it if needed
  const productId = React.use(params).id;

  const prepareProductData = async (productData: any) => {
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("details", productData.productDetails);
    formData.append("description", productData.subName || "");
    formData.append("price", productData.price);
    formData.append("discount_percentage", productData.discount || "0");
    formData.append("tag", JSON.stringify(
      {
        "title": productData.tag,
        "color": productData.tagColor
      }
    ) || "[]");
    formData.append("category_id", productData.subCategory || productData.category);
    formData.append("stock", productData.stock || "99999999");
    
    // Add notes if available
    if (productData.notes) {
      formData.append("notes", productData.notes);
    }
    
    // Process images - start with debugging info
    console.log("Images to process:", productData.images.length);
    console.log("Product data images:", productData.images);
    
    // Process images - separate new uploads from existing images
    const newImageFiles: File[] = [];
    const existingImageUrls: string[] = [];
    
    // Separate primary and non-primary images
    const primaryNewImages: File[] = [];
    const nonPrimaryNewImages: File[] = [];
    const primaryExistingImages: string[] = [];
    const nonPrimaryExistingImages: string[] = [];
    
    for (let i = 0; i < productData.images.length; i++) {
      const image = productData.images[i];
      console.log(`Processing image ${i}:`, image.name, image.url.substring(0, 50) + "...", `isPrimary: ${image.isPrimary}`);
      
      // If it's a Blob URL (new upload)
      if (image.url.startsWith('blob:')) {
        try {
          // Convert the object URL to a Blob/File
          const response = await fetch(image.url);
          const blob = await response.blob();
          console.log(`New image ${i} blob created:`, blob.type, blob.size);
          
          const file = new File([blob], image.name || `new-image-${i}.jpg`, { type: blob.type });
          console.log(`New image ${i} file created:`, file.name, file.type, file.size);
          
          // Add to appropriate collection based on primary status
          if (image.isPrimary) {
            primaryNewImages.push(file);
            console.log(`Added primary new image ${i} to primaryNewImages array`);
          } else {
            nonPrimaryNewImages.push(file);
            console.log(`Added non-primary new image ${i} to nonPrimaryNewImages array`);
          }
        } catch (error) {
          console.error(`Error processing new image ${i}:`, error);
        }
      } else {
        // For existing images, just collect the URLs
        console.log(`Collecting existing image URL ${i}:`, image.url);
        
        // Add to appropriate collection based on primary status
        if (image.isPrimary) {
          primaryExistingImages.push(image.url);
          console.log(`Added primary existing image ${i} to primaryExistingImages array`);
        } else {
          nonPrimaryExistingImages.push(image.url);
          console.log(`Added non-primary existing image ${i} to nonPrimaryExistingImages array`);
        }
      }
    }
    
    // Combine new images with primary images first
    newImageFiles.push(...primaryNewImages, ...nonPrimaryNewImages);
    
    // Combine existing image URLs with primary images first
    existingImageUrls.push(...primaryExistingImages, ...nonPrimaryExistingImages);
    
    console.log(`Final image arrays:`, {
      primaryNewImages: primaryNewImages.length,
      nonPrimaryNewImages: nonPrimaryNewImages.length,
      primaryExistingImages: primaryExistingImages.length,
      nonPrimaryExistingImages: nonPrimaryExistingImages.length,
      newImageFiles: newImageFiles.length,
      existingImageUrls: existingImageUrls.length
    });
    
    // Add new images to formData as files
    if (newImageFiles.length > 0) {
      console.log(`Adding ${newImageFiles.length} new images to formData as images[]`);
      
      newImageFiles.forEach((file: File, index: number) => {
        formData.append("images[]", file);
        console.log(`Appended new image ${index}:`, file.name);
      });
    }
    
    // Add existing image URLs to formData
    if (existingImageUrls.length > 0) {
      console.log(`Adding ${existingImageUrls.length} existing image URLs to formData as existing_images`);
      formData.append("existing_images", JSON.stringify(existingImageUrls));
    }
    
    // Find which image should be primary
    const primaryImage = productData.images.find((img: any) => img.isPrimary);
    console.log(`Primary image in Redux store:`, primaryImage);
    
    // Handle primary image selection
    if (primaryImage) {
      if (primaryImage.url.startsWith('blob:')) {
        // This is a new image - since we put primary images first, the index is 0
        formData.append("primary_image_index", "0");
        console.log(`Set primary_image_index to 0 (new primary image)`);
      } else if (primaryImage.id && primaryImage.id !== 'main-image' && !primaryImage.id.startsWith('image-')) {
        // This is an existing image with a proper database ID
        formData.append("primary_image_id", primaryImage.id);
        console.log(`Set primary_image_id to:`, primaryImage.id);
      } else {
        // Fallback for existing images without proper IDs
        formData.append("primary_image_id", "0");
        console.log(`Set primary_image_id to 0 (first existing image)`);
      }
    } else {
      console.log(`No primary image found:`, primaryImage);
    }
    
    if (newImageFiles.length === 0 && existingImageUrls.length === 0) {
      console.warn("No images processed successfully");
    }
    
    // Debug the FormData content
    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(pair[0], pair[1].name, pair[1].type, pair[1].size);
      } else {
        console.log(pair[0], pair[1]);
      }
    }
    
    return formData;
  };

  const updateProductMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Use the proxy route for better CORS handling and authentication
      const url = `/api/dashboard/products/${productId}`;
      
      console.log("Making API call through proxy to:", url);
      
      // Use fetch with the proxy route
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || t('errors.general'));
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Product updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy-products'] });
      router.push("/dashboard/products"); // Correct redirect path
      dispatch(resetProductCreation());
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("Error updating product:", error);
      setError(error.message || "Failed to update product");
    }
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const formData = await prepareProductData(productData);
      updateProductMutation.mutate(formData);
    } catch (error: any) {
      console.error("Error preparing data:", error);
      setIsSubmitting(false);
      setError(error.message || "Failed to prepare data");
    }
  };

  const goBack = () => {
    router.push(`/dashboard/products/edit/${productId}/step-3`);
  };

  // Show skeleton while component is initializing
  if (!productData) {
    return (
      <ProductLayout>
        <ProductFormSkeleton showReviewButtons />
        <ProductPreviewSkeleton />
      </ProductLayout>
    );
  }

  return (
    <ProductLayout>
      <div className="w-full xl:w-1/2">
        <h1 className="mb-2 text-xl xl:text-2xl font-semibold text-[#414651]">
          Product Review
        </h1>
        <p className="mb-6 xl:mb-8 text-[#717171]">
          Review your product details before submitting
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={goBack}
            className="w-full sm:w-1/2 rounded-md border border-[#2970ff] bg-white py-2 text-center font-semibold text-[#2970ff] hover:bg-blue-50"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-1/2 rounded-md bg-[#2970ff] py-2 text-center font-semibold text-white hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <ProductPreview />
    </ProductLayout>
  );
}

export default ProductEditStep4Page; 