"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import CustomButton from "./custom-button";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { cn } from "@/lib/utils";

type PrescriptionCardStatus = "request" | "approved" | "tracking" | "offer" | "delivery-status";

interface PrescriptionCardProps {
  status?: PrescriptionCardStatus;
  className?: string;
}

function PrescriptionCard({ className, status = "request" }: PrescriptionCardProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "w-full h-full rounded-lg p-4 flex flex-col",
        status === "approved" || status === "delivery-status" ? "gap-1" : "gap-4",
        status !== "delivery-status" ? "bg-white shadow-sm" : "",
        className
      )}
    >
      <div className={`flex ${status === "delivery-status" ? "flex-row items-center gap-3" : "gap-1 items-center"}`}>
        <Icon 
          icon="solar:document-text-outline" 
          width={status === "delivery-status" ? "40" : "24"} 
          height={status === "delivery-status" ? "40" : "24"} 
          className="text-primary-blue" 
        />
        <div>
          <h3 className="text-blue-gray font-semibold text-lg">
            Prescription Request 01
          </h3>
          {status === "delivery-status" && (
            <div className="text-sm">
              <span className="text-blue-gray mr-1">By</span>
              <Link className="text-primary-blue font-semibold" href="">
                Ahmed Mohamed (Client)
              </Link>
              <div className="text-muted-gray mt-1">
                10 Mar 2025, 07:03 PM (live: 5min ago)
              </div>
            </div>
          )}
        </div>
      </div>
      {status === "request" && (
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Image
              src="/images/prescriptions/image-prescription.svg"
              alt="prescription"
              width={40}
              height={40}
            />
            <p className="text-blue-gray font-medium text-sm">
              Prescription Request 01
            </p>
          </div>
          <div className="flex gap-2">
            <Image
              className="cursor-pointer"
              src="/images/eye.svg"
              alt="eye"
              width={24}
              height={24}
              onClick={() => {
                router.push(`/dashboard/prescription/requests/prescription-request-01`);
              }}
            />
          </div>
        </div>
      )}
      {status !== "delivery-status" && (
        <div className="text-sm">
          <span className="text-blue-gray mr-1">By</span>
          <Link className="text-primary-blue font-semibold" href="">
            Ahmed Mohamed (Client)
          </Link>
          <div className="text-muted-gray mt-1">
            10 Mar 2025, 07:03 PM (live: 5min ago)
          </div>
          {status === "approved" && (
            <CustomButton
              className="mt-4 w-full h-[40px]"
              onClick={async () => {
                console.log("clicked");
              }}
            >
              <Image
                src="/images/prescriptions/motorcycle.svg"
                alt="motorcycle"
                width={20}
                height={20}
              />
              Request to delivery
            </CustomButton>
          )}
          {status === "tracking" && (
            <CustomButton
              className="mt-4 w-full h-[40px] bg-[#EEF4FF] hover:bg-[#d5e2fa] text-primary-blue"
              onClick={async () => {
                router.push(`/dashboard/delivery/live-tracking/prescription-request-01`);
              }}
            >
              View Status
            </CustomButton>
          )}
          {status === "offer" && (
            <div className="my-4">
              <h3 className="text-blue-gray font-semibold text-lg">Location: Location 1</h3>
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <p className="text-blue-gray mb-2">Price in L.E</p>
                  <input 
                    className="w-full px-4 py-2 border border-gray-200 outline-none rounded-md" 
                    type="number"
                    placeholder="0.00 L.E" 
                  />
                </div>
                <div className="flex-1">
                  <p className="text-blue-gray mb-2">Discount</p>
                  <input 
                    className="w-full px-4 py-2 border border-gray-200 outline-none rounded-md" 
                    type="number"
                    placeholder="ex. 20% or 10L.E" 
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <CustomButton className="w-2/3 h-[40px]">
                  Send Offers
                </CustomButton>
                <CustomButton className="flex-1 bg-gray-100 text-red-500 hover:bg-gray-200 py-3 rounded-md">
                  Cancel
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PrescriptionCard;
