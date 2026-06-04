import { api } from "./api";
import type { BaseApiResponse } from "@/types";
import type { SiteSetting, UpdateSiteSettingData } from "@/types/site-setting";

export const siteSettingService = {
  /** Public — logo + footer content for any visitor (no auth required). */
  get: async (): Promise<SiteSetting> => {
    const response =
      await api.get<BaseApiResponse<SiteSetting>>("/site-settings");
    return response.data.data!;
  },
};

export const adminSiteSettingService = {
  get: async (): Promise<SiteSetting> => {
    const response = await api.get<BaseApiResponse<SiteSetting>>(
      "/admin/site-settings",
    );
    return response.data.data!;
  },

  update: async (data: UpdateSiteSettingData): Promise<SiteSetting> => {
    const response = await api.patch<BaseApiResponse<SiteSetting>>(
      "/admin/site-settings",
      data,
    );
    return response.data.data!;
  },

  uploadLogo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<BaseApiResponse<{ url: string }>>(
      "/admin/site-settings/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data!.url;
  },
};
