import { api } from "./api";
import type { BaseApiResponse } from "@/types";
import type {
  Banner,
  CreateBannerData,
  UpdateBannerData,
  ListBannersParams,
  PaginatedBanners,
} from "@/types/banner";

interface CreateBannerResponse {
  id: string;
}

export const adminBannerService = {
  list: async (params?: ListBannersParams): Promise<PaginatedBanners> => {
    const response = await api.get<BaseApiResponse<PaginatedBanners>>(
      "/admin/banners",
      { params },
    );
    return response.data.data!;
  },

  getById: async (id: string): Promise<Banner> => {
    const response = await api.get<BaseApiResponse<Banner>>(
      `/admin/banners/${id}`,
    );
    return response.data.data!;
  },

  create: async (data: CreateBannerData): Promise<CreateBannerResponse> => {
    const response = await api.post<BaseApiResponse<CreateBannerResponse>>(
      "/admin/banners",
      data,
    );
    return response.data.data!;
  },

  update: async (id: string, data: UpdateBannerData): Promise<Banner> => {
    const response = await api.patch<BaseApiResponse<Banner>>(
      `/admin/banners/${id}`,
      data,
    );
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/banners/${id}`);
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<BaseApiResponse<{ url: string }>>(
      "/admin/banners/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data!.url;
  },
};

export const bannerService = {
  listActive: async (): Promise<Banner[]> => {
    const response = await api.get<BaseApiResponse<Banner[]>>("/banners");
    return response.data.data!;
  },
};
