import type { Metadata } from "next";
import DashboardRootLayout from "./layout-client";

export const metadata: Metadata = {
  title: "PharmaGo | Dashboard",
  description: "PharmaGo Business Dashboard for Supplier Management",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardRootLayout>{children}</DashboardRootLayout>;
}
