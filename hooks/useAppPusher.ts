import { useEffect } from 'react';
import { usePusherContext } from '@/components/providers/PusherProvider';
import { usePusherEvent } from './usePusherEvent';
import { PUSHER_EVENTS } from '@/config/pusher';

/**
 * Hook to listen for specific Pusher events with automatic handling of user ID
 * 
 * @param eventName Name of the event to listen for (use PUSHER_EVENTS enum)
 * @param callback Function to handle the event data
 * @returns Object containing event data, loading state, and error
 */
export function useAppPusher<T = any>(
  eventName: string,
  callback?: (data: T) => void
) {
  const { userId, channel, isInitialized } = usePusherContext();
  const { data, isInitialized: eventInitialized } = usePusherEvent<T>(eventName, callback);
  
  // Monitor connection state
  useEffect(() => {
    if (!isInitialized) {
      console.log(`useAppPusher(${eventName}): Pusher not yet initialized`);
    } else if (!userId) {
      console.log(`useAppPusher(${eventName}): No user ID set, events won't be received`);
    } else if (!channel) {
      console.log(`useAppPusher(${eventName}): No channel available despite user ID being set`);
    } else {
      console.log(`useAppPusher(${eventName}): Ready and listening on channel ${channel.name}`);
    }
  }, [isInitialized, userId, channel, eventName]);
  
  return {
    data,
    isReady: !!channel && isInitialized && eventInitialized,
    userId,
    channelName: channel?.name
  };
}

/**
 * Specialized hook for notification events
 */
export function useNotifications<T = any>(callback?: (data: T) => void) {
  return useAppPusher<T>(PUSHER_EVENTS.NOTIFICATION, callback);
}

/**
 * Specialized hook for new order events
 */
export function useNewOrders<T = any>(callback?: (data: T) => void) {
  return useAppPusher<T>(PUSHER_EVENTS.NEW_ORDER, callback);
}

/**
 * Specialized hook for prescription updates
 */
export function usePrescriptionUpdates<T = any>(callback?: (data: T) => void) {
  return useAppPusher<T>(PUSHER_EVENTS.PRESCRIPTION_UPDATED, callback);
} 