"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plane,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  myBusinessTripService,
} from "@/services/business-trip";
import type {
  BusinessTrip,
  ListBusinessTripsParams,
  TripStatus,
} from "@/types/business-trip";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function statusPillClass(status: TripStatus): string {
  switch (status) {
    case "VERIFIED":
      return "bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "bg-red-50 text-red-700";
    case "PENDING":
      return "bg-amber-50 text-amber-700";
    case "DRAFT":
      return "bg-muted text-muted-foreground";
  }
}

export default function MyBusinessTripsPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState<ListBusinessTripsParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [deletingTrip, setDeletingTrip] = useState<BusinessTrip | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-business-trips", params],
    queryFn: () => myBusinessTripService.list(params),
  });

  // Stats — an employee's own trips are few, so fetch one page (≤ API cap)
  // and aggregate client-side by status.
  const { data: statsData } = useQuery({
    queryKey: ["my-business-trips-stats"],
    queryFn: () => myBusinessTripService.list({ page: 1, limit: 100 }),
  });

  const trips = statsData?.items ?? [];
  const stats = {
    total: statsData?.pagination.total ?? trips.length,
    pending: trips.filter((tr) => tr.status === "PENDING").length,
    verified: trips.filter((tr) => tr.status === "VERIFIED").length,
    rejected: trips.filter((tr) => tr.status === "REJECTED").length,
  };

  const statCards = [
    { label: "All", value: stats.total, icon: Plane, tint: "text-primary bg-primary/10" },
    { label: "Pending", value: stats.pending, icon: Clock, tint: "text-amber-600 bg-amber-50" },
    { label: "Verified", value: stats.verified, icon: CheckCircle2, tint: "text-emerald-600 bg-emerald-50" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, tint: "text-red-600 bg-red-50" },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => myBusinessTripService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business-trips"] });
      queryClient.invalidateQueries({ queryKey: ["my-business-trips-stats"] });
      toast.success("Trip deleted");
      setDeletingTrip(null);
    },
    onError: () => toast.error("Failed to delete trip"),
  });

  const pagination = data?.pagination;

  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <div className="p-6">
        {/* Heading */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              My Business Trips
            </h2>
            <p className="text-sm text-muted-foreground">
              Record your domestic and international trips for HR verification.
            </p>
          </div>
          <Link
            href="/employee/business-trips/new"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus className="size-4" />
            New Trip
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
                    Trips
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
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Return</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    No business trips yet. Click &quot;New Trip&quot; to add one.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/employee/business-trips/${trip.id}`}
                        className="hover:underline"
                      >
                        {trip.title}
                      </Link>
                    </TableCell>
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
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          statusPillClass(trip.status),
                        )}
                      >
                        {trip.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/employee/business-trips/${trip.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-xs",
                          })}
                          title="View"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        {trip.status !== "VERIFIED" && (
                          <>
                            <Link
                              href={`/employee/business-trips/${trip.id}/edit`}
                              className={buttonVariants({
                                variant: "ghost",
                                size: "icon-xs",
                              })}
                              title="Edit"
                            >
                              <Pencil className="size-3.5" />
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              title="Delete"
                              onClick={() => setDeletingTrip(trip)}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
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

      <Dialog
        open={!!deletingTrip}
        onOpenChange={(open) => !open && setDeletingTrip(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this business trip?</DialogTitle>
            <DialogDescription>
              This will permanently remove &quot;{deletingTrip?.title}&quot;.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingTrip(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deletingTrip && deleteMutation.mutate(deletingTrip.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
