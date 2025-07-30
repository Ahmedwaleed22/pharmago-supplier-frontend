import React, { useState, useRef, useEffect } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/i18n-context";

interface DateRangePickerProps {
  fromDate?: string;
  toDate?: string;
  onDateChange: (fromDate: string, toDate: string) => void;
  className?: string;
}

export function DateRangePicker({
  fromDate,
  toDate,
  onDateChange,
  className
}: DateRangePickerProps) {
  const [localFromDate, setLocalFromDate] = useState(fromDate || "");
  const [localToDate, setLocalToDate] = useState(toDate || "");
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get today's date in YYYY-MM-DD format for max attribute
  const today = new Date().toISOString().split('T')[0];

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Update local state when props change
  useEffect(() => {
    setLocalFromDate(fromDate || "");
    setLocalToDate(toDate || "");
  }, [fromDate, toDate]);

  const handleFromDateChange = (value: string) => {
    setLocalFromDate(value);
    
    // If the new from date is after the current to date, clear the to date
    if (value && localToDate && value > localToDate) {
      setLocalToDate("");
    }
  };

  const handleToDateChange = (value: string) => {
    setLocalToDate(value);
    
    // If the new to date is before the current from date, clear the from date
    if (value && localFromDate && localFromDate > value) {
      setLocalFromDate("");
    }
  };

  const handleApply = () => {
    onDateChange(localFromDate, localToDate);
    setIsExpanded(false);
  };

  const handleClear = () => {
    setLocalFromDate("");
    setLocalToDate("");
    onDateChange("", "");
    setIsExpanded(false);
  };

  const handleQuickSelect = (days: number) => {
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - days);
    
    const fromDateStr = fromDate.toISOString().split('T')[0];
    const toDateStr = today.toISOString().split('T')[0];
    
    setLocalFromDate(fromDateStr);
    setLocalToDate(toDateStr);
    onDateChange(fromDateStr, toDateStr);
    setIsExpanded(false);
  };

  const formatDateRange = () => {
    if (!fromDate && !toDate) return t('dashboard.dateRange.selectDates');
    if (!fromDate || !toDate) return t('dashboard.dateRange.selectDates');
    
    const from = new Date(fromDate).toLocaleDateString();
    const to = new Date(toDate).toLocaleDateString();
    return `${from} - ${to}`;
  };

  const hasActiveFilter = fromDate && toDate;
  const isValidDateRange = localFromDate && localToDate && localFromDate <= localToDate;

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Toggle Button */}
      <Button
        variant={hasActiveFilter ? "default" : "outline"}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full justify-between",
          hasActiveFilter && "bg-primary text-primary-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formatDateRange()}
        </span>
        <svg
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {/* Dropdown Content */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[320px] animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Date Inputs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  {t('dashboard.dateRange.fromDate')}
                </label>
                <Input
                  type="date"
                  value={localFromDate}
                  onChange={(e) => handleFromDateChange(e.target.value)}
                  max={localToDate || today}
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  {t('dashboard.dateRange.toDate')}
                </label>
                <Input
                  type="date"
                  value={localToDate}
                  onChange={(e) => handleToDateChange(e.target.value)}
                  min={localFromDate}
                  max={today}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Validation Message */}
            {localFromDate && localToDate && localFromDate > localToDate && (
              <div className="mb-4 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
                {t('dashboard.dateRange.invalidRange')}
              </div>
            )}
            
            {/* Quick Selection Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(7)}
                className="text-xs flex-1"
              >
                {t('dashboard.dateRange.last7Days')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(30)}
                className="text-xs flex-1"
              >
                {t('dashboard.dateRange.last30Days')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(90)}
                className="text-xs flex-1"
              >
                {t('dashboard.dateRange.last90Days')}
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleApply}
                className="flex-1"
                disabled={!isValidDateRange}
              >
                {t('dashboard.dateRange.applyFilter')}
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                {t('dashboard.dateRange.clear')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 