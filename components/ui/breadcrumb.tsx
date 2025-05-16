"use client";

import React from 'react'
import {Breadcrumbs, BreadcrumbItem} from "@heroui/react";

interface BreadcrumbProps {
  items: {
    label: string;
    href: string;
  }[];
}

function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <Breadcrumbs>
      {items.map((item) => (
        <BreadcrumbItem key={item.href} href={item.href}>
          {item.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  )
}

export default Breadcrumb