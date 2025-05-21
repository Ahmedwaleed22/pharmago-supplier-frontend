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
} from "@/store/ProductCreationSlice";

function ProductEditStep2Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const productData = useSelector((state: any) => state.productCreation);
  // Check if params is a Promise and unwrap it if needed
  const productId = React.use(params).id;

  const NextPage = () => {
    router.push(`/dashboard/products/edit/${productId}/step-3`);
  };

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
            id="price"
            label="Price"
            placeholder="Price"
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
            label="Discount in %"
            placeholder="20%"
            value={productData.discount}
            onChange={(value) => {
              if (value <= 100 && value >= 0) {
                dispatch(setDiscount(value));
              }
            }}
          />

          <LabeledInput
            id="stock-qty"
            label="Stock QTY"
            placeholder="25 QTY"
            value={productData.stock}
            onChange={(value) => dispatch(setStock(Number(value) || ""))}
          />

          <LabeledInput
            id="tag"
            label="Tag"
            placeholder="Enter tag"
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
            Next
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <ProductPreview />
    </ProductLayout>
  );
}

export default ProductEditStep2Page; 