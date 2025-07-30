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

  // Function to translate month name if it's in English
  const translateMonthIfNeeded = (monthText: string) => {
    // Check if the text contains English month abbreviations
    const englishMonths: Record<string, string> = {
      'Jan': 'jan', 'Feb': 'feb', 'Mar': 'mar', 'Apr': 'apr', 'May': 'may', 'Jun': 'jun',
      'Jul': 'jul', 'Aug': 'aug', 'Sep': 'sep', 'Oct': 'oct', 'Nov': 'nov', 'Dec': 'dec'
    };
    
    // Check if the text contains English full month names
    const englishFullMonths: Record<string, string> = {
      'January': 'jan', 'February': 'feb', 'March': 'mar', 'April': 'apr', 'May': 'may', 'June': 'jun',
      'July': 'jul', 'August': 'aug', 'September': 'sep', 'October': 'oct', 'November': 'nov', 'December': 'dec'
    };
    
    let translatedText = monthText;
    
    // Handle month-year pattern first (e.g., "Jul 2025")
    const monthYearPattern = /(\w+)\s+(\d{4})/;
    const match = translatedText.match(monthYearPattern);
    
    if (match) {
      const [fullMatch, month, year] = match;
      
      // Check if it's a known English month
      if (englishMonths[month] || englishFullMonths[month]) {
        const monthKey = englishMonths[month] || englishFullMonths[month];
        const translatedMonth = t(`common.months.${monthKey}`);
        translatedText = translatedText.replace(fullMatch, `${translatedMonth} ${year}`);
        return translatedText; // Return early to avoid double replacement
      }
    }
    
    // If no month-year pattern, try individual month replacements
    // Try to translate full month names first (longer matches)
    for (const [english, key] of Object.entries(englishFullMonths)) {
      if (translatedText.includes(english)) {
        const translatedMonth = t(`common.months.${key}`);
        translatedText = translatedText.replace(english, translatedMonth);
        return translatedText; // Return early to avoid double replacement
      }
    }
    
    // Try to translate month abbreviations
    for (const [english, key] of Object.entries(englishMonths)) {
      if (translatedText.includes(english)) {
        const translatedMonth = t(`common.months.${key}`);
        translatedText = translatedText.replace(english, translatedMonth);
        return translatedText; // Return early to avoid double replacement
      }
    }
    
    return translatedText;
  };

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
              className={`font-semibold text-2xl !px-3 !py-[.35em] !rounded-xl ${data.growth_direction === "up" ? "!text-[#16B364] !bg-[#C9FCD3]" : "!text-[#F5A524] !bg-[#F5A524]/20"}`} 
              icon={data.growth_direction === "down" || data.growth_direction === "neutral" ? "/images/dashboard/grow-arrow-drop.svg" : "/images/dashboard/grow-arrow-up.svg"}
              iconPosition="left"
              iconSize={20}
              trend_direction={data.growth_direction}
            />
          </div>
          <div>
            <span className="text-lg font-bold">{formatPrice(data.current_revenue, currency)}</span>
            <span className="text-gray-500 ml-2">{translateMonthIfNeeded(data.current_month)}</span>
          </div>
        </div>
        <GrowthVolumeGraph className={className?.graph} currency={currency} data={data.data} />
      </div>
    </DashboardCard>
  );
}

export default GrowthVolume;
