"use client";
import PrescriptionCard from "@/components/prescription-card";
import DashboardCard from "@/components/ui/dashboard/dashboard-card";
import { getXmlValue } from "@/helpers/prescriptions";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import { fetchPrescription } from "@/services/prescriptions";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useTranslation } from "@/contexts/i18n-context";
import { Icon } from "@iconify/react";

function PrescriptionDetailsPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [price, setPrice] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [copied, setCopied] = useState(false);
  
  const { data: prescription, isLoading } = useQuery({
    queryKey: ["prescription"],
    queryFn: () => fetchPrescription(slug as string),
  });

  const loadPreview = (is_image: boolean) => {
    if (is_image) {
      return (
        <div className="flex justify-center items-center">
          {prescription?.file_path && (
            <Image
              src={prescription?.file_path}
              alt="prescription-preview"
              className="w-full h-full"
              width={10000}
              height={1000}
            />
          )}
        </div>
      );
    }

    const prescriptionItems = prescription?.prescription_text
      ? Array.from(
          new DOMParser()
            .parseFromString(prescription.prescription_text, "text/xml")
            .querySelectorAll("medicine")
        ).map((medicine) => ({
          description: getXmlValue(medicine.outerHTML, "name"),
          quantity: parseInt(getXmlValue(medicine.outerHTML, "quantity"), 10),
        }))
      : [];

    return (
      <div className="flex justify-center items-center">
        <div className="w-full py-2 bg-white rounded-2xl">
          <table className="w-full border-separate border-spacing-x-4">
            <thead>
              <tr>
                <th className="text-left pb-4">
                  <h4 className="text-blue-600 font-medium text-sm px-1">
                    {t('prescriptions.medicineName')}
                  </h4>
                </th>
                <th className="text-center pb-4 w-20">
                  <h4 className="text-blue-600 font-medium text-sm px-1">
                    {t('prescriptions.qty')}
                  </h4>
                </th>
              </tr>
            </thead>
            <tbody>
              {prescriptionItems.map((item, index) => (
                <tr key={index}>
                  <td className="pb-2">
                    <div className="bg-[#F4F4F4] p-3 px-4 rounded-lg">
                      <span className="font-semibold text-blue-gray">
                        {item.description}
                      </span>
                    </div>
                  </td>
                  <td className="pb-2">
                    <div className="bg-[#F4F4F4] p-3 px-4 rounded-lg flex justify-center">
                      <span className="font-semibold text-blue-gray text-center">
                        {item.quantity}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const breadcrumbs = [
    { label: t('breadcrumbs.dashboard'), href: "/dashboard" },
    { label: t('breadcrumbs.prescription'), href: null },
    {
      label: t('breadcrumbs.prescriptionRequests'),
      href: "/dashboard/prescriptions/requests",
    },
    { label: t('breadcrumbs.prescriptionDetails'), href: null },
  ];

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={breadcrumbs}
      title={t('prescriptions.prescriptionDetails')}
    >
      {prescription && (
        <div className="flex flex-col gap-6">
          {/* Prescription Info */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
            <h2 className="text-lg font-bold mb-2">{t('prescriptions.prescriptionDetails')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
              <div className="flex items-center gap-2">
                <b>ID:</b> {prescription.id}
                <span className="cursor-pointer" onClick={async () => { await navigator.clipboard.writeText(prescription.id); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>
                  <Icon icon="mdi:content-copy" width="16" height="16" />
                </span>
                {copied && <span className="text-xs text-green-600 ml-1">{t('common.copied') || 'Copied!'}</span>}
              </div>
              <div><b>{t('prescriptions.by')}:</b> {prescription.patient?.name}</div>
              <div><b>{t('orderHistory.type')}:</b> {prescription.status}</div>
              <div><b>{t('orderHistory.date')}:</b> {prescription.created_at}</div>
            </div>
          </div>

          {/* Offer Sent Section */}
          {/* {(price || discount) && (
            <div className="bg-blue-50 rounded-lg shadow p-6 flex flex-col gap-2">
              <h2 className="text-lg font-bold mb-2">{t('prescriptions.offerSent') || 'Offer Sent'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {price && <div><b>{t('products.price')}:</b> {price}</div>}
                {discount && <div><b>{t('prescriptions.discount')}:</b> {discount}</div>}
              </div>
            </div>
          )} */}

          {/* Prescription Card and Preview */}
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="w-full lg:w-1/3 h-min">
              <PrescriptionCard
                prescription={prescription}
                status="offer"
                price={price}
                setPrice={setPrice}
                discount={discount}
                setDiscount={setDiscount}
              />
            </div>
            <div className="w-full lg:w-2/4">
              <DashboardCard>
                {loadPreview(prescription.file_path ? true : false)}
              </DashboardCard>
            </div>
          </div>

          {/* Order Content Section */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
            <h2 className="text-lg font-bold mb-2">{t('orderHistory.orderContent') || 'Order Content'}</h2>
            {/* Show prescription_text or file_path info */}
            {prescription.prescription_text ? (
              <div>
                <b>{t('prescriptions.medicineList') || 'Medicine List'}:</b>
                <ul className="list-disc ml-6 mt-2">
                  {Array.from(
                    new DOMParser()
                      .parseFromString(prescription.prescription_text, "text/xml")
                      .querySelectorAll("medicine")
                  ).map((medicine, idx) => (
                    <li key={idx}>
                      {getXmlValue(medicine.outerHTML, "name")} - {getXmlValue(medicine.outerHTML, "quantity")} {t('prescriptions.qty')}
                    </li>
                  ))}
                </ul>
              </div>
            ) : prescription.file_path ? (
              <div>
                <b>{t('prescriptions.image')}:</b>
                <div className="mt-2">
                  <Image src={prescription.file_path} alt="prescription" width={200} height={200} />
                </div>
              </div>
            ) : (
              <div>{t('common.noData')}</div>
            )}
          </div>
        </div>
      )}
    </DashboardWithBreadcrumbsLayout>
  );
}

export default PrescriptionDetailsPage;
