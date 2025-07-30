"use client";

import React, { useState, useEffect } from "react";
import StatisticCard from "@/components/ui/dashboard/statistic-card";
import GrowthVolume from "@/components/ui/dashboard/growth-volume";
import OrderHistory from "@/components/ui/dashboard/order-history";
import QuickAnalytics from "@/components/ui/dashboard/quick-analytics";
import TopSellingProducts from "@/components/ui/dashboard/top-selling-products";
import ComprehensiveAnalytics from "@/components/ui/dashboard/comprehensive-analytics";
import StatisticCardSkeleton from "@/components/ui/dashboard/statistic-card-skeleton";
import ChartSkeleton from "@/components/ui/dashboard/chart-skeleton";
import OrderHistorySkeleton from "@/components/ui/dashboard/order-history-skeleton";
import QuickAnalyticsSkeleton from "@/components/ui/dashboard/quick-analytics-skeleton";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useQuery } from "@tanstack/react-query";
import createDashboardSalesQueryOptions from "@/query-options/dashboard-sales-query-options";
import { useTranslation } from "@/contexts/i18n-context";

function SalesPage() {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const {
    data: analytics,
    isLoading,
    isError,
    error,
  } = useQuery<Dashboard.Sales>(createDashboardSalesQueryOptions(fromDate, toDate));

  const { t } = useTranslation();

  const handleDateChange = (newFromDate: string, newToDate: string) => {
    setFromDate(newFromDate);
    setToDate(newToDate);
  };

  // Add some helpful default date range on first load
  useEffect(() => {
    if (!fromDate && !toDate) {
      // Set default to last 30 days
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
      setToDate(today.toISOString().split('T')[0]);
    }
  }, [fromDate, toDate]);

  if (isLoading) {
    return (
      <>
        <div className="flex gap-4 my-10 w-full overflow-auto pb-1">
          {[...Array(5)].map((_, index) => (
            <StatisticCardSkeleton key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 grid-flow-row gap-4 mt-8">
          <div className="col-span-1 md:col-span-2 h-full">
            <ChartSkeleton className="w-full h-[250px] min-h-[250px]" />
          </div>
          <div className="col-span-1 h-full">
            <QuickAnalyticsSkeleton />
          </div>
        </div>
        <div className="mt-8">
          <OrderHistorySkeleton />
        </div>
      </>
    );
  }

  if (isError) {
    return <div>Error loading dashboard data: {(error as Error).message}</div>;
  }

  if (!analytics) {
    return <div>No data available</div>;
  }

  const statistics = [
    {
      title: t('dashboard.orders'),
      value: analytics.cards.orders.count.toString(),
      icon: "/images/dashboard/order.svg",
      growth: analytics.cards.orders.trend,
      trend_direction: analytics.cards.orders.trend_direction
    },
    {
      title: t('dashboard.prescriptions'),
      value: analytics.cards.prescriptions.count.toString(),
      icon: "/images/dashboard/order.svg",
      growth: analytics.cards.prescriptions.trend,
      trend_direction: analytics.cards.prescriptions.trend_direction
    },
    {
      title: t('dashboard.sales'),
      value: analytics.cards.sales.count.toString(),
      icon: "/images/dashboard/sales.svg",
      growth: analytics.cards.sales.trend,
      trend_direction: analytics.cards.sales.trend_direction
    },
    {
      title: t('dashboard.delivery'),
      value: analytics.cards.deliveries.count.toString(),
      icon: "/images/dashboard/delivery.svg",
      growth: analytics.cards.deliveries.trend,
      trend_direction: analytics.cards.deliveries.trend_direction
    },
    {
      title: t('dashboard.visits'),
      value: analytics.cards.visits.count.toString(),
      icon: "/images/dashboard/visits.svg",
      growth: analytics.cards.visits.trend,
      trend_direction: analytics.cards.visits.trend_direction
    }
  ];

  return (
    <>
      {/* Date Range Picker */}
      <div className="mb-6 flex items-center gap-4">
        <div className="w-80">
          <DateRangePicker
            fromDate={fromDate}
            toDate={toDate}
            onDateChange={handleDateChange}
          />
        </div>
        {(fromDate || toDate) && (
          <div className="text-sm text-muted-foreground">
            {fromDate && toDate ? (
              <>
                Showing data from {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
              </>
            ) : (
              "Please select both start and end dates"
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4 my-10 w-full overflow-auto pb-1">
        {statistics.map((statistic) => (
          <StatisticCard
            className="w-full flex-1 min-w-[200px]"
            key={statistic.title}
            title={statistic.title}
            value={statistic.value}
            icon={statistic.icon}
            growth={statistic.growth}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 grid-flow-row gap-4 mt-8">
        <div className="col-span-1 md:col-span-2 h-full">
          <GrowthVolume
            data={analytics.gross_volume}
            currency={analytics.pharmacy.country.currency}
            className={{ graph: "w-full h-[250px] min-h-[250px]" }}
          />
        </div>
        <div className="col-span-1 h-full">
          <QuickAnalytics />
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="mt-8">
        <TopSellingProducts 
          products={analytics.top_selling_products}
          currency={analytics.pharmacy.country.currency}
        />
      </div>

      {/* Comprehensive Analytics */}
      <div className="mt-8">
        <ComprehensiveAnalytics analytics={analytics} />
      </div>

      {/* Order History */}
      <div className="mt-8">
        <OrderHistory orders={analytics.orders_history} context="sales" />
      </div>
    </>
  );
}

export default SalesPage;
