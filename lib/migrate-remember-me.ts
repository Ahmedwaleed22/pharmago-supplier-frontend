/**
 * Migration utility to clean up old insecure remember me data
 * 
 * This script removes the old `pharmago_remember_credentials` that stored
 * passwords in plain text and migrates users to the new secure system.
 * 
 * Usage: Call this function once when the app loads (e.g., in _app.tsx or layout.tsx)
 */

const OLD_REMEMBER_CREDENTIALS_KEY = "pharmago_remember_credentials";
const OLD_REMEMBER_EMAIL_KEY = "pharmago_remember_email";

export function migrateRememberMeData(): void {
  if (typeof window === 'undefined') {
    return; // Skip on server-side
  }

  try {
    // Check if old data exists
    const oldCredentials = localStorage.getItem(OLD_REMEMBER_CREDENTIALS_KEY);
    const oldEmail = localStorage.getItem(OLD_REMEMBER_EMAIL_KEY);

    if (oldCredentials || oldEmail) {
      console.log('[Remember Me Migration] Removing old insecure credentials...');
      
      // Remove old insecure data
      localStorage.removeItem(OLD_REMEMBER_CREDENTIALS_KEY);
      
      // Note: We keep OLD_REMEMBER_EMAIL_KEY as it's still used by the new system
      // with the same key name (REMEMBER_EMAIL_KEY)
      
      console.log('[Remember Me Migration] Migration completed successfully');
    }
  } catch (error) {
    console.error('[Remember Me Migration] Failed to migrate:', error);
  }
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return !!localStorage.getItem(OLD_REMEMBER_CREDENTIALS_KEY);
  } catch (error) {
    return false;
  }
}

/**
 * Get migration status for logging/debugging
 */
export function getMigrationStatus(): {
  hasOldCredentials: boolean;
  hasOldEmail: boolean;
  needsMigration: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      hasOldCredentials: false,
      hasOldEmail: false,
      needsMigration: false,
    };
  }

  try {
    const hasOldCredentials = !!localStorage.getItem(OLD_REMEMBER_CREDENTIALS_KEY);
    const hasOldEmail = !!localStorage.getItem(OLD_REMEMBER_EMAIL_KEY);

    return {
      hasOldCredentials,
      hasOldEmail,
      needsMigration: hasOldCredentials,
    };
  } catch (error) {
    return {
      hasOldCredentials: false,
      hasOldEmail: false,
      needsMigration: false,
    };
  }
}

