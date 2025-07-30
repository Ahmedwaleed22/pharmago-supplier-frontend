"use client";

import React from "react";
import DashboardCard from "./dashboard-card";
import { formatPrice } from "@/helpers/products";
import { useTranslation } from "@/contexts/i18n-context";
import Image from "next/image";

interface TopSellingProductsProps {
  products: Dashboard.TopSellingProduct[];
  currency: Product.Currency;
  className?: string;
}

function TopSellingProducts({ products, currency, className }: TopSellingProductsProps) {
  const { t } = useTranslation();
  
  // Debug: Log the products data
  console.log('TopSellingProducts data:', products);

  // If no products, show empty state
  if (!products || products.length === 0) {
    return (
      <DashboardCard className={className}>
        <div className="p-6">
          <h3 className="text-[#414651] font-bold text-lg mb-4">
            {t('dashboard.topSellingProducts')}
          </h3>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg 
                className="w-8 h-8 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {t('dashboard.noTopSellingProducts')}
            </h4>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {t('dashboard.noTopSellingProductsDescription')}
            </p>
          </div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className={className}>
      <div className="p-6">
        <h3 className="text-[#414651] font-bold text-lg mb-4">
          {t('dashboard.topSellingProducts')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                  {t('dashboard.product')}
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">
                  {t('dashboard.category')}
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">
                  {t('dashboard.unitsSold')}
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">
                  {t('dashboard.revenue')}
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          #{index + 1} {t('dashboard.bestSeller')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-sm text-gray-900">
                    {product.units_sold?.toLocaleString() || '0'}
                  </td>
                  <td className="py-3 px-2 text-center text-sm font-medium text-gray-900">
                    {product.revenue ? formatPrice(product.revenue, currency) : formatPrice(0, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardCard>
  );
}

export default TopSellingProducts; 