"use client";

import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import React from "react";
import CustomButton from "@/components/custom-button";
import { Icon } from "@iconify/react";
import OrderHistory from "@/components/ui/dashboard/order-history";
import { Select, SelectSection, SelectItem } from "@heroui/select";

export const statusList = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function DeliveryHistoryPage() {
  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Delivery", href: null },
        { label: "History", href: "/dashboard/delivery/history" },
      ]}
      title="Delivery"
    >
      <div className="flex items-center justify-between">
        <div className="flex w-1/3 gap-4 items-center">
          <h1 className="text-2xl font-bold text-blue-gray w-max">
            Delivery History
          </h1>
          <div className="w-1/3">
            <Select
              className="max-w-xs bg-white"
              placeholder="All"
              color="default"
              style={{ color: "#414651" }}
              classNames={{
                trigger: "text-blue-gray bg-white hover:bg-smooth-white shadow-none rounded-md cursor-pointer transition-all duration-300",
                value: "text-blue-gray",
                innerWrapper: "text-blue-gray",
                listbox: "text-blue-gray",
                base: "text-blue-gray rounded-md shadow-sm",
                mainWrapper: "text-blue-gray rounded-md"
              }}
            >
              {statusList.map((status) => (
                <SelectItem key={status.key} className="text-blue-gray">{status.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <CustomButton className="bg-white text-blue-gray hover:bg-[#f8f8f8]">
          <Icon
            className="mr-1"
            icon="lucide:cloud-download"
            width="24"
            height="24"
          />
          Download CSV
        </CustomButton>
      </div>
      <div className="mt-6">
        <OrderHistory noTitle={true} />
      </div>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default DeliveryHistoryPage;
