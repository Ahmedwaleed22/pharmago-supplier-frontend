"use client";

import React from "react";
import DashboardCard from "./dashboard-card";
import { formatPrice } from "@/helpers/products";
import { useTranslation } from "@/contexts/i18n-context";
import { Icon } from "@iconify/react";

interface ComprehensiveAnalyticsProps {
  analytics: Dashboard.Sales;
  className?: string;
}

function ComprehensiveAnalytics({ analytics, className }: ComprehensiveAnalyticsProps) {
  const { t } = useTranslation();

  const revenueBreakdown = analytics.revenue_breakdown;
  const orderMetrics = analytics.average_order_metrics;
  const orderStatus = analytics.order_status_distribution;
  const deliveryPerformance = analytics.delivery_performance;
  const customerRetention = analytics.customer_retention;
  const customerSatisfaction = analytics.customer_satisfaction;
  const competitiveMetrics = analytics.competitive_metrics;
  const geographicalAnalytics = analytics.geographical_analytics;
  const timeBasedAnalytics = analytics.time_based_analytics;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 ${className}`}>
      {/* Revenue Breakdown */}
      <DashboardCard>
        <div className="p-6">
          <h3 className="text-[#414651] font-bold text-lg mb-4 flex items-center">
            <Icon icon="ph:money-light" className="mr-2" />
            {t('dashboard.revenueBreakdown')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.totalRevenue')}</span>
              <span className="font-semibold text-lg">
                {formatPrice(revenueBreakdown.total_revenue, analytics.supplier.country.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.productSales')}</span>
              <span className="text-sm">
                {formatPrice(revenueBreakdown.revenue_breakdown.product_sales, analytics.supplier.country.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.deliveryFees')}</span>
              <span className="text-sm">
                {formatPrice(revenueBreakdown.revenue_breakdown.delivery_fees, analytics.supplier.country.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.serviceFees')}</span>
              <span className="text-sm">
                {formatPrice(revenueBreakdown.revenue_breakdown.service_fees, analytics.supplier.country.currency)}
              </span>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Order Metrics */}
      <DashboardCard>
        <div className="p-6">
          <h3 className="text-[#414651] font-bold text-lg mb-4 flex items-center">
            <Icon icon="ri:shopping-cart-line" className="mr-2" />
            {t('dashboard.orderMetrics')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.averageOrderValue')}</span>
              <span className="font-semibold">
                {formatPrice(orderMetrics.average_order_value, analytics.supplier.country.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.averageItemsPerOrder')}</span>
              <span className="text-sm">{Math.round(orderMetrics.average_items_per_order)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.averageDeliveryFee')}</span>
              <span className="text-sm">
                {formatPrice(orderMetrics.average_delivery_fee, analytics.supplier.country.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.averageDiscount')}</span>
              <span className="text-sm">
                {formatPrice(orderMetrics.average_discount_per_order, analytics.supplier.country.currency)}
              </span>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Order Status Distribution */}
      <DashboardCard>
        <div className="p-6">
          <h3 className="text-[#414651] font-bold text-lg mb-4 flex items-center">
            <Icon icon="mdi:chart-pie" className="mr-2" />
            {t('dashboard.orderStatus')}
          </h3>
          <div className="space-y-3">
            {Object.entries(orderStatus.distribution).map(([status, data]) => (
              <div key={status} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    status === 'delivered' ? 'bg-green-500' :
                    status === 'shipping' ? 'bg-blue-500' :
                    status === 'processing' ? 'bg-yellow-500' :
                    status === 'pending' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-600 capitalize">{status}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{data.count}</div>
                  <div className="text-xs text-gray-500">{data.percentage}%</div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('dashboard.completionRate')}</span>
                <span className="text-sm font-semibold text-green-600">{orderStatus.completion_rate}%</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Delivery Performance */}
      {/* <DashboardCard>
        <div className="p-6">
          <h3 className="text-[#414651] font-bold text-lg mb-4 flex items-center">
            <Icon icon="mdi:truck-delivery" className="mr-2" />
            {t('dashboard.deliveryPerformance')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.totalOrders')}</span>
              <span className="font-semibold">{deliveryPerformance.total_orders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.deliveredOrders')}</span>
              <span className="text-sm text-green-600">{deliveryPerformance.delivered_orders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.onTimeDeliveryRate')}</span>
              <span className="text-sm font-semibold">{deliveryPerformance.on_time_delivery_rate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.avgDeliveryTime')}</span>
              <span className="text-sm">
                {deliveryPerformance.average_delivery_time_hours > 0 
                  ? `${deliveryPerformance.average_delivery_time_hours.toFixed(1)}h`
                  : t('dashboard.noData')
                }
              </span>
            </div>
          </div>
        </div>
      </DashboardCard> */}

      {/* Customer Retention */}
      <DashboardCard>
        <div className="p-6">
          <h3 className="text-[#414651] font-bold text-lg mb-4 flex items-center">
            <Icon icon="solar:users-group-rounded-linear" className="mr-2" />
            {t('dashboard.customerRetention')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.totalCustomers')}</span>
              <span className="font-semibold">{customerRetention.total_customers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.repeatCustomers')}</span>
              <span className="text-sm text-green-600">{customerRetention.repeat_customers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.repeatCustomerRate')}</span>
              <span className="text-sm font-semibold">{customerRetention.repeat_customer_rate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.customerLifetimeValue')}</span>
              <span className="text-sm">
                {formatPrice(customerRetention.customer_lifetime_value, analytics.supplier.country.currency)}
              </span>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Customer Satisfaction */}
      {/* <DashboardCard>
        <div className="p-6">
          <h3 className="text-[#414651] font-bold text-lg mb-4 flex items-center">
            <Icon icon="mdi:star" className="mr-2" />
            {t('dashboard.customerSatisfaction')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.averageRating')}</span>
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(customerSatisfaction.average_rating)
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
                <span className="text-sm font-semibold">{customerSatisfaction.average_rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.totalRatings')}</span>
              <span className="text-sm">{customerSatisfaction.total_ratings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.satisfactionRate')}</span>
              <span className="text-sm font-semibold">{customerSatisfaction.satisfaction_rate}%</span>
            </div>
          </div>
        </div>
      </DashboardCard> */}

      {/* Competitive Metrics */}
      {/* <DashboardCard>
        <div className="p-6">
          <h3 className="text-[#414651] font-bold text-lg mb-4 flex items-center">
            <Icon icon="mdi:chart-line" className="mr-2" />
            {t('dashboard.competitiveMetrics')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.marketShare')}</span>
              <span className="font-semibold">{competitiveMetrics.market_share}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.ranking')}</span>
              <span className="text-sm">#{competitiveMetrics.ranking}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.totalPharmacies')}</span>
              <span className="text-sm">{competitiveMetrics.total_pharmacies_in_market}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.ordersVsMarket')}</span>
              <span className="text-sm">{competitiveMetrics.orders_vs_market_average.toFixed(2)}x</span>
            </div>
          </div>
        </div>
      </DashboardCard> */}

      {/* Geographical Analytics */}
      {/* <DashboardCard>
        <div className="p-6">
          <h3 className="text-[#414651] font-bold text-lg mb-4 flex items-center">
            <Icon icon="mdi:map-marker" className="mr-2" />
            {t('dashboard.geographicalAnalytics')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.citiesServed')}</span>
              <span className="font-semibold">{geographicalAnalytics.total_cities_served}</span>
            </div>
            {geographicalAnalytics.orders_by_location.map((location, index) => (
              <div key={index} className="border-t border-gray-100 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {location.city}
                  </span>
                  <span className="text-sm">{location.order_count} {t('dashboard.orders')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{t('dashboard.revenue')}</span>
                  <span className="text-xs">
                    {formatPrice(location.total_revenue, analytics.supplier.country.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{t('dashboard.averageOrderValue')}</span>
                  <span className="text-xs">
                    {formatPrice(location.average_order_value, analytics.supplier.country.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard> */}

      {/* Time Based Analytics */}
      {/* <DashboardCard>
        <div className="p-6">
          <h3 className="text-[#414651] font-bold text-lg mb-4 flex items-center">
            <Icon icon="mdi:clock" className="mr-2" />
            {t('dashboard.timeBasedAnalytics')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.peakHour')}</span>
              <span className="font-semibold">{timeBasedAnalytics.peak_hour}:00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.peakDay')}</span>
              <span className="font-semibold">
                {(() => {
                  const dayKey = timeBasedAnalytics.peak_day?.toLowerCase();
                  return dayKey ? t(`dashboard.days.${dayKey}`) : timeBasedAnalytics.peak_day;
                })()}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">{t('dashboard.ordersByHour')}</div>
              {Object.entries(timeBasedAnalytics.orders_by_hour).map(([hour, data]) => (
                <div key={hour} className="flex justify-between items-center text-xs">
                  <span>{hour}:00</span>
                  <span>{data.count} {t('dashboard.orders')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardCard> */}
    </div>
  );
}

export default ComprehensiveAnalytics; 