// "use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryClientProvider from "@/components/providers/QueryClientProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import PusherProvider from "@/components/providers/PusherProvider";
import { PusherAutoInitializer } from "@/components/providers/PusherAutoInitializer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PharmaGo | Business Dashboard",
  description: "PharmaGo | Business Dashboard | Pharmacy Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <QueryClientProvider>
          <ReduxProvider>
            <PusherProvider>
              <PusherAutoInitializer />
              {children}
            </PusherProvider>
          </ReduxProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
