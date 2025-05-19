"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/dashboard-layout";
import StatisticCard from "@/components/ui/dashboard/statistic-card";
import GrowthVolume from "@/components/ui/dashboard/growth-volume";
import OrderHistory from "@/components/ui/dashboard/order-history";
import { getDashboardAnalytics } from "@/services/dashboard";
import createDashboardAnalyticsQueryOptions from "@/query-options/dashboard-analytics-query-options";

function Page() {
  const { 
    data: analytics, 
    isLoading,
    isError,
    error
  } = useQuery<Dashboard.Analytics>(createDashboardAnalyticsQueryOptions());

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading dashboard data: {(error as Error).message}</div>;
  }

  if (!analytics) {
    return <div>No data available</div>;
  }

  const statistics = [
    {
      title: "Orders",
      value: analytics.cards.orders.count.toString(),
      icon: "/images/dashboard/order.svg",
      growth: analytics.cards.orders.trend,
      trend_direction: analytics.cards.orders.trend_direction
    },
    {
      title: "Prescriptions",
      value: analytics.cards.prescriptions.count.toString(),
      icon: "/images/dashboard/order.svg",
      growth: analytics.cards.prescriptions.trend,
      trend_direction: analytics.cards.prescriptions.trend_direction
    },
    {
      title: "Sales",
      value: analytics.cards.sales.count.toString(),
      icon: "/images/dashboard/sales.svg",
      growth: analytics.cards.sales.trend,
      trend_direction: analytics.cards.sales.trend_direction
    },
    {
      title: "Delivery",
      value: analytics.cards.deliveries.count.toString(),
      icon: "/images/dashboard/delivery.svg",
      growth: analytics.cards.deliveries.trend,
      trend_direction: analytics.cards.deliveries.trend_direction
    },
    {
      title: "Visits",
      value: analytics.cards.visits.count.toString(),
      icon: "/images/dashboard/visits.svg",
      growth: analytics.cards.visits.trend,
      trend_direction: analytics.cards.visits.trend_direction
    }
  ];

  return (
    <>
      <div className="flex gap-4 my-10 w-full overflow-auto pb-1">
        {statistics.map((statistic) => (
          <StatisticCard 
            className="w-full flex-1 min-w-[200px]" 
            key={statistic.title} 
            title={statistic.title} 
            value={statistic.value} 
            icon={statistic.icon} 
            growth={statistic.growth} 
            trend_direction={statistic.trend_direction}
          />
        ))}
      </div>
      <div className="mt-8">
        <GrowthVolume currency={analytics.pharmacy.country.currency} data={analytics.gross_volume} />
      </div>
      <div className="mt-8">
        <OrderHistory orders={analytics.orders_history} />
      </div>
    </>
  );
}

export default Page;
