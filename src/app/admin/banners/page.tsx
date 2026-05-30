"use client";

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { adminBannerService } from "@/services/banner";
import type { Banner, ListBannersParams, CreateBannerData } from "@/types/banner";
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
import { BannerFormDialog } from "@/components/admin/banner-form-dialog";
import { DeleteBannerDialog } from "@/components/admin/delete-banner-dialog";

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const t = useT();

  const [params, setParams] = useState<ListBannersParams>({
    page: 1,
    limit: 10,
    sortBy: "sortOrder",
    sortOrder: "asc",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-banners", params],
    queryFn: () => adminBannerService.list(params),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-banners"] });

  const createMutation = useMutation({
    mutationFn: adminBannerService.create,
    onSuccess: () => {
      invalidate();
      toast.success(t.banners.toastCreated);
    },
    onError: () => toast.error(t.banners.toastSaveFailed),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateBannerData }) =>
      adminBannerService.update(id, data),
    onSuccess: () => {
      invalidate();
      toast.success(t.banners.toastUpdated);
    },
    onError: () => toast.error(t.banners.toastSaveFailed),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminBannerService.update(id, { isActive }),
    onSuccess: () => invalidate(),
    onError: () => toast.error(t.banners.toastSaveFailed),
  });

  const deleteMutation = useMutation({
    mutationFn: adminBannerService.delete,
    onSuccess: () => {
      invalidate();
      toast.success(t.banners.toastDeleted);
    },
    onError: () => toast.error(t.banners.toastDeleteFailed),
  });

  const handleFormSubmit = async (formData: CreateBannerData) => {
    if (editingBanner) {
      await updateMutation.mutateAsync({ id: editingBanner.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDelete = async () => {
    if (deletingBanner) {
      await deleteMutation.mutateAsync(deletingBanner.id);
    }
  };

  const pagination = data?.pagination;

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t.banners.heading}</h2>
            <p className="text-sm text-muted-foreground">
              {t.banners.subheading}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingBanner(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            {t.banners.addBanner}
          </Button>
        </div>

        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{t.banners.colOrder}</TableHead>
                <TableHead>{t.banners.colBanner}</TableHead>
                <TableHead className="w-28">{t.banners.colActive}</TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {t.common.loading}
                  </TableCell>
                </TableRow>
              ) : !data?.items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {t.banners.empty}
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell className="text-muted-foreground">
                      {banner.sortOrder}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                          {banner.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="size-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium">
                            {banner.title}
                          </div>
                          {banner.subtitle && (
                            <div className="truncate text-xs text-muted-foreground">
                              {banner.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          size="sm"
                          checked={banner.isActive}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({
                              id: banner.id,
                              isActive: checked,
                            })
                          }
                          disabled={toggleMutation.isPending}
                        />
                        <Badge
                          variant={banner.isActive ? "outline" : "secondary"}
                        >
                          {banner.isActive
                            ? t.banners.active
                            : t.banners.inactive}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title={t.common.edit}
                          onClick={() => {
                            setEditingBanner(banner);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title={t.common.delete}
                          onClick={() => {
                            setDeletingBanner(banner);
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
                {t.banners.pageInfo(
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

      <BannerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        banner={editingBanner}
        onSubmit={handleFormSubmit}
      />

      <DeleteBannerDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        banner={deletingBanner}
        onConfirm={handleDelete}
      />
    </div>
  );
}
