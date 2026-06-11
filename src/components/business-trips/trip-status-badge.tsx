import { cn } from "@/lib/utils";
import type { TripStatus } from "@/types/business-trip";

const statusClasses: Record<TripStatus, string> = {
  VERIFIED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  PENDING: "bg-amber-50 text-amber-700",
  DRAFT: "bg-muted text-muted-foreground",
};

export function TripStatusBadge({
  status,
  className,
}: {
  status: TripStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusClasses[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
