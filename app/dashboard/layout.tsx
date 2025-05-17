"use client";

import DashboardLayout from "@/layouts/dashboard-layout";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "@/store/store";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const nonDashboardLayoutPages = [
    "/dashboard/product/add",
    "/dashboard/product/add/step-2",
    "/dashboard/product/add/step-3",
    "/dashboard/product/add/step-4",
    "/dashboard/prescription/requests",
    "/dashboard/prescription/approved",
    "/dashboard/prescription/order-history",
    "/dashboard/delivery/live-tracking",
    "/dashboard/delivery/history",
  ];

  const shouldExcludeFromDashboard =
    nonDashboardLayoutPages.includes(pathname) ||
    (pathname.startsWith("/dashboard/prescription/requests/") &&
      pathname !== "/dashboard/prescription/requests/") ||
    (pathname.startsWith("/dashboard/delivery/live-tracking/") &&
      pathname !== "/dashboard/delivery/live-tracking/");

  if (shouldExcludeFromDashboard) {
    return (
      <html lang="en">
        <body>
          <Provider store={store}>{children}</Provider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <DashboardLayout>{children}</DashboardLayout>
        </Provider>
      </body>
    </html>
  );
}
