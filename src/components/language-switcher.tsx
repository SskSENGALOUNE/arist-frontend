"use client";

import { GB, LA } from "country-flag-icons/react/3x2";
import { locales, useLocaleStore, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const FLAGS: Record<Locale, typeof GB> = {
  en: GB,
  lo: LA,
};

export function LanguageSwitcher({
  variant = "icon",
}: {
  variant?: "icon" | "compact";
}) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const current = locales.find((l) => l.value === locale) ?? locales[0];
  const next = locales.find((l) => l.value !== locale) ?? locales[0];

  const Flag = FLAGS[current.value];

  return (
    <Button
      variant="ghost"
      size={variant === "icon" ? "icon-sm" : "sm"}
      onClick={() => setLocale(next.value)}
      aria-label={`Switch language to ${next.label}`}
      title={`${current.label} → ${next.label}`}
    >
      <Flag className="h-3.5 w-auto rounded-[2px]" />
      {variant === "compact" && <span>{current.label}</span>}
    </Button>
  );
}
