"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ALargeSmall,
  Camera,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  MonitorSmartphone,
  ShieldCheck,
  UserCog,
  GraduationCap,
  Globe,
  BadgeCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth";
import { meService, type UpdateProfileData } from "@/services/me";
import { useT } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useSettingsStore, FONT_SIZE_PX, type FontSize } from "@/stores/settings";
import type {
  Country,
  EducationLevel,
  Gender,
  GraduatedFrom,
  LanguageLevel,
} from "@/types";

function buildPasswordSchema(t: ReturnType<typeof useT>) {
  return z
    .object({
      currentPassword: z.string().min(1, t.profile.currentPasswordRequired),
      newPassword: z.string().min(8, t.profile.newPasswordMin),
      confirmPassword: z.string().min(1, t.profile.confirmRequired),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      path: ["confirmPassword"],
      message: t.profile.passwordsDontMatch,
    });
}

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProfileFormValues = {
  gender: Gender | "";
  educationLevel: EducationLevel | "";
  institutionName: string;
  graduatedFrom: GraduatedFrom | "";
  graduatedCountry: Country | "";
  fieldOfStudy: string;
  englishLevel: LanguageLevel | "";
  vietnameseLevel: LanguageLevel | "";
  chineseLevel: LanguageLevel | "";
  otherLanguages: string;
  passportExpiry: string;
};

function getInitials(firstName?: string, lastName?: string, username?: string) {
  const fi = firstName?.trim()?.[0] ?? "";
  const li = lastName?.trim()?.[0] ?? "";
  const initials = `${fi}${li}`.toUpperCase();
  if (initials) return initials;
  return username?.slice(0, 2).toUpperCase() ?? "AR";
}

function selectClass() {
  return "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors";
}

const GENDER_VALUES: Gender[] = ["MALE", "FEMALE"];
const EDUCATION_VALUES: EducationLevel[] = [
  "HIGH_SCHOOL",
  "VOCATIONAL",
  "DIPLOMA",
  "BACHELOR",
  "MASTER",
  "PHD",
];
const GRADUATED_FROM_VALUES: GraduatedFrom[] = ["DOMESTIC", "ABROAD"];
const COUNTRY_VALUES: Country[] = [
  "LAOS",
  "THAILAND",
  "VIETNAM",
  "CHINA",
  "CAMBODIA",
  "MYANMAR",
  "MALAYSIA",
  "SINGAPORE",
  "JAPAN",
  "SOUTH_KOREA",
  "USA",
  "UK",
  "AUSTRALIA",
  "FRANCE",
  "GERMANY",
  "RUSSIA",
  "CANADA",
  "OTHER",
];
const LANGUAGE_VALUES: LanguageLevel[] = [
  "NONE",
  "BASIC",
  "INTERMEDIATE",
  "ADVANCED",
  "NATIVE",
];

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4.5" />
      </div>
      <p className="font-semibold">{title}</p>
    </div>
  );
}

