"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ProductLayout from "@/layouts/product-layout";
import LabeledInput from "@/components/labeled-input";
import ProductPreview from "@/components/product-preview";
import { 
  setName, 
  setSubName, 
  setCategory, 
  setSubCategory, 
  setProductDetails,
  setNotes
} from "@/store/ProductCreationSlice";
import {useQuery} from "@tanstack/react-query";
import {
  createMainCategoriesQueryOptions,
  createSubCategoriesQueryOptions
} from "@/query-options/categories-query-options";
import { useTranslation } from "@/contexts/i18n-context";

function ProductAddPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const productData = useSelector((state: any) => state.productCreation);
  const { t } = useTranslation();

  const NextPage = () => {
    router.push("/dashboard/products/add/step-2");
  };

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

  return (
    <ProductLayout>
      <div className="w-1/2">
        <h1 className="mb-2 text-2xl font-semibold text-[#414651]">
          {t('products.addProductDetails')}
        </h1>
        <p className="mb-8 text-[#717171]">
          {t('products.boostSalesWithDetails')}
        </p>

        <div className="space-y-6">
          <LabeledInput
            id="product-name"
            label={t('products.productName')}
            placeholder={t('products.productName')}
            value={productData.name}
            onChange={(value) => dispatch(setName(value))}
          />

          <LabeledInput
            id="product-short-description"
            label={t('products.productShortDescription')}
            placeholder={t('products.productShortDescription')}
            value={productData.subName}
            onChange={(value) => dispatch(setSubName(value))}
          />
          
          <LabeledInput
            id="category"
            label={t('products.category')}
            type="select"
            value={productData.category}
            onChange={(value) => dispatch(setCategory(value))}
            options={[
              {
                label: t('products.selectCategory'),
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
            label={t('products.subCategory')}
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
            label={t('products.productDescription')}
            type="textarea"
            placeholder={t('products.descriptionsHere')}
            value={productData.productDetails}
            onChange={(value) => dispatch(setProductDetails(value))}
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

export default ProductAddPage;
