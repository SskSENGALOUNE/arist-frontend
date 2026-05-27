import { api } from "./api";
import type { LoginResponse, BaseApiResponse } from "@/types";
import type { EmployeeUser } from "./employee";

interface LoginRequest {
  username: string;
  password: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<BaseApiResponse<LoginResponse>>(
      "/auth/login",
      data,
    );
    return response.data.data!;
  },

  me: async (): Promise<EmployeeUser> => {
    const response = await api.get<BaseApiResponse<EmployeeUser>>("/auth/me");
    return response.data.data!;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", { refreshToken });
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post("/auth/change-password", data);
  },

  completeInitialPassword: async (newPassword: string): Promise<void> => {
    await api.post("/auth/complete-initial-password", { newPassword });
  },
};
