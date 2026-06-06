"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { useLocaleStore } from "@/lib/i18n";
import { useSettingsStore } from "@/stores/settings";
import { useSiteSettings } from "@/hooks/use-site-settings";

const BRAND_VARS = ["--primary", "--ring", "--sidebar", "--sidebar-primary", "--sidebar-accent", "--sidebar-border"] as const;

export function applyPrimaryColor(hex: string | null) {
  const root = document.documentElement;
  if (hex) {
    root.style.setProperty("--primary", hex);
    root.style.setProperty("--ring", hex);
    root.style.setProperty("--sidebar",         `color-mix(in oklch, ${hex} 55%, #030712)`);
    root.style.setProperty("--sidebar-primary",  `color-mix(in oklch, ${hex} 35%, #030712)`);
    root.style.setProperty("--sidebar-accent",   `color-mix(in oklch, ${hex} 45%, #030712)`);
    root.style.setProperty("--sidebar-border",   `color-mix(in oklch, ${hex} 30%, transparent)`);
  } else {
    BRAND_VARS.forEach((v) => root.style.removeProperty(v));
  }
}

export function StoreHydrator() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateLocale = useLocaleStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const { data: site } = useSiteSettings();

  useEffect(() => {
    hydrateAuth();
    hydrateLocale();
    hydrateSettings();
  }, [hydrateAuth, hydrateLocale, hydrateSettings]);

  useEffect(() => {
    applyPrimaryColor(site?.primaryColor ?? null);
  }, [site?.primaryColor]);

  return null;
}
