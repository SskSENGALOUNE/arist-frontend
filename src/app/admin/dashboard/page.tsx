"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowUpRight,
  Users,
  UserCheck,
  Plane,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { employeeService } from "@/services/employee";
import { adminBusinessTripService } from "@/services/business-trip";
import type { TripStatus } from "@/types/business-trip";
import { useAuthStore } from "@/stores/auth";
import { useT, useLocaleStore } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
<<<<<<< Updated upstream
import { Skeleton } from "@/components/ui/skeleton";

=======
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** "VIENTIANE_CAPITAL" → "Vientiane Capital" */
>>>>>>> Stashed changes
function formatPlace(name: string) {
  return name
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getInitials(firstName?: string, lastName?: string) {
  const fi = firstName?.trim()?.[0] ?? "";
  const li = lastName?.trim()?.[0] ?? "";
  return `${fi}${li}`.toUpperCase() || "AR";
}

const STATUS_COLOR: Record<TripStatus, string> = {
  PENDING: "#f59e0b",
  VERIFIED: "#10b981",
  REJECTED: "#ef4444",
  DRAFT: "#94a3b8",
};

const STATUS_BADGE: Record<TripStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  VERIFIED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  DRAFT: "bg-slate-100 text-slate-600",
};

const STORAGE_MONTH_KEY = "dashboard_traveler_month";
const STORAGE_YEAR_KEY = "dashboard_traveler_year";

