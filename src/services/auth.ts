import { api } from "./api";
import type { User } from "@/types";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};
