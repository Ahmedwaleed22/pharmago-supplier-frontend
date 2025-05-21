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

function ProductAddStep4Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const productData = useSelector((state: any) => state.productCreation);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_PHARMACY_URL;

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
    formData.append("category_id", productData.category);
    formData.append("stock", productData.stock || "0");
    
    // Add notes if available
    if (productData.notes) {
      formData.append("notes", productData.notes);
    }
    
    // Process images - start with debugging info
    console.log("Images to process:", productData.images.length);
    
    // Create array to hold all processed image files
    const allImageFiles: File[] = [];
    
    // Process primary image first to ensure it's first in the array
    const primaryImage = productData.images.find((img: any) => img.isPrimary);
    if (primaryImage) {
      console.log("Processing primary image:", primaryImage.name, primaryImage.url.substring(0, 30) + "...");
      
      // If it's a Blob URL (new upload)
      if (primaryImage.url.startsWith('blob:')) {
        try {
          // Convert the object URL to a Blob/File
          const response = await fetch(primaryImage.url);
          const blob = await response.blob();
          console.log("Primary blob created:", blob.type, blob.size);
          
          const file = new File([blob], primaryImage.name || "primary-image.jpg", { type: blob.type });
          console.log("Primary file created:", file.name, file.type, file.size);
          
          // Add to our collection of files
          allImageFiles.push(file);
        } catch (error) {
          console.error("Error processing primary image:", error);
        }
      }
    }
    
    // Process additional images
    const additionalImages = productData.images.filter((img: any) => !img.isPrimary);
    if (additionalImages.length > 0) {
      console.log("Processing additional images:", additionalImages.length);
      
      // Convert each image to File if it's a Blob URL
      try {
        const additionalFiles = await Promise.all(
          additionalImages.map(async (image: any, index: number) => {
            if (image.url.startsWith('blob:')) {
              try {
                console.log(`Processing additional image ${index}:`, image.name);
                const response = await fetch(image.url);
                const blob = await response.blob();
                return new File([blob], image.name || `additional-image-${index}.jpg`, { type: blob.type });
              } catch (error) {
                console.error(`Error processing additional image ${index}:`, error);
                return null;
              }
            }
            return null;
          })
        );
        
        // Filter out null values and add to our collection
        additionalFiles.filter(Boolean).forEach(file => {
          if (file) allImageFiles.push(file);
        });
      } catch (error) {
        console.error("Error processing additional images:", error);
      }
    }
    
    // Now add all images to the formData under images[]
    if (allImageFiles.length > 0) {
      console.log(`Adding ${allImageFiles.length} images to formData as images[]`);
      allImageFiles.forEach((file, index) => {
        formData.append("images[]", file);
        console.log(`Appended image ${index}:`, file.name);
      });
    } else {
      console.warn("No image files processed successfully");
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

  const createProductMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Create a Direct API call instead of using the proxy
      const url = `${API_BASE_URL}/products/`;
      
      console.log("Making direct API call to:", url);
      
      // Get the auth token using the proper method from api.ts
      const token = getAuthToken();
      console.log("Authentication token available:", !!token);
      
      if (!token) {
        console.error("No authentication token found");
        throw new Error("Authentication failed - no token available");
      }
      
      // Use XMLHttpRequest for more reliable FormData upload
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        
        // Set auth header with the token from cookies
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              resolve({ success: true });
            }
          } else {
            console.error("Error response:", xhr.status, xhr.statusText, xhr.responseText);
            reject({
              status: xhr.status,
              message: xhr.statusText || "Request failed",
              response: xhr.responseText
            });
          }
        };
        
        xhr.onerror = function() {
          reject({
            status: xhr.status,
            message: 'Network error occurred'
          });
        };
        
        xhr.upload.onprogress = function(event) {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
          }
        };
        
        xhr.send(formData);
      });
    },
    onSuccess: (data) => {
      console.log("Product created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['pharmacy-products'] });
      router.push("/dashboard/products"); // Correct redirect path
      dispatch(resetProductCreation());
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("Error creating product:", error);
      setError(error.message || "Failed to create product");
    }
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const formData = await prepareProductData(productData);
      createProductMutation.mutate(formData);
    } catch (error: any) {
      console.error("Error preparing data:", error);
      setIsSubmitting(false);
      setError(error.message || "Failed to prepare data");
    }
  };

  const goBack = () => {
    router.push("/dashboard/products/add/step-3");
  };

  return (
    <ProductLayout>
      <div className="w-1/2">
        <h1 className="mb-2 text-2xl font-semibold text-[#414651]">
          Product Review
        </h1>
        <p className="mb-8 text-[#717171]">
          Review your product details before submitting
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={goBack}
            className="w-1/2 rounded-md border border-[#2970ff] bg-white py-2 text-center font-semibold text-[#2970ff] hover:bg-blue-50"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-1/2 rounded-md bg-[#2970ff] py-2 text-center font-semibold text-white hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <ProductPreview />
    </ProductLayout>
  );
}

export default ProductAddStep4Page;
