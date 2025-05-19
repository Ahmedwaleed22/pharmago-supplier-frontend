"use client";

import React from "react";
import ProductCreationLayout from "@/layouts/product-creation-layout";
import ProductPreview from "@/components/product-preview";

function ProductAddStep4Page() {
  const postProduct = () => {}

  return (
    <ProductCreationLayout>
      <div className="flex flex-col gap-4 w-1/2 max-w-[407px]">
        <ProductPreview className="w-full" />
        <button
          onClick={postProduct}
          className="w-full rounded-lg bg-[#2970ff] py-3 text-center font-semibold text-white hover:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post Product
        </button>
      </div>
    </ProductCreationLayout>
  );
}

export default ProductAddStep4Page;
