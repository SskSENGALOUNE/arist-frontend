"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { businessTripService } from "@/services/business-trip";
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

function formatOwner(trip: BusinessTrip): string {
  if (!trip.user) return "—";
  const name = `${trip.user.firstName} ${trip.user.lastName}`.trim();
  return name || trip.user.email;
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

export default function AllBusinessTripsPage() {
  const [params, setParams] = useState<ListBusinessTripsParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["all-business-trips", params],
    queryFn: () => businessTripService.list(params),
  });

  const pagination = data?.pagination;

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">All Business Trips</h2>
          <p className="text-sm text-muted-foreground">
            View business trips logged by everyone. You can only edit your own
            from &quot;Business Trips&quot;.
          </p>
        </div>

        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Owner</TableHead>
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
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !data?.items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No business trips found.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/employee/business-trips/all/${trip.id}`}
                        className="hover:underline"
                      >
                        {trip.title}
                      </Link>
                    </TableCell>
                    <TableCell>{formatOwner(trip)}</TableCell>
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
                      <Link
                        href={`/employee/business-trips/all/${trip.id}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon-xs",
                        })}
                        title="View"
                      >
                        <Eye className="size-3.5" />
                      </Link>
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
    </div>
  );
}
