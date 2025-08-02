"use client";

import { useEffect, useState } from "react";
import { useNotifications, useNewOrders } from "@/hooks/useAppPusher";
import { usePusherContext } from "@/components/providers/PusherProvider";
import { useTranslation } from "@/contexts/i18n-context";

type Notification = {
  id: string;
  message: string;
  timestamp: number;
  type: 'notification' | 'order' | 'prescription';
  read: boolean;
};

export default function PusherNotifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { userId, channel, isInitialized, forceReconnect } = usePusherContext();
  const [isConnected, setIsConnected] = useState(false);
  
  // Listen for standard notifications
  const { data: notificationData, isReady } = useNotifications<{ message: string }>(
    (data) => {
      console.log("Received notification:", data);
      addNotification({
        id: `notification-${Date.now()}`,
        message: data.message,
        timestamp: Date.now(),
        type: 'notification',
        read: false
      });
    }
  );
  
  // Listen for new orders
  const { data: orderData } = useNewOrders<{ id: string; customer?: string }>(
    (data) => {
      console.log("Received new order:", data);
      addNotification({
        id: `order-${data.id || Date.now()}`,
        message: `New order ${data.id ? `#${data.id}` : ''} ${data.customer ? `from ${data.customer}` : ''}`,
        timestamp: Date.now(),
        type: 'order',
        read: false
      });
    }
  );
  
  // Add a new notification
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 30)); // Keep last 30 notifications
  };
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  // Check connection status
  useEffect(() => {
    if (!channel) {
      setIsConnected(false);
      return;
    }
    
    const checkConnection = () => {
      const pusherConnected = channel && isInitialized;
      setIsConnected(!!pusherConnected);
    };
    
    checkConnection();
    
    // Check again in 1 second to allow for connection to establish
    const timer = setTimeout(checkConnection, 1000);
    
    return () => clearTimeout(timer);
  }, [channel, isInitialized]);
  
  // Add a test notification after mounting (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isReady) {
      const timer = setTimeout(() => {
        addNotification({
          id: `test-${Date.now()}`,
          message: 'This is a test notification from Pusher',
          timestamp: Date.now(),
          type: 'notification',
          read: false
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isReady]);
  
  const handleReconnect = () => {
    forceReconnect();
  };
  
  // If there's no channel yet, show a minimal loading state
  if (!isInitialized) {
    return (
      <div className="p-2 text-sm text-gray-400">
        {t('common.loading')}
      </div>
    );
  }
  
  return (
    <div className="p-2 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-medium">{t('notifications.title')}</h3>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-xs text-gray-500">{isConnected ? t('common.connected') : t('common.disconnected')}</span>
          {!isConnected && (
            <button 
              onClick={handleReconnect}
              className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded"
            >
              {t('common.reconnect')}
            </button>
          )}
        </div>
      </div>
      
      <div className="text-xs mb-2 text-gray-500">
        {userId ? (
          <span>{t('common.channel')}: pharmacy.notifications.{userId}</span>
        ) : (
          <span className="text-red-500">{t('common.noUserIdSet')}</span>
        )}
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          <ul className="space-y-2 divide-y divide-gray-100">
            {notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`p-2 ${notification.read ? 'bg-gray-50' : 'bg-blue-50'} hover:bg-gray-100 rounded cursor-pointer transition-colors`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">
                    {notification.type === 'notification' && t('notifications.title')}
                    {notification.type === 'order' && t('orders.newOrder')}
                    {notification.type === 'prescription' && t('prescriptions.update')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{notification.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            {t('notifications.noNotifications')}
          </p>
        )}
      </div>
    </div>
  );
} 