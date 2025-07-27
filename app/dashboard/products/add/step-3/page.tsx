"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ProductLayout from "@/layouts/product-layout";
import ProductPreview from "@/components/product-preview";
import { 
  addImage,
  removeImage,
  setPrimaryImage
} from "@/store/ProductCreationSlice";
import ImageUpload from "@/components/image-upload";
import { useTranslation } from "@/contexts/i18n-context";
import { ProductFormSkeleton, ProductPreviewSkeleton } from "@/components/ui/dashboard/product-form-skeleton";

function ProductAddStep3Page() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const productData = useSelector((state: any) => state.productCreation);

  const handleImagesChange = (files: File[]) => {
    // For each file, create an object URL and dispatch the addImage action
    files.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const isPrimary = index === 0 && productData.images.length === 0;
      
      dispatch(addImage({
        name: file.name,
        size: file.size,
        url,
        isPrimary
      }));
    });
  };

  const handleDeleteImage = (index: number) => {
    // Find the image in the Redux store that matches the local index
    const imageToDelete = productData.images[index];
    if (imageToDelete) {
      // Revoke the object URL before removing from Redux
      if (imageToDelete.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      dispatch(removeImage(index));
    }
  };

  const handleSetPrimary = (index: number) => {
    dispatch(setPrimaryImage(index));
  };

  const NextPage = () => {
    router.push("/dashboard/products/add/step-4");
  };

  // Show skeleton while component is initializing
  if (!productData) {
    return (
      <ProductLayout>
        <ProductFormSkeleton showImageUpload />
        <ProductPreviewSkeleton />
      </ProductLayout>
    );
  }

  return (
    <ProductLayout>
      <div className="w-full xl:w-1/2">
        <h1 className="mb-2 text-xl xl:text-2xl font-semibold text-[#414651]">
          {t('products.productImageStep')}
        </h1>
        <p className="mb-6 xl:mb-8 text-[#717171]">
          {t('products.boostSalesWithDetails')}
        </p>

        <div className="space-y-4 xl:space-y-6">
          <ImageUpload 
            onImagesChange={handleImagesChange}
            onDeleteImage={handleDeleteImage}
            onSetPrimaryImage={handleSetPrimary}
            existingImages={productData.images}
          />

          <button
            onClick={NextPage}
            className="w-full rounded-lg bg-[#2970ff] py-3 text-center font-semibold text-white hover:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={productData.images.length === 0}
          >
            {t('common.next')}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <ProductPreview />
    </ProductLayout>
  );
}

export default ProductAddStep3Page;
