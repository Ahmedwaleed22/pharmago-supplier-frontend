import {
  Home,
  Search,
  Package,
  Truck,
  ScanSearch,
  CirclePlus,
  ChevronDown,
  CircleCheck,
  NotepadText,
  Clock,
  Map,
  LogOut,
  ChevronUp,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import NavLink from "@/components/NavLink";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import LogoutButton from "@/components/logout-button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useTranslation } from "@/contexts/i18n-context";

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Menu items with translation keys
  const items = [
    {
      title: t('navigation.dashboard'),
      url: "/dashboard",
      icon: "solar:home-2-linear",
    },
    {
      title: t('navigation.products'),
      url: "/dashboard/products",
      icon: "ph:squares-four-light",
      subItems: [
        {
          title: t('products.addProduct'),
          url: "/dashboard/products/add",
          icon: "hugeicons:add-square",
        },
        {
          title: t('products.productList'),
          url: "/dashboard/products",
          icon: "ph:squares-four-light",
        },
      ],
    },
    {
      title: t('navigation.sales'),
      url: "/dashboard/sales",
      icon: "lets-icons:paper-light",
    },
    {
      title: t('navigation.prescriptions'),
      url: "/dashboard/prescriptions",
      icon: "solar:scanner-outline",
      subItems: [
        {
          title: t('prescriptions.approved'),
          url: "/dashboard/prescriptions/approved",
          icon: "solar:check-circle-linear",
        },
        {
          title: t('breadcrumbs.prescriptionRequests'),
          url: "/dashboard/prescriptions/requests",
          icon: "fontisto:prescription",
        },
        // {
        //   title: t('navigation.rfqsRequests'),
        //   url: "/dashboard/prescriptions/rfqs",
        //   icon: "fontisto:prescription",
        // },
        {
          title: t('breadcrumbs.ordersHistory'),
          url: "/dashboard/prescriptions/order-history",
          icon: "solar:clock-circle-linear",
        }
      ],
    },
    {
      title: t('navigation.delivery'),
      url: "/dashboard/delivery",
      icon: "material-symbols:delivery-truck-speed-outline",
      subItems: [
        {
          title: t('breadcrumbs.liveTracking'),
          url: "/dashboard/delivery/live-tracking",
          icon: "ph:gps-light",
        },
        {
          title: t('navigation.deliveryHistory'),
          url: "/dashboard/delivery/history",
          icon: "solar:clock-circle-linear",
        },
      ],
    },
    {
      title: t('navigation.advertisement'),
      url: "/dashboard/advertisements",
      icon: "solar:gallery-bold",
      subItems: [
        {
          title: t('advertisements.addAdvertisement'),
          url: "/dashboard/advertisements/add",
          icon: "hugeicons:add-square",
        },
        {
          title: t('navigation.advertisementList'),
          url: "/dashboard/advertisements",
          icon: "ph:squares-four-light",
        },
      ],
    },
  ];

  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>(() => {
    // Initialize with open state for items whose URL is in the pathname
    const initialState: Record<string, boolean> = {};
    items.forEach(item => {
      if (item.subItems) {
        initialState[item.title] = pathname.includes(item.url);
      }
    });
    return initialState;
  });

  const handleOpenChange = (title: string, isOpen: boolean) => {
    setOpenItems(prev => ({
      ...prev,
      [title]: isOpen
    }));
  };

  return (
    <Sidebar className="bg-white">
      <SidebarContent className="bg-white py-12 px-2">
        <SidebarHeader className="mb-4 px-3">
          <Link href="/dashboard">
            <Image
              src="/images/sidebar-logo.png"
              alt="PharmaGo Logo"
              width={260}
              height={50}
              className="w-[241px] h-[48px]"
            />
          </Link>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation.overview')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) =>
                item.subItems ? (
                  <Collapsible 
                    key={item.title} 
                    open={openItems[item.title]}
                    onOpenChange={(isOpen) => handleOpenChange(item.title, isOpen)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem className="px-1 py-2">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className={cn("px-3 py-[calc(var(--spacing)_*_5.7)] rounded-xl cursor-pointer")}>
                          <Icon icon={item.icon} className="!w-5 !h-5 !font-normal" />
                          <span>{item.title}</span>
                          {openItems[item.title] ? (
                            <ChevronUp className="ml-auto" />
                          ) : (
                            <ChevronDown className="ml-auto" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title} className="hover:bg-sidebar-accent rounded-xl">
                              <NavLink
                                href={subItem.url}
                                className="px-2 py-3 rounded-xl flex gap-2"
                              >
                                <Icon icon={subItem.icon} className="!w-5 !h-5 !font-normal" />
                                <span>{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title} className="px-1 py-2">
                    <SidebarMenuButton asChild>
                      <NavLink
                        href={item.url}
                        className="px-3 py-[calc(var(--spacing)_*_5.7)] rounded-xl"
                      >
                        <Icon icon={item.icon} className="!w-5 !h-5 !font-normal" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="mt-auto px-5">
          <LogoutButton />
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
