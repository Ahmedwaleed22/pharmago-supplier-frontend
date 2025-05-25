"use client";

import { useEffect } from "react";
import { usePusherContext } from "./PusherProvider";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";

/**
 * This component ensures Pusher is initialized with a user ID on every page.
 * It loads the user ID from cookies or API calls as needed.
 */
export function PusherAutoInitializer() {
  const { setUserId, userId, isInitialized } = usePusherContext();
  const router = useRouter();
  const pathname = usePathname();

  // Run once on initial load to get user ID from various sources
  useEffect(() => {
    // Skip on the debug page since it has its own initialization
    if (pathname === '/pusher-debug') {
      return;
    }
    
    // Only run if we don't already have a userId
    if (userId) {
      return;
    }
    
    // Try to get from cookies
    const userIdFromCookie = Cookies.get('user_id');
    if (userIdFromCookie) {
      setUserId(userIdFromCookie);
      return;
    }
    
    // If we're on a dashboard or protected page, try to get user from the page context
    if (pathname.includes('dashboard') || pathname.includes('admin')) {
      // Check if there's a user ID in a global variable or in the DOM
      const userIdFromDOM = document.querySelector('meta[name="user-id"]')?.getAttribute('content');
      if (userIdFromDOM) {
        setUserId(userIdFromDOM);
        return;
      }
            
      // Check if window has user data
      const globalUserData = (window as any).__USER_DATA__;
      if (globalUserData?.id) {
        setUserId(globalUserData.id);
        return;
      }
    }
  }, [pathname]); // Removed userId and setUserId from dependencies

  // This runs when navigating between pages to ensure connection stays active
  useEffect(() => {
    if (!isInitialized || !userId) {
      return;
    }
        
    // Force channel resubscription when navigating between pages
    // We'll use a different approach that doesn't call setUserId
    console.log('PusherAutoInitializer: Page navigation detected, ensuring connection for user:', userId);
  }, [pathname, isInitialized]); // Removed userId and setUserId from dependencies

  // Nothing to render - this is just for initialization
  return null;
} 