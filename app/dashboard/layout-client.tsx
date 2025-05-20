"use client";

import DashboardLayout from "@/layouts/dashboard-layout";
import { usePathname, useRouter } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/api";

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on client side
    if (!isAuthenticated()) {
      router.push("/");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

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
      pathname !== "/dashboard/delivery/live-tracking/") ||
    (pathname.startsWith("/dashboard/product/edit/") &&
      pathname !== "/dashboard/product/edit/");

  if (shouldExcludeFromDashboard) {
    return <Provider store={store}>{children}</Provider>;
  }

  return (
    <Provider store={store}>
      <DashboardLayout>{children}</DashboardLayout>
    </Provider>
  );
} 