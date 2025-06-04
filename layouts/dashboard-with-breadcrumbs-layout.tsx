"use client";

import React from "react";
import DashboardLayout from "./dashboard-layout";
import Link from "next/link";
import { BreadcrumbItem, Breadcrumbs, Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useTranslation } from "@/contexts/i18n-context";
import CustomButton from "@/components/custom-button";

interface DashboardWithBreadcrumbsLayoutProps {
  children: React.ReactNode;
  breadcrumbs: {
    label: string;
    href: string | null;
  }[];
  title: string;
  action?: React.ReactNode;
  refreshable?: boolean;
  refreshFn?: () => void;
}

function DashboardWithBreadcrumbsLayout({
  children,
  breadcrumbs,
  title,
  action,
  refreshable,
  refreshFn,
}: DashboardWithBreadcrumbsLayoutProps) {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <div className="mt-7">
        <Breadcrumbs>
          {breadcrumbs.map((breadcrumb, key) => (
            <BreadcrumbItem key={key}>
              {breadcrumb.href !== null ? (
                <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
              ) : (
                <span
                  className={`${
                    breadcrumb.href === null ? "cursor-not-allowed" : ""
                  }`}
                >
                  {breadcrumb.label}
                </span>
              )}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
        <div className="flex justify-between items-center mt-3">
          <h1 className="text-2xl font-semibold text-blue-gray mt-3">
            {title}
          </h1>
          {action}
          {refreshable && (
            <CustomButton
              onClick={refreshFn}
              className="mt-3 bg-primary-blue text-white"
            >
              <Icon icon="solar:refresh-outline" />
              {t("common.refresh")}
            </CustomButton>
          )}
        </div>
      </div>
      <div className="flex-1 py-6">{children}</div>
    </DashboardLayout>
  );
}

export default DashboardWithBreadcrumbsLayout;
