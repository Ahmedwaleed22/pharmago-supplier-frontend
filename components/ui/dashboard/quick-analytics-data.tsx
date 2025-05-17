import { Icon } from '@iconify/react/dist/iconify.js';
import React from 'react'

function QuickAnalyticsData() {
  const data = [
    {
      icon: "ph:money-light",
      value: "19,050 SAR New Income (14.6%)",
    },
    {
      icon: "ri:shopping-cart-line",
      value: "1,200 New Orders",
    },
    {
      icon: "mdi:cube-outline",
      value: "3,509 Products"
    },
    {
      icon: "solar:buildings-outline",
      value: "15 Branch"
    },
    {
      icon: "solar:users-group-rounded-linear",
      value: "210 New Clients"
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