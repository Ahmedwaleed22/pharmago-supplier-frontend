import type { Metadata } from "next";
import DashboardRootLayout from "./layout-client";

export const metadata: Metadata = {
  title: "PharmaGo | Dashboard",
  description: "PharmaGo Business Dashboard for Pharmacy Management",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardRootLayout>{children}</DashboardRootLayout>;
}
