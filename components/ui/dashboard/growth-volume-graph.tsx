"use client";

import React from "react";
import {
  Chip,
  Button,
  Card,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tab,
  Tabs,
  Spacer,
} from "@heroui/react";
import {Icon} from "@iconify/react";
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis} from "recharts";
import {formatPrice} from "@/helpers/products";
import { useI18n } from '@/contexts/i18n-context';

interface ChartData {
  date: string;
  revenue: number;
}

interface GrowthVolumeGraphProps {
  className?: string;
  data: ChartData[] | null | undefined;
  currency: Product.Currency;
}

const formatDate = (dateString: string, t?: (key: string) => string) => {
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date:', dateString);
    return dateString; // Return original string if date is invalid
  }
  
  // Use translation if available, otherwise fallback to locale-aware formatting
  if (t) {
    const month = t(`common.months.${date.toLocaleString('en-US', { month: 'short' }).toLowerCase()}`);
    const day = date.getDate();
    return `${day} ${month}`;
  }
  
  // Fallback to locale-aware formatting
  return new Intl.DateTimeFormat(navigator.language || 'en', { month: "short", day: "numeric" }).format(date);
};

function GrowthVolumeGraph({ className, data, currency }: GrowthVolumeGraphProps) {
  const { t } = useI18n();
  // Ensure data is an array and has items
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card as="dl" className="border border-transparent dark:border-default-100 bg-transparent shadow-none">
        <section className="flex flex-col flex-nowrap h-full">
          <div className="flex items-center justify-center h-[300px] text-foreground-400">
            No data available for chart
          </div>
        </section>
      </Card>
    );
  }

  // Prepare data for the chart
  const chartData = data.map(item => {
    // Check if item.date is already a formatted string or a valid date
    let formattedDate;
    
    if (typeof item.date === 'string') {
      // If it's already formatted (contains spaces), use it as is
      if (item.date.includes(' ')) {
        formattedDate = item.date;
      } else {
        // It's a date string like "2025-07-15", format it
        formattedDate = formatDate(item.date, t);
      }
    } else {
      // Fallback
      formattedDate = formatDate(String(item.date), t);
    }
    
    return {
      date: formattedDate,
      value: item.revenue,
      // For comparison, if needed
      lastYearValue: 0
    };
  });

  return (
    <Card as="dl" className="border border-transparent dark:border-default-100 bg-transparent shadow-none">
      <section className="flex flex-col flex-nowrap h-full">
        <ResponsiveContainer
          className={cn("min-h-[300px] h-full [&_.recharts-surface]:outline-none", className)}
          height="100%"
          width="100%"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            height={300}
            margin={{
              left: 0,
              right: 0,
            }}
            width={500}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="10%"
                  stopColor={`hsl(var(--heroui-success-500))`}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={`hsl(var(--heroui-success-100))`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontalCoordinatesGenerator={() => [200, 150, 100, 50]}
              stroke="hsl(var(--heroui-default-200))"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="date"
              style={{fontSize: "var(--heroui-font-size-tiny)", transform: "translateX(-40px)"}}
              tickLine={false}
              tickFormatter={(value) => {
                // The value should already be formatted, just return it
                return String(value);
              }}
            />
            <Tooltip
              content={({label, payload}) => (
                <div className="flex h-auto min-w-[120px] items-center gap-x-2 rounded-medium bg-foreground p-2 text-tiny shadow-small">
                  <div className="flex w-full flex-col gap-y-0">
                    {payload?.map((p, index) => {
                      const name = p.name;
                      const value = p.value;

                      return (
                        <div key={`${index}-${name}`} className="flex w-full items-center gap-x-2">
                          <div className="flex w-full items-center gap-x-1 text-small text-background">
                            <span>{formatPrice(value as number, currency)}</span>
                            <span>revenue</span>
                          </div>
                        </div>
                      );
                    })}
                    <span className="text-small font-medium text-foreground-400">
                      {label ? (() => {
                        // Try to translate the date if it contains month names
                        const date = new Date(label);
                        const month = t(`common.months.${date.toLocaleString('en-US', { month: 'short' }).toLowerCase()}`);
                        const day = date.getDate();
                        return `${day} ${month}`;
                      })() : label}
                    </span>
                  </div>
                </div>
              )}
              cursor={{
                strokeWidth: 0,
              }}
            />
            <Area
              activeDot={{
                stroke: `hsl(var(--heroui-success))`,
                strokeWidth: 2,
                fill: "hsl(var(--heroui-background))",
                r: 5,
              }}
              animationDuration={1000}
              animationEasing="ease"
              dataKey="value"
              fill="url(#colorGradient)"
              stroke={`hsl(var(--heroui-success))`}
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </Card>
  );
}

export default GrowthVolumeGraph;
