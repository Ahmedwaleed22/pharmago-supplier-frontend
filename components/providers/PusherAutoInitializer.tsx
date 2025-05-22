"use client";

import { useEffect } from "react";
import { usePusherContext } from "./PusherProvider";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";

/**
 * This component ensures Pusher is initialized with a user ID on every page.
 * It loads the user ID from cookies, localStorage, or API calls as needed.
 */
export function PusherAutoInitializer() {
  const { setUserId, userId, isInitialized } = usePusherContext();
  const router = useRouter();
  const pathname = usePathname();

  // Run once on initial load to get user ID from various sources
  useEffect(() => {
    // Skip on the debug page since it has its own initialization
    if (pathname === '/pusher-debug') {
      console.log('PusherAutoInitializer: Skipping on debug page');
      return;
    }
    
    // Don't run if we already have a user ID
    if (userId) {
      console.log('PusherAutoInitializer: User ID already set:', userId);
      return;
    }

    console.log('PusherAutoInitializer: Looking for user ID on page load');
    
    // Try to get from cookies first
    const userIdFromCookie = Cookies.get('user_id');
    if (userIdFromCookie) {
      console.log('PusherAutoInitializer: Found user ID in cookies:', userIdFromCookie);
      setUserId(userIdFromCookie);
      return;
    }
    
    // If not in cookies, try localStorage
    try {
      const userIdFromLocalStorage = localStorage.getItem('user_id');
      if (userIdFromLocalStorage) {
        console.log('PusherAutoInitializer: Found user ID in localStorage:', userIdFromLocalStorage);
        setUserId(userIdFromLocalStorage);
        return;
      }
    } catch (err) {
      console.error('PusherAutoInitializer: Error accessing localStorage:', err);
    }
    
    // If we're on a dashboard or protected page, try to get user from the page context
    if (pathname.includes('dashboard') || pathname.includes('admin')) {
      // Check if there's a user ID in a global variable or in the DOM
      const userIdFromDOM = document.querySelector('meta[name="user-id"]')?.getAttribute('content');
      if (userIdFromDOM) {
        console.log('PusherAutoInitializer: Found user ID in DOM:', userIdFromDOM);
        setUserId(userIdFromDOM);
        
        // Save to localStorage for future use
        try {
          localStorage.setItem('user_id', userIdFromDOM);
        } catch (err) {
          console.error('PusherAutoInitializer: Error saving to localStorage:', err);
        }
        return;
      }
      
      // Fallback: If we're on a dashboard page but no user ID, try to use a default or fetch from API
      console.log('PusherAutoInitializer: On dashboard but no user ID found, using fallback mechanisms');
      
      // Option 1: Check if window has user data
      const globalUserData = (window as any).__USER_DATA__;
      if (globalUserData?.id) {
        console.log('PusherAutoInitializer: Found user ID in global data:', globalUserData.id);
        setUserId(globalUserData.id);
        return;
      }
      
      // Option 2: Use a hardcoded testing ID for development (replace in production)
      if (process.env.NODE_ENV === 'development') {
        const devTestId = '0196d9d1-4151-72fa-9e41-1fdcd05d8973'; // Replace with your test ID
        console.log('PusherAutoInitializer: Using development test ID:', devTestId);
        setUserId(devTestId);
        
        // Save to localStorage for future use
        try {
          localStorage.setItem('user_id', devTestId);
        } catch (err) {
          console.error('PusherAutoInitializer: Error saving to localStorage:', err);
        }
        return;
      }
    }
    
    console.log('PusherAutoInitializer: No user ID found from any source');
  }, [userId, setUserId, pathname]);

  // This runs when navigating between pages to ensure connection stays active
  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    
    // Log the current active page for debugging
    console.log(`PusherAutoInitializer: Page navigation - ${pathname}`);
    
    // If we have a userId but no active channel, try to re-establish
    if (userId) {
      console.log('PusherAutoInitializer: User ID exists on page navigation, ensuring channel is active');
      setUserId(userId); // This will force channel resubscription
    }
  }, [pathname, isInitialized, userId, setUserId]);

  // Nothing to render - this is just for initialization
  return null;
} 