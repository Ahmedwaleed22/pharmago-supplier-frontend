"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { getPusherChannel, getPusherInstance, disconnectPusher, setPusherUserId } from "@/services/pusher";
import Cookies from "js-cookie";

// Create a context to provide the Pusher channel throughout the app
type PusherContextType = {
  channel: any | null;
  userId: string | number | null;
  setUserId: (userId: string | number) => void;
  isInitialized: boolean;
  pusherInstance: any;
  forceReconnect: () => void;
};

const PusherContext = createContext<PusherContextType>({
  channel: null,
  userId: null,
  setUserId: () => {},
  isInitialized: false,
  pusherInstance: null,
  forceReconnect: () => {},
});

export function usePusherContext() {
  return useContext(PusherContext);
}

export default function PusherProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [userId, setUserIdState] = useState<string | number | null>(null);
  const [channel, setChannel] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pusherInstance, setPusherInstance] = useState<any>(null);
  
  // Set the user ID for Pusher and update the state
  const setUserId = (newUserId: string | number) => {
    console.log('PusherProvider: Setting user ID:', newUserId);
    
    // Store in localStorage and cookies for persistence across pages
    try {
      localStorage.setItem('user_id', newUserId.toString());
      Cookies.set('user_id', newUserId.toString(), { path: '/' });
    } catch (err) {
      console.error('Error saving user ID:', err);
    }
    
    setPusherUserId(newUserId);
    setUserIdState(newUserId);
    
    // Force channel resubscription when user ID changes
    const newChannel = getPusherChannel(newUserId);
    console.log('PusherProvider: Subscribing to channel for new user ID:', newUserId, newChannel);
    setChannel(newChannel);
  };
  
  // Function to force reconnection
  const forceReconnect = () => {
    if (!userId) {
      console.warn('PusherProvider: Cannot reconnect without a user ID');
      return;
    }
    
    console.log('PusherProvider: Forcing reconnection for user:', userId);
    
    // Force channel resubscription
    const reconnectedChannel = getPusherChannel(userId);
    setChannel(reconnectedChannel);
  };
  
  // Initialize Pusher connection when the component mounts - independent of user ID
  useEffect(() => {
    console.log('PusherProvider: Initializing Pusher connection');
    const pusher = getPusherInstance();
    setPusherInstance(pusher);
    setIsInitialized(true);
    
    // Clean up function - only called when the app is unmounted
    return () => {
      console.log('PusherProvider: Cleaning up Pusher connection');
      disconnectPusher();
    };
  }, []); // Empty dependency array ensures this runs once on mount
  
  // Get the user ID from cookies when the component mounts
  useEffect(() => {
    console.log('PusherProvider: Checking for user ID in cookies/localStorage');
    
    // Don't run if we already have a user ID
    if (userId) {
      console.log('PusherProvider: User ID already set:', userId);
      return;
    }
    
    // Check for user ID in cookies
    const userIdFromCookie = Cookies.get('user_id');
    if (userIdFromCookie) {
      console.log('PusherProvider: Found user ID in cookies:', userIdFromCookie);
      setUserId(userIdFromCookie);
      return;
    }
    
    // If not in cookies, try localStorage as fallback
    try {
      const userIdFromLocalStorage = localStorage.getItem('user_id');
      if (userIdFromLocalStorage) {
        console.log('PusherProvider: Found user ID in localStorage:', userIdFromLocalStorage);
        setUserId(userIdFromLocalStorage);
        return;
      }
    } catch (err) {
      console.error('PusherProvider: Error accessing localStorage:', err);
    }
    
    console.log('PusherProvider: No user ID found in cookies or localStorage');
  }, [userId]);
  
  // Subscribe to channel when userId changes and Pusher is initialized
  useEffect(() => {
    if (!userId || !isInitialized) {
      console.log('PusherProvider: Not subscribing to channel - missing userId or not initialized', { userId, isInitialized });
      return;
    }
    
    console.log('PusherProvider: Subscribing to channel for user ID:', userId);
    // Subscribe to the channel for this user
    const pusherChannel = getPusherChannel(userId);
    if (pusherChannel) {
      console.log('PusherProvider: Successfully got channel for user ID:', userId, pusherChannel.name);
      setChannel(pusherChannel);
    } else {
      console.error('PusherProvider: Failed to get channel for user ID:', userId);
    }
  }, [userId, isInitialized]);
  
  // Log whenever the channel changes
  useEffect(() => {
    console.log('PusherProvider: Channel updated:', channel?.name || 'null');
  }, [channel]);
  
  return (
    <PusherContext.Provider value={{ 
      channel, 
      userId, 
      setUserId, 
      isInitialized, 
      pusherInstance,
      forceReconnect
    }}>
      {children}
    </PusherContext.Provider>
  );
} 