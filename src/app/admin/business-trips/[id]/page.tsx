"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  User,
  Mail,
} from "lucide-react";
import { adminBusinessTripService } from "@/services/business-trip";
import type { BusinessTrip, TripStatus } from "@/types/business-trip";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export default function AdminBusinessTripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: trip, isLoading } = useQuery({
    queryKey: ["admin-business-trips", id],
    queryFn: () => adminBusinessTripService.getById(id),
  });

  const verifyMutation = useMutation({
    mutationFn: () => adminBusinessTripService.verify(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-business-trips"] });
      toast.success("Trip verified");
    },
    onError: () => toast.error("Failed to verify trip"),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => adminBusinessTripService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-business-trips"] });
      toast.success("Trip rejected");
      setRejectOpen(false);
      setRejectionReason("");
    },
    onError: () => toast.error("Failed to reject trip"),
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

  const canAct = trip.status !== "VERIFIED";

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link
          href="/admin/business-trips"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ChevronLeft className="size-4" />
          Back to list
        </Link>
        {canAct && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectOpen(true)}
              disabled={rejectMutation.isPending}
            >
              <XCircle className="size-3.5 text-destructive" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
            >
              <CheckCircle2 className="size-3.5" />
              {verifyMutation.isPending ? "Verifying..." : "Verify"}
            </Button>
          </div>
        )}
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
            {trip.user && (
              <>
                <InfoRow
                  label="Employee"
                  icon={<User className="size-3.5" />}
                  value={`${trip.user.firstName} ${trip.user.lastName}`.trim()}
                />
                <InfoRow
                  label="Email"
                  icon={<Mail className="size-3.5" />}
                  value={trip.user.email}
                />
              </>
            )}
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
              label="Submitted"
              value={format(new Date(trip.createdAt), "PPp")}
            />
          </div>

          {trip.status === "VERIFIED" && trip.verifiedAt && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border bg-emerald-50 p-3 text-sm dark:bg-emerald-950/30">
              <CheckCircle2 className="size-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-100">
                  Verified
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
                <p className="font-medium text-destructive">Rejected</p>
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

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject this business trip?</DialogTitle>
            <DialogDescription>
              Provide a reason so the employee can correct the record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              placeholder="e.g. Departure date does not match attendance log"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate(rejectionReason.trim())}
              disabled={
                !rejectionReason.trim() || rejectMutation.isPending
              }
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
