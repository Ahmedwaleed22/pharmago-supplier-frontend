import React from 'react'
import DashboardCard from './dashboard-card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import GrowthRate from './growth-rate';

interface StatisticCardProps {
  className?: string;
  title: string;
  value: string;
  icon: string;
  growth?: number;
  trend_direction?: "up" | "down" | "neutral";
}

function StatisticCard({ className, title, value, icon, growth = 0, trend_direction = "neutral" }: StatisticCardProps) {
  return (
    <DashboardCard className={cn("flex gap-10 flex-col", className)}>
      <div className="flex gap-10 flex-col text-blue-gray">
        <div className="flex items-center gap-2">
          <Image src={icon} alt={title} width={24} height={24} />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <span className="text-2xl font-bold">{value}</span>
          <GrowthRate growth={growth} className="mt-auto" trend_direction={trend_direction} />
        </div>
      </div>
    </DashboardCard>
  )
}

export default StatisticCard;