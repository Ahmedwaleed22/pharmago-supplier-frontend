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
      {items.map((item, key) => (
        <BreadcrumbItem key={key} href={item.href}>
          {item.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  )
}

export default Breadcrumb