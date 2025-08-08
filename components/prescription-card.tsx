"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import CustomButton from "./custom-button";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { cn } from "@/lib/utils";
import {
  getPrescriptionName,
  formatPrescriptionDate,
  getTimeAgo,
  getTranslatedTimeAgo,
  isOfferExpired,
} from "@/helpers/prescriptions";
import { sendPrescriptionOffer } from "@/services/prescriptions";
import { useTranslation } from "@/contexts/i18n-context";
import { useQueryClient } from "@tanstack/react-query";
import { getCurrencySymbol } from "@/store/authSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Prescription } from "@/types/prescription";
import { PrescriptionStatus } from "@/enums/prescription-status";

type PrescriptionCardStatus =
  | "request"
  | "approved"
  | "tracking"
  | "offer"
  | "delivery-status";

interface PrescriptionCardProps {
  status?: PrescriptionCardStatus;
  className?: string;
  prescription: Prescription.Prescription;
  price?: string;
  setPrice?: Dispatch<SetStateAction<string>>;
  discount?: string;
  setDiscount?: Dispatch<SetStateAction<string>>;
  hideLive?: boolean;
}

function PrescriptionCard({
  className,
  status = "request",
  prescription,
  price,
  setPrice,
  discount,
  setDiscount,
  hideLive = false,
}: PrescriptionCardProps) {
  const queryClient = useQueryClient();
  const currencySymbol = useSelector((state: RootState) => getCurrencySymbol(state));  
  const router = useRouter();
  const { t, isRtl } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Guard clause to prevent rendering with undefined prescription
  if (!prescription || !prescription.id) {
    return (
      <div
        className={cn(
          "w-full h-full rounded-lg p-4 flex flex-col items-center justify-center",
          "bg-white shadow-sm",
          className
        )}
      >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-blue"></div>
        <p className="text-sm text-muted-gray mt-2">{t("common.loading")}</p>
      </div>
    );
  }

  const handleSendOffer = async () => {
    if (!price) {
      setError(t("forms.required"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await sendPrescriptionOffer(prescription.id, price, discount);

      // Success - could show a success message or redirect
      // console.log(t('prescriptions.offerSent'));

      queryClient.invalidateQueries({ queryKey: ["pending-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      // Optionally redirect back
      router.back();
    } catch (err: any) {
      setError(err.message || t("prescriptions.failedToSend"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (value: string) => {
    if (setPrice) {
      const numericValue = value.replace(/[^0-9.]/g, '');
      setPrice(numericValue);
    }
  };

  const handleDiscountChange = (value: string) => {
    if (setDiscount) {
      const numericValue = value.replace(/[^0-9.]/g, '');
      setDiscount(numericValue);
    }
  };

  return (
    <div
      className={cn(
        "w-full h-full rounded-lg p-4 flex flex-col",
        status === "approved" || status === "delivery-status"
          ? "gap-1"
          : "gap-4",
        status !== "delivery-status" ? "bg-white shadow-sm" : "",
        status === "approved" ? "cursor-pointer" : "",
        className
      )}
      onClick={() => {
        if (status === "approved") {
          router.push(`/dashboard/prescriptions/requests/${prescription.id}`);
        }
      }}
    >
      <div
        className={`flex ${
          status === "delivery-status"
            ? "flex-row items-center gap-3"
            : "gap-1 items-center"
        } ${isRtl ? "flex-row-reverse" : ""}`}
      >
        <Icon
          icon="solar:document-text-outline"
          width={status === "delivery-status" ? "40" : "24"}
          height={status === "delivery-status" ? "40" : "24"}
          className="text-primary-blue"
        />
        <div>
          <h3 className="text-blue-gray font-semibold text-lg">
            {getPrescriptionName(prescription.created_at, prescription.id)}
          </h3>
          {status === "delivery-status" && (
            <div className="text-sm">
              <span className="text-blue-gray mr-1">
                {t("prescriptions.by")}
              </span>
              <span className="text-primary-blue font-semibold">
                {prescription.patient?.name || t("common.unknownCustomer")} (
                {t("prescriptions.client")})
              </span>
              <div className="text-muted-gray mt-1">
                {formatPrescriptionDate(prescription.created_at, true, t, isRtl)} (
                {t("prescriptions.live")}:{" "}
                {getTranslatedTimeAgo(prescription.created_at, t, isRtl)})
              </div>
            </div>
          )}
        </div>
      </div>
      {status === "request" && (
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            {prescription.file_path ? (
              <Image
                src="/images/prescriptions/image-prescription.svg"
                alt="prescription"
                width={40}
                height={40}
              />
            ) : (
              <Image
                src="/images/prescriptions/text-prescription.svg"
                alt="prescription"
                width={40}
                height={40}
              />
            )}
            <p className="text-blue-gray font-medium text-sm">
              {getPrescriptionName(prescription.created_at, prescription.id)}
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
                router.push(
                  `/dashboard/prescriptions/requests/${prescription.id}`
                );
              }}
            />
          </div>
        </div>
      )}
      {status !== "delivery-status" && (
        <div className="text-sm">
          <span className="text-blue-gray mr-1">{t("prescriptions.by")}</span>
          <span className="text-primary-blue font-semibold">
            {prescription.patient?.name || t("common.unknownCustomer")} (
            {t("prescriptions.client")})
          </span>
          <div className="text-muted-gray mt-1">
            {formatPrescriptionDate(prescription.created_at, true, t, isRtl)}
            {!hideLive && (
              <>
                {" "}(
                  {t("prescriptions.live")}:{" "}
                  {getTranslatedTimeAgo(prescription.created_at, t, isRtl)}
                )
              </>
            )}
          </div>
          {/* {status === "approved" && (
            <CustomButton
              className="mt-4 w-full h-[40px]"
              onClick={async () => {
                // Handle delivery request
              }}
            >
              <Image
                src="/images/prescriptions/motorcycle.svg"
                alt="motorcycle"
                width={20}
                height={20}
              />
              {t("prescriptions.requestToDelivery")}
            </CustomButton>
          )} */}
          {status === "tracking" && (
            <CustomButton
              className="mt-4 w-full h-[40px] bg-[#EEF4FF] hover:bg-[#d5e2fa] text-primary-blue"
              onClick={async () => {
                router.push(
                  `/dashboard/delivery/live-tracking/${prescription.id}`
                );
              }}
            >
              {t("prescriptions.viewStatus")}
            </CustomButton>
          )}
          {status === "offer" && (
            <div className="my-4">
              {prescription.status === PrescriptionStatus.ORDER_PLACED ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                  <p className="text-red-600 font-medium">
                    {t("prescriptions.alreadySentOffer")}
                  </p>
                </div>
              ) : isOfferExpired(prescription.created_at) ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                  <p className="text-red-600 font-medium">
                    {t("prescriptions.offerExpired") || "Offer period has expired (24 hours)"}
                  </p>
                  <p className="text-red-500 text-sm mt-1">
                    {t("prescriptions.offerExpiredDescription") || "You can no longer make an offer for this prescription."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                      <p className="text-blue-gray mb-2">
                        {t("products.price")}
                      </p>
                      <div style={{ 
                        direction: "ltr"
                       }} className="flex">
                        <input
                          className="w-full px-4 py-2 border border-gray-200 outline-none rounded-md rounded-r-none border-r-0"
                          type="number"
                          placeholder={t("forms.pricePlaceholder")}
                          value={price}
                          onChange={(e) => setPrice && handlePriceChange(e.target.value)}
                        />
                        <div className="bg-muted aspect-square h-10 flex items-center justify-center border border-gray-200 rounded-r-md">
                          {currencySymbol}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-gray mb-2">
                        {t("prescriptions.discount")}
                      </p>
                      <div style={{ 
                        direction: "ltr"
                       }} className="flex">
                        <input
                          className="w-full px-4 py-2 border border-gray-200 outline-none rounded-md rounded-r-none border-r-0"
                          type="number"
                          placeholder={t("forms.discountPlaceholder")}
                          value={discount}
                          onChange={(e) => setDiscount && handleDiscountChange(e.target.value)}
                        />
                        <div className="bg-muted aspect-square h-10 flex items-center justify-center border border-gray-200 rounded-r-md">
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  <div className="flex gap-4 mt-4">
                    <CustomButton
                      className="w-2/3 h-[40px]"
                      onClick={handleSendOffer}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? t("common.sending")
                        : t("prescriptions.sendOffers")}
                    </CustomButton>
                    <CustomButton
                      className="flex-1 bg-gray-100 text-red-500 hover:bg-gray-200 py-3 rounded-md"
                      onClick={() => router.back()}
                    >
                      {t("common.cancel")}
                    </CustomButton>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PrescriptionCard;
