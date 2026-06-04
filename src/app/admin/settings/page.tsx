"use client";

import { useEffect, useRef, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageIcon, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminSiteSettingService,
  siteSettingService,
} from "@/services/site-setting";
import { SITE_SETTINGS_QUERY_KEY } from "@/hooks/use-site-settings";
import type { UpdateSiteSettingData } from "@/types/site-setting";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function buildSchema(t: ReturnType<typeof useT>) {
  return z.object({
    logoUrl: z.string().optional(),
    brandName: z.string().max(120).optional(),
    description: z.string().max(500).optional(),
    footerText: z.string().max(500).optional(),
    linksHeading: z.string().max(120).optional(),
    contactEmail: z
      .string()
      .email(t.siteSettings.invalidEmail)
      .optional()
      .or(z.literal("")),
    contactPhone: z.string().max(40).optional(),
    contactAddress: z.string().max(500).optional(),
    facebookUrl: z.string().max(2048).optional(),
    instagramUrl: z.string().max(2048).optional(),
    whatsappUrl: z.string().max(2048).optional(),
    linkedinUrl: z.string().max(2048).optional(),
    footerLinks: z.array(
      z.object({
        label: z.string().min(1).max(120),
        url: z.string().min(1, t.siteSettings.invalidUrl).max(2048),
      }),
    ),
  });
}

type SettingsFormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function AdminSiteSettingsPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: adminSiteSettingService.get,
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(buildSchema(t)),
    defaultValues: {
      logoUrl: "",
      brandName: "",
      description: "",
      footerText: "",
      linksHeading: "",
      contactEmail: "",
      contactPhone: "",
      contactAddress: "",
      facebookUrl: "",
      instagramUrl: "",
      whatsappUrl: "",
      linkedinUrl: "",
      footerLinks: [],
    },
  });

  const {
    register,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "footerLinks",
  });

  useEffect(() => {
    if (data) {
      form.reset({
        logoUrl: data.logoUrl ?? "",
        brandName: data.brandName ?? "",
        description: data.description ?? "",
        footerText: data.footerText ?? "",
        linksHeading: data.linksHeading ?? "",
        contactEmail: data.contactEmail ?? "",
        contactPhone: data.contactPhone ?? "",
        contactAddress: data.contactAddress ?? "",
        facebookUrl: data.facebookUrl ?? "",
        instagramUrl: data.instagramUrl ?? "",
        whatsappUrl: data.whatsappUrl ?? "",
        linkedinUrl: data.linkedinUrl ?? "",
        footerLinks: data.footerLinks ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSiteSettingData) =>
      adminSiteSettingService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY });
      toast.success(t.siteSettings.toastSaved);
    },
    onError: () => toast.error(t.siteSettings.toastSaveFailed),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminSiteSettingService.uploadLogo(file);
      setValue("logoUrl", url, { shouldDirty: true });
    } catch {
      toast.error(t.siteSettings.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const orNull = (v?: string) => (v?.trim() ? v.trim() : null);
    await updateMutation.mutateAsync({
      logoUrl: orNull(values.logoUrl),
      brandName: orNull(values.brandName),
      description: orNull(values.description),
      footerText: orNull(values.footerText),
      linksHeading: orNull(values.linksHeading),
      contactEmail: orNull(values.contactEmail),
      contactPhone: orNull(values.contactPhone),
      contactAddress: orNull(values.contactAddress),
      facebookUrl: orNull(values.facebookUrl),
      instagramUrl: orNull(values.instagramUrl),
      whatsappUrl: orNull(values.whatsappUrl),
      linkedinUrl: orNull(values.linkedinUrl),
      footerLinks: values.footerLinks.map((l) => ({
        label: l.label.trim(),
        url: l.url.trim(),
      })),
    });
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{t.siteSettings.heading}</h2>
          <p className="text-sm text-muted-foreground">
            {t.siteSettings.subheading}
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            {/* ── Branding ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t.siteSettings.brandingSection}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>{t.siteSettings.fieldLogo}</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Controller
                    control={control}
                    name="logoUrl"
                    render={({ field }) =>
                      field.value ? (
                        <div className="flex items-center gap-3">
                          <div className="flex size-20 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={field.value}
                              alt={t.siteSettings.fieldLogo}
                              className="size-full object-contain"
                            />
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                            >
                              <Upload className="size-3.5" />
                              {t.siteSettings.changeLogo}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => field.onChange("")}
                              disabled={uploading}
                            >
                              <X className="size-3.5" />
                              {t.siteSettings.removeLogo}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex size-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-60"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="size-5 animate-spin" />
                              <span className="text-xs">
                                {t.siteSettings.uploading}
                              </span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="size-5" />
                              <span className="px-2 text-center text-xs">
                                {t.siteSettings.uploadHint}
                              </span>
                            </>
                          )}
                        </button>
                      )
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="brandName">
                    {t.siteSettings.fieldBrandName}
                  </Label>
                  <Input
                    id="brandName"
                    placeholder={t.siteSettings.brandNamePlaceholder}
                    {...register("brandName")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description">
                    {t.siteSettings.fieldDescription}
                  </Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder={t.siteSettings.descriptionPlaceholder}
                    {...register("description")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ── Footer ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t.siteSettings.footerSection}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="footerText">
                    {t.siteSettings.fieldFooterText}
                  </Label>
                  <Textarea
                    id="footerText"
                    rows={2}
                    placeholder={t.siteSettings.footerTextPlaceholder}
                    {...register("footerText")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="linksHeading">
                    {t.siteSettings.fieldLinksHeading}
                  </Label>
                  <Input
                    id="linksHeading"
                    placeholder={t.siteSettings.linksHeadingPlaceholder}
                    {...register("linksHeading")}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label>{t.siteSettings.footerLinks}</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => append({ label: "", url: "" })}
                    >
                      <Plus className="size-3.5" />
                      {t.siteSettings.addLink}
                    </Button>
                  </div>

                  {fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t.siteSettings.noLinks}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {fields.map((fieldItem, index) => (
                        <div key={fieldItem.id} className="flex items-start gap-2">
                          <div className="flex-1">
                            <Input
                              placeholder={t.siteSettings.linkLabel}
                              aria-invalid={
                                !!errors.footerLinks?.[index]?.label
                              }
                              {...register(`footerLinks.${index}.label`)}
                            />
                          </div>
                          <div className="flex-[2]">
                            <Input
                              placeholder={t.siteSettings.linkUrl}
                              aria-invalid={!!errors.footerLinks?.[index]?.url}
                              {...register(`footerLinks.${index}.url`)}
                            />
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── Contact ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t.siteSettings.contactSection}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contactEmail">
                    {t.siteSettings.fieldContactEmail}
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    aria-invalid={!!errors.contactEmail}
                    {...register("contactEmail")}
                  />
                  {errors.contactEmail && (
                    <p className="text-xs text-destructive">
                      {errors.contactEmail.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contactPhone">
                    {t.siteSettings.fieldContactPhone}
                  </Label>
                  <Input id="contactPhone" {...register("contactPhone")} />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="contactAddress">
                    {t.siteSettings.fieldContactAddress}
                  </Label>
                  <Textarea
                    id="contactAddress"
                    rows={2}
                    {...register("contactAddress")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ── Social ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t.siteSettings.socialSection}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="facebookUrl">Facebook</Label>
                  <Input
                    id="facebookUrl"
                    placeholder="https://facebook.com/..."
                    {...register("facebookUrl")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    placeholder="https://instagram.com/..."
                    {...register("instagramUrl")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="whatsappUrl">WhatsApp</Label>
                  <Input
                    id="whatsappUrl"
                    placeholder="https://wa.me/..."
                    {...register("whatsappUrl")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    placeholder="https://linkedin.com/company/..."
                    {...register("linkedinUrl")}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || uploading}>
                {isSubmitting ? t.common.saving : t.siteSettings.save}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
