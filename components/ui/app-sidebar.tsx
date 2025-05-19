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

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Product",
    url: "/dashboard/product",
    icon: Package,
    subItems: [
      {
        title: "Add Product",
        url: "/dashboard/product/add",
        icon: CirclePlus,
      },
      {
        title: "Product List",
        url: "/dashboard/product",
        icon: Package,
      },
    ],
  },
  {
    title: "Sales",
    url: "/dashboard/sales",
    icon: Search,
  },
  {
    title: "Prescription",
    url: "/dashboard/prescription",
    icon: ScanSearch,
    subItems: [
      {
        title: "Approved",
        url: "/dashboard/prescription/approved",
        icon: CircleCheck,
      },
      {
        title: "Prescription Requests",
        url: "/dashboard/prescription/requests",
        icon: NotepadText,
      },
      {
        title: "RFQs Requests",
        url: "/dashboard/prescription/rfqs",
        icon: NotepadText,
      },
      {
        title: "Order History",
        url: "/dashboard/prescription/order-history",
        icon: Clock,
      }
    ],
  },
  {
    title: "Delivery",
    url: "/dashboard/delivery",
    icon: Truck,
    subItems: [
      {
        title: "Live Tracking",
        url: "/dashboard/delivery/live-tracking",
        icon: Map,
      },
      {
        title: "Delivery History",
        url: "/dashboard/delivery/history",
        icon: Clock,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
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
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
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
                          <item.icon className="!w-5 !h-5 !font-normal" />
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
                                <subItem.icon className="!w-5 !h-5 !font-normal" />
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
                        <item.icon className="!w-5 !h-5 !font-normal" />
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
