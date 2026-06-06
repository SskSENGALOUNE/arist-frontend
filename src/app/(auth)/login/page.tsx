"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Briefcase } from "lucide-react";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";
import { useT } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/use-site-settings";

type LoginFormValues = {
  username: string;
  password: string;
};

const css = `
  /* ── Root: dark navy + cyan, matching the landing page ── */
  .ar-root {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 2rem 1.25rem;
    background: #030712;
    color: #e2e8f0;
    font-family: var(--font-noto-sans-lao), system-ui, sans-serif;
  }

  /* ── Animated background ── */
  .ar-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

  .ar-orb {
    position: absolute;
    border-radius: 50%;
  }
  .ar-orb-1 {
    top: -12%; left: 12%; width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);
    animation: orb1 12s ease-in-out infinite;
  }
  .ar-orb-2 {
    bottom: -10%; right: 8%; width: 520px; height: 520px;
    background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
    animation: orb2 15s ease-in-out infinite;
  }
  .ar-orb-3 {
    top: 35%; left: -6%; width: 420px; height: 420px;
    background: radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%);
    animation: orb3 10s ease-in-out infinite;
  }
  .ar-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .ar-scan {
    position: absolute; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent);
    animation: scanLine 8s linear infinite;
    opacity: 0.5;
  }

  @keyframes orb1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.15); } }
  @keyframes orb2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,20px) scale(1.1); } }
  @keyframes orb3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,40px) scale(1.08); } }
  @keyframes scanLine { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
  @keyframes borderGlow { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0 rgba(6,182,212,0.5); }
    70%  { box-shadow: 0 0 0 10px rgba(6,182,212,0); }
    100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); }
  }
  @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
  @keyframes arFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes arPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  /* ── Card ── */
  .ar-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 410px;
    padding: 2.5rem 2.25rem 2.25rem;
    border-radius: 18px;
    border: 1px solid rgba(6,182,212,0.15);
    background: rgba(15,23,42,0.85);
    backdrop-filter: blur(20px);
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.08);
    animation: arFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
    overflow: hidden;
  }
  .ar-card-glow {
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(6,182,212,0.6), rgba(59,130,246,0.4), transparent);
    animation: borderGlow 3s ease-in-out infinite;
  }

  .ar-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.75rem;
  }

  .ar-brand-mark {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ar-logo-mark {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #0ea5e9, #06b6d4);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 16px rgba(6,182,212,0.5);
    animation: pulseRing 2.5s ease-in-out infinite;
  }
  .ar-brand-name { font-weight: 600; font-size: 14px; color: #f1f5f9; }

  /* ── Header ── */
  .ar-form-header { margin-bottom: 1.75rem; }

  .ar-form-eyebrow {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #67e8f9;
    margin: 0 0 0.6rem;
  }

  .ar-form-title {
    font-size: 1.85rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin: 0 0 0.4rem;
    background: linear-gradient(135deg,#e0f2fe 0%,#7dd3fc 40%,#06b6d4 75%,#3b82f6 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientShift 6s ease infinite;
  }

  .ar-form-desc {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
    font-weight: 400;
  }

  /* ── Fields ── */
  .ar-field { margin-bottom: 1.35rem; }

  .ar-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 0.55rem;
  }

  .ar-input-wrap { position: relative; }

  .ar-input {
    width: 100%;
    padding: 0.7rem 0.9rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(6,182,212,0.15);
    border-radius: 10px;
    font-family: var(--font-noto-sans-lao), system-ui, sans-serif;
    font-size: 0.9375rem;
    font-weight: 400;
    color: #f1f5f9;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    box-sizing: border-box;
  }
  .ar-input:focus {
    border-color: rgba(6,182,212,0.5);
    background: rgba(255,255,255,0.06);
    box-shadow: 0 0 0 3px rgba(6,182,212,0.12);
  }
  .ar-input::placeholder { color: #475569; font-weight: 400; }
  .ar-input[aria-invalid="true"] { border-color: rgba(239,68,68,0.5); }
  .ar-input-pw { padding-right: 2.6rem; }

  .ar-pw-btn {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }
  .ar-pw-btn:hover { color: #67e8f9; }

  .ar-field-error {
    font-size: 0.75rem;
    color: #f87171;
    margin: 0.45rem 0 0;
  }

  /* ── Error banner ── */
  .ar-error-banner {
    border: 1px solid rgba(239,68,68,0.3);
    border-left: 3px solid #ef4444;
    background: rgba(239,68,68,0.08);
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
    color: #fca5a5;
    margin-bottom: 1.5rem;
    border-radius: 8px;
  }

  /* ── Submit ── */
  .ar-submit {
    width: 100%;
    padding: 0.85rem 1rem;
    background: linear-gradient(135deg,#0284c7 0%,#06b6d4 100%);
    color: #fff;
    border: none;
    font-family: var(--font-noto-sans-lao), system-ui, sans-serif;
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    margin-top: 0.5rem;
    transition: box-shadow 0.2s ease, transform 0.15s ease, opacity 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-radius: 10px;
    box-shadow: 0 0 24px rgba(6,182,212,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .ar-submit:hover:not(:disabled) {
    box-shadow: 0 0 40px rgba(6,182,212,0.55), inset 0 1px 0 rgba(255,255,255,0.2);
    transform: translateY(-1px);
  }
  .ar-submit:active:not(:disabled) { transform: translateY(0); }
  .ar-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .ar-submit-dot {
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
    animation: arPulse 1.2s ease-in-out infinite;
  }

  /* ── Dev quick-login ── */
  .ar-quick {
    width: 100%;
    margin-top: 0.75rem;
    padding: 0.6rem 1rem;
    background: rgba(255,255,255,0.04);
    color: #94a3b8;
    border: 1px dashed rgba(6,182,212,0.25);
    font-family: var(--font-noto-sans-lao), system-ui, sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 10px;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .ar-quick:hover:not(:disabled) {
    border-color: rgba(6,182,212,0.5);
    color: #67e8f9;
    background: rgba(6,182,212,0.06);
  }
  .ar-quick:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const { data: site } = useSiteSettings();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginSchema = z.object({
    username: z.string().min(1, t.auth.usernameRequired),
    password: z.string().min(1, t.auth.passwordRequired),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const isDev = process.env.NODE_ENV !== "production";

  const handleQuickAdminLogin = () => {
    setValue("username", "admin");
    setValue("password", "Admin@1234");
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const result = await authService.login(data);
      setAuth(result.accessToken, result.refreshToken, result.user);
      if (result.user.mustChangePassword) {
        router.push("/force-password");
      } else if (result.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error
          ?.message
      ) {
        setError(
          (err as { response: { data: { error: { message: string } } } }).response.data.error
            .message
        );
      } else {
        setError(t.auth.somethingWentWrong);
      }
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="ar-root">
        {/* ── Animated background (matches landing) ── */}
        <div className="ar-bg" aria-hidden="true">
          <div className="ar-orb ar-orb-1" />
          <div className="ar-orb ar-orb-2" />
          <div className="ar-orb ar-orb-3" />
          <div className="ar-grid" />
          <div className="ar-scan" />
        </div>

        {/* ── Card ── */}
        <div className="ar-card">
          <div className="ar-card-glow" />

          <div className="ar-card-top">
            <div className="ar-brand-mark">
              <div
                className="ar-logo-mark"
                style={
                  site?.logoUrl
                    ? { background: "transparent", boxShadow: "none", animation: "none" }
                    : undefined
                }
              >
                {site?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={site.logoUrl}
                    alt={site.brandName ?? t.landing.brand}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: 10,
                    }}
                  />
                ) : (
                  <Briefcase size={16} color="#fff" />
                )}
              </div>
              <span className="ar-brand-name">
                {site?.brandName?.trim() || t.landing.brand}
              </span>
            </div>
          </div>

          <div className="ar-form-header">
            <p className="ar-form-eyebrow">{t.auth.welcomeBack}</p>
            <h1 className="ar-form-title">{t.auth.signIn}</h1>
            <p className="ar-form-desc">{t.auth.enterCredentials}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && (
              <div className="ar-error-banner" role="alert">
                {error}
              </div>
            )}

            <div className="ar-field">
              <label htmlFor="username" className="ar-label">
                {t.auth.username}
              </label>
              <div className="ar-input-wrap">
                <input
                  id="username"
                  className="ar-input"
                  placeholder="your.username"
                  autoComplete="username"
                  aria-invalid={!!errors.username}
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="ar-field-error" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="ar-field">
              <label htmlFor="password" className="ar-label">
                {t.auth.password}
              </label>
              <div className="ar-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="ar-input ar-input-pw"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="ar-pw-btn"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                  aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="ar-field-error" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button type="submit" className="ar-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="ar-submit-dot" />
                  <span className="ar-submit-dot" style={{ animationDelay: "0.2s" }} />
                  <span className="ar-submit-dot" style={{ animationDelay: "0.4s" }} />
                </>
              ) : (
                t.auth.signIn
              )}
            </button>

            {isDev && (
              <button
                type="button"
                className="ar-quick"
                onClick={handleQuickAdminLogin}
                disabled={isSubmitting}
              >
                ⚡ {t.devTools.quickLoginAdmin}
              </button>
            )}
          </form>
        </div>

        <footer
          style={{
            position: "absolute",
            bottom: 16,
            left: 0,
            right: 0,
            zIndex: 1,
            textAlign: "center",
            fontSize: 12,
            color: "#475569",
            padding: "0 1rem",
          }}
        >
          {site?.footerText?.trim() ||
            t.footer.fallbackText(new Date().getFullYear())}
        </footer>
      </div>
    </>
  );
}
