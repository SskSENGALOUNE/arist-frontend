"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Mail,
  MapPin,
  Phone,
  Plane,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { buildSocialLinks } from "@/components/social-icons";
import { useEffect, useRef, useState } from "react";

/* ─── Global keyframes injected once ─────────────────────────── */
const KEYFRAMES = `
  @keyframes fadeInDown {
    from { opacity:0; transform:translateY(-18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; } to { opacity:1; }
  }
  @keyframes slideInRight {
    from { opacity:0; transform:translateX(36px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes float {
    0%,100% { transform:translateY(0px) rotate(0deg); }
    33%      { transform:translateY(-10px) rotate(0.5deg); }
    66%      { transform:translateY(-5px) rotate(-0.5deg); }
  }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes orb1 {
    0%,100% { transform:translate(0,0) scale(1); }
    50%      { transform:translate(40px,-30px) scale(1.15); }
  }
  @keyframes orb2 {
    0%,100% { transform:translate(0,0) scale(1); }
    50%      { transform:translate(-30px,20px) scale(1.1); }
  }
  @keyframes orb3 {
    0%,100% { transform:translate(0,0) scale(1); }
    50%      { transform:translate(20px,40px) scale(1.08); }
  }
  @keyframes scanLine {
    0%   { transform:translateY(-100%); }
    100% { transform:translateY(100vh); }
  }
  @keyframes borderGlow {
    0%,100% { opacity:0.4; }
    50%      { opacity:1; }
  }
  @keyframes barRise {
    from { transform:scaleY(0); }
    to   { transform:scaleY(1); }
  }
  @keyframes ping {
    75%,100% { transform:scale(2); opacity:0; }
  }
  @keyframes pulseRing {
    0%   { box-shadow:0 0 0 0 rgba(6,182,212,0.5); }
    70%  { box-shadow:0 0 0 10px rgba(6,182,212,0); }
    100% { box-shadow:0 0 0 0 rgba(6,182,212,0); }
  }
  @keyframes gradientShift {
    0%,100% { background-position:0% 50%; }
    50%      { background-position:100% 50%; }
  }
`;

export default function Home() {
  const t = useT();

  const features = [
    {
      icon: Users,
      title: t.landing.feature1Title,
      desc: t.landing.feature1Desc,
      from: "#0ea5e9",
      to: "#06b6d4",
      glow: "rgba(6,182,212,0.3)",
    },
    {
      icon: Plane,
      title: t.landing.feature2Title,
      desc: t.landing.feature2Desc,
      from: "#3b82f6",
      to: "#0ea5e9",
      glow: "rgba(59,130,246,0.3)",
    },
    {
      icon: ShieldCheck,
      title: t.landing.feature3Title,
      desc: t.landing.feature3Desc,
      from: "#06b6d4",
      to: "#6366f1",
      glow: "rgba(99,102,241,0.3)",
    },
  ];

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        id="top"
        className="flex min-h-screen flex-col"
        style={{ background: "#030712", color: "#e2e8f0", fontFamily: "var(--font-noto-sans-lao), system-ui, sans-serif" }}
      >
        <NavBar t={t} />

        <main className="flex flex-1 flex-col">
          {/* ── Hero ── */}
          <HeroSection t={t} />

          {/* ── Stats ── */}
          <StatsStrip t={t} />

          {/* ── Features ── */}
          <FeaturesSection features={features} t={t} />
        </main>

        <SiteFooter t={t} />
      </div>
    </>
  );
}

type T = ReturnType<typeof useT>;
type Feature = {
  icon: React.ElementType;
  title: string;
  desc: string;
  from: string;
  to: string;
  glow: string;
};

