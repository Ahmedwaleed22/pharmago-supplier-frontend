"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { PlusIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/breadcrumb";
import CustomButton from "@/components/custom-button";
import CategoriesFilter from "@/components/ui/categories-filter";
import SearchBar from "@/components/ui/search-bar";
import ProductsGrid from "@/components/ui/products-grid";
import { getDashboardProducts } from "@/services/dashboard";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "@/contexts/i18n-context";
import { resetProductCreation } from "@/store/ProductCreationSlice";

function ProductPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product.Medicine[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Separate loading states for different scenarios
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
  const initialLoadDone = useRef(false);
  const isInitialLoadAttempted = useRef(false);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
    rootMargin: "0px 0px 300px 0px"
  });

  // Load products manually using regular fetch instead of infinite query
  const loadProducts = useCallback(async () => {
    if (isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      console.log(`Loading products page ${page}...`);
      
      const result = await getDashboardProducts(
        selectedCategoryId || "", 
        selectedSubCategoryId || "", 
        debouncedSearchTerm,
        page,
        12 // Number of products per page
      );
      
      // Use functional update to avoid products dependency
      setProducts(prev => {
        // Only add products that aren't already in the list (avoid duplicates)
        const existingIds = new Set(prev.map(p => p.id));
        const newProducts = result.data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });
      
      // Move to next page
      setPage(prev => prev + 1);
      
      // Check if there are more pages based on the response
      const gotFullPage = result.data.length >= 12;
      setHasMore(gotFullPage);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    selectedCategoryId, 
    selectedSubCategoryId, 
    debouncedSearchTerm, 
    page, 
    isLoadingMore
  ]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      
      if (initialLoadDone.current) {
        // Reset pagination when search changes, but only after initial load
        setPage(1);
        setProducts([]);
        setHasMore(true);
        setIsFilterLoading(true); // Show filter loading instead of initial loading
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset products when category filter changes
  useEffect(() => {
    // Only reset if the component has been loaded
    if (initialLoadDone.current && 
        !(selectedCategoryId === null && selectedSubCategoryId === null && !isInitialLoadAttempted.current)) {
      setPage(1);
      setProducts([]);
      setHasMore(true);
      setIsFilterLoading(true); // Show filter loading instead of initial loading
    }
  }, [selectedCategoryId, selectedSubCategoryId]);

  // Load initial products - only run on mount
  useEffect(() => {
    const loadInitialProducts = async () => {
      if (isInitialLoadAttempted.current) return;
      
      try {
        isInitialLoadAttempted.current = true;
        initialLoadDone.current = true;
        
        setIsInitialLoading(true);
        const result = await getDashboardProducts("", "", "", 1, 12);
        
        // Small delay to prevent flashing
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Batch all state updates together
        setProducts(result.data || []);
        setPage(2); // Move to page 2 for next load
        setHasMore(result.data.length >= 12);
        setIsInitialLoading(false);
      } catch (error) {
        console.error('Failed to load initial products:', error);
        setProducts([]);
        setIsInitialLoading(false);
      }
    };
    
    loadInitialProducts();
  }, []); // No dependencies, only runs once
  
  // Load more products when scrolling to bottom
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && !isInitialLoading && !isFilterLoading) {
      console.log('Loading more products due to scroll...');
      loadProducts();
    }
  }, [inView, hasMore, isLoadingMore, isInitialLoading, isFilterLoading, loadProducts]);

  // Effects to load filtered data when filter state changes
  useEffect(() => {
    const applyFilters = async () => {
      if (initialLoadDone.current && isFilterLoading) {
        try {
          const result = await getDashboardProducts(
            selectedCategoryId || "", 
            selectedSubCategoryId || "", 
            debouncedSearchTerm,
            1,
            12
          );
          
          // Small delay to prevent flashing
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Batch all state updates together
          setProducts(result.data || []);
          setPage(2);
          setHasMore(result.data.length >= 12);
          setIsFilterLoading(false);
        } catch (error) {
          console.error('Error applying filters:', error);
          setProducts([]);
          setIsFilterLoading(false);
        }
      }
    };
    
    applyFilters();
  }, [isFilterLoading, selectedCategoryId, selectedSubCategoryId, debouncedSearchTerm]);

  // Handle filtering by category
  const handleCategoryFilter = (categoryId: string, subCategoryId: string) => {
    setSelectedCategoryId(categoryId ? categoryId : null);
    setSelectedSubCategoryId(subCategoryId ? subCategoryId : null);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle manual load more
  const handleLoadMore = () => {
    if (!isLoadingMore && !isFilterLoading && hasMore) {
      loadProducts();
    }
  };

  const handleAddProduct = () => {
    // Reset the product creation state before navigating to add page
    dispatch(resetProductCreation());
    router.push("/dashboard/products/add");
  };

  return (
    <div className="py-8 text-blue-gray">
      <Breadcrumb
        items={[
          { label: t('breadcrumbs.dashboard'), href: "/dashboard" },
          { label: t('breadcrumbs.products'), href: "/dashboard/products" },
        ]}
      />
      <div className="flex justify-between items-center mt-1">
        <h1 className="text-2xl font-bold">{t('navigation.products')}</h1>
        <CustomButton onClick={handleAddProduct}>
          <PlusIcon className="w-4 h-4" />
          {t('products.addProduct')}
        </CustomButton>
      </div>
      <div className="mt-4">
        <SearchBar
          className="w-full max-w-full mt-10"
          placeholder={t('products.searchProduct')}
          value={searchTerm}
          setValue={handleSearch}
        />
        <div className="mt-4">
          <CategoriesFilter onFilter={handleCategoryFilter} />
        </div>
        <div className="mt-10 font-semibold text-gray">
          {isInitialLoading ? (
            <div className="text-center py-10">{t('common.loading')}</div>
          ) : (
            <>
              <h3>{t('products.resultOfSearch')}</h3>
              <div className="mt-3">
                {isFilterLoading ? (
                  <div className="text-center py-10">{t('common.loading')}</div>
                ) : products.length > 0 ? (
                  <ProductsGrid products={products} />
                ) : (
                  <div className="text-center py-10">{t('common.noData')}</div>
                )}
                
                {/* Load More button */}
                {hasMore && products.length > 0 && !isFilterLoading && (
                  <div className="text-center my-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {isLoadingMore ? t('common.loading') : t('ui.showMore')}
                    </button>
                  </div>
                )}
                
                {/* Invisible element to detect when user scrolls to bottom */}
                {hasMore && products.length > 0 && !isFilterLoading && (
                  <div 
                    ref={ref} 
                    className="h-20 w-full mt-2 flex items-center justify-center"
                  >
                    {isLoadingMore && (
                      <div className="text-center py-4">{t('common.loading')}</div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
