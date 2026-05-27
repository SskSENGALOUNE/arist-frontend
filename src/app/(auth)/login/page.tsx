"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  .ar-root {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
  }

  @media (max-width: 768px) {
    .ar-root { grid-template-columns: 1fr; }
    .ar-brand { display: none; }
  }

  /* ── Left brand panel ── */
  .ar-brand {
    background: #08090e;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 3rem;
  }

  .ar-brand-lines {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.18;
    pointer-events: none;
  }

  .ar-brand-top {
    position: relative;
    z-index: 1;
  }

  .ar-logo-mark {
    width: 46px;
    height: 46px;
    border: 1.5px solid #c9933a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 400;
    color: #c9933a;
    letter-spacing: 0.05em;
  }

  .ar-brand-bottom {
    position: relative;
    z-index: 1;
  }

  .ar-brand-tagline {
    font-size: 0.7rem;
    color: #4a4a5a;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin: 0 0 1.25rem;
  }

  .ar-brand-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.75rem, 4vw, 3.75rem);
    font-weight: 300;
    line-height: 1.08;
    color: #f0efe9;
    letter-spacing: -0.02em;
    margin: 0 0 1.5rem;
  }

  .ar-brand-title em {
    font-style: italic;
    color: #c9933a;
  }

  .ar-brand-divider {
    width: 32px;
    height: 1px;
    background: #c9933a;
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  .ar-brand-caption {
    font-size: 0.8125rem;
    color: #5c5c70;
    line-height: 1.6;
    max-width: 280px;
    font-weight: 300;
  }

  /* ── Right form panel ── */
  .ar-form-panel {
    background: #fafaf8;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
  }

  .ar-form-inner {
    width: 100%;
    max-width: 360px;
    animation: arFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: 0.05s;
  }

  @keyframes arFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ar-form-header {
    margin-bottom: 2.75rem;
  }

  .ar-form-eyebrow {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #c9933a;
    margin: 0 0 0.75rem;
  }

  .ar-form-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.25rem;
    font-weight: 400;
    color: #0b0b12;
    margin: 0 0 0.5rem;
    letter-spacing: -0.025em;
    line-height: 1.1;
  }

  .ar-form-desc {
    font-size: 0.875rem;
    color: #92929f;
    margin: 0;
    font-weight: 300;
  }

  /* Fields */
  .ar-field {
    margin-bottom: 1.75rem;
  }

  .ar-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #505060;
    margin-bottom: 0.625rem;
  }

  .ar-input-wrap {
    position: relative;
  }

  .ar-input {
    width: 100%;
    padding: 0.75rem 0;
    background: transparent;
    border: none;
    border-bottom: 1.5px solid #d8d8e2;
    border-radius: 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 400;
    color: #0b0b12;
    outline: none;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
  }

  .ar-input:focus {
    border-bottom-color: #0b0b12;
  }

  .ar-input::placeholder {
    color: #c8c8d4;
    font-weight: 300;
  }

  .ar-input-pw {
    padding-right: 2.25rem;
  }

  .ar-pw-btn {
    position: absolute;
    right: 0;
    bottom: 0.7rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #b0b0be;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }

  .ar-pw-btn:hover { color: #0b0b12; }

  .ar-field-error {
    font-size: 0.75rem;
    color: #c0392b;
    margin-top: 0.45rem;
  }

  /* Error banner */
  .ar-error-banner {
    border-left: 2px solid #e74c3c;
    background: #fdf1f0;
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
    color: #b03025;
    margin-bottom: 1.75rem;
    border-radius: 0 3px 3px 0;
  }

  /* Submit button */
  .ar-submit {
    width: 100%;
    padding: 0.9rem 1rem;
    background: #0b0b12;
    color: #c9933a;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    margin-top: 0.5rem;
    transition: background 0.2s ease, opacity 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-radius: 1px;
  }

  .ar-submit:hover:not(:disabled) {
    background: #171721;
  }

  .ar-submit:active:not(:disabled) {
    background: #060609;
  }

  .ar-submit:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .ar-submit-dot {
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
    animation: arPulse 1.2s ease-in-out infinite;
  }

  @keyframes arPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const result = await authService.login(data);
      setAuth(result.accessToken, result.refreshToken, result.user);
      router.push(result.user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
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
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="ar-root">
        {/* ── Left brand panel ── */}
        <div className="ar-brand">
          <svg
            className="ar-brand-lines"
            viewBox="0 0 600 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* Concentric circles */}
            <circle cx="300" cy="480" r="90" stroke="#c9933a" strokeWidth="0.6" />
            <circle cx="300" cy="480" r="190" stroke="#c9933a" strokeWidth="0.6" />
            <circle cx="300" cy="480" r="310" stroke="#c9933a" strokeWidth="0.6" />
            <circle cx="300" cy="480" r="460" stroke="#c9933a" strokeWidth="0.4" />
            {/* Diagonal rule lines */}
            <line x1="-100" y1="200" x2="700" y2="700" stroke="#c9933a" strokeWidth="0.5" />
            <line x1="-100" y1="0" x2="700" y2="500" stroke="#c9933a" strokeWidth="0.5" />
            <line x1="-100" y1="400" x2="700" y2="900" stroke="#c9933a" strokeWidth="0.5" />
            <line x1="500" y1="-100" x2="0" y2="900" stroke="#c9933a" strokeWidth="0.4" />
            <line x1="700" y1="100" x2="200" y2="900" stroke="#c9933a" strokeWidth="0.4" />
            {/* Cross */}
            <line x1="300" y1="0" x2="300" y2="900" stroke="#c9933a" strokeWidth="0.4" />
            <line x1="0" y1="480" x2="600" y2="480" stroke="#c9933a" strokeWidth="0.4" />
          </svg>

          <div className="ar-brand-top">
            <div className="ar-logo-mark">A</div>
          </div>

          <div className="ar-brand-bottom">
            <p className="ar-brand-tagline">Arist · Internal</p>
            <h2 className="ar-brand-title">
              Employee
              <br />
              <em>Portal</em>
            </h2>
            <div className="ar-brand-divider" />
            <p className="ar-brand-caption">
              Secure access for Arist team members. Contact IT support if you need assistance.
            </p>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="ar-form-panel">
          <div className="ar-form-inner">
            <div className="ar-form-header">
              <p className="ar-form-eyebrow">Welcome back</p>
              <h1 className="ar-form-title">Sign in</h1>
              <p className="ar-form-desc">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {error && (
                <div className="ar-error-banner" role="alert">
                  {error}
                </div>
              )}

              <div className="ar-field">
                <label htmlFor="username" className="ar-label">
                  Username
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
                  Password
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
