"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Switch } from "@/components/ui/switch";
import type { Position } from "@/types/position";
import { useT } from "@/lib/i18n";

type FormValues = {
  name: string;
  isActive: boolean;
};

interface PositionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: Position | null;
  onSubmit: (data: FormValues) => Promise<void>;
}

export function PositionFormDialog({
  open,
  onOpenChange,
  position,
  onSubmit,
}: PositionFormDialogProps) {
  const t = useT();
  const isEdit = !!position;

  const schema = z.object({
    name: z.string().min(1, t.positions.nameRequired).max(100),
    isActive: z.boolean(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", isActive: true },
  });

  const { register, formState: { errors, isSubmitting }, watch, setValue } = form;

  useEffect(() => {
    form.reset(
      position
        ? { name: position.name, isActive: position.isActive }
        : { name: "", isActive: true },
    );
  }, [position, open]);

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.positions.editTitle : t.positions.createTitle}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t.positions.editDescription : t.positions.createDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pos-name">{t.positions.fieldName}</Label>
            <Input
              id="pos-name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pos-active">{t.positions.fieldActive}</Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="pos-active"
                  checked={watch("isActive")}
                  onCheckedChange={(v) => setValue("isActive", v)}
                />
                <span className="text-sm text-muted-foreground">
                  {watch("isActive") ? t.positions.active : t.positions.inactive}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t.common.saving
                : isEdit
                  ? t.common.saveChanges
                  : t.common.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
