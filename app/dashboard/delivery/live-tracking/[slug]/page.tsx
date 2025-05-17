import DeliveryCard from "@/components/delivery-card";
import PrescriptionCard from "@/components/prescription-card";
import Steppers, { Step } from "@/components/steppers";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import React from "react";

function PrescriptionDeliveryStatusPage() {

  const steps: Step[] = [
    { id: 1, title: "Ordered", status: "completed" },
    { id: 2, title: "Ready", status: "current" },
    { id: 3, title: "Shipped", status: "upcoming" },
    { id: 4, title: "Estimated Delivery", status: "upcoming" },
    { id: 5, title: "Delivery Completed", status: "upcoming" },
  ];

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        {
          label: "Delivery",
          href: null,
        },
        { label: "Live Tracking", href: "/dashboard/delivery/live-tracking" },
        { label: "Delivery Detail", href: null },
      ]}
      title="Delivery"
    >
      <div>
        <h1 className="text-2xl font-bold text-blue-gray">Delivery Detail</h1>
        <div className="flex mt-4 justify-between">
          <PrescriptionCard className="p-0" status="delivery-status" />
          <DeliveryCard />
        </div>
      </div>
      <div className="my-8">
        <Steppers steps={steps} className="mt-4" />
      </div>
      <table className="text-blue-gray w-full">
        <thead className="border-b-1 border-[#DEDEDE]">
          <tr>
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">Location</th>
            <th className="text-left py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2">
              <span>19/06/25</span>
              <span>06:59 PM</span>
            </td>
            <td className="py-2">Cairo</td>
            <td className="flex flex-col py-2">
              <span>Shipped</span>
              <span className="text-muted-gray">Ezabawy Pharmacy</span>
              <span className="text-muted-gray">Tracking No. : 12345EG</span>
            </td>
          </tr>
          <tr>
            <td className="py-2">
              <span>19/06/25</span>
              <span>06:59 PM</span>
            </td>
            <td className="py-2">Ezabawy Pharmacy</td>
            <td className="flex flex-col py-2">
              <span>Ready</span>
              <span className="text-muted-gray">Waiting for Pickup</span>
            </td>
          </tr>
          <tr>
            <td className="py-2">
              <span>19/06/25</span>
              <span>06:59 PM</span>
            </td>
            <td className="py-2">-</td>
            <td className="py-2">
              <span>Ordered</span>
            </td>
          </tr>
        </tbody>
      </table>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default PrescriptionDeliveryStatusPage;
