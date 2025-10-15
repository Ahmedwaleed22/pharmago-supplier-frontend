// "use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryClientProvider from "@/components/providers/QueryClientProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import PusherProvider from "@/components/providers/PusherProvider";
import { PusherAutoInitializer } from "@/components/providers/PusherAutoInitializer";
import { I18nProvider } from "@/contexts/i18n-context";
import { isRtlLocale } from "@/lib/i18n";
import { getServerLocale, getServerTranslations } from "@/lib/server-i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PharmaGo | Business Dashboard",
  description: "PharmaGo | Business Dashboard | Supplier Management System",
};

if (process.env.NODE_ENV === "production") console.log = function () {};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Detect locale on server-side
  const initialLocale = await getServerLocale();
  const isRtl = isRtlLocale(initialLocale);
  
  // Preload translations on server-side
  const initialTranslations = await getServerTranslations(initialLocale);

  return (
    <html lang={initialLocale} dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'rtl' : ''}>
      <body className={`${inter.variable} antialiased`}>
        <I18nProvider initialLocale={initialLocale} initialTranslations={initialTranslations}>
          <QueryClientProvider>
            <ReduxProvider>
              <PusherProvider>
                <PusherAutoInitializer />
                {children}
              </PusherProvider>
            </ReduxProvider>
          </QueryClientProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
