import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import { PUSHER_CONFIG } from '@/config/pusher';

// Enable Pusher logging for debugging
Pusher.logToConsole = true;

// Initialize Pusher singleton
let pusherInstance: Pusher | null = null;
let channelInstances: Record<string, any> = {};
let currentUserId: string | number | null = null;

/**
 * Set the current user ID for Pusher channels
 * Call this when the user logs in or changes
 */
export function setPusherUserId(userId: string | number) {
  console.log('Setting Pusher user ID:', userId);
  
  // If we already have a channel for this user, don't recreate it
  const channelName = PUSHER_CONFIG.getChannelName(userId);
  if (channelInstances[channelName]) {
    console.log('Channel already exists for this user ID:', channelName);
    currentUserId = userId;
    return channelInstances[channelName];
  }
  
  currentUserId = userId;
  return getPusherChannel(userId);
}

/**
 * Get the current user ID that's being used for Pusher
 */
export function getPusherUserId(): string | number | null {
  return currentUserId;
}

/**
 * Initialize and get the Pusher client instance
 */
export function getPusherInstance(): Pusher {
  if (!pusherInstance) {
    if (!PUSHER_CONFIG.APP_KEY) {
      console.error('Pusher API key is not configured!', { 
        key: PUSHER_CONFIG.APP_KEY,
        cluster: PUSHER_CONFIG.CLUSTER 
      });
      // Return a dummy instance to prevent errors
      return new Pusher('dummy-key', { cluster: 'eu' });
    }

    console.log('Initializing Pusher with:', { 
      key: PUSHER_CONFIG.APP_KEY,
      cluster: PUSHER_CONFIG.CLUSTER 
    });

    pusherInstance = new Pusher(PUSHER_CONFIG.APP_KEY, {
      cluster: PUSHER_CONFIG.CLUSTER,
      forceTLS: true,
    });

    // Add connection event listeners
    pusherInstance.connection.bind('connected', () => {
      console.log('Pusher connection established successfully');
      
      // When connection is established, resubscribe to the channel if we have a user ID
      if (currentUserId) {
        console.log('Resubscribing to channel for user:', currentUserId);
        getPusherChannel(currentUserId);
      }
    });

    pusherInstance.connection.bind('error', (err: any) => {
      console.error('Pusher connection error:', err);
    });
  }
  return pusherInstance;
}

/**
 * Get the channel instance for a specific user
 * If userId is not provided, it uses the current user ID set via setPusherUserId
 */
export function getPusherChannel(userId?: string | number): any | null {
  // Use provided userId or fall back to currentUserId
  const id = userId || currentUserId;
  
  if (!id) {
    console.warn('No user ID provided for Pusher channel. Make sure to call setPusherUserId first or provide a userId.');
    return null;
  }
  
  const channelName = PUSHER_CONFIG.getChannelName(id);
  console.log('Getting Pusher channel:', channelName);
  
  // First unsubscribe from any existing channel with this name to avoid duplicates
  if (channelInstances[channelName] && pusherInstance) {
    console.log(`Unsubscribing from existing channel: ${channelName} before resubscribing`);
    try {
      pusherInstance.unsubscribe(channelName);
      delete channelInstances[channelName];
    } catch (err) {
      console.error('Error unsubscribing from channel:', err);
    }
  }
  
  if (!channelInstances[channelName]) {
    const pusher = getPusherInstance();
    
    if (!pusher) {
      console.error('Pusher instance not available');
      return null;
    }
    
    try {
      console.log(`Subscribing to channel: ${channelName}`);
      channelInstances[channelName] = pusher.subscribe(channelName);
      
      // Add channel subscription event listeners
      channelInstances[channelName].bind('subscription_succeeded', () => {
        console.log(`Successfully subscribed to channel: ${channelName}`);
      });
      
      channelInstances[channelName].bind('subscription_error', (err: any) => {
        console.error(`Error subscribing to channel ${channelName}:`, err);
      });
    } catch (err) {
      console.error(`Error subscribing to channel ${channelName}:`, err);
      return null;
    }
  }
  
  return channelInstances[channelName];
}

/**
 * Clean up Pusher connection and all channels
 */
export function disconnectPusher(): void {
  if (pusherInstance) {
    console.log('Disconnecting Pusher and unsubscribing from all channels');
    // Unsubscribe from all channels
    Object.keys(channelInstances).forEach(channelName => {
      console.log(`Unsubscribing from channel: ${channelName}`);
      pusherInstance?.unsubscribe(channelName);
    });
    
    pusherInstance.disconnect();
    pusherInstance = null;
    channelInstances = {};
    currentUserId = null;
  }
}

/**
 * React hook to use Pusher and the user's channel in components
 * If userId is not provided, it uses the current user ID set via setPusherUserId
 */
export function usePusher(userId?: string | number) {
  const [channel, setChannel] = useState<any | null>(null);
  
  useEffect(() => {
    // Initialize Pusher and subscribe to the channel
    const pusherChannel = getPusherChannel(userId);
    console.log('usePusher hook initialized with channel:', pusherChannel);
    setChannel(pusherChannel);
    
    // Clean up function
    return () => {
      // We don't unsubscribe here since we want to keep the channel active
      // throughout the app. The disconnect should only be called when the
      // application is closed or when explicitly needed.
      console.log('usePusher hook cleanup');
    };
  }, [userId]);
  
  return { channel };
} 