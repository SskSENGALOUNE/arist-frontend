"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, KeyRound, ShieldCheck, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth";
import { meService, type UpdateProfileData } from "@/services/me";
import { useT } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      currentPassword: z
        .string()
        .min(1, t.profile.currentPasswordRequired),
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
  photoUrl: string;
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
  return "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
}

const GENDER_VALUES: Gender[] = ["MALE", "FEMALE", "OTHER"];
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

export default function ProfilePage() {
  const storedUser = useAuthStore((s) => s.user);
  const t = useT();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(
        storedUser?.role === "ADMIN"
          ? "/admin/dashboard"
          : "/employee/dashboard",
      );
    }
  };

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<
    { kind: "success" | "error"; message: string } | null
  >(null);
  const [profileFeedback, setProfileFeedback] = useState<
    { kind: "success" | "error"; message: string } | null
  >(null);

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
      photoUrl: "",
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
      photoUrl: me.photoUrl ?? "",
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
      passportExpiry: me.passportExpiry
        ? me.passportExpiry.slice(0, 10)
        : "",
    });
  }, [me, profileForm]);

  const profileMutation = useMutation({
    mutationFn: meService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const onPasswordSubmit = passwordForm.handleSubmit(async (data) => {
    setPasswordFeedback(null);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordFeedback({
        kind: "success",
        message: t.profile.passwordUpdated,
      });
      passwordForm.reset();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? t.profile.passwordFailed;
      setPasswordFeedback({ kind: "error", message });
    }
  });

  const onProfileSubmit = profileForm.handleSubmit(async (data) => {
    setProfileFeedback(null);
    const payload: UpdateProfileData = {};
    if (data.photoUrl) payload.photoUrl = data.photoUrl;
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
      setProfileFeedback({
        kind: "success",
        message: t.profile.profileUpdated,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? t.profile.profileFailed;
      setProfileFeedback({ kind: "error", message });
    }
  });

  const user = me ?? storedUser;
  if (!user) {
    if (isLoading) {
      return (
        <div className="p-6 text-sm text-muted-foreground">
          {t.profile.loading}
        </div>
      );
    }
    return null;
  }

  const initials = getInitials(user.firstName, user.lastName, user.username);
  const displayName =
    `${user.firstName} ${user.lastName}`.trim() || user.username;

  return (
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
        <h2 className="text-2xl font-semibold tracking-tight">
          {t.profile.title}
        </h2>
        <p className="text-sm text-muted-foreground">{t.profile.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t.profile.account}</CardTitle>
            <CardDescription>{t.profile.accountDescription}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-2">
            <Avatar className="size-20">
              {me?.photoUrl && (
                <AvatarImage src={me.photoUrl} alt={displayName} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-base font-semibold">{displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge
                variant={user.role === "ADMIN" ? "default" : "secondary"}
                className="mt-1"
              >
                {user.role === "ADMIN"
                  ? t.topbar.administrator
                  : t.topbar.employee}
              </Badge>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 border-t pt-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t.profile.username}
                </p>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t.profile.firstName}
                </p>
                <p className="font-medium">{user.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t.profile.lastName}
                </p>
                <p className="font-medium">{user.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t.profile.role}
                </p>
                <p className="font-medium">{user.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCog className="size-4 text-muted-foreground" />
              <CardTitle>{t.profile.hrProfile}</CardTitle>
            </div>
            <CardDescription>{t.profile.hrProfileDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={onProfileSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              {profileFeedback && (
                <div
                  className={
                    "md:col-span-2 " +
                    (profileFeedback.kind === "success"
                      ? "rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
                      : "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive")
                  }
                >
                  {profileFeedback.message}
                </div>
              )}

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label htmlFor="photoUrl">{t.profile.photoUrl}</Label>
                <Input
                  id="photoUrl"
                  type="url"
                  placeholder="https://..."
                  {...profileForm.register("photoUrl")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gender">{t.profile.gender}</Label>
                <select
                  id="gender"
                  className={selectClass()}
                  {...profileForm.register("gender")}
                >
                  <option value="">{t.profile.pickOption}</option>
                  {GENDER_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {t.enums.gender[v]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="passportExpiry">
                  {t.profile.passportExpiry}
                </Label>
                <Input
                  id="passportExpiry"
                  type="date"
                  {...profileForm.register("passportExpiry")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="educationLevel">
                  {t.profile.educationLevel}
                </Label>
                <select
                  id="educationLevel"
                  className={selectClass()}
                  {...profileForm.register("educationLevel")}
                >
                  <option value="">{t.profile.pickOption}</option>
                  {EDUCATION_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {t.enums.educationLevel[v]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="institutionName">
                  {t.profile.institutionName}
                </Label>
                <Input
                  id="institutionName"
                  {...profileForm.register("institutionName")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="graduatedFrom">
                  {t.profile.graduatedFrom}
                </Label>
                <select
                  id="graduatedFrom"
                  className={selectClass()}
                  {...profileForm.register("graduatedFrom")}
                >
                  <option value="">{t.profile.pickOption}</option>
                  {GRADUATED_FROM_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {t.enums.graduatedFrom[v]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="graduatedCountry">
                  {t.profile.graduatedCountry}
                </Label>
                <select
                  id="graduatedCountry"
                  className={selectClass()}
                  {...profileForm.register("graduatedCountry")}
                >
                  <option value="">{t.profile.pickOption}</option>
                  {COUNTRY_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {t.enums.country[v]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label htmlFor="fieldOfStudy">{t.profile.fieldOfStudy}</Label>
                <Input
                  id="fieldOfStudy"
                  {...profileForm.register("fieldOfStudy")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="englishLevel">{t.profile.englishLevel}</Label>
                <select
                  id="englishLevel"
                  className={selectClass()}
                  {...profileForm.register("englishLevel")}
                >
                  <option value="">{t.profile.pickOption}</option>
                  {LANGUAGE_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {t.enums.languageLevel[v]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vietnameseLevel">
                  {t.profile.vietnameseLevel}
                </Label>
                <select
                  id="vietnameseLevel"
                  className={selectClass()}
                  {...profileForm.register("vietnameseLevel")}
                >
                  <option value="">{t.profile.pickOption}</option>
                  {LANGUAGE_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {t.enums.languageLevel[v]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chineseLevel">{t.profile.chineseLevel}</Label>
                <select
                  id="chineseLevel"
                  className={selectClass()}
                  {...profileForm.register("chineseLevel")}
                >
                  <option value="">{t.profile.pickOption}</option>
                  {LANGUAGE_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {t.enums.languageLevel[v]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="otherLanguages">
                  {t.profile.otherLanguages}
                </Label>
                <Input
                  id="otherLanguages"
                  {...profileForm.register("otherLanguages")}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 md:col-span-2">
                <Button
                  type="submit"
                  disabled={profileForm.formState.isSubmitting}
                >
                  {profileForm.formState.isSubmitting
                    ? t.common.saving
                    : t.profile.saveProfile}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <CardTitle>{t.profile.security}</CardTitle>
            </div>
            <CardDescription>{t.profile.securityDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={onPasswordSubmit}
              className="flex max-w-md flex-col gap-4"
            >
              {passwordFeedback && (
                <div
                  className={
                    passwordFeedback.kind === "success"
                      ? "rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
                      : "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  }
                >
                  {passwordFeedback.message}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currentPassword">
                  {t.profile.currentPassword}
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    autoComplete="current-password"
                    className="pr-9"
                    aria-invalid={!!passwordForm.formState.errors.currentPassword}
                    {...passwordForm.register("currentPassword")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrent((v) => !v)}
                    tabIndex={-1}
                  >
                    {showCurrent ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">{t.profile.newPassword}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-9"
                    aria-invalid={!!passwordForm.formState.errors.newPassword}
                    {...passwordForm.register("newPassword")}
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
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">
                  {t.profile.confirmPassword}
                </Label>
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

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  <KeyRound className="size-4" />
                  {passwordForm.formState.isSubmitting
                    ? t.profile.updating
                    : t.profile.updatePassword}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
