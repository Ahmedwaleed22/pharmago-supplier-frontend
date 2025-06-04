import { Icon } from '@iconify/react/dist/iconify.js';
import React from 'react'
import { useQuery } from '@tanstack/react-query';
import createDashboardAnalyticsQueryOptions from '@/query-options/dashboard-analytics-query-options';
import {formatPrice} from "@/helpers/products";
import { useTranslation } from '@/contexts/i18n-context';

function QuickAnalyticsData() {
  const { t } = useTranslation();
  const { data: analytics } = useQuery<Dashboard.Analytics>(createDashboardAnalyticsQueryOptions());

  const data = [
    {
      icon: "ph:money-light",
      value: `${formatPrice(analytics?.gross_volume?.current_revenue as number, analytics?.pharmacy?.country?.currency as Product.Currency)} (${analytics?.gross_volume.growth.toFixed(1)}%)`,
    },
    {
      icon: "ri:shopping-cart-line",
      value: `${analytics?.cards.orders.count.toString()} ${t('dashboard.newOrders')}`,
    },
    {
      icon: "mdi:cube-outline",
      value: `${analytics?.medicine_count?.toString()} ${analytics?.medicine_count && analytics?.medicine_count > 1 ? t('dashboard.products') : t('dashboard.product')}`
    },
    {
      icon: "solar:buildings-outline",
      value: `${analytics?.pharmacy.branches_count} ${analytics?.pharmacy.branches_count && analytics?.pharmacy.branches_count > 1 ? t('dashboard.branches') : t('dashboard.branch')}`
    },
    {
      icon: "solar:users-group-rounded-linear",
      value: `${analytics?.new_clients?.count.toString()} ${t('dashboard.newClients')}`
    }
  ];
  
  
  return (
    <div className="flex flex-col justify-between gap-4 h-full">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-blue text-white flex items-center justify-center">
            <Icon icon={item.icon} width={24} height={24} />
          </div>
          <div>
            <p className="text-md font-semibold text-blue-gray">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default QuickAnalyticsData