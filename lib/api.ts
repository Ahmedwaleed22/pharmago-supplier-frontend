import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { rememberMeUtils } from "./remember-me";

const API_BASE_URL = '/';

// For client-side storage
const TOKEN_KEY = "pharmacy_auth_token";
const USER_KEY = "pharmacy_user";
const USER_ID_KEY = "user_id";

// Default cookie expiration (30 days for remember me)
const REMEMBER_ME_EXPIRY = 30;
// Session cookies (no expiration - expires when browser closes)
const SESSION_COOKIE_OPTIONS = {
  secure: true,
  sameSite: "strict" as const,
};
// Remember me cookies (with expiration)
const REMEMBER_ME_COOKIE_OPTIONS = (expiry: number) => ({
  expires: expiry,
  secure: true,
  sameSite: "strict" as const,
});

// Create axios instance with default configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Enable CORS requests
  withCredentials: true,
});

// Add auth token and Accept-Language header to requests automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add Accept-Language header if not already present
    if (!config.headers['Accept-Language']) {
      config.headers['Accept-Language'] = getAcceptLanguageHeader();
    }
    
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error data:", error.response.data);
      console.error("Error status:", error.response.status);
      console.error("Error headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }
    console.error("Error config:", error.config);
    return Promise.reject(error);
  }
);

export async function loginPharmacy(
  credentials: Auth.LoginCredentials
): Promise<Auth.LoginResponse> {
  try {
    // Use our proxy request utility
    const responseData = await proxyRequest("post", "login", credentials);

    // Store auth data with remember me preference
    if (responseData.token) {
      setAuthData(responseData, credentials.remember);

      await fetchAuthenticatedUser();
    }

    return responseData;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function resetPassword(phoneNumber: string): Promise<boolean> {
  try {
    const response = await axios.post("/api/forgot-password", { phoneNumber });
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    // If we need to call a logout API endpoint
    // await apiClient.post('/logout');

    // Clear cookies
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_KEY);
    Cookies.remove(USER_ID_KEY);
    // Clear stored credentials from localStorage as well
    clearStoredCredentials();
  } catch (error) {
    console.error("Logout error:", error);
    // Still remove the cookies and stored credentials even if the API call fails
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_KEY);
    Cookies.remove(USER_ID_KEY);
    clearStoredCredentials();
  }
}

// Helper function to clear stored credentials
function clearStoredCredentials(): void {
  if (typeof window !== "undefined") {
    rememberMeUtils.clearStoredCredentials();
  }
}

// Helper function to set authentication data after login
export function setAuthData(
  data: Auth.LoginResponse,
  remember: boolean = false
): void {
  // Choose cookie options based on remember me preference
  const cookieOptions = remember
    ? REMEMBER_ME_COOKIE_OPTIONS(REMEMBER_ME_EXPIRY) // Persistent cookies with expiration
    : SESSION_COOKIE_OPTIONS; // Session cookies (expire when browser closes)

  if (data.token) {
    Cookies.set(TOKEN_KEY, data.token, cookieOptions);
  }

  if (data.user) {
    Cookies.set(USER_KEY, JSON.stringify(data.user), cookieOptions);
    Cookies.set(USER_ID_KEY, data.user.id, cookieOptions);
  }
}

// Helper function to get the authentication token
export function getAuthToken(): string | null {
  return Cookies.get(TOKEN_KEY) || null;
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// Helper function to get the authenticated user
export function getAuthUser(): any {
  const userData = Cookies.get(USER_KEY);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Helper function to get cookie string for server-side auth
export function getCookieString(): string {
  return typeof document !== "undefined" ? document.cookie : "";
}

// Add auth token to API requests
export function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Generic axios function with auth
export async function axiosWithAuth(
  method: "get" | "post" | "put" | "delete" | "patch",
  url: string,
  data?: any,
  options: AxiosRequestConfig = {}
): Promise<any> {
  // Extract the endpoint path from the full URL
  const endpoint = url.replace(API_BASE_URL || "", "").replace(/^\/+/, "");

  // Use the proxy for external API calls to avoid CORS
  if (url.includes(API_BASE_URL!)) {
    return proxyRequest(
      method === "patch" ? "put" : (method as any),
      endpoint,
      data,
      options
    );
  }

  // For internal API routes, use direct axios call with Accept-Language header
  const acceptLanguage = getAcceptLanguageHeader();
  return apiClient({
    method,
    url,
    data,
    headers: {
      'Accept-Language': acceptLanguage,
      ...options.headers,
    },
    ...options,
  });
}

// Legacy function for compatibility
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const method = (options.method || "GET").toLowerCase() as
    | "get"
    | "post"
    | "put"
    | "delete"
    | "patch";
  const data = options.body ? JSON.parse(options.body as string) : undefined;

  // Convert fetch headers to a simple object for axios
  const headers: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      for (const [key, value] of options.headers) {
        headers[key] = value;
      }
    } else if (typeof options.headers === "object") {
      Object.assign(headers, options.headers);
    }
  }

  try {
    const response = await axiosWithAuth(method, url, data, {
      headers: {
        'Accept-Language': getAcceptLanguageHeader(),
        ...headers,
      },
    });

    return {
      ok: true,
      status: response.status,
      json: () => Promise.resolve(response.data),
      text: () => Promise.resolve(JSON.stringify(response.data)),
    };
  } catch (error: any) {
    return {
      ok: false,
      status: error.response?.status || 500,
      json: () =>
        Promise.resolve(error.response?.data || { message: error.message }),
      text: () => Promise.resolve(error.message),
    };
  }
}

// Helper function to get Accept-Language header from locale
export function getAcceptLanguageHeader(): string {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    return 'en';
  }
  
  // Try to get locale from cookie
  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(cookie => cookie.trim().startsWith('locale='));
  const locale = localeCookie ? localeCookie.split('=')[1] : 'en';
  
  return locale || 'en';
}

// Utility function to make requests through our proxy
export async function proxyRequest(
  method: "get" | "post" | "put" | "delete",
  endpoint: string,
  data?: any,
  options: Record<string, any> = {}
) {
  try {
    let response;
    
    // Get the Accept-Language header
    const acceptLanguage = getAcceptLanguageHeader();

    if (method === "get") {
      // For GET requests, use URL parameters and add headers
      response = await axios.get(`/api/proxy`, {
        params: {
          endpoint: endpoint,
        },
        headers: {
          'Accept-Language': acceptLanguage,
          ...getAuthHeader(),
        },
        ...options,
      });
    } else {
      // For other methods, use the body
      response = await axios.post("/api/proxy", {
        endpoint,
        data,
        headers: {
          ...getAuthHeader(),
          'Accept-Language': acceptLanguage,
        },
        ...options,
      });
    }

    return response.data;
  } catch (error: any) {
    console.error(`Proxy ${method.toUpperCase()} request error:`, error);
    throw {
      message: error.response?.data?.error?.message || error.message,
      status: error.response?.status || 500,
    };
  }
}

// Fetch the authenticated pharmacy user data
export async function fetchAuthenticatedUser(): Promise<any> {
  try {
    const response = await axios.get("/api/user", { 
      headers: {
        ...getAuthHeader(),
        'Accept-Language': getAcceptLanguageHeader(),
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    throw error;
  }
}

// Create a new medicine product
export async function createMedicine(formData: FormData): Promise<any> {
  try {
    const response = await axios.post(
      "/api/proxy",
      {
        endpoint: "products/",
        method: "post",
        formData: formData,
        isFormData: true,
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
          "Accept-Language": getAcceptLanguageHeader(),
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating medicine:", error);
    throw error;
  }
}
