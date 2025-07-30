"use client";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useTranslation } from "@/contexts/i18n-context";
import { Icon } from "@iconify/react";
import DashboardCard from "@/components/ui/dashboard/dashboard-card";
import { fetchOrder } from "@/services/orders";
import { getXmlValue } from "@/helpers/prescriptions";
import Image from "next/image";

function PrescriptionOrderDetailsPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  
  const { data: order, isLoading } = useQuery({
    queryKey: ["prescription-order", slug],
    queryFn: () => fetchOrder(slug as string),
  });

  const breadcrumbs = [
    { label: t('breadcrumbs.dashboard'), href: "/dashboard" },
    { label: t('breadcrumbs.orders'), href: "/dashboard/orders" },
    { label: t('breadcrumbs.prescriptionOrderDetails'), href: null },
  ];

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'pending':
        return t('orderHistory.pending');
      case 'processing':
        return t('orderHistory.processing');
      case 'shipping':
        return t('orderHistory.shipping');
      case 'delivered':
        return t('orderHistory.delivered');
      case 'canceled':
        return t('orderHistory.canceled');
      case 'pharmacy_offer':
        return t('orderHistory.pharmacyOffer');
      case 'order_placed':
        return t('orderHistory.orderPlaced');
      default:
        return status;
    }
  };

  const getPaymentStatusTranslation = (status: string) => {
    switch (status) {
      case 'pending':
        return t('orderHistory.paymentPending');
      case 'paid':
        return t('orderHistory.paymentPaid');
      case 'failed':
        return t('orderHistory.paymentFailed');
      default:
        return status;
    }
  };

  const loadPrescriptionPreview = () => {
    // Find prescription item in order items
    const prescriptionItem = order?.items?.find((item: any) => 
      item.orderable_type === "App\\Models\\Prescription"
    );
    
    if (!prescriptionItem?.orderable) {
      return <div>{t('common.noData')}</div>;
    }

    const prescription = prescriptionItem.orderable;

    if (prescription.file_path) {
      return (
        <div className="flex justify-center items-center">
          <Image
            src={prescription.file_path}
            alt="prescription-preview"
            className="w-full h-full"
            width={10000}
            height={1000}
          />
        </div>
      );
    }

    if (prescription.prescription_text) {
      const prescriptionItems = Array.from(
        new DOMParser()
          .parseFromString(prescription.prescription_text, "text/xml")
          .querySelectorAll("medicine")
      ).map((medicine) => ({
        description: getXmlValue(medicine.outerHTML, "name"),
        quantity: parseInt(getXmlValue(medicine.outerHTML, "quantity"), 10),
      }));

      return (
        <div className="flex justify-center items-center">
          <div className="w-full py-2 bg-white rounded-2xl">
            <table className="w-full border-separate border-spacing-x-4">
              <thead>
                <tr>
                  <th className="text-left pb-4">
                    <h4 className="text-blue-600 font-medium text-sm px-1">
                      {t('prescriptions.medicineName')}
                    </h4>
                  </th>
                  <th className="text-center pb-4 w-20">
                    <h4 className="text-blue-600 font-medium text-sm px-1">
                      {t('prescriptions.qty')}
                    </h4>
                  </th>
                </tr>
              </thead>
              <tbody>
                {prescriptionItems.map((item, index) => (
                  <tr key={index}>
                    <td className="pb-2">
                      <div className="bg-[#F4F4F4] p-3 px-4 rounded-lg">
                        <span className="font-semibold text-blue-gray">
                          {item.description}
                        </span>
                      </div>
                    </td>
                    <td className="pb-2">
                      <div className="bg-[#F4F4F4] p-3 px-4 rounded-lg flex justify-center">
                        <span className="font-semibold text-blue-gray text-center">
                          {item.quantity}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return <div>{t('common.noData')}</div>;
  };

  if (isLoading) {
    return (
      <DashboardWithBreadcrumbsLayout
        breadcrumbs={breadcrumbs}
        title={t('orders.prescriptionOrderDetails')}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
        </div>
      </DashboardWithBreadcrumbsLayout>
    );
  }

  if (!order) {
    return (
      <DashboardWithBreadcrumbsLayout
        breadcrumbs={breadcrumbs}
        title={t('orders.prescriptionOrderDetails')}
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{t('common.error')}</p>
        </div>
      </DashboardWithBreadcrumbsLayout>
    );
  }

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={breadcrumbs}
      title={t('orders.prescriptionOrderDetails')}
    >
      <div className="flex flex-col gap-6">
        
        {/* Order Info */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <h2 className="text-lg font-bold mb-2">{t('orders.prescriptionOrderDetails')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
            <div className="flex items-center gap-2">
              <b>{t('orderHistory.id')}:</b> {order.tracking_id || order.id}
              <span className="cursor-pointer" onClick={async () => { 
                await navigator.clipboard.writeText(order.tracking_id || order.id); 
                setCopied(true); 
                setTimeout(() => setCopied(false), 1200); 
              }}>
                <Icon icon="mdi:content-copy" width="16" height="16" />
              </span>
              {copied && <span className="text-xs text-green-600 ml-1">{t('common.copied') || 'Copied!'}</span>}
            </div>
            <div><b>{t('orders.customer')}:</b> {order.user?.name}</div>
            <div><b>{t('orderHistory.status')}:</b> {getStatusTranslation(order.status)}</div>
            <div><b>{t('orders.paymentStatus')}:</b> {getPaymentStatusTranslation(order.payment_status)}</div>
            <div><b>{t('orderHistory.date')}:</b> {order.created_at}</div>
            <div><b>{t('orders.total')}:</b> {order.total} {order.currency?.code || 'USD'}</div>
          </div>
        </div>

        {/* Prescription Preview */}
        {order?.items?.some((item: any) => item.orderable_type === "App\\Models\\Prescription") && (
          <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
            <h2 className="text-lg font-bold mb-2">{t('prescriptions.prescriptionDetails')}</h2>
            <DashboardCard>
              {loadPrescriptionPreview()}
            </DashboardCard>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <h2 className="text-lg font-bold mb-2">{t('orders.orderItems')}</h2>
          <div className="space-y-4">
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.orderable?.name || t('common.unknownProduct')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('orders.quantity')}: {item.quantity}
                  </p>
                  {item.orderable?.description && (
                    <p className="text-sm text-gray-500 mt-1">{item.orderable.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {item.unit_price || 0} {order.currency?.code || 'USD'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('orders.total')}: {item.subtotal || 0} {order.currency?.code || 'USD'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Information */}
        {order.shipping_address && (
          <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
            <h2 className="text-lg font-bold mb-2">{t('orders.shippingInformation')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><b>{t('orders.address')}:</b> {order.shipping_address.address}</div>
              {order.shipping_address.city && (
                <div><b>{t('orders.city')}:</b> {order.shipping_address.city}</div>
              )}
              {order.shipping_address.state && (
                <div><b>{t('orders.state')}:</b> {order.shipping_address.state}</div>
              )}
              {order.shipping_address.postal_code && (
                <div><b>{t('orders.postalCode')}:</b> {order.shipping_address.postal_code}</div>
              )}
              {order.shipping_address.country && (
                <div><b>{t('orders.country')}:</b> {order.shipping_address.country}</div>
              )}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <h2 className="text-lg font-bold mb-2">{t('orders.orderSummary')}</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t('orders.subtotal')}:</span>
              <span>{order.subtotal} {order.currency?.code || 'USD'}</span>
            </div>
            {order.delivery_fees > 0 && (
              <div className="flex justify-between">
                <span>{t('orders.deliveryFees')}:</span>
                <span>{order.delivery_fees} {order.currency?.code || 'USD'}</span>
              </div>
            )}
            {order.service_fee > 0 && (
              <div className="flex justify-between">
                <span>{t('orders.serviceFee')}:</span>
                <span>{order.service_fee} {order.currency?.code || 'USD'}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span>{t('orders.discount')}:</span>
                <span>-{order.discount} {order.currency?.code || 'USD'}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>{t('orders.total')}:</span>
              <span>{order.total} {order.currency?.code || 'USD'}</span>
            </div>
          </div>
        </div>

        {/* Pharmacy Information */}
        {order.pharmacy && (
          <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
            <h2 className="text-lg font-bold mb-2">{t('orders.pharmacyInformation')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><b>{t('orders.pharmacyName')}:</b> {order.pharmacy.name}</div>
              {order.pharmacy.phone_number && (
                <div><b>{t('orders.phone')}:</b> {order.pharmacy.phone_number}</div>
              )}
              {order.pharmacy.address && (
                <div><b>{t('orders.address')}:</b> {order.pharmacy.address}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default PrescriptionOrderDetailsPage; 