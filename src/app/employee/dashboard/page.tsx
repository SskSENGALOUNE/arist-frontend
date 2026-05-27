"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, UserCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth";
import { useT } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

function getInitials(firstName?: string, lastName?: string, username?: string) {
  const fi = firstName?.trim()?.[0] ?? "";
  const li = lastName?.trim()?.[0] ?? "";
  const initials = `${fi}${li}`.toUpperCase();
  if (initials) return initials;
  return username?.slice(0, 2).toUpperCase() ?? "AR";
}

export default function EmployeeDashboardPage() {
  const t = useT();
  const storedUser = useAuthStore((s) => s.user);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: authService.me,
  });

  const user = me ?? storedUser;
  if (!user) return null;

  const displayName =
    `${user.firstName} ${user.lastName}`.trim() || user.username;
  const initials = getInitials(user.firstName, user.lastName, user.username);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t.employeeDashboard.welcome(displayName)}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t.employeeDashboard.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t.employeeDashboard.yourAccount}</CardTitle>
            <CardDescription>
              {t.employeeDashboard.yourAccountDescription}
            </CardDescription>
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
              <Badge variant="secondary" className="mt-1">
                {t.topbar.employee}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Link
          href="/employee/profile"
          className="group block lg:col-span-1"
        >
          <Card className="h-full transition-colors group-hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCircle className="size-5 text-muted-foreground" />
                <CardTitle>{t.employeeDashboard.profileCta}</CardTitle>
              </div>
              <CardDescription>
                {t.employeeDashboard.profileCtaDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {t.common.edit}
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/employee/profile#security"
          className="group block lg:col-span-1"
        >
          <Card className="h-full transition-colors group-hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="size-5 text-muted-foreground" />
                <CardTitle>{t.employeeDashboard.securityCta}</CardTitle>
              </div>
              <CardDescription>
                {t.employeeDashboard.securityCtaDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {t.profile.updatePassword}
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
