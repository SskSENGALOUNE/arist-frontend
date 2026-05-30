"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  User,
} from "lucide-react";
import { businessTripService } from "@/services/business-trip";
import type { BusinessTrip, TripStatus } from "@/types/business-trip";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

export default function AllBusinessTripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: trip, isLoading } = useQuery({
    queryKey: ["all-business-trips", id],
    queryFn: () => businessTripService.getById(id),
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Trip not found
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-4">
        <Link
          href="/employee/business-trips/all"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ChevronLeft className="size-4" />
          Back to all trips
        </Link>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl">{trip.title}</CardTitle>
            <Badge variant={statusVariant(trip.status)}>{trip.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            <InfoRow
              label="Owner"
              icon={<User className="size-3.5" />}
              value={formatOwner(trip)}
            />
            <InfoRow label="Trip Type" value={trip.tripType} />
            <InfoRow
              label="Destination"
              icon={<MapPin className="size-3.5" />}
              value={formatDestination(trip)}
            />
            <InfoRow
              label="Departure"
              icon={<Calendar className="size-3.5" />}
              value={format(new Date(trip.departureDate), "PP")}
            />
            <InfoRow
              label="Return"
              icon={<Calendar className="size-3.5" />}
              value={format(new Date(trip.returnDate), "PP")}
            />
            <InfoRow
              label="Created"
              value={format(new Date(trip.createdAt), "PPp")}
            />
            <InfoRow
              label="Last Updated"
              value={format(new Date(trip.updatedAt), "PPp")}
            />
          </div>

          {trip.status === "VERIFIED" && trip.verifiedAt && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border bg-emerald-50 p-3 text-sm dark:bg-emerald-950/30">
              <CheckCircle2 className="size-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-100">
                  Verified by admin
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {format(new Date(trip.verifiedAt), "PPp")}
                </p>
              </div>
            </div>
          )}

          {trip.status === "REJECTED" && trip.rejectionReason && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border bg-destructive/5 p-3 text-sm">
              <XCircle className="size-4 mt-0.5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  Rejected by admin
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {trip.rejectionReason}
                </p>
                {trip.verifiedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(trip.verifiedAt), "PPp")}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
