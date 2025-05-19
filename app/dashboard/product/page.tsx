"use client";

import React, { useState } from "react";
import { PlusIcon } from "lucide-react";
import Breadcrumb from "@/components/ui/breadcrumb";
import CustomButton from "@/components/custom-button";
import CategoriesFilter from "@/components/ui/categories-filter";
import SearchBar from "@/components/ui/search-bar";
import ProductsGrid from "@/components/ui/products-grid";
import { useQuery } from "@tanstack/react-query";
import { getDashboardProducts } from "@/services/dashboard";
  
function ProductPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);

  // Query to fetch products
  const { data: products, isLoading, isError, error, refetch } = useQuery<Product.Medicine[]>({
    queryKey: ['dashboardProducts', selectedCategoryId, selectedSubCategoryId, searchTerm],
    queryFn: () => getDashboardProducts(selectedCategoryId || "", selectedSubCategoryId || "", searchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2
  });

  // Handle filtering by category
  const handleCategoryFilter = (categoryId: string, subCategoryId: string) => {
    setSelectedCategoryId(categoryId ? categoryId : null);
    setSelectedSubCategoryId(subCategoryId ? subCategoryId : null);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  if (isError) {
    return <div>Error loading dashboard data: {(error as Error).message}</div>;
  }

  // Filter products based on selected criteria
  const filteredProducts = products?.filter(product => {
    // Filter by search term
    const matchesSearch = searchTerm ? 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) : 
      true;
    
    // In the real implementation, you would have category and subcategory fields in your product data
    // This is a placeholder for demonstration
    const matchesCategory = selectedCategoryId ? 
      true : // product.categoryId === selectedCategoryId : 
      true;
    
    const matchesSubCategory = selectedSubCategoryId ? 
      true : // product.subCategoryId === selectedSubCategoryId : 
      true;
    
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

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
          value={searchTerm}
          setValue={handleSearch}
        />
        <div className="mt-4">
          <CategoriesFilter onFilter={handleCategoryFilter} />
        </div>
        <div className="mt-10 font-semibold text-gray">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              <h3>Result of search</h3>
              <div className="mt-3">
                <ProductsGrid products={filteredProducts || []} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
