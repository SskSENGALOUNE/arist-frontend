import { api } from "./api";
import type { BaseApiResponse } from "@/types";
import type {
  Position,
  CreatePositionData,
  UpdatePositionData,
} from "@/types/position";

export const positionService = {
  list: async (activeOnly?: boolean): Promise<Position[]> => {
    const response = await api.get<BaseApiResponse<Position[]>>(
      "/admin/positions",
      { params: activeOnly ? { activeOnly: "true" } : undefined },
    );
    return response.data.data!;
  },

  create: async (data: CreatePositionData): Promise<Position> => {
    const response = await api.post<BaseApiResponse<Position>>(
      "/admin/positions",
      data,
    );
    return response.data.data!;
  },

  update: async (id: string, data: UpdatePositionData): Promise<Position> => {
    const response = await api.patch<BaseApiResponse<Position>>(
      `/admin/positions/${id}`,
      data,
    );
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/positions/${id}`);
  },
};
