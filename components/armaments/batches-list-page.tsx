"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { ArmamentBatchesPageShell } from "@/components/armaments/batches-page-shell";
import { useArmamentBatches } from "@/hooks/use-armament-batches";
import { useDeleteArmamentBatchMutation } from "@/hooks/use-armament-batch-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import {
  getExpirationBadgeVariant,
  getExpirationLabel,
  getAvailabilityBadgeVariant,
} from "@/types/armament-batch.type";
import type { ArmamentBatchItem } from "@/types/armament-batch.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";

export function ArmamentBatchesListPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const permissions = usePermissions("armaments");
  const deleteMutation = useDeleteArmamentBatchMutation();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [filter, setFilter] = useState<string>(
    searchParams.get("filter") ?? "all",
  );

  const page = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;

  const batchesQuery = useArmamentBatches({
    armament_id: params.id,
    page,
    per_page: perPage,
    search: search || undefined,
    only_available: filter === "available" ? true : undefined,
    only_expired: filter === "expired" ? true : undefined,
    expiring_in_days: filter === "expiring" ? 30 : undefined,
  });

  const batches = batchesQuery.data?.data ?? [];
  const meta = batchesQuery.data?.meta;

  const totalQuantity = batches.reduce((acc, b) => acc + b.quantity, 0);
  const totalAvailable = batches.reduce((acc, b) => acc + b.available_quantity, 0);
  const expiringOrExpiredCount = batches.filter(
    (b) => b.is_expired || b.is_expiring_soon,
  ).length;

  function updateSearchParams(updates: Record<string, string | undefined>) {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    router.push(`?${newParams.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateSearchParams({ search: search || undefined, page: "1" });
  }

  function handleFilterChange(value: string) {
    setFilter(value);
    updateSearchParams({
      filter: value === "all" ? undefined : value,
      page: "1",
    });
  }

  function handlePageChange(newPage: number) {
    updateSearchParams({ page: String(newPage) });
  }

  async function handleDelete(batch: ArmamentBatchItem) {
    await deleteMutation.mutateAsync({
      batchId: batch.id,
      armamentId: params.id,
    });
  }

  return (
    <ArmamentBatchesPageShell
      title="Gestão de lotes"
      description="Acompanhe os lotes vinculados a este armamento e sua disponibilidade."
      requiredPermission="view"
    >
      <div className="flex justify-end">
        {permissions.canCreate ? (
          <Button asChild>
            <Link href={`/armaments/${params.id}/batches/create`}>
              <Plus className="mr-2 h-4 w-4" />
              Novo lote
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Quantidade total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {batchesQuery.isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl font-display text-slate-900">
                {totalQuantity}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader className="pb-2">
            <CardDescription>Disponível</CardDescription>
          </CardHeader>
          <CardContent>
            {batchesQuery.isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl font-display text-green-600">
                {totalAvailable}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader className="pb-2">
            <CardDescription>Vencendo / vencidos</CardDescription>
          </CardHeader>
          <CardContent>
            {batchesQuery.isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl font-display text-amber-600">
                {expiringOrExpiredCount}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Lotes cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os lotes vinculados a este armamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Buscar por número do lote..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button type="submit" variant="default">
                Buscar
              </Button>
            </form>

            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="available">Apenas disponíveis</SelectItem>
                <SelectItem value="expiring">Vencendo em 30 dias</SelectItem>
                <SelectItem value="expired">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {batchesQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : batches.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              Nenhum lote encontrado para este armamento.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lote</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Disponível</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => {
                      const expirationVariant = getExpirationBadgeVariant(batch);
                      const expirationLabel = getExpirationLabel(batch);
                      const availabilityVariant = getAvailabilityBadgeVariant(
                        batch.available_percentage,
                      );

                      return (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium">
                            {batch.batch_number}
                          </TableCell>
                          <TableCell className="text-right">
                            {batch.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {batch.available_quantity}
                              <Badge
                                variant={availabilityVariant}
                                className="text-xs"
                              >
                                {batch.available_percentage.toFixed(0)}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {batch.expiration_date
                              ? format(
                                  new Date(batch.expiration_date),
                                  "dd/MM/yyyy",
                                  { locale: ptBR },
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {batch.expiration_date ? (
                              <Badge variant={expirationVariant}>
                                {expirationLabel}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Link
                                  href={`/armaments/${params.id}/batches/${batch.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Visualizar</span>
                                </Link>
                              </Button>

                              {permissions.canUpdate ? (
                                <Button
                                  asChild
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <Link
                                    href={`/armaments/${params.id}/batches/${batch.id}/edit`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                  </Link>
                                </Button>
                              ) : null}

                              {permissions.canDelete ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Excluir</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Confirmar exclusão
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir o lote{" "}
                                        <strong>{batch.batch_number}</strong>? Esta
                                        ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(batch)}
                                        disabled={deleteMutation.isPending}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {deleteMutation.isPending
                                          ? "Excluindo..."
                                          : "Confirmar"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {meta && meta.last_page > 1 ? (
                <Pagination
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
                  total={meta.total}
                  from={meta.from}
                  to={meta.to}
                  onPageChange={handlePageChange}
                  isDisabled={batchesQuery.isFetching}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </ArmamentBatchesPageShell>
  );
}