function getStoredInt(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(key);
  return v ? parseInt(v, 10) : fallback;
}

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const [travelerPage, setTravelerPage] = useState(1);

  const now = new Date();
  const [travelerMonth, setTravelerMonth] = useState<number>(() =>
    getStoredInt(STORAGE_MONTH_KEY, now.getMonth() + 1),
  );
  const [travelerYear, setTravelerYear] = useState<number>(() =>
    getStoredInt(STORAGE_YEAR_KEY, now.getFullYear()),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_MONTH_KEY, String(travelerMonth));
    localStorage.setItem(STORAGE_YEAR_KEY, String(travelerYear));
  }, [travelerMonth, travelerYear]);

  const empStatsQuery = useQuery({
    queryKey: ["dashboard", "employee-stats"],
    queryFn: employeeService.getStats,
  });

  const tripStatsQuery = useQuery({
    queryKey: ["dashboard", "trip-stats"],
    queryFn: adminBusinessTripService.getStats,
  });

  const destinationQuery = useQuery({
    queryKey: ["dashboard", "destination-stats"],
    queryFn: adminBusinessTripService.getDestinationStats,
  });

  const travelersQuery = useQuery({
    queryKey: ["dashboard", "top-travelers", travelerPage, travelerMonth, travelerYear],
    queryFn: () =>
      adminBusinessTripService.getTopTravelers({
        page: travelerPage,
        limit: 5,
        month: travelerMonth,
        year: travelerYear,
      }),
  });

  const recentTripsQuery = useQuery({
    queryKey: ["dashboard", "recent-trips"],
    queryFn: () =>
      adminBusinessTripService.list({
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
  });

  const empStats = empStatsQuery.data;
  const tripStats = tripStatsQuery.data;
  const travelers = travelersQuery.data?.items ?? [];
  const travelerMax = travelers.reduce((m, tr) => Math.max(m, tr.tripCount), 0) || 1;
  const travelerPagination = travelersQuery.data?.pagination;
  const recentTrips = recentTripsQuery.data?.items ?? [];

  const barData = (destinationQuery.data?.topCountries ?? [])
    .slice(0, 7)
    .map((d) => ({ name: formatPlace(d.name), count: d.count }));

  const donutData = tripStats
    ? (["PENDING", "VERIFIED", "REJECTED", "DRAFT"] as TripStatus[])
        .map((s) => ({
          name: t.dashboard[`trip${s.charAt(0) + s.slice(1).toLowerCase()}` as "tripPending"],
          value: tripStats[s.toLowerCase() as keyof typeof tripStats] as number,
          color: STATUS_COLOR[s],
        }))
        .filter((d) => d.value > 0)
    : [];

  const today = new Date().toLocaleDateString(
    locale === "lo" ? "lo-LA" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );

  const statCards = [
    {
      label: t.dashboard.totalEmployees,
      value: empStats?.total ?? 0,
      unit: t.dashboard.peopleUnit,
      icon: Users,
      iconCls: "bg-violet-100 text-violet-600",
      href: "/admin/employees",
      loading: empStatsQuery.isLoading,
    },
    {
      label: t.dashboard.active,
      value: empStats?.active ?? 0,
      unit: t.dashboard.peopleUnit,
      icon: UserCheck,
      iconCls: "bg-emerald-100 text-emerald-600",
      href: "/admin/employees",
      loading: empStatsQuery.isLoading,
    },
    {
      label: t.dashboard.totalTrips,
      value: tripStats?.total ?? 0,
      unit: t.dashboard.tripsUnit,
      icon: Plane,
      iconCls: "bg-sky-100 text-sky-600",
      href: "/admin/business-trips",
      loading: tripStatsQuery.isLoading,
    },
    {
      label: t.dashboard.pendingApproval,
      value: tripStats?.pending ?? 0,
      unit: t.dashboard.tripsUnit,
      icon: Clock,
      iconCls: "bg-amber-100 text-amber-600",
      href: "/admin/business-trips",
      loading: tripStatsQuery.isLoading,
    },
  ];

  const statusLabel: Record<TripStatus, string> = {
    PENDING: t.dashboard.tripPending,
    VERIFIED: t.dashboard.tripVerified,
    REJECTED: t.dashboard.tripRejected,
    DRAFT: t.dashboard.tripDraft,
  };

  return (
<<<<<<< Updated upstream
    <div className="flex flex-1 flex-col gap-5 bg-muted/40 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t.dashboard.welcomeBack(user?.firstName)}!
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t.dashboard.overview}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-background px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm">
          <Calendar className="size-3.5" />
          <span>{today}</span>
        </div>
=======
    <div className="flex flex-1 flex-col gap-6 bg-muted/40 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {t.dashboard.welcomeBack(user?.firstName)}
        </h2>
        <p className="text-sm text-muted-foreground">{t.dashboard.overview}</p>
>>>>>>> Stashed changes
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative flex flex-col justify-between rounded-2xl border bg-background p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <ArrowUpRight className="size-4 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                {card.loading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <p className="text-3xl font-bold tracking-tight">
                    {card.value}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {card.unit}
                </p>
              </div>
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl",
                  card.iconCls,
                )}
              >
                <card.icon className="size-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Bar chart */}
        <div className="rounded-2xl border bg-background p-5 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-semibold">{t.dashboard.topDestinations}</h3>
            <p className="text-sm text-muted-foreground">
              {t.dashboard.topCountriesDescription}
            </p>
          </div>
          {destinationQuery.isLoading ? (
            <Skeleton className="h-52 w-full rounded-xl" />
          ) : barData.length === 0 ? (
            <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
              {t.dashboard.noTripData}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barCategoryGap="40%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  cursor={{ fill: "rgba(124,58,237,0.05)" }}
                  formatter={(v) => [v, t.dashboard.tripsUnit]}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut chart */}
        <div className="rounded-2xl border bg-background p-5 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-semibold">{t.dashboard.tripStatus}</h3>
            <ArrowUpRight className="size-4 text-muted-foreground/30" />
          </div>
          {tripStatsQuery.isLoading ? (
            <Skeleton className="mx-auto mt-6 size-36 rounded-full" />
          ) : donutData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              {t.dashboard.noTripData}
            </div>
          ) : (
            <>
              <div className="relative flex items-center justify-center">
                <PieChart width={188} height={188}>
                  <Pie
                    data={donutData}
                    cx={90}
                    cy={90}
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[11px] text-muted-foreground">
                    {t.dashboard.tripsUnit}
                  </p>
                  <p className="text-2xl font-bold">{tripStats?.total ?? 0}</p>
                </div>
              </div>
              <ul className="mt-1 space-y-2">
                {donutData.map((d) => (
                  <li key={d.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-muted-foreground">{d.name}</span>
                    </span>
                    <span className="font-semibold">{d.value}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent trips */}
        <div className="rounded-2xl border bg-background shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h3 className="font-semibold">{t.dashboard.recentTrips}</h3>
            <Link
              href="/admin/business-trips"
              className="flex items-center gap-0.5 text-sm text-primary hover:underline"
            >
              {t.dashboard.viewAll}
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {recentTripsQuery.isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentTrips.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              {t.dashboard.noRecentTrips}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {[
                    t.dashboard.tripTraveler,
                    t.dashboard.tripTitle,
                    t.dashboard.tripTypeLabel,
                    t.employees.status,
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="border-b last:border-b-0 hover:bg-muted/20"
                  >
                    <td className="px-5 py-3 font-medium">
                      {trip.user
                        ? `${trip.user.firstName} ${trip.user.lastName}`
                        : "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-5 py-3 text-muted-foreground">
                      {trip.title}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          trip.tripType === "INTERNATIONAL"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-violet-50 text-violet-700",
                        )}
                      >
                        {trip.tripType === "INTERNATIONAL"
                          ? t.dashboard.international
                          : t.dashboard.domestic}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_BADGE[trip.status],
                        )}
                      >
                        {statusLabel[trip.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top travelers */}
        <div className="rounded-2xl border bg-background shadow-sm">
          <div className="flex flex-col gap-2 border-b px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t.dashboard.topTravelers}</h3>
              <ArrowUpRight className="size-4 text-muted-foreground/30" />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {t.dashboard.travelerMonthLabel}:
              </span>
              <select
                value={travelerMonth}
                onChange={(e) => {
                  setTravelerMonth(Number(e.target.value));
                  setTravelerPage(1);
                }}
                className="rounded-md border bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleString(
                      locale === "lo" ? "lo-LA" : "en-US",
                      { month: "short" },
                    )}
                  </option>
                ))}
              </select>
              <select
                value={travelerYear}
                onChange={(e) => {
                  setTravelerYear(Number(e.target.value));
                  setTravelerPage(1);
                }}
                className="rounded-md border bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
          <div className="p-5">
            {travelersQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : travelers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t.dashboard.noTravelers}
              </p>
            ) : (
              <ul className="space-y-4">
                {travelers.map((tr) => (
                  <li key={tr.userId}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                          {getInitials(tr.firstName, tr.lastName)}
                        </div>
                        <span className="text-sm font-medium">
                          {tr.firstName} {tr.lastName}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {tr.tripCount}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${(tr.tripCount / travelerMax) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {travelerPagination && travelerPagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  {t.employees.pageInfo(
                    travelerPagination.page,
                    travelerPagination.totalPages,
                    travelerPagination.total,
                  )}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    disabled={!travelerPagination.hasPrev}
                    onClick={() => setTravelerPage((p) => p - 1)}
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    disabled={!travelerPagination.hasNext}
                    onClick={() => setTravelerPage((p) => p + 1)}
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
