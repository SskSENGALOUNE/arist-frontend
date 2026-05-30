import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/** Skeleton for a paginated table/list page. */
export function TablePageSkeleton({
  columns = 7,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        <div className="mb-4 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: columns }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, r) => (
                <TableRow key={r}>
                  {Array.from({ length: columns }).map((_, c) => (
                    <TableCell key={c}>
                      <Skeleton className="h-4 w-full max-w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

/** Skeleton for a single-record detail card page. */
export function DetailPageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-4">
        <Skeleton className="h-8 w-32" />
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-5 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {Array.from({ length: rows }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-2.5"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** Skeleton for a form (create/edit) page. */
export function FormPageSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-4">
        <Skeleton className="h-8 w-32" />
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-5">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
