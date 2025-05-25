"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CustomButton from "./custom-button";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { cn } from "@/lib/utils";
import { getPrescriptionName, formatPrescriptionDate, getTimeAgo } from "@/helpers/prescriptions";
import { sendPrescriptionOffer } from "@/services/prescriptions";
import { useTranslation } from "@/contexts/i18n-context";

type PrescriptionCardStatus = "request" | "approved" | "tracking" | "offer" | "delivery-status";

interface PrescriptionCardProps {
  status?: PrescriptionCardStatus;
  className?: string;
  prescription: Prescription.Prescription;
  price?: string;
  setPrice?: Dispatch<SetStateAction<string>>;
  discount?: string;
  setDiscount?: Dispatch<SetStateAction<string>>;
}

function PrescriptionCard({ 
  className, 
  status = "request", 
  prescription,
  price,
  setPrice,
  discount,
  setDiscount
}: PrescriptionCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSendOffer = async () => {
    if (!price) {
      setError(t('forms.required'));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await sendPrescriptionOffer(prescription.id, price, discount);
      
      // Success - could show a success message or redirect
      console.log(t('prescriptions.offerSent'));
      
      // Optionally redirect back
      router.back();
    } catch (err: any) {
      setError(err.message || t('prescriptions.failedToSend'));
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {getPrescriptionName(prescription.created_at, prescription.id)}
          </h3>
          {status === "delivery-status" && (
            <div className="text-sm">
              <span className="text-blue-gray mr-1">{t('prescriptions.by')}</span>
              <Link className="text-primary-blue font-semibold" href="">
                {prescription.patient.name} ({t('prescriptions.client')})
              </Link>
              <div className="text-muted-gray mt-1">
                {formatPrescriptionDate(prescription.created_at)} ({t('prescriptions.live')}: {getTimeAgo(prescription.created_at)})
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
                router.push(`/dashboard/prescriptions/requests/${prescription.id}`);
              }}
            />
          </div>
        </div>
      )}
      {status !== "delivery-status" && (
        <div className="text-sm">
          <span className="text-blue-gray mr-1">{t('prescriptions.by')}</span>
          <Link className="text-primary-blue font-semibold" href="">
            {prescription.patient.name} ({t('prescriptions.client')})
          </Link>
          <div className="text-muted-gray mt-1">
            {formatPrescriptionDate(prescription.created_at)} ({t('prescriptions.live')}: {getTimeAgo(prescription.created_at)})
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
              {t('prescriptions.requestToDelivery')}
            </CustomButton>
          )}
          {status === "tracking" && (
            <CustomButton
              className="mt-4 w-full h-[40px] bg-[#EEF4FF] hover:bg-[#d5e2fa] text-primary-blue"
              onClick={async () => {
                router.push(`/dashboard/delivery/live-tracking/prescription-request-01`);
              }}
            >
              {t('prescriptions.viewStatus')}
            </CustomButton>
          )}
          {status === "offer" && (
            <div className="my-4">
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <p className="text-blue-gray mb-2">{t('products.priceInLE')}</p>
                  <input 
                    className="w-full px-4 py-2 border border-gray-200 outline-none rounded-md" 
                    type="number"
                    placeholder={t('forms.pricePlaceholder')}
                    value={price}
                    onChange={(e) => setPrice && setPrice(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-blue-gray mb-2">{t('prescriptions.discount')}</p>
                  <input 
                    className="w-full px-4 py-2 border border-gray-200 outline-none rounded-md" 
                    type="number"
                    placeholder={t('forms.discountPlaceholder')}
                    value={discount}
                    onChange={(e) => setDiscount && setDiscount(e.target.value)}
                  />
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
              <div className="flex gap-4 mt-4">
                <CustomButton 
                  className="w-2/3 h-[40px]"
                  onClick={handleSendOffer}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('common.sending') : t('prescriptions.sendOffers')}
                </CustomButton>
                <CustomButton 
                  className="flex-1 bg-gray-100 text-red-500 hover:bg-gray-200 py-3 rounded-md"
                  onClick={() => router.back()}
                >
                  {t('common.cancel')}
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
