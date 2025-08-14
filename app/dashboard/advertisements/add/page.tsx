"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/contexts/i18n-context";
import ADsLayout from "@/layouts/ads-layout";
import ImageUpload from "@/components/image-upload";
import ADsPreview from "@/components/ads-preview";
import axios from "axios";

export interface ImageFile {
  file: File;
  url: string;
  name: string;
  size: number;
  isPrimary: boolean;
  id: string;
}

function ProductAddPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [images, setImages] = useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleImagesChange = (files: File[]) => {
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      id: `${Date.now()}-${file.name}`,
      isPrimary: false,
    }));
    
    setImages((prev) => {
      const updatedImages = [...prev, ...newImages];
      // Set first image as primary if no primary image exists
      if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
        updatedImages[0].isPrimary = true;
      }
      return updatedImages;
    });
  };

  const handleSetPrimary = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages.forEach((image, i) => {
        image.isPrimary = i === index;
      });
      console.log(newImages);
      return newImages;
    });
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => {
      const imageToDelete = prev[index];
      
      // Revoke blob URL to prevent memory leaks
      if (imageToDelete?.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      
      const newImages = prev.filter((_, i) => i !== index);
      
      // If deleted image was primary and there are remaining images, make first one primary
      if (imageToDelete?.isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      
      return newImages;
    });
  };

  const prepareAdvertisementData = async () => {
    const formData = new FormData();
    
    let displayOrder = 1;
    
    // Loop over every image to send all of them
    for (let index = 0; index < images.length; index++) {
      const image = images[index];
      
      if (image.url.startsWith('blob:')) {
        try {
          const response = await fetch(image.url);
          const blob = await response.blob();
          const file = new File([blob], image.name || "advertisement-image.jpg", { type: blob.type });
          
          // Add each image with indexed field names to avoid overwriting
          formData.append(`image_${index}`, file);
          
          // Add display order for each image (primary images get 0, others get incremented values)
          const imageDisplayOrder = image.isPrimary ? 0 : displayOrder++;
          formData.append(`display_order_${index}`, imageDisplayOrder.toString());
          
        } catch (error) {
          console.error("Error processing image:", error);
        }
      }
    }
    
    return formData;
  };

  const createAdvertisementMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post('/api/advertisements', formData);
      
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.message || t('errors.general'));
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Advertisement created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      router.push("/dashboard/advertisements");
      setIsSubmitting(false);
      setError("");
    },
    onError: (error: any) => {
      console.error("Error creating advertisement:", error);
      setError(error.message || t('errors.general'));
      setIsSubmitting(false);
    },
  });

  const handlePostAdvertisement = async () => {
    if (images.length === 0) {
      setError(t('forms.required'));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = await prepareAdvertisementData();
      createAdvertisementMutation.mutate(formData);
    } catch (error) {
      console.error("Error preparing advertisement data:", error);
      setError(t('errors.general'));
      setIsSubmitting(false);
    }
  };

  // Memoize existingImages to prevent unnecessary re-renders
  const existingImages = useMemo(() => 
    images.map((image, index) => ({
      url: image.url,
      id: image.id,
      isPrimary: image.isPrimary || false,
      name: image.name,
      size: image.size,
    })), [images]
  );

  return (
    <ADsLayout>
      <div className="w-1/2">
        <h1 className="mb-2 text-2xl font-semibold text-[#414651]">
          {t("advertisements.addAdvertisementImage")}
        </h1>
        <p className="mb-8 text-[#717171]">
          {t("products.boostSalesWithDetails")}
        </p>

        <div className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          
          <ImageUpload
            onImagesChange={handleImagesChange}
            onDeleteImage={handleDeleteImage}
            onSetPrimaryImage={handleSetPrimary}
            existingImages={existingImages}
          />

          <button
            onClick={handlePostAdvertisement}
            className="w-full rounded-lg bg-[#2970ff] py-3 text-center font-semibold text-white hover:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || createAdvertisementMutation.isPending}
          >
            {isSubmitting || createAdvertisementMutation.isPending 
              ? t("ui.uploading")
              : t("advertisements.postAdvertisement")
            }
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <ADsPreview images={images} />
    </ADsLayout>
  );
}

export default ProductAddPage;
