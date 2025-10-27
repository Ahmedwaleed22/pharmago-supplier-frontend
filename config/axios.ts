import axios from "axios";
import Cookies from "js-cookie";

const TOKEN_KEY = "supplier_auth_token";

// Helper to get auth token from cookies
function getAuthToken(): string | null {
  return Cookies.get(TOKEN_KEY) || null;
}

// Helper to get locale for Accept-Language header
function getLocale(): string {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    const localeCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("locale=")
    );
    const locale = localeCookie ? localeCookie.split("=")[1] : "en";
    return locale || "en";
  }
  return "en";
}

export const SupplierAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/v1/supplier",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add auth token and Accept-Language header to requests automatically
SupplierAPI.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Accept-Language header if not already present
    if (!config.headers["Accept-Language"]) {
      config.headers["Accept-Language"] = getLocale();
    }

    return config;
  },
  (error) => {
    console.error("Supplier API request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
SupplierAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    if (error.response) {
      console.error("Supplier API error data:", error.response.data);
      console.error("Supplier API error status:", error.response.status);
    } else if (error.request) {
      console.error("Supplier API request error:", error.request);
    } else {
      console.error("Supplier API error message:", error.message);
    }
    return Promise.reject(error);
  }
);

