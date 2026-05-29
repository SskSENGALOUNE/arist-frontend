"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function NewBusinessTripPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: BusinessTripFormValues) =>
      myBusinessTripService.create({
        title: data.title,
        tripType: data.tripType,
        destinationProvince: data.destinationProvince ?? null,
        destinationCountry: data.destinationCountry ?? null,
        departureDate: data.departureDate,
        returnDate: data.returnDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business-trips"] });
      toast.success("Business trip created");
      router.push("/employee/business-trips");
    },
    onError: () => toast.error("Failed to create trip"),
  });

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/employee/business-trips"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ChevronLeft className="size-4" />
          Back
        </Link>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New Business Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessTripForm
            submitLabel="Create Trip"
            onSubmit={async (data) => {
              await createMutation.mutateAsync(data);
            }}
            onCancel={() => router.push("/employee/business-trips")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
