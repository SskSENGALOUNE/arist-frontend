"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COUNTRIES,
  LAO_PROVINCES,
  type BusinessTrip,
  type LaoProvince,
  type TripType,
} from "@/types/business-trip";
import type { Country } from "@/types";

const schema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    tripType: z.enum(["DOMESTIC", "INTERNATIONAL"]),
    destinationProvince: z
      .enum([
        "VIENTIANE_CAPITAL",
        "PHONGSALI",
        "LUANG_NAMTHA",
        "OUDOMXAI",
        "BOKEO",
        "LUANG_PRABANG",
        "HUAPHANH",
        "XAYABOULI",
        "XIANGKHOUANG",
        "VIENTIANE",
        "BORIKHAMXAI",
        "KHAMMOUANE",
        "SAVANNAKHET",
        "SALAVAN",
        "SEKONG",
        "CHAMPASAK",
        "ATTAPEU",
        "XAISOMBOUN",
      ])
      .nullable()
      .optional(),
    destinationCountry: z
      .enum([
        "LAOS",
        "THAILAND",
        "VIETNAM",
        "CHINA",
        "CAMBODIA",
        "MYANMAR",
        "MALAYSIA",
        "SINGAPORE",
        "JAPAN",
        "SOUTH_KOREA",
        "USA",
        "UK",
        "AUSTRALIA",
        "FRANCE",
        "GERMANY",
        "RUSSIA",
        "CANADA",
        "OTHER",
      ])
      .nullable()
      .optional(),
    departureDate: z.string().min(1, "Departure date is required"),
    returnDate: z.string().min(1, "Return date is required"),
  })
  .refine(
    (data) =>
      data.tripType === "DOMESTIC"
        ? !!data.destinationProvince
        : !!data.destinationCountry,
    {
      message: "Select a destination matching the trip type",
      path: ["destinationProvince"],
    },
  )
  .refine((data) => data.returnDate >= data.departureDate, {
    message: "Return date must be on or after departure date",
    path: ["returnDate"],
  });

export type BusinessTripFormValues = z.infer<typeof schema>;

interface BusinessTripFormProps {
  initialTrip?: BusinessTrip | null;
  submitLabel: string;
  onSubmit: (data: BusinessTripFormValues) => Promise<void>;
  onCancel?: () => void;
}

function toDateInput(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function BusinessTripForm({
  initialTrip,
  submitLabel,
  onSubmit,
  onCancel,
}: BusinessTripFormProps) {
  const form = useForm<BusinessTripFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      tripType: "DOMESTIC",
      destinationProvince: null,
      destinationCountry: null,
      departureDate: "",
      returnDate: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (initialTrip) {
      reset({
        title: initialTrip.title,
        tripType: initialTrip.tripType,
        destinationProvince: initialTrip.destinationProvince,
        destinationCountry: initialTrip.destinationCountry,
        departureDate: toDateInput(initialTrip.departureDate),
        returnDate: toDateInput(initialTrip.returnDate),
      });
    }
  }, [initialTrip, reset]);

  const tripType = watch("tripType");

  useEffect(() => {
    if (tripType === "DOMESTIC") {
      setValue("destinationCountry", null);
    } else {
      setValue("destinationProvince", null);
    }
  }, [tripType, setValue]);

  const submit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. Site visit at Luang Prabang branch"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Trip Type</Label>
        <Controller
          control={control}
          name="tripType"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => field.onChange(v as TripType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DOMESTIC">Domestic (Lao)</SelectItem>
                <SelectItem value="INTERNATIONAL">International</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {tripType === "DOMESTIC" ? (
        <div className="space-y-1.5">
          <Label>Destination Province</Label>
          <Controller
            control={control}
            name="destinationProvince"
            render={({ field }) => (
              <Select
                value={field.value ?? null}
                onValueChange={(v) => field.onChange(v as LaoProvince)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a province" />
                </SelectTrigger>
                <SelectContent>
                  {LAO_PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.destinationProvince && (
            <p className="text-xs text-destructive">
              {errors.destinationProvince.message}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>Destination Country</Label>
          <Controller
            control={control}
            name="destinationCountry"
            render={({ field }) => (
              <Select
                value={field.value ?? null}
                onValueChange={(v) => field.onChange(v as Country)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.destinationCountry && (
            <p className="text-xs text-destructive">
              {errors.destinationCountry.message}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="departureDate">Departure Date</Label>
          <Input
            id="departureDate"
            type="date"
            {...register("departureDate")}
          />
          {errors.departureDate && (
            <p className="text-xs text-destructive">
              {errors.departureDate.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="returnDate">Return Date</Label>
          <Input id="returnDate" type="date" {...register("returnDate")} />
          {errors.returnDate && (
            <p className="text-xs text-destructive">
              {errors.returnDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
