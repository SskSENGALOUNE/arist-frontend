import { api } from "./api";
import type { BaseApiResponse } from "@/types";

export interface EmployeeUser {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  isActive: boolean;
  firstName: string;
  lastName: string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  photoUrl: string | null;
  gender: string | null;
  educationLevel: string | null;
  institutionName: string | null;
  graduatedFrom: string | null;
  graduatedCountry: string | null;
  fieldOfStudy: string | null;
  englishLevel: string | null;
  vietnameseLevel: string | null;
  chineseLevel: string | null;
  otherLanguages: string | null;
  passportExpiry: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUsers {
  items: EmployeeUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: "ADMIN" | "EMPLOYEE";
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateEmployeeData {
  username: string;
  email: string;
  password: string;
  role: "ADMIN" | "EMPLOYEE";
  firstName: string;
  lastName: string;
}

export interface UpdateEmployeeData {
  email?: string;
  role?: "ADMIN" | "EMPLOYEE";
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
}

export const employeeService = {
  list: async (params?: ListUsersParams): Promise<PaginatedUsers> => {
    const response = await api.get<BaseApiResponse<PaginatedUsers>>(
      "/admin/users",
      { params },
    );
    return response.data.data!;
  },

  getById: async (id: string): Promise<EmployeeUser> => {
    const response = await api.get<BaseApiResponse<EmployeeUser>>(
      `/admin/users/${id}`,
    );
    return response.data.data!;
  },

  create: async (data: CreateEmployeeData): Promise<EmployeeUser> => {
    const response = await api.post<BaseApiResponse<EmployeeUser>>(
      "/admin/users",
      data,
    );
    return response.data.data!;
  },

  update: async (
    id: string,
    data: UpdateEmployeeData,
  ): Promise<EmployeeUser> => {
    const response = await api.patch<BaseApiResponse<EmployeeUser>>(
      `/admin/users/${id}`,
      data,
    );
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await api.post(`/admin/users/${id}/reset-password`, { newPassword });
  },
};
