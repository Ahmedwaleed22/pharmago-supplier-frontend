import React from 'react'
import { cn } from '@/lib/utils';
interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

function DashboardCard({ children, className }: DashboardCardProps) {
  return (
    <div className={cn("bg-white rounded-xl px-4 py-5 shadow-sm h-full", className)}>
      {children}
    </div>
  )
}

export default DashboardCard;