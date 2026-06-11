"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plane,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useT } from "@/lib/i18n";
<<<<<<< Updated upstream
import { buttonVariants } from "@/components/ui/button";
=======
import { LanguageSwitcher } from "@/components/language-switcher";
>>>>>>> Stashed changes
import { useSiteSettings } from "@/hooks/use-site-settings";
import { buildSocialLinks } from "@/components/social-icons";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const t = useT();

  const features: Feature[] = [
    {
      icon: Users,
      title: t.landing.feature1Title,
      desc: t.landing.feature1Desc,
      iconGradient: "from-sky-500 to-cyan-500",
      iconShadow: "shadow-cyan-500/30",
      glow: "bg-cyan-500/30",
      hoverBorder: "hover:border-sky-500/35",
      sweep:
        "bg-[linear-gradient(90deg,transparent,var(--color-sky-500),var(--color-cyan-500),transparent)]",
    },
    {
      icon: Plane,
      title: t.landing.feature2Title,
      desc: t.landing.feature2Desc,
      iconGradient: "from-blue-500 to-sky-500",
      iconShadow: "shadow-blue-500/30",
      glow: "bg-blue-500/30",
      hoverBorder: "hover:border-blue-500/35",
      sweep:
        "bg-[linear-gradient(90deg,transparent,var(--color-blue-500),var(--color-sky-500),transparent)]",
    },
    {
      icon: ShieldCheck,
      title: t.landing.feature3Title,
      desc: t.landing.feature3Desc,
      iconGradient: "from-cyan-500 to-indigo-500",
      iconShadow: "shadow-indigo-500/30",
      glow: "bg-indigo-500/30",
      hoverBorder: "hover:border-cyan-500/35",
      sweep:
        "bg-[linear-gradient(90deg,transparent,var(--color-cyan-500),var(--color-indigo-500),transparent)]",
    },
  ];

  return (
<<<<<<< Updated upstream
    <>
      <style>{KEYFRAMES}</style>
      <div
        id="top"
        className="flex min-h-screen flex-col"
        style={{ background: "#030712", color: "#e2e8f0", fontFamily: "var(--font-noto-sans-lao), system-ui, sans-serif" }}
      >
        <NavBar t={t} />
=======
    <div
      id="top"
      className="flex min-h-screen flex-col bg-gray-950 text-slate-200 [font-family:system-ui,sans-serif]"
    >
      <NavBar t={t} />
>>>>>>> Stashed changes

      <main className="flex flex-1 flex-col">
        <HeroSection t={t} />
        <StatsStrip t={t} />
        <FeaturesSection features={features} t={t} />
      </main>

      <SiteFooter t={t} />
    </div>
  );
}

type T = ReturnType<typeof useT>;
type Feature = {
  icon: React.ElementType;
  title: string;
  desc: string;
  iconGradient: string;
  iconShadow: string;
  glow: string;
  hoverBorder: string;
  sweep: string;
};

/* ═══════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════ */
function NavBar({ t }: { t: T }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: site } = useSiteSettings();
  const brandName = site?.brandName?.trim() || t.landing.brand;
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Center menu — Home scrolls to top; the rest are placeholders to point at
  // real sections/pages once they exist.
  const navItems = [
    { label: t.landing.navHome, href: "#top", active: true },
    { label: t.landing.navCompany, href: "#features", active: false },
    { label: t.landing.navManagement, href: "#features", active: false },
    { label: t.landing.navMedia, href: "#", active: false },
    { label: t.landing.navCareer, href: "#", active: false },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-gray-950/75 backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="#top" className="flex shrink-0 items-center gap-2.5">
          <div
            className={cn(
              "flex size-9 items-center justify-center overflow-hidden rounded-[11px]",
              !site?.logoUrl &&
                "bg-gradient-to-br from-sky-500 to-cyan-500 shadow-[0_0_16px] shadow-cyan-500/50",
            )}
          >
            {site?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={site.logoUrl}
                alt={brandName}
                className="size-full object-contain"
              />
            ) : (
              <Briefcase className="size-[18px] text-white" />
            )}
          </div>
          <span className="text-[17px] font-bold text-slate-100">
            {brandName}
          </span>
        </Link>

        {/* Right capsule: nav + search + Get In Touch */}
        <div className="flex items-center gap-1.5 rounded-full border border-slate-400/20 bg-slate-900/55 p-1.5 backdrop-blur-md">
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors hover:text-cyan-300",
                  item.active
                    ? "border-slate-400/45 text-slate-50"
                    : "border-transparent text-slate-300",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

