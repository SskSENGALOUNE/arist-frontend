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
} from "lucide-react";
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

function statusVariant(
  status: TripStatus,
): "default" | "outline" | "secondary" | "destructive" {
  switch (status) {
    case "VERIFIED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "DRAFT":
      return "secondary";
    case "PENDING":
      return "outline";
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => myBusinessTripService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business-trips"] });
      toast.success("Trip deleted");
      setDeletingTrip(null);
    },
    onError: () => toast.error("Failed to delete trip"),
  });

  const pagination = data?.pagination;

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">My Business Trips</h2>
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

        <div className="rounded-xl border bg-background">
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
                      <Badge variant={statusVariant(trip.status)}>
                        {trip.status}
                      </Badge>
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

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} —{" "}
                {pagination.total} total
              </p>
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
