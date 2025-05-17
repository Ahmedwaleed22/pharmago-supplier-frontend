import PrescriptionCard from "@/components/prescription-card";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import React from "react";

function LiveTrackingPage() {
  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Delivery", href: null },
        { label: "Live Tracking", href: "/dashboard/delivery/live-tracking" },
      ]}
      title="Delivery"
    >
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-blue-gray">Approved</h1>
        <span className="text-sm bg-[#FF6363] font-bold h-[calc(var(--spacing)_*_5.5)] w-[calc(var(--spacing)_*_5.5)] rounded-full flex items-center justify-center text-white">
          3
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-5">
        {Array(20)
          .fill(0)
          .map((_, index) => (
            <PrescriptionCard key={index} status="tracking" />
          ))}
      </div>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default LiveTrackingPage;
