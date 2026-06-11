"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plane,
  Clock,
  CheckCircle2,
  XCircle,
  BookCheck,
  BookX,
} from "lucide-react";
import { adminBusinessTripService } from "@/services/business-trip";
import type {
  BusinessTrip,
  ListBusinessTripsParams,
} from "@/types/business-trip";
import { cn } from "@/lib/utils";
import { TripStatusBadge } from "@/components/business-trips/trip-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDestination(trip: BusinessTrip): string {
  if (trip.tripType === "DOMESTIC") {
    return trip.destinationProvince
      ? trip.destinationProvince.replace(/_/g, " ")
      : "—";
  }
  return trip.destinationCountry
    ? trip.destinationCountry.replace(/_/g, " ")
    : "—";
}

function employeeName(trip: BusinessTrip): string {
  if (trip.user) {
    return `${trip.user.firstName} ${trip.user.lastName}`.trim() || trip.user.email;
  }
  return trip.userId.slice(0, 8);
}

export default function AdminBusinessTripsPage() {
  const router = useRouter();
  const [params, setParams] = useState<ListBusinessTripsParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-business-trips", params],
    queryFn: () => adminBusinessTripService.list(params),
  });

  const { data: statsData } = useQuery({
    queryKey: ["admin-business-trips-stats"],
    queryFn: adminBusinessTripService.getStats,
  });

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, page: 1, search: search || undefined }));
  };

  const stats = {
    total: statsData?.total ?? 0,
    pending: statsData?.pending ?? 0,
    verified: statsData?.verified ?? 0,
    rejected: statsData?.rejected ?? 0,
    withPassport: statsData?.passportStats?.withPassport ?? 0,
    withoutPassport: statsData?.passportStats?.withoutPassport ?? 0,
  };

  const statCards = [
    { label: "All", value: stats.total, icon: Plane, tint: "text-primary bg-primary/10", unit: "Trips" },
    { label: "Pending", value: stats.pending, icon: Clock, tint: "text-amber-600 bg-amber-50", unit: "Trips" },
    { label: "Verified", value: stats.verified, icon: CheckCircle2, tint: "text-emerald-600 bg-emerald-50", unit: "Trips" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, tint: "text-red-600 bg-red-50", unit: "Trips" },
    { label: "Has Passport", value: stats.withPassport, icon: BookCheck, tint: "text-sky-600 bg-sky-50", unit: "People" },
    { label: "No Passport", value: stats.withoutPassport, icon: BookX, tint: "text-orange-600 bg-orange-50", unit: "People" },
  ];

  const pagination = data?.pagination;

  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <div className="p-6">
        {/* Heading */}
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight">
            All Business Trips
          </h2>
          <p className="text-sm text-muted-foreground">
            Review and verify business trips submitted by employees.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="flex items-center justify-between rounded-xl border bg-background p-4 shadow-sm"
            >
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {card.value}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {card.unit}
                  </span>
                </p>
              </div>
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-full",
                  card.tint,
                )}
              >
                <card.icon className="size-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-background p-3 shadow-sm">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by employee or title..."
              className="w-full pl-8 sm:w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* Table card */}
        <div className="rounded-xl border bg-background shadow-sm">
          <div className="flex items-center gap-6 border-b px-4">
            <button
              type="button"
              className="-mb-px border-b-2 border-primary py-3 text-sm font-medium text-foreground"
            >
              All trips
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Return</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !data?.items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No business trips found.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((trip) => (
                  <TableRow
                    key={trip.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/admin/business-trips/${trip.id}`)
                    }
                  >
                    <TableCell className="font-medium">
                      {employeeName(trip)}
                    </TableCell>
                    <TableCell>{trip.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{trip.tripType}</Badge>
                    </TableCell>
                    <TableCell>{formatDestination(trip)}</TableCell>
                    <TableCell>
                      {format(new Date(trip.departureDate), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(trip.returnDate), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>
                      <TripStatusBadge status={trip.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} —{" "}
                {pagination.total} total
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Rows per page
                  </span>
                  <select
                    value={params.limit}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        page: 1,
                        limit: Number(e.target.value),
                      }))
                    }
                    className="h-8 rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    disabled={!pagination.hasPrev}
                    onClick={() =>
                      setParams((prev) => ({
                        ...prev,
                        page: (prev.page ?? 1) - 1,
                      }))
                    }
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    disabled={!pagination.hasNext}
                    onClick={() =>
                      setParams((prev) => ({
                        ...prev,
                        page: (prev.page ?? 1) + 1,
                      }))
                    }
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
