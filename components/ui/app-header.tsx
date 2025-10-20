import React from "react";
import { Search, Menu, User, LogOut } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import SearchBar from "./search-bar";
import NotificationMenu from "./notification-menu";
import { useSelector } from "react-redux";
import { getSupplier } from "@/store/authSlice";
import { RootState } from "@/store/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createNotificationsQueryOptions } from "@/query-options/notifications-query-options";
import { usePusherEvent } from "@/hooks/usePusherEvent";
import { PUSHER_EVENTS } from "@/config/pusher";
import { useI18n, useTranslation } from "@/contexts/i18n-context";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useSearchParams } from "next/navigation";

interface PusherNotificationEvent {
  type: string;
  notification?: Dashboard.Notification;
  // For prescription events
  prescription?: any;
  consumer_name?: string;
  prescription_id?: string;
}

function AppHeader() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const supplier = useSelector(getSupplier);
  const isAuthLoading = useSelector((state: RootState) => state.auth.isLoading);
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [soundInitialized, setSoundInitialized] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const { locale } = useI18n();

  // Get notifications data to show unread count (using default parameters)
  const { data: notificationResponse } = useQuery(createNotificationsQueryOptions(0, 1, locale));
  const unreadCount = notificationResponse?.meta?.unread_count || 0;


  console.log(supplier);
  // Handle global clicks to close notification menu
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // Only close if clicking outside the notification area
      const target = event.target as Element;
      if (!target.closest('[data-notification-area]')) {
        setIsNotificationMenuOpen(false);
      }
    };

    if (isNotificationMenuOpen) {
      document.addEventListener('click', handleGlobalClick);
    }

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isNotificationMenuOpen]);

  // Initialize audio on component mount
  useEffect(() => {
    const initializeAudio = () => {
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.01;
        audio.muted = true;
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
          setSoundInitialized(true);
        }).catch(() => {
          // This is expected behavior - browsers require user interaction for audio
          console.log("Audio will be initialized on first user interaction");
        });
      } catch (err) {
        console.warn("Audio initialization failed:", err);
      }
    };

    // Only try to initialize if not already initialized
    if (!soundInitialized) {
      initializeAudio();
    }

    // Add user interaction listeners to initialize audio
    const handleUserInteraction = () => {
      if (!soundInitialized) {
        initializeAudio();
      }
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []); // Remove soundInitialized from dependencies to prevent re-running

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const sound = new Audio("/sounds/notification.mp3");
      sound.volume = 0.7;
      sound.play().catch(err => {
        // This is expected if user hasn't interacted with the page yet
        console.log("Notification sound requires user interaction to play");
      });
    } catch (err) {
      console.warn("Error creating notification sound:", err);
    }
  };

  // Handle new notification events from Pusher
  usePusherEvent<PusherNotificationEvent>(PUSHER_EVENTS.NOTIFICATION, (data) => {    
    // Silent removal events should not play any sounds or show toasts
    if (data.type === "prescription_removed") {
      return;
    }

    // Handle different types of notifications
    if (data.type === "new_prescription") {
      // Play sound only for new prescription arrivals
      playNotificationSound();
      // This is a prescription notification, don't update the notifications list
      // Show browser notification for prescription
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("New Prescription", {
          body: `New prescription from ${data.consumer_name || 'Unknown'}`,
          icon: "/icons/favicon-32x32.png"
        });
      }
    } else if (data.notification) {
      // Play sound for regular notifications
      playNotificationSound();
      // This is a regular notification, update the notifications list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(data.notification.title, {
          body: data.notification.short_description,
          icon: "/icons/favicon-32x32.png"
        });
      }
    } else {
      // Unknown notification type, just invalidate queries to be safe
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  return (
    <>
      <header className="w-full flex justify-between items-center">
        {/* Mobile menu button - only visible on small screens */}
        <button
          className="lg:hidden mr-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search bar - width changes based on screen size */}
        <SearchBar 
          className="w-full" 
          value={searchValue} 
          setValue={setSearchValue} 
          placeholder={t('ui.searchPlaceholder')}
        />

        {/* Right side content */}
        <div className="flex justify-between items-center gap-2 sm:gap-5 ml-auto">
          <div className="relative" data-notification-area>
            <div
              className="relative cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsNotificationMenuOpen(!isNotificationMenuOpen);
              }}
            >
              <Image
                src="/images/notification.svg"
                alt="notification"
                width={22}
                height={22}
              />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </div>
            <NotificationMenu
              isOpen={isNotificationMenuOpen}
              onClose={() => setIsNotificationMenuOpen(false)}
            />
          </div>
          {isAuthLoading || !supplier ? (
            // Loading skeleton
            <div className="flex items-center gap-2 p-1">
              <div className="sm:w-[48px] sm:h-[48px] w-[40px] h-[40px] rounded-full bg-gray-200 animate-pulse" />
              <div className="flex flex-col gap-1">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <Dropdown placement="bottom-end">
              <DropdownTrigger className="cursor-pointer">
                <div className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors">
                  {supplier?.logo && (
                    <Image
                      src={supplier?.logo}
                      alt={supplier?.name}
                      width={40}
                      height={40}
                      className="sm:w-[48px] sm:h-[48px] w-[40px] h-[40px] rounded-full"
                      unoptimized={true}
                      onError={(e) => {
                        console.warn('Failed to load supplier logo in header:', supplier?.logo);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex flex-col sm:flex">
                    <h2 className="text-sm font-medium text-blue-gray">
                      {supplier?.name}
                    </h2>
                    <h3 className="text-xs font-medium text-[#717171]">
                      {t('auth.supplierAdmin')}
                    </h3>
                  </div>
                </div>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Profile Actions"
                className="w-48"
              >
                <DropdownItem 
                  key="profile"
                  textValue={t('navigation.profile')}
                  startContent={<User className="w-4 h-4" />}
                  className="py-3"
                >
                  <Link href="/dashboard/profile" className="w-full block">
                    {t('navigation.profile')}
                  </Link>
                </DropdownItem>
                <DropdownItem 
                  key="logout"
                  textValue={t('navigation.logout')}
                  startContent={<LogOut className="w-4 h-4" />}
                  className="py-3 text-red-600"
                  color="danger"
                  onClick={logout}
                >
                  {t('navigation.logout')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </header>

      {/* Mobile menu and search - shown when menu is open on small screens */}
      {isMobileMenuOpen && (
        <div className="lg:hidden px-4 pb-4 pt-4">
          <div className="bg-white w-full h-[40px] rounded-md flex items-center gap-2 px-3 mb-4">
            <Search className="w-5 h-5" />
            <input
              type="text"
              placeholder={t('ui.searchPlaceholder')}
              className="w-full h-full outline-none"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default AppHeader;
