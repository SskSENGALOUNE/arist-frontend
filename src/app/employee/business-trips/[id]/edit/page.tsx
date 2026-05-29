"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { myBusinessTripService } from "@/services/business-trip";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BusinessTripForm,
  type BusinessTripFormValues,
} from "@/components/business-trips/business-trip-form";

export default function EditBusinessTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: trip, isLoading } = useQuery({
    queryKey: ["my-business-trips", id],
    queryFn: () => myBusinessTripService.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: BusinessTripFormValues) =>
      myBusinessTripService.update(id, {
        title: data.title,
        tripType: data.tripType,
        destinationProvince: data.destinationProvince ?? null,
        destinationCountry: data.destinationCountry ?? null,
        departureDate: data.departureDate,
        returnDate: data.returnDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business-trips"] });
      toast.success("Business trip updated");
      router.push(`/employee/business-trips/${id}`);
    },
    onError: () => toast.error("Failed to update trip"),
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

  if (trip.status === "VERIFIED") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <p className="text-muted-foreground">
          Verified trips cannot be edited.
        </p>
        <Link
          href={`/employee/business-trips/${id}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Back to trip
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-4 flex items-center gap-2">
        <Link
          href={`/employee/business-trips/${id}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ChevronLeft className="size-4" />
          Back
        </Link>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Business Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessTripForm
            initialTrip={trip}
            submitLabel="Save Changes"
            onSubmit={async (data) => {
              await updateMutation.mutateAsync(data);
            }}
            onCancel={() => router.push(`/employee/business-trips/${id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
