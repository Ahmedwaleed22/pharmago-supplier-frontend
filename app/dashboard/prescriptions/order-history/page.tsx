"use client";

import PrescriptionCard from "@/components/prescription-card";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import React, { useState, useRef, useEffect } from "react";
import CustomButton from "@/components/custom-button";
import {Icon} from "@iconify/react";
import OrderHistory from "@/components/ui/dashboard/order-history";
import { fetchAllPrescriptions } from "@/services/prescriptions";
import { useQuery } from "@tanstack/react-query";

function OrderHistoryPage() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchAllPrescriptions(),
  });

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={[
        {label: "Dashboard", href: "/dashboard"},
        {label: "Prescription", href: null},
        {label: "Orders History", href: "/dashboard/prescriptions/order-history"},
      ]}
      title="Prescription"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-gray">Orders History</h1>
      </div>
      <div className="mt-6">
        {orders && (
          <OrderHistory 
            noTitle={true} 
            orders={orders}
          />
        )}
      </div>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default OrderHistoryPage;
