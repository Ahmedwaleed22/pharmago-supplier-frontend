"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeAllItems } from "@/store/ProductCreationSlice";
import { useTranslation } from "@/contexts/i18n-context";
import { cn } from "@/lib/utils";

function ProductLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { t, isRtl } = useTranslation();
  
  // Check if we're in edit mode
  const isEditMode = pathname.includes("/edit");
  
  // Extract the product ID if in edit mode
  const productId = isEditMode ? pathname.split('/edit/')[1]?.split('/')[0] : null;
  
  // Create the base path segment based on mode
  const basePathSegment = isEditMode 
    ? `/edit/${productId}`
    : "/add";
  
  const steps = [
    {
      label: t('products.generalInformation'),
      href: `/dashboard/products${basePathSegment}`,
    },
    {
      label: t('products.productDetails'),
      href: `/dashboard/products${basePathSegment}/step-2`,
    },
    {
      label: t('products.productImageStep'),
      href: `/dashboard/products${basePathSegment}/step-3`,
    },
    {
      label: t('products.summary'),
      href: `/dashboard/products${basePathSegment}/step-4`,
    },
  ];

  const BackToDashboard = () => {
    dispatch(removeAllItems());
    window.location.href = "/dashboard";
  };

  // Determine current step based on pathname pattern instead of exact match
  let currentStep = 0;  // Default to first step
  
  if (pathname.includes('/step-2')) {
    currentStep = 1;
  } else if (pathname.includes('/step-3')) {
    currentStep = 2;
  } else if (pathname.includes('/step-4')) {
    currentStep = 3;
  }

  const pageTitle = isEditMode ? t('products.editProduct') : t('products.addProduct');

  const ChevronIcon = isRtl ? ChevronRight : ChevronLeft;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-smooth-white">
      {/* Sidebar */}
      <div className={`w-full lg:w-64 border-gray-200 bg-white ${isRtl ? 'lg:border-l border-b lg:border-b-0' : 'lg:border-r border-b lg:border-b-0'}`}>
        <div className="px-4 py-4 lg:py-16">
          <Link href="/dashboard">
            <Image
              src="/images/sidebar-logo.png"
              alt="PharmaGo Logo"
              width={260}
              height={50}
              className="w-full h-full max-w-[200px] lg:max-w-none"
            />
          </Link>
        </div>

        <div className="flex flex-row lg:flex-col gap-2 lg:gap-6 overflow-x-auto lg:overflow-x-visible px-4 lg:px-0 pb-4 lg:pb-0">
          {steps.map((step, index) => (
            <Link href={step.href} key={index}>
              <div
                key={index}
                className={cn(
                  "py-2 lg:py-0 px-3 lg:px-0 lg:pl-5 whitespace-nowrap lg:whitespace-normal rounded lg:rounded-none",
                  index === currentStep
                    ? `lg:border-r-4 border-primary-blue text-primary-blue bg-blue-50 lg:bg-transparent`
                    : ''
                )}
              >
                <div className="text-xs text-[#787878]">
                  {t('products.step')} {index + 1}/{steps.length}
                </div>
                <div className="font-medium text-[#414651]">{step.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 xl:p-8 overflow-y-auto">
        <div className="mb-4 xl:mb-8">
          <span
            className={`inline-flex items-center text-[#717171] hover:text-[#494949] transition-all duration-300 cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}
            onClick={BackToDashboard}
          >
            <ChevronIcon className={`h-4 w-4 ${isRtl ? 'ml-1' : 'mr-1'}`} />
            {t('ui.backToDashboard')}
          </span>
        </div>
        <div className={`flex flex-col xl:flex-row gap-4 xl:gap-8 xl:justify-between xl:p-12 ${isRtl ? 'xl:flex-row-reverse' : ''}`}>{children}</div>
      </div>
    </div>
  );
}

export default ProductLayout;
