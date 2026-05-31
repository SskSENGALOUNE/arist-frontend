"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { positionService } from "@/services/position";
import type { Position } from "@/types/position";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: () => positionService.list(),
  });

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
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t.positions.heading}</h2>
            <p className="text-sm text-muted-foreground">{t.positions.subheading}</p>
          </div>
          <Button
            size="sm"
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            <Plus className="size-4" />
            {t.positions.addPosition}
          </Button>
        </div>

        <div className="rounded-xl border bg-background">
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
              ) : !positions.length ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    {t.positions.empty}
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((pos) => (
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
                        <Badge variant={pos.isActive ? "outline" : "secondary"}>
                          {pos.isActive ? t.positions.active : t.positions.inactive}
                        </Badge>
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
