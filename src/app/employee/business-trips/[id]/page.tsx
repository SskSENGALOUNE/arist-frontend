"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ChevronLeft,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
} from "lucide-react";
import { myBusinessTripService } from "@/services/business-trip";
import type { BusinessTrip } from "@/types/business-trip";
import { TripStatusBadge } from "@/components/business-trips/trip-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function BusinessTripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: trip, isLoading } = useQuery({
    queryKey: ["my-business-trips", id],
    queryFn: () => myBusinessTripService.getById(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => myBusinessTripService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business-trips"] });
      toast.success("Trip deleted");
      router.push("/employee/business-trips");
    },
    onError: () => toast.error("Failed to delete trip"),
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

  const canEdit = trip.status !== "VERIFIED";

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link
          href="/employee/business-trips"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ChevronLeft className="size-4" />
          Back to list
        </Link>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Link
              href={`/employee/business-trips/${id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil className="size-3.5" />
              Edit
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5 text-destructive" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl">{trip.title}</CardTitle>
            <TripStatusBadge status={trip.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
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

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this business trip?</DialogTitle>
            <DialogDescription>
              This will permanently remove &quot;{trip.title}&quot;. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
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
