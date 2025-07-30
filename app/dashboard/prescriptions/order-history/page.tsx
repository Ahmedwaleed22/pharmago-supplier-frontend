"use client";

import PrescriptionCard from "@/components/prescription-card";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import React, { useState, useRef, useEffect } from "react";
import CustomButton from "@/components/custom-button";
import {Icon} from "@iconify/react";
import OrderHistory from "@/components/ui/dashboard/order-history";
import { fetchAllPrescriptions } from "@/services/prescriptions";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/contexts/i18n-context";

function OrderHistoryPage() {
  const { t } = useTranslation();
  
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchAllPrescriptions(),
  });

  const breadcrumbs = [
    {label: t('breadcrumbs.dashboard'), href: "/dashboard"},
    {label: t('breadcrumbs.prescription'), href: null},
    {label: t('breadcrumbs.ordersHistory'), href: "/dashboard/prescriptions/order-history"},
  ];

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={breadcrumbs}
      title={t('prescriptions.title')}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-gray">{t('orderHistory.title')}</h1>
      </div>
      <div className="mt-6">
        {orders && (
          <OrderHistory 
            noTitle={true} 
            orders={orders}
            context="prescriptions"
          />
        )}
      </div>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default OrderHistoryPage;
