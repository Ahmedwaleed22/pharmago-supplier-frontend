"use client";

import React, { useState } from "react";
import DashboardCard from "./dashboard-card";
import GrowthRate from "./growth-rate";
import GrowthVolumeGraph from "./growth-volume-graph";

interface DataPoint {
  month: string;
  value1: number;
  value2: number;
}

const chartData: DataPoint[] = [
  { month: "Jan", value1: 20, value2: 10 },
  { month: "Feb", value1: 40, value2: 30 },
  { month: "Mar", value1: 35, value2: 45 },
  { month: "Apr", value1: 50, value2: 40 },
  { month: "May", value1: 60, value2: 55 },
  { month: "Jun", value1: 75, value2: 65 },
  { month: "Jul", value1: 65, value2: 80 },
  { month: "Aug", value1: 90, value2: 75 },
  { month: "Sep", value1: 100, value2: 90 },
  { month: "Oct", value1: 85, value2: 95 },
  { month: "Nov", value1: 95, value2: 85 },
  { month: "Dec", value1: 110, value2: 100 },
];

type GrowthVolumeDataClassName = {
  graph?: string;
}

interface GrowthVolumeData {
  className?: GrowthVolumeDataClassName;
}

function GrowthVolume({ className }: GrowthVolumeData) {
  const [activePoint, setActivePoint] = useState<DataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handlePointHover = (point: DataPoint, event: React.MouseEvent) => {
    setActivePoint(point);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <DashboardCard className="p-0">
      <div className="flex flex-col gap-5 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-[#414651] font-bold text-lg">Gross volume</h3>
            <GrowthRate
              growth={-21.0}
              className="!text-[#F5A524] !bg-[#F5A524]/20 font-semibold text-2xl !px-3 !py-[.35em] !rounded-xl"
              icon="/images/dashboard/grow-arrow-drop.svg"
              iconPosition="left"
              iconSize={20}
            />
          </div>
        </div>
        <GrowthVolumeGraph className={className?.graph} />
      </div>
    </DashboardCard>
  );
}

export default GrowthVolume;
