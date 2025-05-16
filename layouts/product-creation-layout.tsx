"use client";

import React from "react";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeAllItems } from "@/store/ProductCreationSlice";

function ProductCreationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const steps = [
    {
      label: "General Information",
      href: "/dashboard/product/add",
    },
    {
      label: "Product Details",
      href: "/dashboard/product/add/step-2",
    },
    {
      label: "Product Image",
      href: "/dashboard/product/add/step-3",
    },
    {
      label: "Summary",
      href: "/dashboard/product/add/step-4",
    },
  ];

  const BackToDashboard = () => {
    dispatch(removeAllItems());
    router.push("/dashboard");
  };

  const currentStep = steps.findIndex((step) => step.href === pathname);

  return (
    <div className="flex min-h-screen bg-[#f4f4f5]">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <div className="px-4 py-16">
          <Link href="/dashboard">
            <Image
              src="/images/sidebar-logo.png"
              alt="PharmaGo Logo"
              width={260}
              height={50}
              className="w-full h-full"
            />
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          {steps.map((step, index) => (
            <Link href={step.href} key={index}>
              <div
                key={index}
                className={`py-0 pl-5 ${
                  index === currentStep
                    ? "border-r-4 border-[#2970ff]"
                    : "border-r-4 border-transparent"
                }`}
              >
                <div className="text-xs text-[#787878]">
                  Step {index + 1}/{steps.length}
                </div>
                <div className="font-medium text-[#414651]">{step.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-1 p-8">
        <div className="mb-8">
          <span
            className="inline-flex items-center text-[#717171] hover:text-[#494949] transition-all duration-300 cursor-pointer"
            onClick={BackToDashboard}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </span>
        </div>
        <div className="flex gap-8 p-18 justify-between">{children}</div>
      </div>
    </div>
  );
}

export default ProductCreationLayout;
