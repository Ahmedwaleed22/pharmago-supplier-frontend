import React from 'react';
import DashboardCard from "@/components/ui/dashboard/dashboard-card";
import QuickAnalyticsData from "@/components/ui/dashboard/quick-analytics-data";
import { useTranslation } from "@/contexts/i18n-context";

function QuickAnalytics() {
  const { t } = useTranslation();

  return (
    <DashboardCard className="h-full">
      <div className="flex flex-col h-full px-3 py-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-5">
            <h3 className="text-[#414651] font-bold text-lg">{t("dashboard.quickAnalytics")}</h3>
          </div>
        </div>
        <QuickAnalyticsData />
      </div>
    </DashboardCard>
  );
}

export default QuickAnalytics;