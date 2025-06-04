"use client";

import DeliveryCard from "@/components/delivery-card";
import PrescriptionCard from "@/components/prescription-card";
import Steppers, { Step } from "@/components/steppers";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import { getDeliveryLiveTracking, getOrderStatus } from "@/services/orders";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React from "react";
import { useTranslation } from "@/contexts/i18n-context";

function PrescriptionDeliveryStatusPage() {
  const { slug } = useParams();
  const { t, isRtl } = useTranslation();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order-status", slug],
    queryFn: () => getOrderStatus({ order_id: slug as string }),
  });

  // Transform order data to prescription format for the PrescriptionCard component
  const orderData = (order as any)?.data;

  // Function to translate API status values to proper translation keys
  const translateStatus = (status: string): string => {
    const statusMapping: Record<string, string> = {
      'Order Accepted': t('delivery.orderAccepted'),
      'Pick up': t('delivery.pickUp'),
      'In Progress': t('delivery.inProgress'),
      'Drop Off': t('delivery.dropOff'),
      'Ordered': t('delivery.ordered'),
      'Ready': t('delivery.ready'),
      'Shipped': t('delivery.shipped'),
      'Estimated Delivery': t('delivery.estimatedDelivery'),
      'Delivery Completed': t('delivery.deliveryCompleted'),
    };
    return statusMapping[status] || status;
  };

  // Generate steps from tracking_statuses if available, otherwise use default
  const steps: Step[] = orderData?.tracking_statuses
    ? orderData.tracking_statuses.map((trackingStatus: any, index: number) => ({
        id: index + 1,
        title: translateStatus(trackingStatus.status),
        status: trackingStatus.completed
          ? "completed"
          : index ===
            orderData.tracking_statuses.findIndex((ts: any) => !ts.completed)
          ? "current"
          : "upcoming",
      }))
    : [
        { id: 1, title: t('delivery.ordered'), status: "completed" },
        { id: 2, title: t('delivery.ready'), status: "current" },
        { id: 3, title: t('delivery.shipped'), status: "upcoming" },
        { id: 4, title: t('delivery.estimatedDelivery'), status: "upcoming" },
        { id: 5, title: t('delivery.deliveryCompleted'), status: "upcoming" },
      ];
  const transformedPrescription: Prescription.Prescription | null = orderData
    ? {
        id: orderData.order_id,
        name: `${t('orderHistory.request')} ${orderData.tracking_id}`,
        patient: {
          id: orderData.customer?.id || "",
          name: orderData.customer?.name || t('common.unknownCustomer'),
        },
        file_path: null,
        prescription_text: null,
        created_at: orderData.updated_at || orderData.created_at || orderData.order_details?.created_at || "",
        status: orderData.current_status || "unknown",
      }
    : null;

  if (isLoading) {
    return (
      <DashboardWithBreadcrumbsLayout
        breadcrumbs={[
          { label: t('breadcrumbs.dashboard'), href: "/dashboard" },
          {
            label: t('breadcrumbs.delivery'),
            href: null,
          },
          { label: t('breadcrumbs.liveTracking'), href: "/dashboard/delivery/live-tracking" },
          { label: t('breadcrumbs.deliveryDetail'), href: null },
        ]}
        title={t('delivery.title')}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
        </div>
      </DashboardWithBreadcrumbsLayout>
    );
  }

  if (isError || !order || !transformedPrescription) {
    return (
      <DashboardWithBreadcrumbsLayout
        breadcrumbs={[
          { label: t('breadcrumbs.dashboard'), href: "/dashboard" },
          {
            label: t('breadcrumbs.delivery'),
            href: null,
          },
          { label: t('breadcrumbs.liveTracking'), href: "/dashboard/delivery/live-tracking" },
          { label: t('breadcrumbs.deliveryDetail'), href: null },
        ]}
        title={t('delivery.title')}
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{t('common.error')}</p>
        </div>
      </DashboardWithBreadcrumbsLayout>
    );
  }

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={[
        { label: t('breadcrumbs.dashboard'), href: "/dashboard" },
        {
          label: t('breadcrumbs.delivery'),
          href: null,
        },
        { label: t('breadcrumbs.liveTracking'), href: "/dashboard/delivery/live-tracking" },
        { label: t('breadcrumbs.deliveryDetail'), href: null },
      ]}
      title={t('delivery.title')}
    >
      <div>
        <h1 className="text-2xl font-bold text-blue-gray">{t('delivery.deliveryDetail')}</h1>
        <div className={`flex mt-4 justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
          <PrescriptionCard
            className="p-0"
            status="delivery-status"
            prescription={transformedPrescription}
          />
          <DeliveryCard deliveryGuy={orderData?.delivery_guy} />
        </div>
      </div>
      <div className="my-8">
        <Steppers steps={steps} className="mt-4" />
      </div>
      <table className="text-blue-gray w-full">
        <thead className="border-b-1 border-[#DEDEDE]">
          <tr>
            <th className="text-start py-2">{t('orderHistory.date')}</th>
            <th className="text-start py-2">{t('common.location')}</th>
            <th className="text-start py-2">{t('orderHistory.status')}</th>
          </tr>
        </thead>
        <tbody>
          {orderData?.tracking_statuses?.map((trackingStatus: any, index: number) => (
            <tr key={index}>
              <td className="py-2">
                <div className="flex flex-col">
                  {trackingStatus.timestamp ? (
                    <>
                      <span>{new Date(trackingStatus.timestamp).toLocaleDateString()}</span>
                      <span>{new Date(trackingStatus.timestamp).toLocaleTimeString()}</span>
                    </>
                  ) : (
                    <span className="text-muted-gray">{t('orderHistory.pending')}</span>
                  )}
                </div>
              </td>
              <td className="py-2">
                {trackingStatus.completed ? 
                  (orderData.delivery_address?.address || t('common.location')) : 
                  '-'
                }
              </td>
              <td className="flex flex-col py-2">
                <span>{translateStatus(trackingStatus.status)}</span>
                {trackingStatus.completed && orderData.tracking_id && (
                  <span className="text-muted-gray">{t('common.trackingNo')} : {orderData.tracking_id}</span>
                )}
                {!trackingStatus.completed && (
                  <span className="text-muted-gray">{t('orderHistory.pending')}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default PrescriptionDeliveryStatusPage;
