"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmployeeUser } from "@/services/employee";
import { useT } from "@/lib/i18n";

function buildSchema(t: ReturnType<typeof useT>) {
  return z
    .object({
      newPassword: z.string().min(8, t.resetPasswordDialog.passwordMin),
      confirmPassword: z.string().min(1, t.resetPasswordDialog.confirmRequired),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      path: ["confirmPassword"],
      message: t.resetPasswordDialog.passwordsDontMatch,
    });
}

type FormValues = {
  newPassword: string;
  confirmPassword: string;
};

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeUser | null;
  onConfirm: (newPassword: string) => Promise<void>;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  employee,
  onConfirm,
}: ResetPasswordDialogProps) {
  const t = useT();
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<
    { kind: "error"; message: string } | null
  >(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(t)),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      setFeedback(null);
      setShowPassword(false);
    }
    onOpenChange(next);
  };

  const name = employee
    ? `${employee.firstName} ${employee.lastName}`.trim() || employee.username
    : "";

  const onSubmit = handleSubmit(async (data) => {
    setFeedback(null);
    try {
      await onConfirm(data.newPassword);
      handleOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? t.resetPasswordDialog.failed;
      setFeedback({ kind: "error", message });
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.resetPasswordDialog.title}</DialogTitle>
          <DialogDescription>
            {t.resetPasswordDialog.description(name)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {feedback && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {feedback.message}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">
              {t.resetPasswordDialog.newPassword}
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="pr-9"
                aria-invalid={!!errors.newPassword}
                {...register("newPassword")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
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
              {t.resetPasswordDialog.confirmPassword}
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t.resetPasswordDialog.submitting
                : t.resetPasswordDialog.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
