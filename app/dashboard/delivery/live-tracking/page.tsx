"use client";

import PrescriptionCard from "@/components/prescription-card";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import { getDeliveryLiveTracking } from "@/services/orders";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useTranslation } from "@/contexts/i18n-context";

function LiveTrackingPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["live-tracking"],
    queryFn: getDeliveryLiveTracking,
  });

  if (isLoading) {
    return (
      <DashboardWithBreadcrumbsLayout
        breadcrumbs={[
          { label: t('breadcrumbs.dashboard'), href: "/dashboard" },
          { label: t('breadcrumbs.delivery'), href: null },
          { label: t('breadcrumbs.liveTracking'), href: "/dashboard/delivery/live-tracking" },
        ]}
        title={t('delivery.title')}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </DashboardWithBreadcrumbsLayout>
    );
  }

  if (isError) {
    return (
      <DashboardWithBreadcrumbsLayout
        breadcrumbs={[
          { label: t('breadcrumbs.dashboard'), href: "/dashboard" },
          { label: t('breadcrumbs.delivery'), href: null },
          { label: t('breadcrumbs.liveTracking'), href: "/dashboard/delivery/live-tracking" },
        ]}
        title={t('delivery.title')}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">{t('common.error')}</div>
        </div>
      </DashboardWithBreadcrumbsLayout>
    );
  }

  const deliveryOrders = (orders?.data as any)?.active_deliveries || [];

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={[
        { label: t('breadcrumbs.dashboard'), href: "/dashboard" },
        { label: t('breadcrumbs.delivery'), href: null },
        { label: t('breadcrumbs.liveTracking'), href: "/dashboard/delivery/live-tracking" },
      ]}
      title={t('delivery.title')}
      refreshable={true}
      refreshFn={() => {
        queryClient.invalidateQueries({ queryKey: ["live-tracking"] });
      }}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-blue-gray">{t('delivery.liveTracking')}</h1>
        <span className="text-sm bg-[#FF6363] font-bold h-[calc(var(--spacing)_*_5.5)] w-[calc(var(--spacing)_*_5.5)] rounded-full flex items-center justify-center text-white">
          {deliveryOrders.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-5">
        {deliveryOrders.length > 0 ? (
          deliveryOrders.map((order: any, index: number) => (
            <PrescriptionCard 
              key={order.order_id} 
              status="tracking" 
              prescription={{
                id: order.order_id,
                patient: {
                  id: order.customer.id,
                  name: order.customer.name
                },
                created_at: order.updated_at || order.created_at,
                status: order.status
              } as unknown as Prescription.Prescription} 
            />
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center min-h-[200px]">
            <div className="text-lg text-gray-500">{t('common.noData')}</div>
          </div>
        )}
      </div>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default LiveTrackingPage;
