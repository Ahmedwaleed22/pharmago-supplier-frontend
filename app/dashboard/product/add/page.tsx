"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ProductCreationLayout from "@/layouts/product-creation-layout";
import LabeledInput from "@/components/labeled-input";
import ProductPreview from "@/components/product-preview";
import { 
  setName, 
  setSubName, 
  setCategory, 
  setSubCategory, 
  setProductDetails,
  setPharmacyLogo
} from "@/store/ProductCreationSlice";

function ProductAddPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const productData = useSelector((state: any) => state.productCreation);

  const NextPage = () => {
    router.push("/dashboard/product/add/step-2");
  };

  return (
    <ProductCreationLayout>
      <div className="w-1/2">
        <h1 className="mb-2 text-2xl font-semibold text-[#414651]">
          Add Product Details
        </h1>
        <p className="mb-8 text-[#717171]">
          Boost sales with detailed product information
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
            id="sub-name"
            label="Sub-Name"
            placeholder="Sub-Name"
            value={productData.subName}
            onChange={(value) => dispatch(setSubName(value))}
          />

          <LabeledInput
            id="category"
            label="Category"
            type="select"
            value={productData.category}
            onChange={(value) => dispatch(setCategory(value))}
            options={[{ label: "Category 01", value: "Category 01" }]}
          />

          <LabeledInput
            id="sub-category"
            label="Sub-Category"
            type="select"
            value={productData.subCategory}
            onChange={(value) => dispatch(setSubCategory(value))}
            options={[{ label: "Sub-Category 02", value: "Sub-Category 02" }]}
          />

          <LabeledInput
            id="pharmacy-logo"
            label="Pharmacy Logo"
            type="select"
            value={productData.pharmacyLogo}
            onChange={(value) => dispatch(setPharmacyLogo(value))}
            options={[
              {
                label: "Pharmacy Logo Company",
                value: "Pharmacy Logo Company",
              },
            ]}
          />

          <LabeledInput
            id="product-details"
            label="Product Details"
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
    </ProductCreationLayout>
  );
}

export default ProductAddPage;
