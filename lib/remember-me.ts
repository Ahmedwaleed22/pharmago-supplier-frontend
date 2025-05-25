// Constants for remember me functionality
const REMEMBER_CREDENTIALS_KEY = "pharmago_remember_credentials";
const REMEMBER_EMAIL_KEY = "pharmago_remember_email";

// Interface for stored credentials
interface StoredCredentials {
  email: string;
  password: string;
}

// Utility functions for remember me functionality
export const rememberMeUtils = {
  // Store credentials securely
  storeCredentials: (email: string, password: string): void => {
    try {
      // For better security, we could encrypt this data
      const credentials: StoredCredentials = { email, password };
      localStorage.setItem(REMEMBER_CREDENTIALS_KEY, JSON.stringify(credentials));
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } catch (error) {
      console.error("Failed to store credentials:", error);
    }
  },

  // Get stored credentials
  getStoredCredentials: (): StoredCredentials | null => {
    try {
      const stored = localStorage.getItem(REMEMBER_CREDENTIALS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to retrieve credentials:", error);
      return null;
    }
  },

  // Get stored email only
  getStoredEmail: (): string | null => {
    try {
      return localStorage.getItem(REMEMBER_EMAIL_KEY);
    } catch (error) {
      console.error("Failed to retrieve email:", error);
      return null;
    }
  },

  // Check if credentials are stored
  hasStoredCredentials: (): boolean => {
    try {
      return !!localStorage.getItem(REMEMBER_CREDENTIALS_KEY);
    } catch (error) {
      return false;
    }
  },

  // Clear stored credentials
  clearStoredCredentials: (): void => {
    try {
      localStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    } catch (error) {
      console.error("Failed to clear credentials:", error);
    }
  },

  // Update stored credentials (when user changes email/password)
  updateStoredCredentials: (email: string, password: string): void => {
    if (rememberMeUtils.hasStoredCredentials()) {
      rememberMeUtils.storeCredentials(email, password);
    }
  },

  // Store only email (for partial remember functionality)
  storeEmailOnly: (email: string): void => {
    try {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } catch (error) {
      console.error("Failed to store email:", error);
    }
  }
};

// Export constants for use in API functions
export { REMEMBER_CREDENTIALS_KEY, REMEMBER_EMAIL_KEY }; 