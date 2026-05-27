"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  employeeService,
  type EmployeeUser,
  type ListUsersParams,
} from "@/services/employee";
import { Button } from "@/components/ui/button";
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

export default function EmployeesPage() {
  const queryClient = useQueryClient();

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

  const pagination = data?.pagination;

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email..."
                className="w-64 pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              Search
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
            Add Employee
          </Button>
        </div>

        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !data?.items.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      {emp.firstName} {emp.lastName}
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
                        {emp.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
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
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
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
    </div>
  );
}
