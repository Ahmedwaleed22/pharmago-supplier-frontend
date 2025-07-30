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

  // If no products, show sample data for testing
  if (!products || products.length === 0) {
    const sampleProducts = [
      {
        id: '1',
        name: 'Sample Product 1',
        image: null,
        category: 'General',
        units_sold: 15,
        revenue: 150.00,
        average_rating: 4.5
      },
      {
        id: '2',
        name: 'Sample Product 2',
        image: null,
        category: 'General',
        units_sold: 8,
        revenue: 80.00,
        average_rating: 4.0
      }
    ];
    
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
                {sampleProducts.map((product, index) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              📦
                            </div>
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
                              📦
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