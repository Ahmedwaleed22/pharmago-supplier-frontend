import React from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import StatisticCard from "@/components/ui/dashboard/statistic-card";
import GrowthVolume from "@/components/ui/dashboard/growth-volume";
import OrderHistory from "@/components/ui/dashboard/order-history";

function page() {
  const statistics = [
    {
      title: "Orders",
      value: "154",
      icon: "/images/dashboard/order.svg",
      growth: 12
    },
    {
      title: "Prescriptions",
      value: "154",
      icon: "/images/dashboard/order.svg",
      growth: 12
    },
    {
      title: "Sales",
      value: "154",
      icon: "/images/dashboard/sales.svg",
      growth: -12
    },
    {
      title: "Delivery",
      value: "154",
      icon: "/images/dashboard/delivery.svg",
      growth: 12
    },
    {
      title: "Visits",
      value: "154",
      icon: "/images/dashboard/visits.svg",
      growth: 12
    }
  ]
  return (
    <>
      <div className="flex gap-4 my-10 w-full overflow-auto pb-1">
        {statistics.map((statistic) => (
          <StatisticCard className="w-full flex-1 min-w-[200px]" key={statistic.title} title={statistic.title} value={statistic.value} icon={statistic.icon} growth={statistic.growth} />
        ))}
      </div>
      <div className="mt-8">
        <GrowthVolume />
      </div>
      <div className="mt-8">
        <OrderHistory />
      </div>
    </>
  );
}

export default page;
