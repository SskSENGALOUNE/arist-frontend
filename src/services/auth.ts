import { api } from "./api";
import type { User, LoginResponse, BaseApiResponse } from "@/types";

interface LoginRequest {
  username: string;
  password: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<BaseApiResponse<LoginResponse>>(
      "/auth/login",
      data,
    );
    return response.data.data!;
  },

  me: async (): Promise<User> => {
    const response = await api.get<BaseApiResponse<User>>("/auth/me");
    return response.data.data!;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", { refreshToken });
  },
};
