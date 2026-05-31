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
import type { Department } from "@/types/department";
import { useT } from "@/lib/i18n";

type FormValues = {
  name: string;
  isActive: boolean;
};

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  onSubmit: (data: FormValues) => Promise<void>;
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  onSubmit,
}: DepartmentFormDialogProps) {
  const t = useT();
  const isEdit = !!department;

  const schema = z.object({
    name: z.string().min(1, t.departments.nameRequired).max(100),
    isActive: z.boolean(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", isActive: true },
  });

  const { register, formState: { errors, isSubmitting }, watch, setValue } = form;

  useEffect(() => {
    form.reset(
      department
        ? { name: department.name, isActive: department.isActive }
        : { name: "", isActive: true },
    );
  }, [department, open]);

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.departments.editTitle : t.departments.createTitle}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t.departments.editDescription : t.departments.createDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dept-name">{t.departments.fieldName}</Label>
            <Input
              id="dept-name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dept-active">{t.departments.fieldActive}</Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="dept-active"
                  checked={watch("isActive")}
                  onCheckedChange={(v) => setValue("isActive", v)}
                />
                <span className="text-sm text-muted-foreground">
                  {watch("isActive") ? t.departments.active : t.departments.inactive}
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
