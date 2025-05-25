"use client";

import React, { useState } from "react";
import DashboardCard from "./dashboard-card";
import GrowthRate from "./growth-rate";
import GrowthVolumeGraph from "./growth-volume-graph";
import {formatPrice} from "@/helpers/products";
import { useTranslation } from "@/contexts/i18n-context";

interface GrowthVolumeProps {
  className?: {
    graph?: string;
  };
  data: Dashboard.GrossVolumeData;
  currency: Product.Currency;
}

function GrowthVolume({ className, data, currency }: GrowthVolumeProps) {
  const { t } = useTranslation();
  const [activePoint, setActivePoint] = useState<{date: string; revenue: number} | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });



  const handlePointHover = (point: {date: string; revenue: number}, event: React.MouseEvent) => {
    setActivePoint(point);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <DashboardCard className="p-0">
      <div className="flex flex-col gap-5 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-[#414651] font-bold text-lg">{t('dashboard.growthVolume')}</h3>
            <GrowthRate
              growth={data.growth}
              className="!text-[#F5A524] !bg-[#F5A524]/20 font-semibold text-2xl !px-3 !py-[.35em] !rounded-xl"
              icon="/images/dashboard/grow-arrow-drop.svg"
              iconPosition="left"
              iconSize={20}
              trend_direction={data.growth > 0 ? "up" : data.growth < 0 ? "down" : "neutral"}
            />
          </div>
          <div>
            <span className="text-lg font-bold">{formatPrice(data.current_revenue, currency)}</span>
            <span className="text-gray-500 ml-2">{data.current_month}</span>
          </div>
        </div>
        <GrowthVolumeGraph className={className?.graph} currency={currency} data={data.data} />
      </div>
    </DashboardCard>
  );
}

export default GrowthVolume;
