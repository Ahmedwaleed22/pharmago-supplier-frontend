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
    "/dashboard/products/add",
    "/dashboard/products/add/step-2",
    "/dashboard/products/add/step-3",
    "/dashboard/products/add/step-4",
    "/dashboard/prescriptions/requests",
    "/dashboard/prescriptions/approved",
    "/dashboard/prescriptions/order-history",
    "/dashboard/delivery/live-tracking",
    "/dashboard/delivery/history",
    "/dashboard/advertisements",
    "/dashboard/advertisements/add",
    "/dashboard/branches",
    "/dashboard/branches/add",
  ];

  const shouldExcludeFromDashboard =
    nonDashboardLayoutPages.includes(pathname) ||
    (pathname.startsWith("/dashboard/prescriptions/requests/") &&
      pathname !== "/dashboard/prescriptions/requests/") ||
    (pathname.startsWith("/dashboard/delivery/live-tracking/") &&
      pathname !== "/dashboard/delivery/live-tracking/") ||
    (pathname.startsWith("/dashboard/products/edit/") &&
      pathname !== "/dashboard/products/edit/") ||
    (pathname.startsWith("/dashboard/branches/edit/") &&
      pathname !== "/dashboard/branches/edit/");

  if (shouldExcludeFromDashboard) {
    return <Provider store={store}>{children}</Provider>;
  }

  return (
    <Provider store={store}>
      <DashboardLayout>{children}</DashboardLayout>
    </Provider>
  );
} 