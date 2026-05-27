export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  timeout: 15000,
} as const;
