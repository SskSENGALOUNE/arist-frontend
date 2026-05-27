"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function Home() {
  const t = useT();
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{t.landing.title}</h1>
      <p className="text-muted-foreground">{t.landing.subtitle}</p>
      <Link
        href="/login"
        className="mt-2 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t.landing.signIn}
      </Link>
    </div>
  );
}
