"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
  Globe,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { employeeService } from "@/services/employee";
import { adminBusinessTripService } from "@/services/business-trip";
import type { DestinationStat, TripType } from "@/types/business-trip";
import { useAuthStore } from "@/stores/auth";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "VIENTIANE_CAPITAL" → "Vientiane Capital" */
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

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const t = useT();

  const statsQuery = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: employeeService.getStats,
  });

  const [travelerFilter, setTravelerFilter] = useState<TripType | "ALL">("ALL");
  const [travelerPage, setTravelerPage] = useState(1);

  const travelersQuery = useQuery({
    queryKey: ["dashboard", "top-travelers", travelerFilter, travelerPage],
    queryFn: () =>
      adminBusinessTripService.getTopTravelers({
        page: travelerPage,
        limit: 5,
        tripType: travelerFilter === "ALL" ? undefined : travelerFilter,
      }),
  });

  const travelerTabs: { key: TripType | "ALL"; label: string }[] = [
    { key: "ALL", label: t.dashboard.filterAll },
    { key: "INTERNATIONAL", label: t.dashboard.filterInternational },
    { key: "DOMESTIC", label: t.dashboard.filterDomestic },
  ];
  const travelers = travelersQuery.data?.items ?? [];
  const travelerMax = travelers.reduce((m, tr) => Math.max(m, tr.tripCount), 0) || 1;
  const travelerPagination = travelersQuery.data?.pagination;

  const destinationQuery = useQuery({
    queryKey: ["dashboard", "destination-stats"],
    queryFn: adminBusinessTripService.getDestinationStats,
  });

  const s = statsQuery.data;
  const statCards = [
    {
      label: t.dashboard.totalEmployees,
      value: s?.total ?? 0,
      icon: Users,
      tint: "text-primary bg-primary/10",
    },
    {
      label: t.dashboard.active,
      value: s?.active ?? 0,
      icon: UserCheck,
      tint: "text-emerald-600 bg-emerald-50",
    },
    {
      label: t.dashboard.inactive,
      value: s?.inactive ?? 0,
      icon: UserX,
      tint: "text-red-600 bg-red-50",
    },
    {
      label: t.dashboard.administrators,
      value: s?.admins ?? 0,
      icon: ShieldCheck,
      tint: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 bg-muted/40 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t.dashboard.welcomeBack(user?.firstName)}
        </h2>
        <p className="text-sm text-muted-foreground">{t.dashboard.overview}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center justify-between rounded-xl border bg-background p-4 shadow-sm"
          >
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <div className="mt-1 text-2xl font-semibold tracking-tight">
                {statsQuery.isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <>
                    {card.value}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      {t.dashboard.peopleUnit}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className={cn("flex size-11 items-center justify-center rounded-full", card.tint)}>
              <card.icon className="size-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RankList
          title={t.dashboard.topCountries}
          description={t.dashboard.topCountriesDescription}
          icon={Globe}
          items={destinationQuery.data?.topCountries ?? []}
          isLoading={destinationQuery.isLoading}
          emptyLabel={t.dashboard.noTripData}
          unit={t.dashboard.tripsUnit}
        />
        <RankList
          title={t.dashboard.topProvinces}
          description={t.dashboard.topProvincesDescription}
          icon={MapPin}
          items={destinationQuery.data?.topProvinces ?? []}
          isLoading={destinationQuery.isLoading}
          emptyLabel={t.dashboard.noTripData}
          unit={t.dashboard.tripsUnit}
        />
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t.dashboard.topTravelers}</CardTitle>
              <CardDescription>
                {t.dashboard.topTravelersDescription}
              </CardDescription>
            </div>
            {/* Filter tabs */}
            <div className="inline-flex rounded-lg border bg-muted/50 p-0.5">
              {travelerTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setTravelerFilter(tab.key);
                    setTravelerPage(1);
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    travelerFilter === tab.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {travelersQuery.isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !travelers.length ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t.dashboard.noTravelers}
            </p>
          ) : (
            <ul>
              {travelers.map((tr, i) => (
                <li
                  key={tr.userId}
                  className="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0"
                >
                  <span className="w-4 shrink-0 text-sm font-semibold text-muted-foreground">
                    {(travelerPagination?.page
                      ? (travelerPagination.page - 1) * travelerPagination.limit
                      : 0) +
                      i +
                      1}
                  </span>
                  <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">
                    {getInitials(tr.firstName, tr.lastName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-medium">
                        {tr.firstName} {tr.lastName}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {tr.tripCount} {t.dashboard.tripsUnit}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(tr.tripCount / travelerMax) * 100}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {travelerPagination && travelerPagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {t.employees.pageInfo(
                  travelerPagination.page,
                  travelerPagination.totalPages,
                  travelerPagination.total,
                )}
              </p>
              <div className="flex items-center gap-1">
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
        </CardContent>
      </Card>
    </div>
  );
}

function RankList({
  title,
  description,
  icon: Icon,
  items,
  isLoading,
  emptyLabel,
  unit,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  items: DestinationStat[];
  isLoading: boolean;
  emptyLabel: string;
  unit: string;
}) {
  const max = items.reduce((m, it) => Math.max(m, it.count), 0) || 1;

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full" />
            ))}
          </div>
        ) : !items.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {items.map((item, i) => (
              <li key={item.name} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-sm font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{formatPlace(item.name)}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {item.count} {unit}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(item.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
