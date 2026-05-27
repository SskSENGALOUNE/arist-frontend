"use client";

import { Languages, Check } from "lucide-react";
import { locales, useLocaleStore, type Locale } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher({
  variant = "icon",
}: {
  variant?: "icon" | "compact";
}) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const current = locales.find((l) => l.value === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          variant === "icon" ? (
            <Button variant="ghost" size="icon-sm" aria-label="Language">
              <Languages />
            </Button>
          ) : (
            <Button variant="ghost" size="sm">
              <Languages />
              <span>{current?.label}</span>
            </Button>
          )
        }
      />
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-36">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.value}
            onClick={() => setLocale(l.value as Locale)}
            className="justify-between"
          >
            <span>{l.label}</span>
            {locale === l.value && (
              <Check className="size-4 text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