export default function ProfilePage() {
  const storedUser = useAuthStore((s) => s.user);
  const t = useT();
  const queryClient = useQueryClient();
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);

  const sizeOptions: { value: FontSize; label: string; desc: string }[] = [
    { value: "sm", label: "S", desc: "18px" },
    { value: "md", label: "M", desc: "20px" },
    { value: "lg", label: "L", desc: "22px" },
    { value: "xl", label: "XL", desc: "25px" },
  ];

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: authService.me,
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(buildPasswordSchema(t)),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      gender: "",
      educationLevel: "",
      institutionName: "",
      graduatedFrom: "",
      graduatedCountry: "",
      fieldOfStudy: "",
      englishLevel: "",
      vietnameseLevel: "",
      chineseLevel: "",
      otherLanguages: "",
      passportExpiry: "",
    },
  });

  useEffect(() => {
    if (!me) return;
    profileForm.reset({
      gender: (me.gender as Gender) ?? "",
      educationLevel: (me.educationLevel as EducationLevel) ?? "",
      institutionName: me.institutionName ?? "",
      graduatedFrom: (me.graduatedFrom as GraduatedFrom) ?? "",
      graduatedCountry: (me.graduatedCountry as Country) ?? "",
      fieldOfStudy: me.fieldOfStudy ?? "",
      englishLevel: (me.englishLevel as LanguageLevel) ?? "",
      vietnameseLevel: (me.vietnameseLevel as LanguageLevel) ?? "",
      chineseLevel: (me.chineseLevel as LanguageLevel) ?? "",
      otherLanguages: me.otherLanguages ?? "",
      passportExpiry: me.passportExpiry ? me.passportExpiry.slice(0, 10) : "",
    });
  }, [me, profileForm]);

  const profileMutation = useMutation({
    mutationFn: meService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const onPasswordSubmit = passwordForm.handleSubmit(async (data) => {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(t.profile.passwordUpdated);
      passwordForm.reset();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? t.profile.passwordFailed;
      toast.error(message);
    }
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    try {
      await meService.uploadPhoto(file);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(t.profile.profileUpdated);
    } catch {
      setPhotoPreview(null);
      toast.error(t.profile.profileFailed);
    } finally {
      setPhotoUploading(false);
    }
  };

  const onProfileSubmit = profileForm.handleSubmit(async (data) => {
    const payload: UpdateProfileData = {};
    if (data.gender) payload.gender = data.gender;
    if (data.educationLevel) payload.educationLevel = data.educationLevel;
    if (data.institutionName) payload.institutionName = data.institutionName;
    if (data.graduatedFrom) payload.graduatedFrom = data.graduatedFrom;
    if (data.graduatedCountry) payload.graduatedCountry = data.graduatedCountry;
    if (data.fieldOfStudy) payload.fieldOfStudy = data.fieldOfStudy;
    if (data.englishLevel) payload.englishLevel = data.englishLevel;
    if (data.vietnameseLevel) payload.vietnameseLevel = data.vietnameseLevel;
    if (data.chineseLevel) payload.chineseLevel = data.chineseLevel;
    if (data.otherLanguages) payload.otherLanguages = data.otherLanguages;
    if (data.passportExpiry) payload.passportExpiry = data.passportExpiry;
    try {
      await profileMutation.mutateAsync(payload);
      toast.success(t.profile.profileUpdated);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? t.profile.profileFailed;
      toast.error(message);
    }
  });

  const user = me ?? storedUser;
  if (!user) {
    if (isLoading) {
      return (
        <div className="p-6 text-sm text-muted-foreground">{t.profile.loading}</div>
      );
    }
    return null;
  }

  const initials = getInitials(user.firstName, user.lastName, user.username);
  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.username;

  return (
<<<<<<< Updated upstream
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
=======
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="self-start"
        >
          <ArrowLeft className="size-4" />
          {t.common.backToDashboard}
        </Button>
        <h2 className="text-xl font-semibold tracking-tight">
          {t.profile.title}
        </h2>
        <p className="text-sm text-muted-foreground">{t.profile.subtitle}</p>
      </div>
>>>>>>> Stashed changes

      {/* ── Hero card ── */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-background to-background shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="size-24 ring-4 ring-background shadow-lg">
              <AvatarImage
                src={photoPreview ?? me?.photoUrl ?? undefined}
                alt={displayName}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={photoUploading}
              className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {photoUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Identity */}
          <div className="flex flex-col items-center sm:items-start gap-2 pb-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight">{displayName}</h2>
              <Badge
                variant={user.role === "ADMIN" ? "default" : "secondary"}
                className="text-xs px-2.5 py-0.5"
              >
                {user.role === "ADMIN" ? t.topbar.administrator : t.topbar.employee}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1">
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t.profile.username}: </span>
                {user.username}
              </span>
              {user.firstName && (
                <span className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t.profile.firstName}: </span>
                  {user.firstName}
                </span>
              )}
              {user.lastName && (
                <span className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t.profile.lastName}: </span>
                  {user.lastName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="hr" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="hr" className="flex items-center gap-1.5">
            <UserCog className="size-3.5" />
            {t.profile.hrProfile}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" />
            {t.profile.security}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1.5">
            <MonitorSmartphone className="size-3.5" />
            ການສະແດງຜົນ
          </TabsTrigger>
        </TabsList>

        {/* ── HR Profile tab ── */}
        <TabsContent value="hr">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={onProfileSubmit} className="space-y-8">

                {/* Personal */}
                <div>
                  <SectionHeader
                    icon={BadgeCheck}
                    title={t.profile.account}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="gender">{t.profile.gender}</Label>
                      <select id="gender" className={selectClass()} {...profileForm.register("gender")}>
                        <option value="">{t.profile.pickOption}</option>
                        {GENDER_VALUES.map((v) => (
                          <option key={v} value={v}>{t.enums.gender[v]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="passportExpiry">{t.profile.passportExpiry}</Label>
                      <Input id="passportExpiry" type="date" {...profileForm.register("passportExpiry")} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Education */}
                <div>
                  <SectionHeader
                    icon={GraduationCap}
                    title={t.profile.educationLevel}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="educationLevel">{t.profile.educationLevel}</Label>
                      <select id="educationLevel" className={selectClass()} {...profileForm.register("educationLevel")}>
                        <option value="">{t.profile.pickOption}</option>
                        {EDUCATION_VALUES.map((v) => (
                          <option key={v} value={v}>{t.enums.educationLevel[v]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="institutionName">{t.profile.institutionName}</Label>
                      <Input id="institutionName" {...profileForm.register("institutionName")} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="graduatedFrom">{t.profile.graduatedFrom}</Label>
                      <select id="graduatedFrom" className={selectClass()} {...profileForm.register("graduatedFrom")}>
                        <option value="">{t.profile.pickOption}</option>
                        {GRADUATED_FROM_VALUES.map((v) => (
                          <option key={v} value={v}>{t.enums.graduatedFrom[v]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="graduatedCountry">{t.profile.graduatedCountry}</Label>
                      <select id="graduatedCountry" className={selectClass()} {...profileForm.register("graduatedCountry")}>
                        <option value="">{t.profile.pickOption}</option>
                        {COUNTRY_VALUES.map((v) => (
                          <option key={v} value={v}>{t.enums.country[v]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label htmlFor="fieldOfStudy">{t.profile.fieldOfStudy}</Label>
                      <Input id="fieldOfStudy" {...profileForm.register("fieldOfStudy")} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Languages */}
                <div>
                  <SectionHeader
                    icon={Globe}
                    title={t.profile.otherLanguages}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="englishLevel">{t.profile.englishLevel}</Label>
                      <select id="englishLevel" className={selectClass()} {...profileForm.register("englishLevel")}>
                        <option value="">{t.profile.pickOption}</option>
                        {LANGUAGE_VALUES.map((v) => (
                          <option key={v} value={v}>{t.enums.languageLevel[v]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="vietnameseLevel">{t.profile.vietnameseLevel}</Label>
                      <select id="vietnameseLevel" className={selectClass()} {...profileForm.register("vietnameseLevel")}>
                        <option value="">{t.profile.pickOption}</option>
                        {LANGUAGE_VALUES.map((v) => (
                          <option key={v} value={v}>{t.enums.languageLevel[v]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="chineseLevel">{t.profile.chineseLevel}</Label>
                      <select id="chineseLevel" className={selectClass()} {...profileForm.register("chineseLevel")}>
                        <option value="">{t.profile.pickOption}</option>
                        {LANGUAGE_VALUES.map((v) => (
                          <option key={v} value={v}>{t.enums.languageLevel[v]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="otherLanguages">{t.profile.otherLanguages}</Label>
                      <Input id="otherLanguages" {...profileForm.register("otherLanguages")} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={profileForm.formState.isSubmitting} size="lg">
                    {profileForm.formState.isSubmitting ? t.common.saving : t.profile.saveProfile}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security tab ── */}
        <TabsContent value="security">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t.profile.security}</CardTitle>
              <p className="text-sm text-muted-foreground">{t.profile.securityDescription}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={onPasswordSubmit} className="space-y-5 max-w-md">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="currentPassword">{t.profile.currentPassword}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      autoComplete="current-password"
                      className="pr-10"
                      aria-invalid={!!passwordForm.formState.errors.currentPassword}
                      {...passwordForm.register("currentPassword")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCurrent((v) => !v)}
                      tabIndex={-1}
                    >
                      {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="newPassword">{t.profile.newPassword}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      autoComplete="new-password"
                      className="pr-10"
                      aria-invalid={!!passwordForm.formState.errors.newPassword}
                      {...passwordForm.register("newPassword")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNew((v) => !v)}
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">{t.profile.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    aria-invalid={!!passwordForm.formState.errors.confirmPassword}
                    {...passwordForm.register("confirmPassword")}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={passwordForm.formState.isSubmitting} size="lg">
                    <KeyRound className="size-4" />
                    {passwordForm.formState.isSubmitting ? t.profile.updating : t.profile.updatePassword}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Appearance tab ── */}
        <TabsContent value="appearance">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <ALargeSmall className="size-4 text-muted-foreground" />
                ຂະໜາດຕົວໜັງສື
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                ປັບຂະໜາດຕົວໜັງສືທົ່ວທັງແອັບ. ການຕັ້ງຄ່ານີ້ຈະບັນທຶກໄວ້ໃນອຸປະກອນຂອງທ່ານ.
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                {sizeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFontSize(opt.value)}
                    style={{ fontSize: FONT_SIZE_PX[opt.value] }}
                    className={cn(
                      "flex h-16 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all",
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
