"use client";

import { useEffect } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmployeeUser } from "@/services/employee";
import { departmentService } from "@/services/department";
import { positionService } from "@/services/position";
import { useT } from "@/lib/i18n";
import type { Gender } from "@/types";

function buildSchemas(t: ReturnType<typeof useT>) {
  const createSchema = z.object({
    username: z.string().min(1, t.employeeForm.usernameRequired),
    email: z.string().email(t.employeeForm.invalidEmail),
    password: z.string().min(8, t.employeeForm.passwordMin),
    firstName: z.string().min(1, t.employeeForm.firstNameRequired),
    lastName: z.string().min(1, t.employeeForm.lastNameRequired),
    role: z.enum(["ADMIN", "EMPLOYEE"]),
    gender: z
      .union([z.literal(""), z.enum(["MALE", "FEMALE"])])
      .refine((v) => v !== "", { message: t.employeeForm.genderRequired }),
    departmentId: z.string().optional(),
    positionId: z.string().optional(),
  });

  const editSchema = z.object({
    email: z.string().email(t.employeeForm.invalidEmail),
    firstName: z.string().min(1, t.employeeForm.firstNameRequired),
    lastName: z.string().min(1, t.employeeForm.lastNameRequired),
    role: z.enum(["ADMIN", "EMPLOYEE"]),
    isActive: z.boolean(),
    departmentId: z.string().optional(),
    positionId: z.string().optional(),
  });

  return { createSchema, editSchema };
}

type CreateFormValues = {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "EMPLOYEE";
  gender: Gender | "";
  departmentId?: string;
  positionId?: string;
};
type EditFormValues = {
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "EMPLOYEE";
  isActive: boolean;
  departmentId?: string;
  positionId?: string;
};

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeUser | null;
  onSubmit: (data: CreateFormValues | EditFormValues) => Promise<void>;
}

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  onSubmit,
}: EmployeeFormDialogProps) {
  const t = useT();
  const isEdit = !!employee;
  const { createSchema, editSchema } = buildSchemas(t);

  const { data: departments = [] } = useQuery({
    queryKey: ["departments", "active"],
    queryFn: () => departmentService.list(true),
    enabled: open,
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["positions", "active"],
    queryFn: () => positionService.list(true),
    enabled: open,
  });

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "EMPLOYEE" as const,
      gender: undefined,
      departmentId: "",
      positionId: "",
    },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "EMPLOYEE",
      isActive: true,
      departmentId: "",
      positionId: "",
    },
  });

  useEffect(() => {
    if (employee) {
      editForm.reset({
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
        isActive: employee.isActive,
        departmentId: employee.departmentId ?? "",
        positionId: employee.positionId ?? "",
      });
    } else {
      createForm.reset();
    }
  }, [employee, open]);

  // Fields shared by both create and edit forms. Create-only fields
  // (username/password/gender) and edit-only fields (isActive) are accessed
  // through createForm/editForm directly below.
  const form = (isEdit ? editForm : createForm) as unknown as UseFormReturn<{
    email: string;
    firstName: string;
    lastName: string;
    role: "ADMIN" | "EMPLOYEE";
    departmentId?: string;
    positionId?: string;
  }>;
  const { formState: { errors, isSubmitting } } = form;
  const createErrors = createForm.formState.errors;

  const handleSubmit = form.handleSubmit(async (data) => {
    const payload = {
      ...data,
      departmentId: data.departmentId || null,
      positionId: data.positionId || null,
      ...("gender" in data ? { gender: data.gender || null } : {}),
    };
    await onSubmit(payload as CreateFormValues | EditFormValues);
    onOpenChange(false);
    form.reset();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.employeeForm.editTitle : t.employeeForm.createTitle}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t.employeeForm.editDescription
              : t.employeeForm.createDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">{t.employeeForm.username}</Label>
              <Input
                id="username"
                aria-invalid={!!createErrors.username}
                {...createForm.register("username")}
              />
              {createErrors.username && (
                <p className="text-xs text-destructive">
                  {createErrors.username.message as string}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">{t.employeeForm.firstName}</Label>
              <Input
                id="firstName"
                aria-invalid={!!errors.firstName}
                {...form.register("firstName")}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">
                  {errors.firstName.message as string}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">{t.employeeForm.lastName}</Label>
              <Input
                id="lastName"
                aria-invalid={!!errors.lastName}
                {...form.register("lastName")}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">
                  {errors.lastName.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t.employeeForm.email}</Label>
            <Input
              id="email"
              type="email"
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">
                {errors.email.message as string}
              </p>
            )}
          </div>

          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{t.employeeForm.password}</Label>
              <Input
                id="password"
                type="password"
                aria-invalid={!!(errors as Record<string, unknown>).password}
                {...createForm.register("password")}
              />
              {(errors as Record<string, { message?: string }>).password && (
                <p className="text-xs text-destructive">
                  {(errors as Record<string, { message?: string }>).password?.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="departmentId">{t.employeeForm.department}</Label>
              <select
                id="departmentId"
                className={selectClass}
                {...form.register("departmentId")}
              >
                <option value="">{t.employeeForm.noDepartment}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="positionId">{t.employeeForm.position}</Label>
              <select
                id="positionId"
                className={selectClass}
                {...form.register("positionId")}
              >
                <option value="">{t.employeeForm.noPosition}</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">{t.employeeForm.role}</Label>
              <select
                id="role"
                className={selectClass}
                {...form.register("role")}
              >
                <option value="EMPLOYEE">{t.employeeForm.roleEmployee}</option>
                <option value="ADMIN">{t.employeeForm.roleAdmin}</option>
              </select>
            </div>
            {!isEdit && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gender">{t.employeeForm.gender}</Label>
                <select
                  id="gender"
                  className={selectClass}
                  aria-invalid={!!(errors as Record<string, unknown>).gender}
                  {...createForm.register("gender")}
                >
                  <option value="" disabled>
                    {t.employeeForm.selectGender}
                  </option>
                  <option value="MALE">{t.enums.gender.MALE}</option>
                  <option value="FEMALE">{t.enums.gender.FEMALE}</option>
                </select>
                {(errors as Record<string, { message?: string }>).gender && (
                  <p className="text-xs text-destructive">
                    {(errors as Record<string, { message?: string }>).gender?.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                className="size-4 rounded border-input"
                {...editForm.register("isActive")}
              />
              <Label htmlFor="isActive">{t.employeeForm.activeLabel}</Label>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t.common.saving
                : isEdit
                  ? t.common.saveChanges
                  : t.common.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
