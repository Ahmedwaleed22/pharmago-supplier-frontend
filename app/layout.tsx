// "use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryClientProvider from "@/components/providers/QueryClientProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";

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
          <ReduxProvider>{children}</ReduxProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
