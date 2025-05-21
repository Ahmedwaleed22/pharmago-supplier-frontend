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

function PrescriptionDetailsPage() {
  const { slug } = useParams();
  const [price, setPrice] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  
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

    // Sample data for the table
    // const prescriptionItems = [
    //   { description: "Description 01", quantity: 2 },
    //   { description: "Description 02", quantity: 2 },
    //   { description: "Description 03", quantity: 2 },
    //   { description: "Description 04", quantity: 2 },
    //   { description: "Description 05", quantity: 2 },
    //   { description: "Description 06", quantity: 1 },
    // ];

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
                    Medicine Name
                  </h4>
                </th>
                <th className="text-center pb-4 w-20">
                  <h4 className="text-blue-600 font-medium text-sm px-1">
                    QTY
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

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Prescription", href: null },
        {
          label: "Prescription Requests",
          href: "/dashboard/prescriptions/requests",
        },
        { label: "Prescription Details", href: null },
      ]}
      title="Prescription Details"
    >
      {prescription && (
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
      )}
    </DashboardWithBreadcrumbsLayout>
  );
}

export default PrescriptionDetailsPage;
