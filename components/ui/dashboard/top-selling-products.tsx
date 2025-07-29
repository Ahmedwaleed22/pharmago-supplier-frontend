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

  if (!products || products.length === 0) {
    return (
      <DashboardCard className={className}>
        <div className="p-6">
          <h3 className="text-[#414651] font-bold text-lg mb-4">
            {t('dashboard.topSellingProducts')}
          </h3>
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-sm">{t('dashboard.noProductsSold')}</p>
            </div>
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
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">
                  {t('dashboard.rating')}
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
                    {product.units_sold.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-center text-sm font-medium text-gray-900">
                    {formatPrice(product.revenue, currency)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.average_rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-xs text-gray-500">
                        ({product.average_rating.toFixed(1)})
                      </span>
                    </div>
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