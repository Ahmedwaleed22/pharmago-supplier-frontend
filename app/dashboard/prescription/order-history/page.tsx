import PrescriptionCard from "@/components/prescription-card";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import React from "react";
import CustomButton from "@/components/custom-button";
import {Icon} from "@iconify/react";
import OrderHistory from "@/components/ui/dashboard/order-history";

function OrderHistoryPage() {
  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={[
        {label: "Dashboard", href: "/dashboard"},
        {label: "Prescription", href: null},
        {label: "Orders History", href: "/dashboard/prescription/order-history"},
      ]}
      title="Prescription"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-gray">Orders History</h1>
        <CustomButton className="bg-white text-blue-gray hover:bg-[#f8f8f8]">
          <Icon className="mr-1" icon="lucide:cloud-download" width="24" height="24"/>
          Download CSV
        </CustomButton>
      </div>
      <div className="mt-6">
        <OrderHistory noTitle={true} />
      </div>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default OrderHistoryPage;
