'use server';

// Cookie keys (must match client-side)
const TOKEN_KEY = "supplier_auth_token";
const USER_KEY = "supplier_user";

/**
 * Server action to get the auth token
 * This function relies on cookies being passed in from the client component
 */
export async function getServerToken(cookieString: string = ''): Promise<string | null> {
  // Parse the cookie string to find the token
  const match = new RegExp(`${TOKEN_KEY}=([^;]+)`).exec(cookieString);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Server action to check if user is authenticated
 */
export async function isServerAuthenticated(cookieString: string = ''): Promise<boolean> {
  const token = await getServerToken(cookieString);
  return token !== null;
}

/**
 * Server action to get the authenticated user
 */
export async function getServerUser(cookieString: string = ''): Promise<any> {
  // Parse the cookie string to find the user data
  const match = new RegExp(`${USER_KEY}=([^;]+)`).exec(cookieString);
  
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
  
  return null;
}

/**
 * Server action to get authorization headers
 */
export async function getServerAuthHeader(cookieString: string = ''): Promise<Record<string, string>> {
  const token = await getServerToken(cookieString);
  return token ? { Authorization: `Bearer ${token}` } : {};
} 