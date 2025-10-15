// Constants for remember me functionality
const REMEMBER_TOKEN_KEY = "pharmago_remember_token";
const REMEMBER_EMAIL_KEY = "pharmago_remember_email";

// Interface for stored remember data
interface RememberData {
  email: string;
  token: string;
}

// Utility functions for remember me functionality
export const rememberMeUtils = {
  // Store remember token securely (only email + token, no password)
  storeRememberToken: (email: string, token: string): void => {
    try {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      localStorage.setItem(REMEMBER_TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to store remember token:", error);
    }
  },

  // Get stored remember token
  getRememberToken: (): string | null => {
    try {
      return localStorage.getItem(REMEMBER_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to retrieve remember token:", error);
      return null;
    }
  },

  // Get stored email
  getStoredEmail: (): string | null => {
    try {
      return localStorage.getItem(REMEMBER_EMAIL_KEY);
    } catch (error) {
      console.error("Failed to retrieve email:", error);
      return null;
    }
  },

  // Get both email and token
  getRememberData: (): RememberData | null => {
    try {
      const email = localStorage.getItem(REMEMBER_EMAIL_KEY);
      const token = localStorage.getItem(REMEMBER_TOKEN_KEY);
      
      if (email && token) {
        return { email, token };
      }
      return null;
    } catch (error) {
      console.error("Failed to retrieve remember data:", error);
      return null;
    }
  },

  // Check if remember token exists
  hasRememberToken: (): boolean => {
    try {
      return !!localStorage.getItem(REMEMBER_TOKEN_KEY);
    } catch (error) {
      return false;
    }
  },

  // Clear stored remember data
  clearRememberData: (): void => {
    try {
      localStorage.removeItem(REMEMBER_TOKEN_KEY);
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    } catch (error) {
      console.error("Failed to clear remember data:", error);
    }
  },

  // Store only email (for showing email in login form without auto-login)
  storeEmailOnly: (email: string): void => {
    try {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      localStorage.removeItem(REMEMBER_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to store email:", error);
    }
  }
};

// Export constants for use in API functions
export { REMEMBER_TOKEN_KEY, REMEMBER_EMAIL_KEY }; 