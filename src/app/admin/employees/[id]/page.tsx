"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Pencil, KeyRound, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  employeeService,
  type EmployeeUser,
} from "@/services/employee";
import { useT } from "@/lib/i18n";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { DeleteEmployeeDialog } from "@/components/employees/delete-employee-dialog";
import { ResetPasswordDialog } from "@/components/employees/reset-password-dialog";

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(locale === "lo" ? "lo-LA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(value: string | null | undefined, locale: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale === "lo" ? "lo-LA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getInitials(firstName?: string, lastName?: string, username?: string) {
  const fi = firstName?.trim()?.[0] ?? "";
  const li = lastName?.trim()?.[0] ?? "";
  const initials = `${fi}${li}`.toUpperCase();
  if (initials) return initials;
  return username?.slice(0, 2).toUpperCase() ?? "AR";
}

function Field({
  label,
  value,
  notSet,
}: {
  label: string;
  value: string | null | undefined;
  notSet: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">
        {value ?? <span className="text-muted-foreground">{notSet}</span>}
      </p>
    </div>
  );
}

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useT();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeeService.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      employeeService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(t.employees.toastUpdated);
    },
    onError: () => toast.error(t.employees.toastSaveFailed),
  });

  const deleteMutation = useMutation({
    mutationFn: () => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(t.employees.toastDeleted);
      router.push("/admin/employees");
    },
    onError: () => toast.error(t.employees.toastDeleteFailed),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (newPassword: string) =>
      employeeService.resetPassword(id, newPassword),
    onSuccess: () => toast.success(t.resetPasswordDialog.success),
    onError: () => toast.error(t.resetPasswordDialog.failed),
  });

  const employee: EmployeeUser | undefined = data;
  const localeRaw =
    typeof document !== "undefined" ? document.documentElement.lang : "en";

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">{t.common.loading}</div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Link
          href="/admin/employees"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-4" />
          {t.employeeDetail.backToList}
        </Link>
        <p className="text-sm text-muted-foreground">
          {t.employeeDetail.notFound}
        </p>
      </div>
    );
  }

  const displayName =
    `${employee.firstName} ${employee.lastName}`.trim() || employee.username;
  const initials = getInitials(
    employee.firstName,
    employee.lastName,
    employee.username,
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/employees"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-4" />
          {t.employeeDetail.backToList}
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFormOpen(true)}
          >
            <Pencil className="size-3.5" />
            {t.common.edit}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetOpen(true)}
          >
            <KeyRound className="size-3.5" />
            {t.common.resetPassword}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" />
            {t.common.delete}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {employee.photoUrl && (
                <AvatarImage src={employee.photoUrl} alt={displayName} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">{displayName}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={employee.role === "ADMIN" ? "default" : "secondary"}
                >
                  {employee.role}
                </Badge>
                <Badge
                  variant={employee.isActive ? "outline" : "destructive"}
                >
                  {employee.isActive
                    ? t.employees.statusActive
                    : t.employees.statusInactive}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.employeeDetail.accountInfo}</CardTitle>
            <CardDescription>
              {t.employeeDetail.accountInfoDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label={t.employeeDetail.username}
              value={employee.username}
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.email}
              value={employee.email}
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.role}
              value={employee.role}
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.status}
              value={
                employee.isActive
                  ? t.employees.statusActive
                  : t.employees.statusInactive
              }
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.mustChangePassword}
              value={employee.mustChangePassword ? t.common.yes : t.common.no}
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.lastLoginAt}
              value={formatDate(employee.lastLoginAt, localeRaw)}
              notSet={t.common.notSet}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.employeeDetail.hrProfile}</CardTitle>
            <CardDescription>
              {t.employeeDetail.hrProfileDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label={t.employeeDetail.gender}
              value={
                employee.gender
                  ? t.enums.gender[employee.gender]
                  : null
              }
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.educationLevel}
              value={
                employee.educationLevel
                  ? t.enums.educationLevel[employee.educationLevel]
                  : null
              }
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.institutionName}
              value={employee.institutionName}
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.fieldOfStudy}
              value={employee.fieldOfStudy}
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.graduatedFrom}
              value={
                employee.graduatedFrom
                  ? t.enums.graduatedFrom[employee.graduatedFrom]
                  : null
              }
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.graduatedCountry}
              value={
                employee.graduatedCountry
                  ? t.enums.country[employee.graduatedCountry]
                  : null
              }
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.englishLevel}
              value={
                employee.englishLevel
                  ? t.enums.languageLevel[employee.englishLevel]
                  : null
              }
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.vietnameseLevel}
              value={
                employee.vietnameseLevel
                  ? t.enums.languageLevel[employee.vietnameseLevel]
                  : null
              }
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.chineseLevel}
              value={
                employee.chineseLevel
                  ? t.enums.languageLevel[employee.chineseLevel]
                  : null
              }
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.otherLanguages}
              value={employee.otherLanguages}
              notSet={t.common.notSet}
            />
            <Field
              label={t.employeeDetail.passportExpiry}
              value={formatDateOnly(employee.passportExpiry, localeRaw)}
              notSet={t.common.notSet}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.employeeDetail.metadata}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Field
            label={t.employeeDetail.createdAt}
            value={formatDate(employee.createdAt, localeRaw)}
            notSet={t.common.notSet}
          />
          <Field
            label={t.employeeDetail.updatedAt}
            value={formatDate(employee.updatedAt, localeRaw)}
            notSet={t.common.notSet}
          />
        </CardContent>
      </Card>

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={employee}
        onSubmit={async (formData) => {
          await updateMutation.mutateAsync(
            formData as Record<string, unknown>,
          );
        }}
      />

      <DeleteEmployeeDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        employee={employee}
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />

      <ResetPasswordDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        employee={employee}
        onConfirm={async (newPassword) => {
          await resetPasswordMutation.mutateAsync(newPassword);
        }}
      />
    </div>
  );
}
