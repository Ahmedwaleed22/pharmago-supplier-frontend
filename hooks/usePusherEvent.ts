import { useEffect, useState } from 'react';
import { usePusherContext } from '@/components/providers/PusherProvider';

/**
 * Hook to listen for Pusher events on the user's channel
 * 
 * @param eventName The name of the event to listen for
 * @param callback Optional callback function to handle the event data
 * @returns An object containing the latest event data and the userId
 */
export function usePusherEvent<T = any>(
  eventName: string,
  callback?: (data: T) => void
) {
  const { channel, userId, isInitialized } = usePusherContext();
  const [eventData, setEventData] = useState<T | null>(null);
  
  useEffect(() => {
    // Don't proceed if no channel is available
    if (!channel) {
      console.warn('No Pusher channel available for event binding:', eventName);
      return;
    }
    
    console.log(`Binding to event '${eventName}' on channel:`, channel.name);
    
    // Bind to the event
    const handleEvent = (data: T) => {
      console.log(`Received event '${eventName}':`, data);
      setEventData(data);
      if (callback) {
        callback(data);
      }
    };
    
    channel.bind(eventName, handleEvent);
    
    // Clean up
    return () => {
      if (channel) {
        console.log(`Unbinding from event '${eventName}' on channel:`, channel.name);
        channel.unbind(eventName, handleEvent);
      }
    };
  }, [channel, eventName, callback, isInitialized]);
  
  return { data: eventData, userId, isInitialized };
} 