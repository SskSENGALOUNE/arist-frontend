"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  KeyRound,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";
import {
  employeeService,
  type EmployeeUser,
  type ListUsersParams,
} from "@/services/employee";
import { useT, useLocaleStore } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { DeleteEmployeeDialog } from "@/components/employees/delete-employee-dialog";
import { ResetPasswordDialog } from "@/components/employees/reset-password-dialog";

function intlLocale(locale: string) {
  return locale === "lo" ? "lo-LA" : "en-US";
}

function getInitials(firstName?: string, lastName?: string, username?: string) {
  const fi = firstName?.trim()?.[0] ?? "";
  const li = lastName?.trim()?.[0] ?? "";
  const initials = `${fi}${li}`.toUpperCase();
  if (initials) return initials;
  return username?.slice(0, 2).toUpperCase() ?? "AR";
}

function formatAbsolute(value: string | null | undefined, locale: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(intlLocale(locale), {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

function formatRelative(value: string | null | undefined, locale: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), {
    numeric: "auto",
  });
  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (Math.abs(diffSec) >= secondsInUnit) {
      return rtf.format(Math.round(diffSec / secondsInUnit), unit);
    }
  }
  return rtf.format(diffSec, "second");
}

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);

  const [params, setParams] = useState<ListUsersParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeUser | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] =
    useState<EmployeeUser | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resettingEmployee, setResettingEmployee] =
    useState<EmployeeUser | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["employees", params],
    queryFn: () => employeeService.list(params),
  });

  const allIds = data?.items.map((e) => e.id) ?? [];
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Stats — dedicated backend endpoint returns accurate counts.
  const { data: statsData } = useQuery({
    queryKey: ["employee-stats"],
    queryFn: employeeService.getStats,
  });

  const stats = {
    total: statsData?.total ?? 0,
    active: statsData?.active ?? 0,
    inactive: statsData?.inactive ?? 0,
    admins: statsData?.admins ?? 0,
  };

  const statCards = [
    { label: t.employees.statsAll, value: stats.total, icon: Users, tint: "text-primary bg-primary/10" },
    { label: t.employees.statsActive, value: stats.active, icon: UserCheck, tint: "text-emerald-600 bg-emerald-50" },
    { label: t.employees.statsInactive, value: stats.inactive, icon: UserX, tint: "text-red-600 bg-red-50" },
    { label: t.employees.statsAdmins, value: stats.admins, icon: ShieldCheck, tint: "text-amber-600 bg-amber-50" },
  ];

  const createMutation = useMutation({
    mutationFn: employeeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee-stats"] });
      toast.success(t.employees.toastCreated);
    },
    onError: () => toast.error(t.employees.toastSaveFailed),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      employeeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee-stats"] });
      toast.success(t.employees.toastUpdated);
    },
    onError: () => toast.error(t.employees.toastSaveFailed),
  });

  const deleteMutation = useMutation({
    mutationFn: employeeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee-stats"] });
      toast.success(t.employees.toastDeleted);
    },
    onError: () => toast.error(t.employees.toastDeleteFailed),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      employeeService.resetPassword(id, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee-stats"] });
      toast.success(t.resetPasswordDialog.success);
    },
    onError: () => toast.error(t.resetPasswordDialog.failed),
  });

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, page: 1, search: search || undefined }));
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    if (editingEmployee) {
      await updateMutation.mutateAsync({
        id: editingEmployee.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(
        formData as unknown as Parameters<typeof employeeService.create>[0],
      );
    }
  };

  const handleDelete = async () => {
    if (deletingEmployee) {
      await deleteMutation.mutateAsync(deletingEmployee.id);
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    if (resettingEmployee) {
      await resetPasswordMutation.mutateAsync({
        id: resettingEmployee.id,
        newPassword,
      });
    }
  };

  const pagination = data?.pagination;

  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <div className="p-6">
        {/* Heading */}
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight">
            {t.employees.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t.employees.subtitle}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="flex items-center justify-between rounded-xl border bg-background p-4 shadow-sm"
            >
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {card.value}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {t.employees.peopleUnit}
                  </span>
                </p>
              </div>
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-full",
                  card.tint,
                )}
              >
                <card.icon className="size-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.employees.searchPlaceholder}
                className="w-72 pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              {t.common.search}
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingEmployee(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            {t.employees.addEmployee}
          </Button>
        </div>

        {/* Table card */}
        <div className="rounded-xl border bg-background shadow-sm">
          <div className="flex items-center gap-6 border-b px-4">
            <button
              type="button"
              className="-mb-px border-b-2 border-primary py-3 text-sm font-medium text-foreground"
            >
              {t.employees.allEmployees}
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border accent-primary"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>{t.employees.name}</TableHead>
                <TableHead>{t.employees.username}</TableHead>
                <TableHead>{t.employees.email}</TableHead>
                <TableHead>{t.employees.role}</TableHead>
                <TableHead>{t.employees.status}</TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={() =>
                      setParams((prev) => ({
                        ...prev,
                        page: 1,
                        sortBy: "lastLoginAt",
                        sortOrder:
                          prev.sortBy === "lastLoginAt" &&
                          prev.sortOrder === "desc"
                            ? "asc"
                            : "desc",
                      }))
                    }
                  >
                    {t.employees.lastLoginAt}
                    {params.sortBy === "lastLoginAt" &&
                      (params.sortOrder === "desc" ? (
                        <ChevronDown className="size-3.5" />
                      ) : (
                        <ChevronUp className="size-3.5" />
                      ))}
                  </button>
                </TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t.common.loading}
                  </TableCell>
                </TableRow>
              ) : !data?.items.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t.employees.noEmployees}
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((emp) => (
                  <TableRow
                    key={emp.id}
                    className="cursor-pointer"
                    data-selected={selectedIds.has(emp.id)}
                    onClick={() => router.push(`/admin/employees/${emp.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border accent-primary"
                        checked={selectedIds.has(emp.id)}
                        onChange={() => toggleOne(emp.id)}
                        aria-label={`Select ${emp.firstName} ${emp.lastName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 shrink-0">
                          {emp.photoUrl && (
                            <AvatarImage
                              src={emp.photoUrl}
                              alt={`${emp.firstName} ${emp.lastName}`}
                            />
                          )}
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitials(emp.firstName, emp.lastName, emp.username)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {emp.firstName} {emp.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{emp.username}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={emp.role === "ADMIN" ? "default" : "secondary"}
                      >
                        {emp.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          emp.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700",
                        )}
                      >
                        {emp.isActive
                          ? t.employees.statusActive
                          : t.employees.statusInactive}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.lastLoginAt ? (
                        <span title={formatAbsolute(emp.lastLoginAt, locale) ?? undefined}>
                          {formatRelative(emp.lastLoginAt, locale)}
                        </span>
                      ) : (
                        <span className="italic">
                          {t.employees.neverLoggedIn}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none">
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="bottom">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingEmployee(emp);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="size-3.5" />
                            {t.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setResettingEmployee(emp);
                              setResetOpen(true);
                            }}
                          >
                            <KeyRound className="size-3.5" />
                            {t.common.resetPassword}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setDeletingEmployee(emp);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                            {t.common.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {t.employees.pageInfo(
                  pagination.page,
                  pagination.totalPages,
                  pagination.total,
                )}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {t.employees.rowsPerPage}
                  </span>
                  <select
                    value={params.limit}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        page: 1,
                        limit: Number(e.target.value),
                      }))
                    }
                    className="h-8 rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    disabled={!pagination.hasPrev}
                    onClick={() =>
                      setParams((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))
                    }
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    disabled={!pagination.hasNext}
                    onClick={() =>
                      setParams((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))
                    }
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editingEmployee}
        onSubmit={handleFormSubmit}
      />

      <DeleteEmployeeDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        employee={deletingEmployee}
        onConfirm={handleDelete}
      />

      <ResetPasswordDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        employee={resettingEmployee}
        onConfirm={handleResetPassword}
      />
    </div>
  );
}
