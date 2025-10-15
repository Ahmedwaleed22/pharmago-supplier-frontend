"use client";

import { usePusherEvent } from "@/hooks/usePusherEvent";
import { PUSHER_EVENTS } from "@/config/pusher";
import { useEffect, useState } from "react";
import { usePusherContext } from "@/components/providers/PusherProvider";

export default function PusherExample() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const { userId, setUserId, isInitialized, channel, pusherInstance } = usePusherContext();
  const [inputUserId, setInputUserId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  
  // Example: Listen for notification events on user-specific channel
  const { data: notificationData } = usePusherEvent<{ message: string }>(
    PUSHER_EVENTS.NOTIFICATION,
    (data) => {
      console.log("Received user notification:", data);
    }
  );
  
  // Update notifications when new notification data is received
  useEffect(() => {
    if (notificationData) {
      setNotifications((prev) => [...prev, `Notification: ${notificationData.message}`]);
    }
  }, [notificationData]);
  
  // Example: Listen for new orders
  usePusherEvent(PUSHER_EVENTS.NEW_ORDER, (data) => {
    console.log("New order received:", data);
    setNotifications((prev) => [...prev, `New order: ${JSON.stringify(data)}`]);
  });
  
  // Check connection status
  useEffect(() => {
    if (!pusherInstance) {
      setConnectionStatus('Pusher not initialized');
      return;
    }
    
    const updateConnectionState = () => {
      setConnectionStatus(pusherInstance.connection.state);
    };
    
    // Initial state
    updateConnectionState();
    
    // Listen for connection state changes
    pusherInstance.connection.bind('state_change', (states: any) => {
      console.log('Pusher connection state changed:', states);
      updateConnectionState();
    });
    
    return () => {
      if (pusherInstance && pusherInstance.connection) {
        pusherInstance.connection.unbind('state_change');
      }
    };
  }, [pusherInstance]);
  
  // Auto-generate a random user ID for testing if none exists
  useEffect(() => {
    if (!userId && !inputUserId) {
      const randomId = `test-user-${Math.random().toString(36).substr(2, 9)}`;
      setInputUserId(randomId);
    }
  }, [userId, inputUserId]);
  
  // Handle user ID change
  const handleSetUserId = () => {
    if (inputUserId) {
      setUserId(inputUserId);
      
      // Store in localStorage for persistence
      try {
        localStorage.setItem('user_id', inputUserId);
        console.log('Saved user ID to localStorage:', inputUserId);
      } catch (err) {
        console.error('Failed to save user ID to localStorage:', err);
      }
    }
  };
  
  // Save current user ID to localStorage
  const handleSaveUserId = () => {
    if (userId) {
      try {
        localStorage.setItem('user_id', userId.toString());
        console.log('Saved user ID to localStorage:', userId);
        setNotifications(prev => [...prev, `Saved user ID: ${userId} to localStorage`]);
      } catch (err) {
        console.error('Failed to save user ID to localStorage:', err);
      }
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Pusher Notifications Example</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded border">
          <h3 className="text-md font-medium mb-2">User ID Configuration</h3>
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="text" 
              value={inputUserId} 
              onChange={(e) => setInputUserId(e.target.value)}
              placeholder="Enter user ID" 
              className="border rounded px-3 py-1.5 flex-1"
            />
            <button 
              onClick={handleSetUserId}
              className="bg-blue-500 text-white px-3 py-1.5 rounded"
            >
              Set User ID
            </button>
          </div>
          
          <div className="text-sm mb-3">
            {userId ? (
              <div>
                <span className="text-green-600">
                  Current User ID: <strong>{userId}</strong>
                </span>
                <button 
                  onClick={handleSaveUserId}
                  className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  Save to localStorage
                </button>
              </div>
            ) : (
              <span className="text-red-600">
                No user ID set. Please set a user ID to receive notifications.
              </span>
            )}
          </div>
          
          <div className="text-sm">
            <div className="mb-1">
              <span className={isInitialized ? "text-green-600" : "text-red-600"}>
                Pusher Initialized: <strong>{isInitialized ? "Yes" : "No"}</strong>
              </span>
            </div>
            <div className="mb-1">
              <span className={connectionStatus === 'connected' ? "text-green-600" : "text-yellow-600"}>
                Connection Status: <strong>{connectionStatus}</strong>
              </span>
            </div>
            <div>
              <span className={channel ? "text-green-600" : "text-red-600"}>
                Channel: <strong>{channel ? channel.name : "None"}</strong>
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded border">
          <h3 className="text-md font-medium mb-2">Debug Information</h3>
          <div className="text-sm mb-3">
            <div className="mb-1">
              <strong>Channel Name Format:</strong> supplier.notifications.{'{userId}'}
            </div>
            {userId && (
              <div className="mb-1">
                <strong>Your Channel:</strong> supplier.notifications.{userId}
              </div>
            )}
            <div className="mb-1">
              <strong>Events Listening For:</strong> {PUSHER_EVENTS.NOTIFICATION}, {PUSHER_EVENTS.NEW_ORDER}
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            <p>Troubleshooting steps if not working:</p>
            <ol className="list-decimal ml-5 mt-1 space-y-0.5">
              <li>Check connection status above</li>
              <li>Verify Pusher API key is set in .env.local</li>
              <li>Make sure a user ID is set and channel is created</li>
              <li>Check browser console for errors</li>
            </ol>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-md font-medium mb-2">User Notifications</h3>
        {notifications.length > 0 ? (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {notifications.map((message, index) => (
              <li key={index} className="p-2 bg-blue-50 rounded border border-blue-100 text-sm">
                {message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No notifications yet. They will appear here when received via Pusher.</p>
        )}
      </div>
    </div>
  );
} 