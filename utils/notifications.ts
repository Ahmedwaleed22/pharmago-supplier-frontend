/**
 * Utility functions for browser notifications
 */

let lastSoundTime = 0;
const SOUND_COOLDOWN = 300; // Minimum milliseconds between sounds

/**
 * Play a notification sound
 * Creates a simple beep sound using Web Audio API
 */
export function playNotificationSound() {
  // Prevent too many sounds in quick succession
  const now = Date.now();
  if (now - lastSoundTime < SOUND_COOLDOWN) {
    return;
  }
  lastSoundTime = now;

  try {
    // Use Web Audio API to create a simple notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure sound: gentle beep
    oscillator.frequency.value = 800; // Higher pitch
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    // Cleanup
    setTimeout(() => {
      audioContext.close();
    }, 500);
  } catch (error) {
    console.error('Error playing notification sound:', error);
    // Fallback: try using HTML5 Audio if Web Audio API fails
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OYSg4PSqTl7rJeGAY7k9n10n8uBiJ+zfLZiTYIGGi58OSfTQ8MT6bj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQYxh9Hz04IzBh5uwO/jmEoOD0qk5e6yXhgGO5PZ9dJ/LgYifs3y2Yk2CBhoufDkn00PDE+m4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silently fail if audio can't play (user might have restrictions)
      });
    } catch (fallbackError) {
      // Silently fail - notifications are optional
      console.warn('Could not play notification sound');
    }
  }
}

let originalTitle: string | null = null;
let notificationInterval: NodeJS.Timeout | null = null;
let notificationCount = 0;

/**
 * Get the original title, initializing it if needed
 */
function getOriginalTitle(): string {
  if (typeof document === 'undefined') {
    return '';
  }
  if (!originalTitle) {
    originalTitle = document.title;
  }
  return originalTitle;
}

/**
 * Check if the current tab is active
 */
function isTabActive(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  return !document.hidden;
}

/**
 * Flash the browser title with unread count
 * @param count - Number of unread messages
 */
export function flashBrowserTitle(count: number) {
  // Guard against SSR - only run in browser
  if (typeof document === 'undefined') {
    return;
  }

  // Only flash if tab is not active or if there are unread messages
  if (isTabActive() && count === 0) {
    clearTitleFlash();
    return;
  }

  notificationCount = count;
  
  // Clear any existing interval
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }

  // Get original title (will initialize if needed)
  const title = getOriginalTitle();

  // Start flashing
  let showNotification = true;
  notificationInterval = setInterval(() => {
    if (typeof document === 'undefined') {
      return;
    }
    
    if (notificationCount === 0 || isTabActive()) {
      clearTitleFlash();
      return;
    }

    document.title = showNotification
      ? `(${notificationCount > 0 ? notificationCount : '•'}) ${title}`
      : title;
    showNotification = !showNotification;
  }, 1000); // Flash every second
}

/**
 * Clear the title flash and restore original title
 */
export function clearTitleFlash() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
  notificationCount = 0;
  
  // Guard against SSR
  if (typeof document !== 'undefined' && originalTitle) {
    document.title = originalTitle;
  }
}

/**
 * Initialize title tracking (save original title on load)
 */
export function initializeTitle() {
  // Guard against SSR
  if (typeof document === 'undefined') {
    return;
  }
  
  originalTitle = document.title;
  
  // Restore title when tab becomes active
  document.addEventListener('visibilitychange', () => {
    if (isTabActive() && notificationCount === 0) {
      clearTitleFlash();
    }
  });
}

/**
 * Calculate total unread count from conversations
 */
export function calculateUnreadCount(conversations: any[]): number {
  return conversations.reduce((total, conv) => {
    return total + (conv.unread_count || 0);
  }, 0);
}

