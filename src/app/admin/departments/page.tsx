"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { departmentService } from "@/services/department";
import type { Department } from "@/types/department";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DepartmentFormDialog } from "@/components/admin/department-form-dialog";

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const t = useT();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.list(),
  });

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const stats = [
    {
      label: t.departments.statsTotal,
      value: departments.length,
      icon: Layers,
      tint: "text-primary bg-primary/10",
    },
    {
      label: t.departments.active,
      value: departments.filter((d) => d.isActive).length,
      icon: CheckCircle2,
      tint: "text-emerald-600 bg-emerald-50",
    },
    {
      label: t.departments.inactive,
      value: departments.filter((d) => !d.isActive).length,
      icon: XCircle,
      tint: "text-red-600 bg-red-50",
    },
  ];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["departments"] });

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => departmentService.create(data),
    onSuccess: () => { invalidate(); toast.success(t.departments.toastCreated); },
    onError: () => toast.error(t.departments.toastSaveFailed),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; isActive?: boolean } }) =>
      departmentService.update(id, data),
    onSuccess: () => { invalidate(); toast.success(t.departments.toastUpdated); },
    onError: () => toast.error(t.departments.toastSaveFailed),
  });

  const deleteMutation = useMutation({
    mutationFn: departmentService.delete,
    onSuccess: () => { invalidate(); toast.success(t.departments.toastDeleted); },
    onError: () => toast.error(t.departments.toastDeleteFailed),
  });

  const handleFormSubmit = async (data: { name: string; isActive: boolean }) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data });
    } else {
      await createMutation.mutateAsync({ name: data.name });
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <div className="p-6">
        {/* Heading */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {t.departments.heading}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t.departments.subheading}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            <Plus className="size-4" />
            {t.departments.addDepartment}
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((card) => (
            <div
              key={card.label}
              className="flex items-center justify-between rounded-xl border bg-background p-4 shadow-sm"
            >
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {card.value}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {t.departments.unit}
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
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-background p-3 shadow-sm">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.departments.searchPlaceholder}
              className="w-full pl-8 sm:w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-xl border bg-background shadow-sm">
          <div className="flex items-center gap-6 border-b px-4">
            <button
              type="button"
              className="-mb-px border-b-2 border-primary py-3 text-sm font-medium text-foreground"
            >
              {t.departments.allDepartments}
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.departments.colName}</TableHead>
                <TableHead className="w-28">{t.departments.colActive}</TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    {t.common.loading}
                  </TableCell>
                </TableRow>
              ) : !filtered.length ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    {search ? t.departments.noMatch : t.departments.empty}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          size="sm"
                          checked={dept.isActive}
                          onCheckedChange={(checked) =>
                            updateMutation.mutate({ id: dept.id, data: { isActive: checked } })
                          }
                          disabled={updateMutation.isPending}
                        />
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            dept.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {dept.isActive ? t.departments.active : t.departments.inactive}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title={t.common.edit}
                          onClick={() => { setEditing(dept); setFormOpen(true); }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title={t.common.delete}
                          onClick={() => { setDeleting(dept); setDeleteOpen(true); }}
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
        </div>
      </div>

      <DepartmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        department={editing}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.departments.deleteTitle}</DialogTitle>
            <DialogDescription>
              {t.departments.deleteDescription(deleting?.name ?? "")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t.common.deleting : t.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
