import React from 'react'
import DashboardCard from './dashboard-card';
import OrderHistoryTable from './order-history-table';

interface OrderHistoryProps {
  className?: string;
  noTitle?: boolean;
}

function OrderHistory({ className, noTitle }: OrderHistoryProps) {
  return (
    <DashboardCard className="p-0">
      <div className="flex flex-col gap-5 p-6">
        {!noTitle && (
          <div className="flex justify-between items-center">
            <h3 className="text-[#414651] font-bold text-lg">Order History</h3>
          </div>
        )}
        <OrderHistoryTable />
      </div>
    </DashboardCard>
  )
}

export default OrderHistory;