/* ═══════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════ */
function NavBar({ t }: { t: T }) {
  const [scrolled, setScrolled] = useState(false);
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
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background 0.4s, backdrop-filter 0.4s",
        background: scrolled ? "rgba(3,7,18,0.75)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          height: 72,
        }}
      >
        {/* Logo */}
        <Link
          href="#top"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              overflow: "hidden",
              background: site?.logoUrl
                ? "transparent"
                : "linear-gradient(135deg,#0ea5e9,#06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: site?.logoUrl ? "none" : "0 0 16px rgba(6,182,212,0.5)",
            }}
          >
            {site?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={site.logoUrl}
                alt={brandName}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Briefcase style={{ width: 18, height: 18, color: "#fff" }} />
            )}
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#f1f5f9" }}>
            {brandName}
          </span>
        </Link>

        {/* Right capsule: nav + search + Get In Touch */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: 6,
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(12px)",
          }}
        >
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  color: item.active ? "#f8fafc" : "#cbd5e1",
                  border: item.active
                    ? "1px solid rgba(148,163,184,0.45)"
                    : "1px solid transparent",
                  transition: "color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "#67e8f9")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = item.active
                    ? "#f8fafc"
                    : "#cbd5e1")
                }
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            aria-label={t.landing.searchLabel}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.3)",
              background: "transparent",
              color: "#cbd5e1",
              cursor: "pointer",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#67e8f9";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(6,182,212,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#cbd5e1";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(148,163,184,0.3)";
            }}
          >
            <Search style={{ width: 17, height: 17 }} />
          </button>

          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 20px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg,#0284c7,#06b6d4)",
              boxShadow: "0 0 18px rgba(6,182,212,0.35)",
              textDecoration: "none",
              transition: "box-shadow 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 28px rgba(6,182,212,0.6)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 18px rgba(6,182,212,0.35)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
            }}
          >
            <Phone style={{ width: 15, height: 15 }} />
            {t.landing.getInTouch}
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════ */
function HeroSection({ t }: { t: T }) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid rgba(6,182,212,0.08)",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* ── BG orbs ── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "20%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(6,182,212,0.12) 0%,transparent 70%)",
            animation: "orb1 12s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-5%",
            right: "10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)",
            animation: "orb2 15s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 70%)",
            animation: "orb3 10s ease-in-out infinite",
          }}
        />
        {/* grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.04) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* scan line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg,transparent,rgba(6,182,212,0.3),transparent)",
            animation: "scanLine 8s linear infinite",
            opacity: 0.5,
          }}
        />
        {/* top shimmer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg,transparent,rgba(6,182,212,0.6),rgba(59,130,246,0.4),transparent)",
            animation: "borderGlow 3s ease-in-out infinite",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1152,
          margin: "0 auto",
          padding: "80px 24px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        {/* Left copy */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {/* Badge */}
          <span
            style={{
              marginBottom: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              borderRadius: 999,
              border: "1px solid rgba(6,182,212,0.3)",
              background: "rgba(6,182,212,0.07)",
              fontSize: 12,
              fontWeight: 500,
              color: "#67e8f9",
              animation: "fadeInDown 0.6s ease both",
            }}
          >
            <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "#06b6d4",
                  animation: "ping 1.5s ease-in-out infinite",
                  opacity: 0.75,
                }}
              />
              <span
                style={{
                  position: "relative",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#0ea5e9,#06b6d4)",
                }}
              />
            </span>
            {t.landing.heroBadge}
          </span>

          {/* H1 */}
          <h1
            style={{
              fontSize: "clamp(2.2rem,4vw,3.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
              background: "linear-gradient(135deg,#e0f2fe 0%,#7dd3fc 35%,#06b6d4 65%,#3b82f6 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "fadeInUp 0.7s ease both, gradientShift 6s ease infinite",
            }}
          >
            {t.landing.heroTitle}
          </h1>

          <p
            style={{
              marginTop: 20,
              fontSize: 16,
              lineHeight: 1.75,
              color: "#94a3b8",
              maxWidth: 480,
              animation: "fadeInUp 0.85s ease both",
            }}
          >
            {t.landing.heroSubtitle}
          </p>

          {/* CTAs */}
          <div
            style={{
              marginTop: 32,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              animation: "fadeInUp 1s ease both",
            }}
          >
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 46,
                padding: "0 28px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                textDecoration: "none",
                background: "linear-gradient(135deg,#0284c7 0%,#06b6d4 100%)",
                boxShadow: "0 0 30px rgba(6,182,212,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.boxShadow =
                  "0 0 50px rgba(6,182,212,0.65), inset 0 1px 0 rgba(255,255,255,0.2)";
                el.style.transform = "translateY(-2px) scale(1.02)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.boxShadow =
                  "0 0 30px rgba(6,182,212,0.4), inset 0 1px 0 rgba(255,255,255,0.15)";
                el.style.transform = "none";
              }}
            >
              {t.landing.getStarted}
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 46,
                padding: "0 28px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                color: "#94a3b8",
                textDecoration: "none",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "rgba(6,182,212,0.4)";
                el.style.color = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "rgba(255,255,255,0.1)";
                el.style.color = "#94a3b8";
              }}
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
    "linear-gradient(135deg,#0ea5e9,#06b6d4)",
    "linear-gradient(135deg,#3b82f6,#0ea5e9)",
    "linear-gradient(135deg,#6366f1,#3b82f6)",
  ];
  return (
    <div
      style={{
        marginTop: 36,
        display: "flex",
        alignItems: "center",
        gap: 14,
        animation: "fadeIn 1.2s ease both",
      }}
    >
      <div style={{ display: "flex" }}>
        {grads.map((g, i) => (
          <div
            key={i}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: g,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              marginLeft: i === 0 ? 0 : -10,
              border: "2px solid #030712",
              boxShadow: "0 0 10px rgba(6,182,212,0.3)",
            }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
        <span style={{ color: "#e2e8f0", fontWeight: 600 }}>500+</span> {t.landing.mockEmployees}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO MOCKUP
═══════════════════════════════════════════════════════════════ */
function HeroMockup({ t }: { t: T }) {
  const stats = [
    { label: t.landing.mockEmployees, value: "248", icon: Users, color: "#0ea5e9" },
    { label: t.landing.mockTrips, value: "17", icon: Plane, color: "#06b6d4" },
    { label: t.landing.mockPending, value: "4", icon: ShieldCheck, color: "#3b82f6" },
  ];
  const bars = [40, 65, 50, 80, 60, 90, 72];

  return (
    <div
      style={{
        position: "relative",
        animation: "slideInRight 0.8s ease both, float 7s ease-in-out 1s infinite",
      }}
    >
      {/* outer glow halo */}
      <div
        style={{
          position: "absolute",
          inset: -24,
          borderRadius: 32,
          background: "radial-gradient(ellipse,rgba(6,182,212,0.15) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* border glow */}
      <div
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: 20,
          background:
            "linear-gradient(135deg,rgba(6,182,212,0.4),rgba(59,130,246,0.2),rgba(6,182,212,0.1))",
          animation: "borderGlow 3s ease-in-out infinite",
          zIndex: -1,
        }}
      />

      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(6,182,212,0.15)",
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.08)",
        }}
      >
        {/* Chrome */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            borderBottom: "1px solid rgba(6,182,212,0.1)",
            background: "rgba(3,7,18,0.6)",
            padding: "10px 16px",
          }}
        >
          {["#f87171", "#fbbf24", "#4ade80"].map((c, i) => (
            <span
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: c,
                display: "inline-block",
              }}
            />
          ))}
          <div
            style={{
              flex: 1,
              height: 18,
              borderRadius: 6,
              background: "rgba(255,255,255,0.05)",
              marginLeft: 10,
              border: "1px solid rgba(6,182,212,0.08)",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr" }}>
          {/* Sidebar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              borderRight: "1px solid rgba(6,182,212,0.1)",
              background: "rgba(3,7,18,0.4)",
              padding: "16px 0",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg,#0ea5e9,#06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 12px rgba(6,182,212,0.5)",
              }}
            >
              <Briefcase style={{ width: 14, height: 14, color: "#fff" }} />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 26,
                  borderRadius: 6,
                  background: i === 1 ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.04)",
                  border: "1px solid " + (i === 1 ? "rgba(6,182,212,0.3)" : "transparent"),
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {stats.map((s, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 10,
                    padding: 10,
                    border: "1px solid rgba(6,182,212,0.12)",
                    background: "rgba(6,182,212,0.05)",
                    backdropFilter: "blur(8px)",
                    transition: "border-color 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.borderColor = `rgba(6,182,212,0.35)`)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(6,182,212,0.12)")
                  }
                >
                  <s.icon style={{ width: 14, height: 14, color: s.color }} />
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#f1f5f9",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 9,
                      color: "#64748b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div
              style={{
                borderRadius: 10,
                border: "1px solid rgba(6,182,212,0.1)",
                background: "rgba(3,7,18,0.5)",
                padding: 12,
              }}
            >
              <div
                style={{
                  height: 8,
                  width: 80,
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.06)",
                  marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 72 }}>
                {bars.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      borderRadius: "3px 3px 0 0",
                      background: `linear-gradient(to top, #0284c7, #06b6d4)`,
                      boxShadow: "0 0 8px rgba(6,182,212,0.4)",
                      height: `${h}%`,
                      transformOrigin: "bottom",
                      animation: `barRise 0.7s ease ${300 + i * 80}ms both`,
                      transition: "filter 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.filter = "brightness(1.4)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.filter = "none")
                    }
                  />
                ))}
              </div>
            </div>

            {/* Rows */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 8,
                  border: "1px solid rgba(6,182,212,0.08)",
                  background: "rgba(6,182,212,0.03)",
                  padding: "8px 10px",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(6,182,212,0.25)";
                  el.style.background = "rgba(6,182,212,0.07)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(6,182,212,0.08)";
                  el.style.background = "rgba(6,182,212,0.03)";
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,rgba(14,165,233,0.3),rgba(6,182,212,0.3))",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: 6,
                      width: "40%",
                      borderRadius: 3,
                      background:
                        "linear-gradient(90deg,rgba(6,182,212,0.3) 25%,rgba(6,182,212,0.1) 50%,rgba(6,182,212,0.3) 75%)",
                      backgroundSize: "200% 100%",
                      animation: `shimmer 2.5s ease-in-out ${i * 250}ms infinite`,
                    }}
                  />
                  <div
                    style={{
                      height: 5,
                      width: "28%",
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.05)",
                      marginTop: 5,
                    }}
                  />
                </div>
                <div
                  style={{
                    height: 18,
                    width: 44,
                    borderRadius: 999,
                    background: "rgba(34,197,94,0.15)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    fontSize: 9,
                    color: "#4ade80",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
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
    { value: "248", suffix: "+", label: t.landing.mockEmployees, icon: Users, color: "#0ea5e9" },
    { value: "17", suffix: "", label: t.landing.mockTrips, icon: Plane, color: "#06b6d4" },
    { value: "99", suffix: "%", label: t.landing.mockPending, icon: ShieldCheck, color: "#3b82f6" },
  ];
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        borderBottom: "1px solid rgba(6,182,212,0.08)",
        background: "rgba(3,7,18,0.8)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "28px 16px",
              borderRight: i < 2 ? "1px solid rgba(6,182,212,0.08)" : "none",
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.55s ease ${i * 130}ms, transform 0.55s ease ${i * 130}ms`,
            }}
          >
            <s.icon
              style={{
                width: 20,
                height: 20,
                color: s.color,
                marginBottom: 4,
                filter: `drop-shadow(0 0 6px ${s.color})`,
              }}
            />
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#f1f5f9",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {s.value}
              <span style={{ fontSize: 18 }}>{s.suffix}</span>
            </span>
            <span style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>{s.label}</span>
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
    <section id="features" style={{ background: "rgba(3,7,18,0.95)", scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "96px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 56px" }}>
          <h2
            style={{
              fontSize: "clamp(1.6rem,3vw,2.2rem)",
              fontWeight: 700,
              color: "#f1f5f9",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {t.landing.featuresTitle}
          </h2>
          <p style={{ marginTop: 12, fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>
            {t.landing.featuresSubtitle}
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
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
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        borderRadius: 16,
        padding: "28px 24px",
        border: `1px solid ${hov ? `${f.from}55` : "rgba(6,182,212,0.1)"}`,
        background: hov ? "rgba(6,182,212,0.05)" : "rgba(15,23,42,0.7)",
        backdropFilter: "blur(16px)",
        boxShadow: hov ? `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${f.from}33` : "none",
        transform: hov ? "translateY(-6px)" : "none",
        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}
    >
      {/* top sweep line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg,transparent,${f.from},${f.to},transparent)`,
          opacity: hov ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
      {/* bottom glow */}
      <div
        style={{
          position: "absolute",
          bottom: -24,
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 40,
          borderRadius: "50%",
          background: f.glow,
          filter: "blur(20px)",
          opacity: hov ? 1 : 0,
          transition: "opacity 0.35s",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `linear-gradient(135deg,${f.from},${f.to})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          boxShadow: `0 0 20px ${f.glow}`,
          transform: hov ? "scale(1.1) rotate(2deg)" : "none",
          transition: "transform 0.3s",
        }}
      >
        <f.icon style={{ width: 22, height: 22, color: "#fff" }} />
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", margin: "0 0 8px" }}>
        {f.title}
      </h3>
      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REVEAL WRAPPER
═══════════════════════════════════════════════════════════════ */
function RevealCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════ */
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
      links: [t.landing.linkFeatures, t.landing.linkBusinessTrips, t.landing.linkEmployees],
    },
    { title: t.landing.footerCompany, links: [t.landing.linkAbout, t.landing.linkContact] },
    { title: t.landing.footerLegal, links: [t.landing.linkPrivacy, t.landing.linkTerms] },
  ];
  const useFallback = footerLinks.length === 0 && !hasContact;

  const rightCols = useFallback
    ? marketingColumns.length
    : (footerLinks.length > 0 ? 1 : 0) + (hasContact ? 1 : 0);
  const gridTemplateColumns = `1.5fr ${"1fr ".repeat(Math.max(rightCols, 1)).trim()}`;

  const colTitleStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 16,
  };

  return (
    <footer
      style={{
        borderTop: "1px solid rgba(6,182,212,0.1)",
        background: "rgba(3,7,18,0.98)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* shimmer top */}
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg,transparent,rgba(6,182,212,0.4),rgba(59,130,246,0.3),transparent)",
          animation: "borderGlow 4s ease-in-out infinite",
        }}
      />
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "56px 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns, gap: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  overflow: "hidden",
                  background: site?.logoUrl
                    ? "transparent"
                    : "linear-gradient(135deg,#0ea5e9,#06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: site?.logoUrl ? "none" : "0 0 14px rgba(6,182,212,0.4)",
                }}
              >
                {site?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={site.logoUrl}
                    alt={brandName}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <Briefcase style={{ width: 14, height: 14, color: "#fff" }} />
                )}
              </div>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>
                {brandName}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, maxWidth: 240 }}>
              {tagline}
            </p>
            {socials.length > 0 && (
              <div style={{ display: "flex", gap: 14, marginTop: 16 }}>
                {socials.map(({ url, Icon, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    style={{ color: "#64748b", transition: "color 0.2s", display: "flex" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = "#67e8f9")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = "#64748b")
                    }
                  >
                    <Icon style={{ width: 18, height: 18 }} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Fallback marketing columns — only until Site Settings are filled in */}
          {useFallback &&
            marketingColumns.map((col) => (
              <div key={col.title}>
                <h3 style={colTitleStyle}>{col.title}</h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="/login"
                        style={{
                          fontSize: 13,
                          color: "#475569",
                          textDecoration: "none",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLAnchorElement).style.color = "#7dd3fc")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLAnchorElement).style.color = "#475569")
                        }
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          {/* Configured footer links (from /admin/settings) */}
          {!useFallback && footerLinks.length > 0 && (
            <div>
              <h3 style={colTitleStyle}>{linksHeading}</h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {footerLinks.map((link, i) => (
                  <li key={`${link.url}-${i}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 13,
                        color: "#475569",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = "#7dd3fc")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = "#475569")
                      }
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
            <div>
              <h3 style={colTitleStyle}>{t.footer.contactHeading}</h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {site?.contactPhone && (
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone style={{ width: 15, height: 15, color: "#06b6d4", flexShrink: 0 }} />
                    <a
                      href={`tel:${site.contactPhone}`}
                      style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}
                    >
                      {site.contactPhone}
                    </a>
                  </li>
                )}
                {site?.contactEmail && (
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mail style={{ width: 15, height: 15, color: "#06b6d4", flexShrink: 0 }} />
                    <a
                      href={`mailto:${site.contactEmail}`}
                      style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}
                    >
                      {site.contactEmail}
                    </a>
                  </li>
                )}
                {site?.contactAddress && (
                  <li style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <MapPin
                      style={{ width: 15, height: 15, color: "#06b6d4", flexShrink: 0, marginTop: 2 }}
                    />
                    <span style={{ fontSize: 13, color: "#94a3b8", whiteSpace: "pre-line" }}>
                      {site.contactAddress}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid rgba(6,182,212,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: "#334155" }}>
            {site?.footerText?.trim() ||
              `© ${new Date().getFullYear()} ${t.landing.footer}`}
          </span>
          <span style={{ fontSize: 12, color: "#334155" }}>{t.landing.footerRights}</span>
        </div>
      </div>
    </footer>
  );
}
