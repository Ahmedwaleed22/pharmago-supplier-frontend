"use client";

import React from 'react'
import DashboardLayout from './dashboard-layout';
import Link from 'next/link';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';

interface DashboardWithBreadcrumbsLayoutProps {
  children: React.ReactNode;
  breadcrumbs: {
    label: string;
    href: string | null;
  }[];
  title: string;
}

function DashboardWithBreadcrumbsLayout({ children, breadcrumbs, title }: DashboardWithBreadcrumbsLayoutProps) {
  return (
    <DashboardLayout>
      <div className="mt-7">
        <Breadcrumbs>
          {breadcrumbs.map((breadcrumb) => (
            <BreadcrumbItem key={breadcrumb.href}>
              {breadcrumb.href !== null ? (
                <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
              ) : (
                <span className={`${breadcrumb.href === null ? "cursor-not-allowed" : ""}`}>{breadcrumb.label}</span>
              )}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
        <h1 className="text-2xl font-semibold text-blue-gray mt-3">{title}</h1>
      </div>
      <div className="flex-1 py-6">
        {children}
      </div>
    </DashboardLayout>
  )
}

export default DashboardWithBreadcrumbsLayout;