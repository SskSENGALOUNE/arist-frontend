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
import { ALargeSmall, Eye, Globe, Mail, MapPin, Moon, Paintbrush, Phone, Sun, ImageIcon, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useSettingsStore, FONT_SIZE_PX, type FontSize } from "@/stores/settings";
import { applyPrimaryColor } from "@/components/html-lang-sync";
import { buildSocialLinks } from "@/components/social-icons";
import { cn } from "@/lib/utils";
import { adminSiteSettingService } from "@/services/site-setting";
import { SITE_SETTINGS_QUERY_KEY } from "@/hooks/use-site-settings";
import type { UpdateSiteSettingData } from "@/types/site-setting";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TIMEZONES = [
  { value: "Asia/Vientiane", label: "Asia/Vientiane (UTC+7) — ລາວ" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (UTC+7) — ໄທ" },
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh (UTC+7) — ຫວຽດນາມ" },
  { value: "Asia/Singapore", label: "Asia/Singapore (UTC+8)" },
  { value: "UTC", label: "UTC (UTC+0)" },
];

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY  (31/01/2026)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY  (01/31/2026)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD  (2026-01-31)" },
];

const PRESET_COLORS = [
  "#0284c7", "#0ea5e9", "#6366f1", "#8b5cf6",
  "#ec4899", "#ef4444", "#f97316", "#22c55e",
  "#14b8a6", "#64748b",
];

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
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
    primaryColor: z.string().optional().or(z.literal("")),
  });
}

type SettingsFormValues = z.infer<ReturnType<typeof buildSchema>>;

const SIZE_OPTIONS: { value: FontSize; label: string; desc: string }[] = [
  { value: "sm", label: "S", desc: "18px" },
  { value: "md", label: "M", desc: "20px" },
  { value: "lg", label: "L", desc: "22px" },
  { value: "xl", label: "XL", desc: "25px" },
];

