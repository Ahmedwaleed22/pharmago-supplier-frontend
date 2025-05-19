"use client";

import { useState } from "react";
import CustomButton from "../custom-button";
import SelectBox from "./select-box";
import { useQuery } from "@tanstack/react-query";
import {createMainCategoriesQueryOptions, createSubCategoriesQueryOptions} from "@/query-options/categories-query-options";

interface CategoriesFilterProps {
  onFilter?: (category: string, subCategory: string) => void;
}

function CategoriesFilter({ onFilter }: CategoriesFilterProps) {
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("All");
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState<string>("All");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);

  // Fetch main categories
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
  } = useQuery<Category.Category[]>(createSubCategoriesQueryOptions(selectedCategoryId));

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategoryName(value);
    setSelectedSubCategoryName("All");
    setSelectedSubCategoryId(null);

    if (value === "All") {
      setSelectedCategoryId(null);
    } else {
      const category = categories.find(cat => cat.name === value);
      setSelectedCategoryId(category?.id || null);
    }
  };

  // Handle subcategory change
  const handleSubCategoryChange = (value: string) => {
    setSelectedSubCategoryName(value);
    
    if (value === "All") {
      setSelectedSubCategoryId(null);
    } else {
      const subCategory = subCategories.find(subCat => subCat.name === value);
      setSelectedSubCategoryId(subCategory?.id || null);
    }
  };

  // Format categories for SelectBox
  const categoryOptions = ["All", ...categories.map(cat => cat.name)];
  const subCategoryOptions = ["All", ...subCategories.map(subCat => subCat.name)];

  // Handle search button click
  const handleSearch = () => {
    if (onFilter) {
      // Pass the IDs to the parent for filtering
      const categoryId = selectedCategoryId || '';
      const subCategoryId = selectedSubCategoryId || '';
      onFilter(categoryId, subCategoryId);
    }
  };

  return (
    <div className="flex gap-5">
      <div className="flex flex-col flex-1 gap-2">
        <label htmlFor="category">Category</label>
        <SelectBox
          label="Category"
          id="category"
          options={categoryOptions}
          onChange={handleCategoryChange}
          selectedOption={selectedCategoryName}
        />
        <CustomButton
          className="mt-2"
          onClick={handleSearch}
        >
          Search
        </CustomButton>
      </div>
      <div className="flex flex-col flex-1 gap-2">
        <label htmlFor="subcategory">Sub Category</label>
        <SelectBox
          label="Sub Category"
          id="subcategory"
          options={subCategoryOptions}
          onChange={handleSubCategoryChange}
          selectedOption={selectedSubCategoryName}
        />
      </div>
    </div>
  );
}

export default CategoriesFilter;
