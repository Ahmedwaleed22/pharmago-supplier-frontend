"use client";

import React from "react";
import { PlusIcon } from "lucide-react";
import Breadcrumb from "@/components/ui/breadcrumb";
import CustomButton from "@/components/custom-button";
import CategoriesFilter from "@/components/ui/categories-filter";
import SearchBar from "@/components/ui/search-bar";
import ProductsGrid from "@/components/ui/products-grid";

function ProductPage() {
  const products = [
    {
      id: "e96d2138-325f-4524-b174-32c40bd6fcba",
      name: "Layne Haag Jr.",
      image: "https://picsum.photos/640/480?random=11546",
      details: "Tempora reprehenderit quisquam eum optio.",
      price: "60.24",
      discount_percentage: "54.00",
      discounted_price: "27.71",
      description: "Odio quae aliquam ipsum.",
      rating: "3",
      notes: "Sit placeat aut nihil provident quae.",
      tag: {
        color: "#1f9dcd",
        title: "consequatur",
      },
      stock: 0,
      in_stock: false,
      currency: {
        id: 174,
        name: "Philippine Peso",
        code: "PHP",
      },
      is_whitelisted: false,
    },
  ];

  return (
    <div className="py-8 text-blue-gray">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Product", href: "/dashboard/product" },
        ]}
      />
      <div className="flex justify-between items-center mt-1">
        <h1 className="text-2xl font-bold">Product</h1>
        <CustomButton href="/dashboard/product/add">
          <PlusIcon className="w-4 h-4" />
          Add Product
        </CustomButton>
      </div>
      <div className="mt-4">
        <SearchBar
          className="w-full max-w-full mt-10"
          placeholder="Search product"
          // logoClassName="text-primary-blue"
          value={""}
          setValue={() => {
            // This function is now called rather than returned
          }}
        />
        <div className="mt-4">
          <CategoriesFilter />
        </div>
        <div className="mt-10 font-semibold text-gray">
          <h3>Result of search</h3>
          <div className="mt-3">
            <ProductsGrid products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