<<<<<<< Updated upstream
=======
          <div className="mx-1 hidden h-6 w-px bg-slate-400/25 lg:block" />

          <LanguageSwitcher />

>>>>>>> Stashed changes
          <button
            type="button"
            aria-label={t.landing.searchLabel}
            className="hidden size-10 items-center justify-center rounded-full border border-slate-400/30 text-slate-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-300 sm:inline-flex"
          >
            <Search className="size-[17px]" />
          </button>

          <Link
            href="/login"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-br from-sky-600 to-cyan-500 px-4 text-sm font-semibold text-white shadow-[0_0_18px] shadow-cyan-500/35 transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_28px] hover:shadow-cyan-500/60 sm:px-5"
          >
            <Phone className="size-[15px]" />
            <span className="hidden sm:inline">{t.landing.getInTouch}</span>
          </Link>

          <button
            type="button"
            aria-label={t.landing.navHome}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-slate-400/30 text-slate-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-300 lg:hidden"
          >
            {menuOpen ? (
              <X className="size-[17px]" />
            ) : (
              <Menu className="size-[17px]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-cyan-500/10 bg-gray-950/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-cyan-500/10 hover:text-cyan-300",
                    item.active ? "text-slate-50" : "text-slate-300",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════ */
function HeroSection({ t }: { t: T }) {
  return (
    <section className="relative flex items-center overflow-hidden border-b border-cyan-500/10 lg:min-h-[90vh]">
      {/* ── BG orbs ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-[10%] left-[20%] size-[600px] animate-[orb1_12s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_70%)]" />
        <div className="absolute -bottom-[5%] right-[10%] size-[500px] animate-[orb2_15s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
        <div className="absolute -left-[5%] top-[40%] size-[400px] animate-[orb3_10s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.08)_0%,transparent_70%)]" />
        {/* grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* scan line */}
        <div className="absolute inset-x-0 h-px animate-[scanLine_8s_linear_infinite] bg-[linear-gradient(90deg,transparent,rgba(6,182,212,0.3),transparent)] opacity-50" />
        {/* top shimmer */}
        <div className="absolute inset-x-0 top-0 h-px animate-[borderGlow_3s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(6,182,212,0.6),rgba(59,130,246,0.4),transparent)]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
        {/* Left copy */}
        <div className="flex flex-col items-start">
          {/* Badge */}
          <span className="mb-5 inline-flex animate-[fadeInDown_0.6s_ease_both] items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-3.5 py-[5px] text-xs font-medium text-cyan-300">
            <span className="relative inline-flex size-2">
              <span className="absolute inset-0 animate-[landingPing_1.5s_ease-in-out_infinite] rounded-full bg-cyan-500 opacity-75" />
              <span className="relative size-2 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500" />
            </span>
            {t.landing.heroBadge}
          </span>

          {/* H1 */}
          <h1 className="m-0 animate-[fadeInUp_0.7s_ease_both,gradientShift_6s_ease_infinite] bg-[linear-gradient(135deg,var(--color-sky-100)_0%,var(--color-sky-300)_35%,var(--color-cyan-500)_65%,var(--color-blue-500)_100%)] bg-[length:200%_200%] bg-clip-text text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-transparent">
            {t.landing.heroTitle}
          </h1>

          <p className="mt-5 max-w-md animate-[fadeInUp_0.85s_ease_both] text-base leading-[1.75] text-slate-400">
            {t.landing.heroSubtitle}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex animate-[fadeInUp_1s_ease_both] flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex h-[46px] items-center gap-2 rounded-[10px] bg-gradient-to-br from-sky-600 to-cyan-500 px-7 text-sm font-semibold text-white shadow-[0_0_30px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(6,182,212,0.65),inset_0_1px_0_rgba(255,255,255,0.2)]"
            >
              {t.landing.getStarted}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-[46px] items-center rounded-[10px] border border-white/10 bg-white/5 px-7 text-sm font-medium text-slate-400 backdrop-blur-md transition-colors duration-200 hover:border-cyan-500/40 hover:text-slate-200"
            >
              {t.landing.signIn}
            </Link>
          </div>

          {/* Trust */}
          <TrustRow t={t} />
        </div>

        {/* Right mockup */}
        <HeroMockup t={t} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRUST ROW
═══════════════════════════════════════════════════════════════ */
function TrustRow({ t }: { t: T }) {
  const grads = [
    "from-sky-500 to-cyan-500",
    "from-blue-500 to-sky-500",
    "from-indigo-500 to-blue-500",
  ];
  return (
    <div className="mt-9 flex animate-[fadeIn_1.2s_ease_both] items-center gap-3.5">
      <div className="flex">
        {grads.map((g, i) => (
          <div
            key={i}
            className={cn(
              "flex size-8 items-center justify-center rounded-full border-2 border-gray-950 bg-gradient-to-br text-xs font-semibold text-white shadow-[0_0_10px] shadow-cyan-500/30",
              g,
              i > 0 && "-ml-2.5",
            )}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      <p className="m-0 text-xs text-slate-500">
        <span className="font-semibold text-slate-200">500+</span>{" "}
        {t.landing.mockEmployees}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO MOCKUP
═══════════════════════════════════════════════════════════════ */
function HeroMockup({ t }: { t: T }) {
  const stats = [
    {
      label: t.landing.mockEmployees,
      value: "248",
      icon: Users,
      iconClass: "text-sky-500",
    },
    {
      label: t.landing.mockTrips,
      value: "17",
      icon: Plane,
      iconClass: "text-cyan-500",
    },
    {
      label: t.landing.mockPending,
      value: "4",
      icon: ShieldCheck,
      iconClass: "text-blue-500",
    },
  ];
  const bars = [40, 65, 50, 80, 60, 90, 72];

  return (
    <div className="relative animate-[slideInRight_0.8s_ease_both,float_7s_ease-in-out_1s_infinite]">
      {/* outer glow halo */}
      <div className="pointer-events-none absolute -inset-6 rounded-[32px] bg-[radial-gradient(ellipse,rgba(6,182,212,0.15)_0%,transparent_70%)]" />
      {/* border glow */}
      <div className="absolute -inset-px -z-10 animate-[borderGlow_3s_ease-in-out_infinite] rounded-[20px] bg-[linear-gradient(135deg,rgba(6,182,212,0.4),rgba(59,130,246,0.2),rgba(6,182,212,0.1))]" />

      <div className="overflow-hidden rounded-[18px] border border-cyan-500/15 bg-slate-900/85 shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(6,182,212,0.08)] backdrop-blur-xl">
        {/* Chrome */}
        <div className="flex items-center gap-1.5 border-b border-cyan-500/10 bg-gray-950/60 px-4 py-2.5">
          <span className="inline-block size-2.5 rounded-full bg-red-400" />
          <span className="inline-block size-2.5 rounded-full bg-amber-400" />
          <span className="inline-block size-2.5 rounded-full bg-green-400" />
          <div className="ml-2.5 h-[18px] flex-1 rounded-md border border-cyan-500/10 bg-white/5" />
        </div>

        <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[60px_1fr]">
          {/* Sidebar */}
          <div className="flex flex-col items-center gap-3 border-r border-cyan-500/10 bg-gray-950/40 py-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 shadow-[0_0_12px] shadow-cyan-500/50">
              <Briefcase className="size-3.5 text-white" />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-[26px] w-7 rounded-md border",
                  i === 1
                    ? "border-cyan-500/30 bg-cyan-500/15"
                    : "border-transparent bg-white/5",
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="cursor-default rounded-[10px] border border-cyan-500/10 bg-cyan-500/5 p-2.5 backdrop-blur-sm transition-colors hover:border-cyan-500/35"
                >
                  <s.icon className={cn("size-3.5", s.iconClass)} />
                  <div className="mt-1.5 text-lg font-bold leading-none text-slate-100">
                    {s.value}
                  </div>
                  <div className="mt-1 truncate text-[9px] text-slate-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="rounded-[10px] border border-cyan-500/10 bg-gray-950/50 p-3">
              <div className="mb-2.5 h-2 w-20 rounded bg-white/5" />
              <div className="flex h-[72px] items-end gap-1">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 origin-bottom animate-[barRise_0.7s_ease_both] rounded-t-[3px] bg-gradient-to-t from-sky-600 to-cyan-500 shadow-[0_0_8px] shadow-cyan-500/40 transition-[filter] hover:brightness-[1.4]"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${300 + i * 80}ms`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Rows */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-lg border border-cyan-500/8 bg-cyan-500/3 px-2.5 py-2 transition-colors hover:border-cyan-500/25 hover:bg-cyan-500/7"
              >
                <div className="size-6 shrink-0 rounded-full bg-gradient-to-br from-sky-500/30 to-cyan-500/30" />
                <div className="flex-1">
                  <div
                    className="h-1.5 w-2/5 animate-[shimmer_2.5s_ease-in-out_infinite] rounded-[3px] bg-[linear-gradient(90deg,rgba(6,182,212,0.3)_25%,rgba(6,182,212,0.1)_50%,rgba(6,182,212,0.3)_75%)] bg-[length:200%_100%]"
                    style={{ animationDelay: `${i * 250}ms` }}
                  />
                  <div className="mt-1 h-[5px] w-[28%] rounded-[3px] bg-white/5" />
                </div>
                <div className="flex h-[18px] w-11 items-center justify-center rounded-full border border-green-500/25 bg-green-500/15 text-[9px] text-green-400">
                  ACTIVE
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATS STRIP
═══════════════════════════════════════════════════════════════ */
function StatsStrip({ t }: { t: T }) {
  const stats = [
    {
      value: "248",
      suffix: "+",
      label: t.landing.mockEmployees,
      icon: Users,
      iconClass: "text-sky-500",
    },
    {
      value: "17",
      suffix: "",
      label: t.landing.mockTrips,
      icon: Plane,
      iconClass: "text-cyan-500",
    },
    {
      value: "99",
      suffix: "%",
      label: t.landing.mockPending,
      icon: ShieldCheck,
      iconClass: "text-blue-500",
    },
  ];
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="border-b border-cyan-500/10 bg-gray-950/80 backdrop-blur-md"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-3 px-4 sm:px-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-6 transition-all duration-[550ms] ease-out sm:px-4 sm:py-7",
              i < 2 && "border-r border-cyan-500/10",
              vis ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
            )}
            style={{ transitionDelay: `${i * 130}ms` }}
          >
            <s.icon
              className={cn(
                "mb-1 size-5 drop-shadow-[0_0_6px_currentColor]",
                s.iconClass,
              )}
            />
            <span className="text-2xl font-extrabold leading-none text-slate-100 tabular-nums sm:text-[28px]">
              {s.value}
              <span className="text-lg">{s.suffix}</span>
            </span>
            <span className="text-center text-xs text-slate-500">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════ */
function FeaturesSection({ features, t }: { features: Feature[]; t: T }) {
  return (
    <section id="features" className="scroll-mt-20 bg-gray-950/95">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
          <h2 className="m-0 text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.02em] text-slate-100">
            {t.landing.featuresTitle}
          </h2>
          <p className="mt-3 text-sm leading-[1.7] text-slate-500">
            {t.landing.featuresSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {features.map((f, i) => (
            <RevealCard key={f.title} delay={i * 130}>
              <FeatureCard f={f} />
            </RevealCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ f }: { f: Feature }) {
  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-cyan-500/10 bg-slate-900/70 px-6 py-7 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1.5 hover:bg-cyan-500/5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]",
        f.hoverBorder,
      )}
    >
      {/* top sweep line */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          f.sweep,
        )}
      />
      {/* bottom glow */}
      <div
        className={cn(
          "absolute -bottom-6 left-1/2 h-10 w-30 -translate-x-1/2 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100",
          f.glow,
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "mb-5 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-[0_0_20px] transition-transform duration-300 group-hover:rotate-2 group-hover:scale-110",
          f.iconGradient,
          f.iconShadow,
        )}
      >
        <f.icon className="size-[22px] text-white" />
      </div>

      <h3 className="m-0 mb-2 text-[15px] font-semibold text-slate-100">
        {f.title}
      </h3>
      <p className="m-0 text-[13px] leading-[1.7] text-slate-500">{f.desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REVEAL WRAPPER
═══════════════════════════════════════════════════════════════ */
function RevealCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.12 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={cn(
        "h-full transition-all duration-600 ease-out",
        vis ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════ */
const FOOTER_COL_TITLE =
  "mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400";
const FOOTER_LINK =
  "text-[13px] text-slate-600 no-underline transition-colors hover:text-sky-300";

function SiteFooter({ t }: { t: T }) {
  const { data: site } = useSiteSettings();
  const brandName = site?.brandName?.trim() || t.landing.brand;
  const tagline = site?.description?.trim() || t.landing.footerTagline;
  const socials = buildSocialLinks(site);
  const footerLinks = site?.footerLinks ?? [];
  const linksHeading = site?.linksHeading?.trim() || t.footer.linksHeading;
  const hasContact = Boolean(
    site?.contactPhone || site?.contactEmail || site?.contactAddress,
  );

  // Marketing columns are the fallback shown only until footer links / contact
  // are configured in /admin/settings.
  const marketingColumns = [
    {
      title: t.landing.footerProduct,
      links: [
        t.landing.linkFeatures,
        t.landing.linkBusinessTrips,
        t.landing.linkEmployees,
      ],
    },
    {
      title: t.landing.footerCompany,
      links: [t.landing.linkAbout, t.landing.linkContact],
    },
    {
      title: t.landing.footerLegal,
      links: [t.landing.linkPrivacy, t.landing.linkTerms],
    },
  ];
  const useFallback = footerLinks.length === 0 && !hasContact;

  return (
    <footer className="border-t border-cyan-500/10 bg-gray-950/98 backdrop-blur-lg">
      {/* shimmer top */}
      <div className="h-px animate-[borderGlow_4s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(6,182,212,0.4),rgba(59,130,246,0.3),transparent)]" />
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-14">
        <div className="flex flex-wrap gap-10">
          {/* Brand */}
          <div className="w-full md:w-auto md:min-w-[220px] md:flex-[1.5]">
            <div className="mb-4 flex items-center gap-2.5">
              <div
                className={cn(
                  "flex size-8 items-center justify-center overflow-hidden rounded-[9px]",
                  !site?.logoUrl &&
                    "bg-gradient-to-br from-sky-500 to-cyan-500 shadow-[0_0_14px] shadow-cyan-500/40",
                )}
              >
                {site?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={site.logoUrl}
                    alt={brandName}
                    className="size-full object-contain"
                  />
                ) : (
                  <Briefcase className="size-3.5 text-white" />
                )}
              </div>
              <span className="text-sm font-semibold text-slate-100">
                {brandName}
              </span>
            </div>
            <p className="max-w-60 text-[13px] leading-[1.7] text-slate-600">
              {tagline}
            </p>
            {socials.length > 0 && (
              <div className="mt-4 flex gap-3.5">
                {socials.map(({ url, Icon, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex text-slate-500 transition-colors hover:text-cyan-300"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Fallback marketing columns — only until Site Settings are filled in */}
          {useFallback &&
            marketingColumns.map((col) => (
              <div key={col.title} className="min-w-[140px] flex-1">
                <h3 className={FOOTER_COL_TITLE}>{col.title}</h3>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="/login" className={FOOTER_LINK}>
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          {/* Configured footer links (from /admin/settings) */}
          {!useFallback && footerLinks.length > 0 && (
            <div className="min-w-[140px] flex-1">
              <h3 className={FOOTER_COL_TITLE}>{linksHeading}</h3>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {footerLinks.map((link, i) => (
                  <li key={`${link.url}-${i}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={FOOTER_LINK}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Configured contact info (from /admin/settings) */}
          {!useFallback && hasContact && (
            <div className="min-w-[180px] flex-1">
              <h3 className={FOOTER_COL_TITLE}>{t.footer.contactHeading}</h3>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {site?.contactPhone && (
                  <li className="flex items-center gap-2">
                    <Phone className="size-[15px] shrink-0 text-cyan-500" />
                    <a
                      href={`tel:${site.contactPhone}`}
                      className="text-[13px] text-slate-400 no-underline"
                    >
                      {site.contactPhone}
                    </a>
                  </li>
                )}
                {site?.contactEmail && (
                  <li className="flex items-center gap-2">
                    <Mail className="size-[15px] shrink-0 text-cyan-500" />
                    <a
                      href={`mailto:${site.contactEmail}`}
                      className="text-[13px] text-slate-400 no-underline"
                    >
                      {site.contactEmail}
                    </a>
                  </li>
                )}
                {site?.contactAddress && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-[15px] shrink-0 text-cyan-500" />
                    <span className="whitespace-pre-line text-[13px] text-slate-400">
                      {site.contactAddress}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-500/10 pt-6">
          <span className="text-xs text-slate-700">
            {site?.footerText?.trim() ||
              `© ${new Date().getFullYear()} ${t.landing.footer}`}
          </span>
          <span className="text-xs text-slate-700">
            {t.landing.footerRights}
          </span>
        </div>
      </div>
    </footer>
  );
}
