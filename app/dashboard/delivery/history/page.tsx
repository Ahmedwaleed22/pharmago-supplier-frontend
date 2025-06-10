"use client";

import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import React, { useState } from "react";
import CustomButton from "@/components/custom-button";
import { Icon } from "@iconify/react";
import OrderHistory from "@/components/ui/dashboard/order-history";
import { Select, SelectItem } from "@heroui/select";
import { Pagination } from "@heroui/pagination";
import { useQuery } from "@tanstack/react-query";
import { getDeliveryHistory } from "@/services/orders";
import { useTranslation } from "@/contexts/i18n-context";
import { useSearchParams } from "next/navigation";

function DeliveryHistoryPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const statusList = [
    { key: "all", label: t('categories.all') },
    { key: "pending", label: t('orderHistory.pending') },
    { key: "processing", label: t('common.processing') },
    { key: "shipping", label: t('common.shipping') },
    { key: "delivered", label: t('common.delivered') },
    { key: "canceled", label: t('common.canceled') },
  ];

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["order-history", status, page, search],
    queryFn: () => {
      console.log(`Fetching delivery history for status: ${status}, page: ${page}, search: ${search}`);
      return getDeliveryHistory(status, page, search || "");
    },
    placeholderData: (previousData, previousQuery) => previousData,
  });

  // Reset page when status changes
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const pagination = orders?.data?.pagination;
  const stats = orders?.data?.stats;

  const cardFooterPagination = (
    <>
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center mt-6">
          <div className="ltr-force">
            <Pagination
              showControls
              total={pagination.last_page}
              page={page}
              onChange={setPage}
              classNames={{
                cursor: "!hidden",
                item: "relative z-0",
                prev: "relative z-0 bg-default-100",
                next: "relative z-0 bg-default-100",
              }}
            />
          </div>
          <style jsx global>{`
            .ltr-force {
              direction: ltr !important;
            }
            .ltr-force * {
              direction: ltr !important;
            }
            .ltr-force [data-slot="wrapper"] {
              flex-direction: row !important;
            }
            .ltr-force [data-slot="cursor"] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
            }
            .ltr-force [data-slot="item"][data-active="true"] {
              background-color: #3b82f6 !important; /* primary blue */
              color: white !important;
              box-shadow: var(--heroui-shadow-small) !important;
            }
            .ltr-force [data-slot="prev"] {
              border-top-right-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
              border-top-left-radius: var(--heroui-radius-medium) !important;
              border-bottom-left-radius: var(--heroui-radius-medium) !important;
            }
            .ltr-force [data-slot="next"] {
              border-top-left-radius: 0 !important;
              border-bottom-left-radius: 0 !important;
              border-top-right-radius: var(--heroui-radius-medium) !important;
              border-bottom-right-radius: var(--heroui-radius-medium) !important;
            }
            .ltr-force [data-slot="item"]:first-of-type {
              border-top-right-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
            }
            .ltr-force [data-slot="item"]:last-of-type {
              border-top-left-radius: 0 !important;
              border-bottom-left-radius: 0 !important;
            }
            .ltr-force [data-slot="item"]:not(:first-of-type):not(:last-of-type) {
              border-radius: 0 !important;
            }
          `}</style>
        </div>
      )}
    </>
  );

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={[
        { label: t('breadcrumbs.dashboard'), href: "/dashboard" },
        { label: t('breadcrumbs.delivery'), href: null },
        { label: t('navigation.deliveryHistory'), href: "/dashboard/delivery/history" },
      ]}
      title={t('delivery.title')}
    >
      <div className="flex items-center justify-between">
        <div className="flex w-full lg:w-1/3 gap-4 items-center">
          <h1 className="text-2xl font-bold text-blue-gray w-max">
            {t('navigation.deliveryHistory')}
          </h1>
          <div className="w-1/3">
            <Select
              className="max-w-xs bg-white"
              placeholder={t('categories.all')}
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
              onSelectionChange={(e) => handleStatusChange(e.currentKey as string)}
            >
              {statusList.map((status) => (
                <SelectItem key={status.key} className="text-blue-gray">{status.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
        {/* Display stats if available */}
        {/* {stats && (
          <div className="flex gap-4 text-sm text-blue-gray">
            <div className="flex flex-col items-center">
              <span className="font-semibold">{stats.total_orders}</span>
              <span>{t('orderHistory.totalOrders')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">{stats.delivered_orders}</span>
              <span>{t('common.delivered')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">{stats.delivery_success_rate}%</span>
              <span>{t('delivery.successRate')}</span>
            </div>
          </div>
        )} */}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{t('common.error')}</p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <OrderHistory noTitle={true} orders={orders?.data?.orders as unknown as Dashboard.OrderHistoryItem[] || []} noPagination={true} cardFooter={cardFooterPagination} />
          </div>

          {/* Pagination info */}
          {pagination && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <div>
                {t('common.showing')} {pagination.from} {t('common.to')} {pagination.to} {t('common.of')} {pagination.total} {t('common.results')}
              </div>
              <div>
                {t('common.page')} {page} {t('common.of')} {pagination.last_page}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardWithBreadcrumbsLayout>
  );
}

export default DeliveryHistoryPage;
