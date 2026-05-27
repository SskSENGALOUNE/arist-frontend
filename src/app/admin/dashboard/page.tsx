"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { employeeService } from "@/services/employee";
import { useAuthStore } from "@/stores/auth";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const t = useT();

  const allQuery = useQuery({
    queryKey: ["dashboard", "all"],
    queryFn: () => employeeService.list({ page: 1, limit: 100 }),
  });

  const recentQuery = useQuery({
    queryKey: ["dashboard", "recent"],
    queryFn: () =>
      employeeService.list({
        page: 1,
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
  });

  const items = allQuery.data?.items ?? [];
  const total = allQuery.data?.pagination.total ?? 0;
  const active = items.filter((u) => u.isActive).length;
  const inactive = items.filter((u) => !u.isActive).length;
  const admins = items.filter((u) => u.role === "ADMIN").length;

  const stats = [
    {
      label: t.dashboard.totalEmployees,
      value: total,
      icon: Users,
      hint: t.dashboard.totalEmployeesHint,
    },
    {
      label: t.dashboard.active,
      value: active,
      icon: UserCheck,
      hint: t.dashboard.activeHint,
    },
    {
      label: t.dashboard.inactive,
      value: inactive,
      icon: UserX,
      hint: t.dashboard.inactiveHint,
    },
    {
      label: t.dashboard.administrators,
      value: admins,
      icon: ShieldCheck,
      hint: t.dashboard.administratorsHint,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t.dashboard.welcomeBack(user?.firstName)}
        </h2>
        <p className="text-sm text-muted-foreground">{t.dashboard.overview}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} size="sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>{s.label}</CardDescription>
                <s.icon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                {allQuery.isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  s.value
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle>{t.dashboard.recentEmployees}</CardTitle>
            <CardDescription>
              {t.dashboard.recentEmployeesDescription}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/employees" />}
          >
            {t.dashboard.viewAll}
            <ArrowRight className="size-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentQuery.isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !recentQuery.data?.items.length ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t.dashboard.noEmployees}
            </p>
          ) : (
            <ul className="divide-y">
              {recentQuery.data.items.map((emp) => (
                <li
                  key={emp.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {emp.email}
                    </p>
                  </div>
                  <Badge
                    variant={emp.role === "ADMIN" ? "default" : "secondary"}
                  >
                    {emp.role}
                  </Badge>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {formatDate(emp.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
