"use client";

import Advertisement from "@/components/advertisement";
import CustomButton from "@/components/custom-button";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import { useTranslation } from "@/contexts/i18n-context";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import React from "react";
import { createAdvertisementsQueryOptions } from "@/query-options/advertisements-query-options";

function AdvertisementsPage() {
  const { t } = useTranslation();
  const advertisements = useQuery(createAdvertisementsQueryOptions());

  return (
    <DashboardWithBreadcrumbsLayout
      title={t("advertisements.title")}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Advertisements", href: "/dashboard/advertisements" },
      ]}
      action={
        <CustomButton href="/dashboard/advertisements/add">
          <PlusIcon className="w-4 h-4" />
          {t("advertisements.addAdvertisement")}
        </CustomButton>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {advertisements.isLoading ? (
          // Optionally, add skeletons here if you have them
          null
        ) : advertisements.data && advertisements.data.length > 0 ? (
          advertisements.data.map((advertisement) => (
            <Advertisement key={advertisement.id} advertisement={advertisement} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] w-full py-12 col-span-full">
            <div className="mb-6">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="80" height="80" rx="16" fill="#F4F6FB"/>
                <path d="M24 56V28C24 25.7909 25.7909 24 28 24H52C54.2091 24 56 25.7909 56 28V52C56 54.2091 54.2091 56 52 56H28C25.7909 56 24 54.2091 24 52Z" fill="#E0E7FF"/>
                <rect x="32" y="36" width="16" height="2.5" rx="1.25" fill="#A5B4FC"/>
                <rect x="32" y="42" width="16" height="2.5" rx="1.25" fill="#A5B4FC"/>
                <rect x="32" y="48" width="10" height="2.5" rx="1.25" fill="#A5B4FC"/>
                <rect x="36" y="28" width="8" height="4" rx="2" fill="#6366F1"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-blue-gray mb-2">{t("advertisements.noAdvertisements")}</h2>
            <p className="text-gray-500 text-center max-w-xs">{t("advertisements.noAdvertisementsDescription")}</p>
          </div>
        )}
      </div>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default AdvertisementsPage;
