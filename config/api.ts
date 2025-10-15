import axios from "axios";
import { getAuthToken } from "@/lib/api";
import { getServerToken } from "@/lib/server-auth";

export const ClientAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SUPPLIER_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

// Add auth token to requests dynamically via interceptor
ClientAPI.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    console.log(token);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Create a function to get a server-side API client with cookies
export function createServerAPI(cookieString: string) {
  const serverAPI = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SUPPLIER_URL,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    withCredentials: true,
  });
  
  // Add interceptor for server-side requests
  serverAPI.interceptors.request.use(async (config) => {
    const token = await getServerToken(cookieString);
    if (token) {
      console.log("Server token:", token);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    console.error('Server request error:', error);
    return Promise.reject(error);
  });
  
  return serverAPI;
}