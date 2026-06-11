"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  User,
  Mail,
  Clock,
  Plane,
  Globe,
  Building2,
  Timer,
} from "lucide-react";
import { adminBusinessTripService } from "@/services/business-trip";
import type { BusinessTrip, TripStatus } from "@/types/business-trip";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { cn } from "@/lib/utils";

function statusConfig(status: TripStatus) {
  switch (status) {
    case "VERIFIED":
      return {
        variant: "default" as const,
        label: "Verified",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-emerald-200 dark:border-emerald-800",
        bar: "bg-emerald-500",
      };
    case "REJECTED":
      return {
        variant: "destructive" as const,
        label: "Rejected",
        color: "text-destructive",
        bg: "bg-destructive/5",
        border: "border-destructive/20",
        bar: "bg-destructive",
      };
    case "PENDING":
      return {
        variant: "outline" as const,
        label: "Pending Review",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-amber-200 dark:border-amber-800",
        bar: "bg-amber-500",
      };
    case "DRAFT":
      return {
        variant: "secondary" as const,
        label: "Draft",
        color: "text-muted-foreground",
        bg: "bg-muted/40",
        border: "border-border",
        bar: "bg-muted-foreground",
      };
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

function DetailItem({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function TimelineStep({
  icon,
  label,
  date,
  active,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  date: string | null;
  active: boolean;
  colorClass: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", !active && "opacity-40")}>
      <div
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
          active ? colorClass : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {date && (
          <p className="text-xs text-muted-foreground">
            {format(new Date(date), "PPp")}
          </p>
        )}
      </div>
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
      toast.success("Trip verified successfully");
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

  const canAct = trip.status === "PENDING";
  const cfg = statusConfig(trip.status);
  const tripDays =
    differenceInDays(
      new Date(trip.returnDate),
      new Date(trip.departureDate),
    ) + 1;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2">
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
              {verifyMutation.isPending ? "Verifying…" : "Verify"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column: Hero + Employee */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Hero card */}
          <Card className="overflow-hidden">
            <div className={cn("h-1 w-full", cfg.bar)} />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Plane className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl leading-tight">
                      {trip.title}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted{" "}
                      {format(new Date(trip.createdAt), "PPp")}
                    </p>
                  </div>
                </div>
                <Badge variant={cfg.variant} className="shrink-0">
                  {cfg.label}
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
              <DetailItem
                icon={
                  trip.tripType === "DOMESTIC" ? (
                    <Building2 className="size-4" />
                  ) : (
                    <Globe className="size-4" />
                  )
                }
                label="Trip Type"
                value={
                  trip.tripType === "DOMESTIC" ? "Domestic" : "International"
                }
              />
              <DetailItem
                icon={<MapPin className="size-4" />}
                label="Destination"
                value={formatDestination(trip)}
              />
              <DetailItem
                icon={<Calendar className="size-4" />}
                label="Departure Date"
                value={format(new Date(trip.departureDate), "PP")}
              />
              <DetailItem
                icon={<Calendar className="size-4" />}
                label="Return Date"
                value={format(new Date(trip.returnDate), "PP")}
              />
              <DetailItem
                icon={<Timer className="size-4" />}
                label="Duration"
                value={`${tripDays} day${tripDays !== 1 ? "s" : ""}`}
                className="sm:col-span-2"
              />
            </CardContent>
          </Card>

          {/* Employee card */}
          {trip.user && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Employee
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
                <DetailItem
                  icon={<User className="size-4" />}
                  label="Full Name"
                  value={`${trip.user.firstName} ${trip.user.lastName}`.trim()}
                />
                <DetailItem
                  icon={<Mail className="size-4" />}
                  label="Email"
                  value={trip.user.email}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Status timeline */}
        <div>
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Status Timeline
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col gap-4 pt-5">
              <TimelineStep
                icon={<Clock className="size-3.5 text-white" />}
                label="Submitted"
                date={trip.submittedAt ?? trip.createdAt}
                active={true}
                colorClass="bg-blue-500 text-white"
              />

              {trip.status === "VERIFIED" && (
                <TimelineStep
                  icon={<CheckCircle2 className="size-3.5 text-white" />}
                  label="Verified"
                  date={trip.verifiedAt}
                  active={true}
                  colorClass="bg-emerald-500 text-white"
                />
              )}

              {trip.status === "REJECTED" && (
                <>
                  <TimelineStep
                    icon={<XCircle className="size-3.5 text-white" />}
                    label="Rejected"
                    date={trip.verifiedAt}
                    active={true}
                    colorClass="bg-destructive text-white"
                  />
                  {trip.rejectionReason && (
                    <div
                      className={cn(
                        "rounded-lg border p-3 text-xs",
                        cfg.bg,
                        cfg.border,
                      )}
                    >
                      <p className="font-medium text-destructive mb-1">
                        Reason
                      </p>
                      <p className="text-muted-foreground">
                        {trip.rejectionReason}
                      </p>
                    </div>
                  )}
                </>
              )}

              {trip.status === "PENDING" && (
                <TimelineStep
                  icon={<Clock className="size-3.5" />}
                  label="Awaiting Review"
                  date={null}
                  active={false}
                  colorClass=""
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject dialog */}
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
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
