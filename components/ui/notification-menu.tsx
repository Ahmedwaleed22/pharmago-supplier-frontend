import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { createNotificationsQueryOptions } from "@/query-options/notifications-query-options";
import { usePusherEvent } from "@/hooks/usePusherEvent";
import { PUSHER_EVENTS } from "@/config/pusher";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/services/dashboard";
import { useSelector } from "react-redux";
import { getSupplier } from "@/store/authSlice";
import { useI18n, useTranslation } from "@/contexts/i18n-context";

interface PusherNotificationEvent {
  type: string;
  notification: Dashboard.Notification;
}

interface NotificationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({ isOpen, onClose }) => {
  const supplier = useSelector(getSupplier);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [currentLimit, setCurrentLimit] = useState(3); // Start with 3 notifications
  const { t } = useTranslation();
  const { locale } = useI18n();
  
  // Use the actual API to fetch notifications with pagination
  const { data: notificationResponse, isLoading, isFetching, isPlaceholderData } = useQuery(createNotificationsQueryOptions(0, currentLimit, locale));
  
  const notifications = notificationResponse?.data || [];
  const unreadCount = notificationResponse?.meta?.unread_count || 0;

  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      console.log("Mark all as read successful, invalidating queries...");
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Also update the cache optimistically
      queryClient.setQueryData(['notifications', 0, currentLimit], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((notification: Dashboard.Notification) => ({
            ...notification,
            is_read: true
          })),
          meta: {
            ...oldData.meta,
            unread_count: 0
          }
        };
      });
    },
    onError: (error) => {
      console.error("Error marking all notifications as read:", error);
    }
  });

  // Mutation for marking single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (data, variables) => {
      console.log(`Mark notification ${variables} as read successful, invalidating queries...`);
      // Invalidate and refetch notifications - invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Also update the cache optimistically
      queryClient.setQueryData(['notifications', 0, currentLimit], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((notification: Dashboard.Notification) => 
            notification.id === variables 
              ? { ...notification, is_read: true }
              : notification
          ),
          meta: {
            ...oldData.meta,
            unread_count: Math.max(0, (oldData.meta?.unread_count || 0) - 1)
          }
        };
      });
    },
    onError: (error) => {
      console.error("Error marking notification as read:", error);
    }
  });

  // Handle new notification events from Pusher (for real-time updates in the menu)
  usePusherEvent<PusherNotificationEvent>(PUSHER_EVENTS.NOTIFICATION, (data) => {
    console.log("New notification received in menu:", data);
    
    // Invalidate queries to refetch latest data
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  });

  // Handle clicking outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset pagination when menu opens
  useEffect(() => {
    if (isOpen) {
      setCurrentLimit(3);
    }
  }, [isOpen]);

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleNotificationClick = (notification: Dashboard.Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      console.log(`Marking notification ${notification.id} as read...`);
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to the notification link if provided
    if (notification.link && notification.category === "prescription") {
      console.log(`Navigating to notification link: ${notification.link}`);
      if (notification.is_expired) {
        console.log(`Notification ${notification.id} is expired, skipping navigation`);
      } else {
        window.open(notification.link, '_self');
      }
    }
  };

  const handleViewMore = () => {
    // Increase limit by 3 to load 3 more notifications
    setCurrentLimit(prev => prev + 3);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (!isOpen) return null;

  // Check if there are more notifications to load
  // If we got exactly the limit we requested, there might be more
  // Also check if the API provides has_more metadata
  const hasMoreNotifications = notificationResponse?.meta?.has_more ?? (notifications.length === currentLimit);

  return (
    <div 
      ref={menuRef}
      className="absolute top-12 right-0 z-50 w-[420px] bg-white rounded-2xl shadow-lg overflow-hidden"
      style={{
        boxShadow: "0px 2px 30px 0px rgba(0, 0, 0, 0.22), 0px 0px 15px 0px rgba(0, 0, 0, 0.06)"
      }}
    >
      <div className="p-3">
        <div className="flex justify-between items-center px-5 py-2">
          <div className="inline-flex items-center">
            <h4 className="text-lg font-medium text-gray-800">{t('notifications.title')}</h4>
            {unreadCount > 0 && (
              <span className="flex justify-center items-center bg-red-500 text-white text-xs rounded-full w-5 h-5 ml-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="text-blue-600 text-sm px-2 py-2 rounded-full hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markAllAsReadMutation.isPending ? t('notifications.markingAsRead') : t('notifications.markAllRead')}
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {isLoading && !isPlaceholderData ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">{t('common.loading')}</div>
          </div>
        ) : notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`flex gap-3 px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.is_read ? "bg-blue-50" : ""} ${markAsReadMutation.isPending ? "opacity-50" : ""}`}
                onClick={() => !markAsReadMutation.isPending && handleNotificationClick(notification)}
              >
                <div className="relative">
                  {notification.logo || supplier?.logo && (
                    <Image
                      src={notification.logo || supplier?.logo}
                      alt={notification.title}
                      width={40}
                      height={40}
                      className="rounded-full w-[40px] h-[40px]"
                    />
                  )}
                  {!notification.is_read && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className="text-sm">
                    <strong className="text-gray-800">{notification.title}</strong>
                    {markAsReadMutation.isPending && markAsReadMutation.variables === notification.id && (
                      <span className="ml-2 text-xs text-gray-500">{t('notifications.markingAsRead')}</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">{notification.short_description}</p>
                  <span className="text-xs text-gray-500">{formatTimeAgo(notification.created_at)}</span>
                  
                  {notification.category && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {notification.category}
                      </div>
                      {notification.type && (
                        <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {notification.type}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isFetching && isPlaceholderData && (
              <div className="flex justify-center items-center py-4 bg-gray-50">
                <div className="text-gray-500 text-sm">{t('notifications.loadingMore')}</div>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">{t('notifications.noNotifications')}</div>
          </div>
        )}
      </div>

      {hasMoreNotifications && notifications.length > 0 && (
        <button 
          onClick={handleViewMore}
          disabled={isFetching}
          className="w-full py-4 text-blue-600 text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? t('common.loading') : t('ui.showMore')}
        </button>
      )}
    </div>
  );
};

export default NotificationMenu; 