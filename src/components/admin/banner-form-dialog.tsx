"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { adminBannerService } from "@/services/banner";
import type { Banner, CreateBannerData } from "@/types/banner";
import { useT } from "@/lib/i18n";

function buildSchema(t: ReturnType<typeof useT>) {
  return z.object({
    title: z.string().min(1, t.banners.titleRequired).max(255),
    subtitle: z.string().max(500).optional(),
    imageUrl: z.string().optional(),
    isActive: z.boolean(),
    sortOrder: z.number().int().min(0),
  });
}

export type BannerFormValues = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
};

interface BannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: Banner | null;
  onSubmit: (data: CreateBannerData) => Promise<void>;
}

export function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  onSubmit,
}: BannerFormDialogProps) {
  const t = useT();
  const isEdit = !!banner;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(buildSchema(t)),
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  const {
    register,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (banner) {
      form.reset({
        title: banner.title,
        subtitle: banner.subtitle ?? "",
        imageUrl: banner.imageUrl ?? "",
        isActive: banner.isActive,
        sortOrder: banner.sortOrder,
      });
    } else {
      form.reset({
        title: "",
        subtitle: "",
        imageUrl: "",
        isActive: true,
        sortOrder: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner, open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminBannerService.uploadImage(file);
      setValue("imageUrl", url, { shouldDirty: true });
    } catch {
      toast.error(t.banners.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({
      title: data.title,
      subtitle: data.subtitle?.trim() ? data.subtitle.trim() : null,
      imageUrl: data.imageUrl?.trim() ? data.imageUrl.trim() : null,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.banners.editTitle : t.banners.createTitle}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t.banners.editDescription : t.banners.createDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">{t.banners.fieldTitle}</Label>
            <Input
              id="title"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subtitle">{t.banners.fieldSubtitle}</Label>
            <Textarea
              id="subtitle"
              rows={2}
              aria-invalid={!!errors.subtitle}
              {...register("subtitle")}
            />
            {errors.subtitle && (
              <p className="text-xs text-destructive">
                {errors.subtitle.message}
              </p>
            )}
          </div>

          {/* Image upload */}
          <div className="flex flex-col gap-1.5">
            <Label>{t.banners.fieldImage}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) =>
                field.value ? (
                  <div className="relative w-full overflow-hidden rounded-lg border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={field.value}
                      alt={t.banners.fieldImage}
                      className="h-32 w-full object-cover"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="secondary"
                        title={t.banners.changeImage}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="destructive"
                        title={t.banners.removeImage}
                        onClick={() => field.onChange("")}
                        disabled={uploading}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        <span className="text-xs">{t.banners.uploading}</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="size-5" />
                        <span className="text-xs">{t.banners.uploadHint}</span>
                      </>
                    )}
                  </button>
                )
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sortOrder">{t.banners.fieldSortOrder}</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                aria-invalid={!!errors.sortOrder}
                {...register("sortOrder", { valueAsNumber: true })}
              />
              {errors.sortOrder && (
                <p className="text-xs text-destructive">
                  {errors.sortOrder.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="isActive">{t.banners.fieldActive}</Label>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <div className="flex h-8 items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.value ? t.banners.active : t.banners.inactive}
                    </span>
                  </div>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting || uploading}>
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
