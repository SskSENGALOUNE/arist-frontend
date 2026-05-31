import { api } from "./api";
import type { BaseApiResponse } from "@/types";
import type {
  Department,
  CreateDepartmentData,
  UpdateDepartmentData,
} from "@/types/department";

export const departmentService = {
  list: async (activeOnly?: boolean): Promise<Department[]> => {
    const response = await api.get<BaseApiResponse<Department[]>>(
      "/admin/departments",
      { params: activeOnly ? { activeOnly: "true" } : undefined },
    );
    return response.data.data!;
  },

  create: async (data: CreateDepartmentData): Promise<Department> => {
    const response = await api.post<BaseApiResponse<Department>>(
      "/admin/departments",
      data,
    );
    return response.data.data!;
  },

  update: async (id: string, data: UpdateDepartmentData): Promise<Department> => {
    const response = await api.patch<BaseApiResponse<Department>>(
      `/admin/departments/${id}`,
      data,
    );
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/departments/${id}`);
  },
};
