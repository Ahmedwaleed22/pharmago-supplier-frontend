import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react'

interface GrowthRateProps {
  growth: number;
  className?: string;
  icon?: string;
  iconPosition?: "left" | "right";
  iconSize?: number;
  trend_direction?: "up" | "down" | "neutral";
}

function GrowthRate({ growth, className, icon, iconPosition = "right", iconSize = 9, trend_direction = "neutral" }: GrowthRateProps) {
  const isPositive = trend_direction === "up" || (trend_direction === "neutral" && growth > 0);
  const iconSrc = icon || (isPositive ? "/images/dashboard/grow.svg" : "/images/dashboard/fall.svg");

  return (
    <div className={cn(`flex justify-between gap-1 rounded-sm px-[.2em] py-[.1em] ${isPositive ? "bg-[#C9FCD3] text-[#16B364]" : "bg-[#FFDDDD] text-[#FF5F5F]"}`, className)}>
      {iconPosition === "left" && (
        <Image src={iconSrc} alt="Growth Rate" width={iconSize} height={iconSize} />
      )}
      <span className="text-[.7em] font-medium">{growth}%</span>
      {iconPosition === "right" && (
        <Image src={iconSrc} alt="Growth Rate" width={iconSize} height={iconSize} />
      )}
    </div>
  )
}

export default GrowthRate;