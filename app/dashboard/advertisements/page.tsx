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
        {advertisements.data?.map((advertisement) => (
          <Advertisement key={advertisement.id} advertisement={advertisement} />
        ))}
      </div>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default AdvertisementsPage;
