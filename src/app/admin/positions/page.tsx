"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Briefcase,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { positionService } from "@/services/position";
import type { Position } from "@/types/position";
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
import { PositionFormDialog } from "@/components/admin/position-form-dialog";

export default function PositionsPage() {
  const queryClient = useQueryClient();
  const t = useT();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Position | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: () => positionService.list(),
  });

  const filtered = positions.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const stats = [
    {
      label: t.positions.statsTotal,
      value: positions.length,
      icon: Briefcase,
      tint: "text-primary bg-primary/10",
    },
    {
      label: t.positions.active,
      value: positions.filter((p) => p.isActive).length,
      icon: CheckCircle2,
      tint: "text-emerald-600 bg-emerald-50",
    },
    {
      label: t.positions.inactive,
      value: positions.filter((p) => !p.isActive).length,
      icon: XCircle,
      tint: "text-red-600 bg-red-50",
    },
  ];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["positions"] });

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => positionService.create(data),
    onSuccess: () => { invalidate(); toast.success(t.positions.toastCreated); },
    onError: () => toast.error(t.positions.toastSaveFailed),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; isActive?: boolean } }) =>
      positionService.update(id, data),
    onSuccess: () => { invalidate(); toast.success(t.positions.toastUpdated); },
    onError: () => toast.error(t.positions.toastSaveFailed),
  });

  const deleteMutation = useMutation({
    mutationFn: positionService.delete,
    onSuccess: () => { invalidate(); toast.success(t.positions.toastDeleted); },
    onError: () => toast.error(t.positions.toastDeleteFailed),
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
              {t.positions.heading}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t.positions.subheading}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            <Plus className="size-4" />
            {t.positions.addPosition}
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
                    {t.positions.unit}
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
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.positions.searchPlaceholder}
              className="w-72 pl-8"
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
              {t.positions.allPositions}
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.positions.colName}</TableHead>
                <TableHead className="w-28">{t.positions.colActive}</TableHead>
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
                    {search ? t.positions.noMatch : t.positions.empty}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((pos) => (
                  <TableRow key={pos.id}>
                    <TableCell className="font-medium">{pos.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          size="sm"
                          checked={pos.isActive}
                          onCheckedChange={(checked) =>
                            updateMutation.mutate({ id: pos.id, data: { isActive: checked } })
                          }
                          disabled={updateMutation.isPending}
                        />
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            pos.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {pos.isActive ? t.positions.active : t.positions.inactive}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title={t.common.edit}
                          onClick={() => { setEditing(pos); setFormOpen(true); }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title={t.common.delete}
                          onClick={() => { setDeleting(pos); setDeleteOpen(true); }}
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

      <PositionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        position={editing}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.positions.deleteTitle}</DialogTitle>
            <DialogDescription>
              {t.positions.deleteDescription(deleting?.name ?? "")}
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
