"use client";

import { useQuery } from "@tanstack/react-query";
import { siteSettingService } from "@/services/site-setting";

export const SITE_SETTINGS_QUERY_KEY = ["site-settings"] as const;

/**
 * Fetches the public site settings (logo + footer). Used by the Footer and the
 * branding in layouts/login. Cached aggressively since it changes rarely.
 */
export function useSiteSettings() {
  return useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: siteSettingService.get,
    staleTime: 5 * 60 * 1000,
  });
}