function SettingsPreview({
  values,
  t,
}: {
  values: SettingsFormValues;
  t: ReturnType<typeof useT>;
}) {
  const year = new Date().getFullYear();
  const brandName = values.brandName?.trim() || "Arist";
  const copyright = values.footerText?.trim() || `© ${year} ${brandName}`;
  const links = values.footerLinks ?? [];
  const linksHeading = values.linksHeading?.trim() || t.footer.linksHeading;
  const socials = buildSocialLinks(values);
  const hasContact =
    values.contactPhone || values.contactEmail || values.contactAddress;

  return (
    <div className="overflow-hidden rounded-b-lg text-[11px]">
      {/* Mock nav bar */}
      <div className="flex h-9 items-center gap-2 border-b bg-background px-3">
        {values.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.logoUrl}
            alt={brandName}
            className="h-5 w-auto max-w-[80px] object-contain"
          />
        ) : (
          <div className="h-5 w-5 rounded bg-primary/30" />
        )}
        <span className="font-semibold">{brandName}</span>
      </div>

      {/* Page content placeholder */}
      <div className="flex h-16 items-center justify-center bg-muted/30">
        <span className="text-[10px] text-muted-foreground">
          — page content —
        </span>
      </div>

      {/* Footer preview */}
      <div className="border-t bg-background p-3">
        <div
          className={cn(
            "grid gap-4",
            links.length > 0 || hasContact ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {/* Brand column */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              {values.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={values.logoUrl}
                  alt={brandName}
                  className="h-4 w-auto max-w-[60px] object-contain"
                />
              ) : null}
              <span className="font-semibold leading-none">{brandName}</span>
            </div>
            {values.description?.trim() && (
              <p className="line-clamp-3 text-muted-foreground">
                {values.description}
              </p>
            )}
            {socials.length > 0 && (
              <div className="flex items-center gap-1.5">
                {socials.map(({ Icon, label }) => (
                  <Icon key={label} className="size-3 text-primary" />
                ))}
              </div>
            )}
          </div>

          {/* Links + Contact column */}
          {(links.length > 0 || hasContact) && (
            <div className="flex flex-col gap-3">
              {links.length > 0 && (
                <div>
                  <p className="mb-1 font-semibold">{linksHeading}</p>
                  <ul className="flex flex-col gap-0.5 text-primary">
                    {links.slice(0, 4).map((l, i) => (
                      <li key={i}>{l.label || "—"}</li>
                    ))}
                    {links.length > 4 && (
                      <li className="text-muted-foreground">
                        +{links.length - 4} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {hasContact && (
                <div>
                  <p className="mb-1 font-semibold">{t.footer.contactHeading}</p>
                  <ul className="flex flex-col gap-0.5 text-muted-foreground">
                    {values.contactPhone && (
                      <li className="flex items-center gap-1">
                        <Phone className="size-2.5 shrink-0 text-primary" />
                        <span className="truncate">{values.contactPhone}</span>
                      </li>
                    )}
                    {values.contactEmail && (
                      <li className="flex items-center gap-1">
                        <Mail className="size-2.5 shrink-0 text-primary" />
                        <span className="truncate">{values.contactEmail}</span>
                      </li>
                    )}
                    {values.contactAddress && (
                      <li className="flex items-start gap-1">
                        <MapPin className="mt-px size-2.5 shrink-0 text-primary" />
                        <span className="line-clamp-2">
                          {values.contactAddress}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 border-t pt-2 text-right text-[10px] text-muted-foreground">
          {copyright}
        </div>
      </div>
    </div>
  );
}

export default function AdminSiteSettingsPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const darkMode = useSettingsStore((s) => s.darkMode);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);
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
      timezone: "Asia/Vientiane",
      dateFormat: "DD/MM/YYYY",
      primaryColor: "",
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

  const formValues = form.watch();

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
        timezone: data.timezone ?? "Asia/Vientiane",
        dateFormat: data.dateFormat ?? "DD/MM/YYYY",
        primaryColor: data.primaryColor ?? "",
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
      timezone: values.timezone || "Asia/Vientiane",
      dateFormat: values.dateFormat || "DD/MM/YYYY",
      primaryColor: orNull(values.primaryColor),
    });
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">{t.siteSettings.heading}</h2>
          <p className="text-sm text-muted-foreground">
            {t.siteSettings.subheading}
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <form onSubmit={onSubmit} className="min-w-0 flex-1 flex flex-col gap-6">
            {/* ── System ── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="size-4 text-muted-foreground" />
                  {t.siteSettings.systemSection}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="timezone">{t.siteSettings.fieldTimezone}</Label>
                  <select
                    id="timezone"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...register("timezone")}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>{t.siteSettings.fieldDateFormat}</Label>
                  <div className="flex flex-wrap gap-2">
                    {DATE_FORMATS.map((fmt) => (
                      <Controller
                        key={fmt.value}
                        control={control}
                        name="dateFormat"
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => field.onChange(fmt.value)}
                            className={cn(
                              "rounded-lg border-2 px-4 py-2 text-sm font-mono transition-all",
                              field.value === fmt.value
                                ? "border-primary bg-primary/8 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            )}
                          >
                            {fmt.label}
                          </button>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Appearance (extended) ── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Paintbrush className="size-4 text-muted-foreground" />
                  {t.siteSettings.appearanceSection}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {/* Font size */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <ALargeSmall className="size-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">ຂະໜາດຕົວໜັງສືທົ່ວໄປ</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFontSize(opt.value)}
                        style={{ fontSize: FONT_SIZE_PX[opt.value] }}
                        className={cn(
                          "flex h-14 w-20 flex-col items-center justify-center gap-0.5 rounded-xl border-2 transition-all",
                          fontSize === opt.value
                            ? "border-primary bg-primary/8 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        <span className="font-semibold leading-none">ກ</span>
                        <span className="text-[10px] leading-none opacity-70">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dark mode */}
                <div className="flex items-center justify-between rounded-xl border-2 border-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    {darkMode ? (
                      <Moon className="size-4 text-muted-foreground" />
                    ) : (
                      <Sun className="size-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{t.siteSettings.darkModeLabel}</p>
                      <p className="text-xs text-muted-foreground">{t.siteSettings.darkModeHint}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={darkMode}
                    onClick={toggleDarkMode}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      darkMode ? "bg-primary" : "bg-input"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                        darkMode ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {/* Primary color */}
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-sm font-medium">{t.siteSettings.fieldPrimaryColor}</p>
                    <p className="text-xs text-muted-foreground">{t.siteSettings.primaryColorHint}</p>
                  </div>
                  <Controller
                    control={control}
                    name="primaryColor"
                    render={({ field }) => (
                      <div className="flex flex-col gap-3">
                        {/* Preset swatches */}
                        <div className="flex flex-wrap gap-2">
                          {PRESET_COLORS.map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              title={hex}
                              onClick={() => { field.onChange(hex); applyPrimaryColor(hex); }}
                              className={cn(
                                "size-8 rounded-lg border-2 transition-all",
                                field.value === hex
                                  ? "border-foreground scale-110 shadow-md"
                                  : "border-transparent hover:scale-105"
                              )}
                              style={{ background: hex }}
                            />
                          ))}
                          {field.value && !PRESET_COLORS.includes(field.value) && (
                            <div
                              className="size-8 rounded-lg border-2 border-foreground shadow-md"
                              style={{ background: field.value }}
                            />
                          )}
                        </div>
                        {/* Custom hex input + native picker */}
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={field.value || "#0284c7"}
                            onChange={(e) => { field.onChange(e.target.value); applyPrimaryColor(e.target.value); }}
                            className="size-9 cursor-pointer rounded-lg border border-input bg-background p-0.5"
                          />
                          <Input
                            placeholder="#0284c7"
                            value={field.value ?? ""}
                            onChange={(e) => { field.onChange(e.target.value); applyPrimaryColor(e.target.value || null); }}
                            className="w-32 font-mono text-sm"
                            maxLength={7}
                          />
                          {field.value && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => { field.onChange(""); applyPrimaryColor(null); }}
                            >
                              <X className="size-3.5" />
                              {t.siteSettings.primaryColorReset}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

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

          {/* Live preview panel */}
          <div className="xl:w-[380px] xl:shrink-0">
            <div className="xl:sticky xl:top-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Eye className="size-4 text-muted-foreground" />
                    {t.siteSettings.livePreview}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <SettingsPreview values={formValues} t={t} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
