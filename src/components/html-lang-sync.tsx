"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { useLocaleStore } from "@/lib/i18n";

export function StoreHydrator() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateLocale = useLocaleStore((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
    hydrateLocale();
  }, [hydrateAuth, hydrateLocale]);

  return null;
}
