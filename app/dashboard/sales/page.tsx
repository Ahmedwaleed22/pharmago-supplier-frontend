import React from "react";
import StatisticCard from "@/components/ui/dashboard/statistic-card";
import GrowthVolume from "@/components/ui/dashboard/growth-volume";
import OrderHistory from "@/components/ui/dashboard/order-history";
import QuickAnalytics from "@/components/ui/dashboard/quick-analytics";

function SalesPage() {
  const statistics = [
    {
      title: "Orders",
      value: "154",
      icon: "/images/dashboard/order.svg",
      growth: 12,
    },
    {
      title: "Prescriptions",
      value: "154",
      icon: "/images/dashboard/order.svg",
      growth: 12,
    },
    {
      title: "Sales",
      value: "154",
      icon: "/images/dashboard/sales.svg",
      growth: -12,
    },
    {
      title: "Delivery",
      value: "154",
      icon: "/images/dashboard/delivery.svg",
      growth: 12,
    },
    {
      title: "Visits",
      value: "154",
      icon: "/images/dashboard/visits.svg",
      growth: 12,
    },
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
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 grid-flow-row gap-4 mt-8">
        <div className="col-span-1 md:col-span-2 h-full">
          <GrowthVolume className={{ graph: "w-full h-[250px] min-h-[250px]" }} />
        </div>
        <div className="col-span-1 h-full">
          <QuickAnalytics />
        </div>
      </div>
      <div className="mt-8">
        <OrderHistory />
      </div>
    </>
  );
}

export default SalesPage;
