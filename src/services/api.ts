import axios from "axios";
import { apiConfig } from "@/config/api";
import { useAuthStore } from "@/stores/auth";

export const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints handle their own 401s (e.g. wrong password on login) — the
// global redirect below must not hijack them, or the page can never show the error.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/change-password", "/auth/complete-initial-password"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl: string = error.config?.url ?? "";
    const isAuthRequest = AUTH_ENDPOINTS.some((path) => requestUrl.includes(path));
    if (error.response?.status === 401 && !isAuthRequest) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
