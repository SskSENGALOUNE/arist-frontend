"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, KeyRound, LogOut, ShieldAlert } from "lucide-react";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
function buildSchema(t: ReturnType<typeof useT>) {
  return z
    .object({
      newPassword: z.string().min(8, t.forcePassword.newPasswordMin),
      confirmPassword: z.string().min(1, t.forcePassword.confirmRequired),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      path: ["confirmPassword"],
      message: t.forcePassword.passwordsDontMatch,
    });
}

type FormValues = {
  newPassword: string;
  confirmPassword: string;
};

export default function ForcePasswordPage() {
  const router = useRouter();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logoutStore = useAuthStore((s) => s.logout);

  const [showNew, setShowNew] = useState(false);
  const [feedback, setFeedback] = useState<
    { kind: "success" | "error"; message: string } | null
  >(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (!user.mustChangePassword) {
      router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard");
    }
  }, [hydrated, token, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(t)),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setFeedback(null);
    try {
      await authService.completeInitialPassword(data.newPassword);
      const me = await authService.me();
      if (token && refreshToken) {
        setAuth(token, refreshToken, {
          id: me.id,
          username: me.username,
          email: me.email,
          role: me.role,
          firstName: me.firstName,
          lastName: me.lastName,
          mustChangePassword: me.mustChangePassword,
        });
      }
      setFeedback({
        kind: "success",
        message: t.forcePassword.successRedirecting,
      });
      router.replace(
        me.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard",
      );
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? t.forcePassword.failed;
      setFeedback({ kind: "error", message });
    }
  });

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // ignore
    }
    logoutStore();
    router.replace("/login");
  };

  if (!hydrated || !user || !user.mustChangePassword) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-amber-600 dark:text-amber-400" />
              <CardTitle>{t.forcePassword.title}</CardTitle>
            </div>
            <CardDescription>{t.forcePassword.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              {feedback && (
                <div
                  className={
                    feedback.kind === "success"
                      ? "rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
                      : "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  }
                >
                  {feedback.message}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">
                  {t.forcePassword.newPassword}
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-9"
                    aria-invalid={!!errors.newPassword}
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNew((v) => !v)}
                    tabIndex={-1}
                  >
                    {showNew ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">
                  {t.forcePassword.confirmPassword}
                </Label>
                <Input
                  id="confirmPassword"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  {t.forcePassword.logout}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <KeyRound className="size-4" />
                  {isSubmitting
                    ? t.forcePassword.submitting
                    : t.forcePassword.submit}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
