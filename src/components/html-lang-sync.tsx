"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { useLocaleStore } from "@/lib/i18n";
import { useSettingsStore } from "@/stores/settings";

export function StoreHydrator() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateLocale = useLocaleStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
    hydrateLocale();
    hydrateSettings();
  }, [hydrateAuth, hydrateLocale, hydrateSettings]);

  return null;
}
