"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  KeyRound,
} from "lucide-react";
import {
  employeeService,
  type EmployeeUser,
  type ListUsersParams,
} from "@/services/employee";
import { useT } from "@/lib/i18n";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { DeleteEmployeeDialog } from "@/components/employees/delete-employee-dialog";
import { ResetPasswordDialog } from "@/components/employees/reset-password-dialog";

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const t = useT();

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

  const { data, isLoading } = useQuery({
    queryKey: ["employees", params],
    queryFn: () => employeeService.list(params),
  });

  const createMutation = useMutation({
    mutationFn: employeeService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      employeeService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: employeeService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      employeeService.resetPassword(id, newPassword),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
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
        formData as Parameters<typeof employeeService.create>[0],
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
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.employees.searchPlaceholder}
                className="w-64 pl-8"
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

        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.employees.name}</TableHead>
                <TableHead>{t.employees.username}</TableHead>
                <TableHead>{t.employees.email}</TableHead>
                <TableHead>{t.employees.role}</TableHead>
                <TableHead>{t.employees.status}</TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t.common.loading}
                  </TableCell>
                </TableRow>
              ) : !data?.items.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t.employees.noEmployees}
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/employees/${emp.id}`}
                        className="hover:underline"
                      >
                        {emp.firstName} {emp.lastName}
                      </Link>
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
                      <Badge
                        variant={emp.isActive ? "outline" : "destructive"}
                      >
                        {emp.isActive
                          ? t.employees.statusActive
                          : t.employees.statusInactive}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/employees/${emp.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-xs",
                          })}
                          title={t.common.view}
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title={t.common.edit}
                          onClick={() => {
                            setEditingEmployee(emp);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title={t.common.resetPassword}
                          onClick={() => {
                            setResettingEmployee(emp);
                            setResetOpen(true);
                          }}
                        >
                          <KeyRound className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title={t.common.delete}
                          onClick={() => {
                            setDeletingEmployee(emp);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {t.employees.pageInfo(
                  pagination.page,
                  pagination.totalPages,
                  pagination.total,
                )}
              </p>
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
