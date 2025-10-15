"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ProductLayout from "@/layouts/product-layout";
import LabeledInput from "@/components/labeled-input";
import ProductPreview from "@/components/product-preview";
import {
  setPrice,
  setDiscount,
  setStock,
  setTag,
  setTagColor,
  setPriceTiers,
} from "@/store/ProductCreationSlice";
import { useTranslation } from "@/contexts/i18n-context";
import { ProductFormSkeleton, ProductPreviewSkeleton } from "@/components/ui/dashboard/product-form-skeleton";

function ProductAddStep2Page() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const productData = useSelector((state: any) => state.productCreation);

  const NextPage = () => {
    router.push("/dashboard/products/add/step-3");
  };

  // Show skeleton while component is initializing
  if (!productData) {
    return (
      <ProductLayout>
        <ProductFormSkeleton showPriceFields />
        <ProductPreviewSkeleton />
      </ProductLayout>
    );
  }

  return (
    <ProductLayout>
      <div className="w-full xl:w-1/2">
        <h1 className="mb-2 text-xl xl:text-2xl font-semibold text-[#414651]">
          {t('products.addProductDetails')}
        </h1>
        <p className="mb-6 xl:mb-8 text-[#717171]">
          {t('products.boostSalesWithDetails')}
        </p>

        <div className="space-y-4 xl:space-y-6">
          <LabeledInput
            id="price"
            label={t('products.price')}
            placeholder={t('forms.pricePlaceholder')}
            value={productData.price}
            onChange={(value) => {
              // Allow only numbers and up to 2 decimal places
              if (/^\d*\.?\d{0,2}$/.test(value)) {
                dispatch(setPrice(value));
              }
            }}
          />

          <LabeledInput
            id="discount"
            label={t('products.discount')}
            placeholder={t('products.discountPlaceholder')}
            value={productData.discount}
            onChange={(value) => {
              if (value <= 100 && value >= 0) {
                dispatch(setDiscount(value));
              }
            }}
          />

          <LabeledInput
            id="stock-qty"
            label={t('products.stockQty')}
            placeholder={t('products.stockPlaceholder')}
            value={productData.stock}
            onChange={(value) => dispatch(setStock(Number(value) || 0))}
          />

          <LabeledInput
            id="tag"
            label={t('products.tag')}
            placeholder={t('products.enterTag')}
            value={productData.tag}
            type="tags"
            onChange={(value) => dispatch(setTag(value))}
            onColorChange={(value) => dispatch(setTagColor(value))}
            color={productData.tagColor}
          />

          <button
            onClick={NextPage}
            className="w-full rounded-md bg-[#2970ff] py-2 text-center font-semibold text-white hover:bg-blue-600 cursor-pointer"
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

export default ProductAddStep2Page;
