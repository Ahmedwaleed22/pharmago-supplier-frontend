"use client";

import React from 'react'
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/ui/app-sidebar";
import AppHeader from '@/components/ui/app-header';

import { HeroUIProvider } from "@heroui/react";


interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {  
  return (
    <div className="bg-smooth-white flex">
      <SidebarProvider
        style={{
          "--sidebar-width": "280px",
          "--sidebar-width-mobile": "240px",
        }}
        className="w-min relative"
      >
        <AppSidebar/>
        <main className="absolute top-0 -right-6">
          <SidebarTrigger className="cursor-pointer"/>
        </main>
      </SidebarProvider>
      <div className="py-8 lg:px-10 px-3 w-full">
        <AppHeader />
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </div>
    </div>
  )
}

export default DashboardLayout