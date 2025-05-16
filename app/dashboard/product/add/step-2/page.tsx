"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ProductCreationLayout from "@/layouts/product-creation-layout";
import LabeledInput from "@/components/labeled-input";
import ProductPreview from "@/components/product-preview";
import { 
  setPrice, 
  setDiscount, 
  setStock, 
  setTags 
} from "@/store/ProductCreationSlice";

function ProductAddStep2Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const productData = useSelector((state: any) => state.productCreation);

  const NextPage = () => {
    router.push("/dashboard/product/add/step-3");
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
            id="price"
            label="Price"
            placeholder="Price"
            value={productData.price}
            onChange={(value) => dispatch(setPrice(Number(value) || ""))}
          />

          <LabeledInput
            id="discount"
            label="Discount in %"
            placeholder="20%"
            value={productData.discount}
            onChange={(value) => dispatch(setDiscount(Number(value) || ""))}
          />

          <LabeledInput
            id="stock-qty"
            label="Stock QTY"
            placeholder="25 QTY"
            value={productData.stock}
            onChange={(value) => dispatch(setStock(Number(value) || ""))}
          />

          <LabeledInput
            id="tags"
            label="Tags"
            type="tags"
            tags={productData.tags}
            setTags={(tags) => dispatch(setTags(tags))}
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

export default ProductAddStep2Page;
