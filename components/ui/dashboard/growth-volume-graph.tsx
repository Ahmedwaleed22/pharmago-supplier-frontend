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

type ChartData = {
  month: string;
  value: number;
  lastYearValue: number;
};

type Chart = {
  key: string;
  title: string;
  value: number;
  suffix: string;
  type: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  chartData: ChartData[];
};

const data: Chart[] = [
  {
    key: "unique-visitors",
    title: "Unique Visitors",
    suffix: "visitors",
    value: 147000,
    type: "number",
    change: "12.8%",
    changeType: "positive",
    chartData: [
      {month: "Jan", value: 98000, lastYearValue: 43500},
      {month: "Feb", value: 125000, lastYearValue: 38500},
      {month: "Mar", value: 89000, lastYearValue: 58300},
      {month: "Apr", value: 156000, lastYearValue: 35300},
      {month: "May", value: 112000, lastYearValue: 89600},
      {month: "Jun", value: 167000, lastYearValue: 56400},
      {month: "Jul", value: 138000, lastYearValue: 45200},
      {month: "Aug", value: 178000, lastYearValue: 84600},
      {month: "Sep", value: 129000, lastYearValue: 73500},
      {month: "Oct", value: 159000, lastYearValue: 65900},
      {month: "Nov", value: 147000, lastYearValue: 82300},
      {month: "Dec", value: 127000, lastYearValue: 95000},
    ],
  },
];

const formatValue = (value: number, type: string | undefined) => {
  if (type === "number") {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + "k";
    }

    return value.toLocaleString();
  }
  if (type === "percentage") return `${value}%`;

  return value;
};

const formatMonth = (month: string) => {
  const monthNumber =
    {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    }[month] ?? 0;

  return new Intl.DateTimeFormat("en-US", {month: "long"}).format(new Date(2024, monthNumber, 1));
};

/**
 * 🚨 This example requires installing the `recharts` package:
 * `npm install recharts`
 *
 * ```tsx
 * import {Area, AreaChart, ResponsiveContainer, YAxis} from "recharts";
 * ```
 */
function GrowthVolumeGraph({ className }: { className?: string }) {
  const [activeChart, setActiveChart] = React.useState<(typeof data)[number]["key"]>(data[0].key);

  const activeChartData = React.useMemo(() => {
    const chart = data.find((d) => d.key === activeChart);

    return {
      chartData: chart?.chartData ?? [],
      color:
        chart?.changeType === "positive"
          ? "success"
          : chart?.changeType === "negative"
            ? "danger"
            : "default",
      suffix: chart?.suffix,
      type: chart?.type,
    };
  }, [activeChart]);

  const {chartData, color, suffix, type} = activeChartData;

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
                  stopColor={`hsl(var(--heroui-${color}-500))`}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={`hsl(var(--heroui-${color}-100))`}
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
              dataKey="month"
              style={{fontSize: "var(--heroui-font-size-tiny)", transform: "translateX(-40px)"}}
              tickLine={false}
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
                            <span>{formatValue(value as number, type)}</span>
                            <span>{suffix}</span>
                          </div>
                        </div>
                      );
                    })}
                    <span className="text-small font-medium text-foreground-400">
                      {formatMonth(label)} 25, 2024
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
                stroke: `hsl(var(--heroui-${color === "default" ? "foreground" : color}))`,
                strokeWidth: 2,
                fill: "hsl(var(--heroui-background))",
                r: 5,
              }}
              animationDuration={1000}
              animationEasing="ease"
              dataKey="value"
              fill="url(#colorGradient)"
              stroke={`hsl(var(--heroui-${color === "default" ? "foreground" : color}))`}
              strokeWidth={2}
              type="monotone"
            />
            <Area
              activeDot={{
                stroke: "hsl(var(--heroui-default-400))",
                strokeWidth: 2,
                fill: "hsl(var(--heroui-background))",
                r: 5,
              }}
              animationDuration={1000}
              animationEasing="ease"
              dataKey="lastYearValue"
              fill="transparent"
              stroke="hsl(var(--heroui-default-400))"
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
