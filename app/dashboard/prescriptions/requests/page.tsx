"use client";

import PrescriptionCard from "@/components/prescription-card";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPendingPrescriptions } from "@/services/prescriptions";
import Loading from "@/components/loading";

function PrescriptionRequestsPage() {
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["pending-prescriptions"],
    queryFn: () => fetchPendingPrescriptions(),
  });

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Prescription", href: null },
        { label: "Requests", href: "/dashboard/prescriptions/requests" },
      ]}
      title="Prescription"
    >
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-blue-gray">Prescription / Rx</h1>
        {prescriptions && prescriptions.length > 0 && (
          <span className="text-sm bg-[#FF6363] font-bold h-[calc(var(--spacing)_*_5.5)] w-[calc(var(--spacing)_*_5.5)] rounded-full flex items-center justify-center text-white">
            {prescriptions.length}
          </span>
        )}
      </div>
      {!isLoading && prescriptions ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-5">
          {prescriptions?.map((prescription, index) => (
            <PrescriptionCard
              key={index}
              prescription={prescription}
            />
          ))}
        </div>
      ) : (
        <Loading />
      )}
    </DashboardWithBreadcrumbsLayout>
  );
}

export default PrescriptionRequestsPage;
