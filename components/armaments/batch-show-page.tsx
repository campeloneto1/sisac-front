"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Edit, Package, Percent, Trash2 } from "lucide-react";

import { ArmamentBatchesPageShell } from "@/components/armaments/batches-page-shell";
import { useArmamentBatch } from "@/hooks/use-armament-batches";
import { useDeleteArmamentBatchMutation } from "@/hooks/use-armament-batch-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import {
  getExpirationBadgeVariant,
  getExpirationLabel,
  getAvailabilityBadgeVariant,
} from "@/types/armament-batch.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

export function ArmamentBatchShowPage() {
  const params = useParams<{ id: string; batchId: string }>();
  const router = useRouter();
  const permissions = usePermissions("armaments");
  const batchQuery = useArmamentBatch(params.batchId);
  const deleteMutation = useDeleteArmamentBatchMutation();

  async function handleDelete() {
    await deleteMutation.mutateAsync({
      batchId: params.batchId,
      armamentId: params.id,
    });
    router.push(`/armaments/${params.id}/batches`);
  }

  return (
    <ArmamentBatchesPageShell
      title="Detalhe do lote"
      description="Visualize o contexto operacional do lote vinculado ao armamento."
      requiredPermission="view"
    >
      {batchQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      ) : batchQuery.isError || !batchQuery.data?.data ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Lote não encontrado</CardTitle>
            <CardDescription>
              Não foi possível carregar os dados do lote. Verifique se ele existe
              e se você possui permissão para acessá-lo.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {(() => {
            const batch = batchQuery.data.data;
            const expirationVariant = getExpirationBadgeVariant(batch);
            const expirationLabel = getExpirationLabel(batch);
            const availabilityVariant = getAvailabilityBadgeVariant(
              batch.available_percentage,
            );

            return (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900">
                      Lote {batch.batch_number}
                    </h2>
                    {batch.expiration_date ? (
                      <Badge variant={expirationVariant}>{expirationLabel}</Badge>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    {permissions.canUpdate ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/armaments/${params.id}/batches/${batch.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </Button>
                    ) : null}

                    {permissions.canDelete ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o lote{" "}
                              <strong>{batch.batch_number}</strong>? Esta ação não
                              pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              disabled={deleteMutation.isPending}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteMutation.isPending
                                ? "Excluindo..."
                                : "Confirmar exclusão"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
                  </div>
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
                      <p className="text-3xl font-display text-slate-900">
                        {batch.quantity}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200/70 bg-white/80">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Disponível
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-display text-slate-900">
                          {batch.available_quantity}
                        </p>
                        <Badge variant={availabilityVariant}>
                          {batch.available_percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200/70 bg-white/80">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Validade
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-display text-slate-900">
                        {batch.expiration_date
                          ? format(new Date(batch.expiration_date), "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          : "Sem validade"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-slate-200/70 bg-white/80">
                  <CardHeader>
                    <CardTitle>Detalhamento de uso</CardTitle>
                    <CardDescription>
                      Distribuição da quantidade total entre disponível, em uso e
                      saída permanente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-500">Disponível</p>
                        <p className="text-lg font-semibold text-green-600">
                          {batch.available_quantity}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-500">Em uso</p>
                        <p className="text-lg font-semibold text-amber-600">
                          {batch.used_quantity}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-500">
                          Saída permanente (consumido/perdido)
                        </p>
                        <p className="text-lg font-semibold text-red-600">
                          {batch.permanently_out_quantity}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {batch.creator || batch.updater ? (
                  <Card className="border-slate-200/70 bg-white/80">
                    <CardHeader>
                      <CardTitle>Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      {batch.creator && batch.created_at ? (
                        <div className="space-y-1">
                          <p className="text-sm text-slate-500">Criado por</p>
                          <p className="font-medium text-slate-900">
                            {batch.creator.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(
                              new Date(batch.created_at),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR },
                            )}
                          </p>
                        </div>
                      ) : null}
                      {batch.updater && batch.updated_at ? (
                        <div className="space-y-1">
                          <p className="text-sm text-slate-500">
                            Última atualização por
                          </p>
                          <p className="font-medium text-slate-900">
                            {batch.updater.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(
                              new Date(batch.updated_at),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR },
                            )}
                          </p>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ) : null}
              </>
            );
          })()}
        </>
      )}
    </ArmamentBatchesPageShell>
  );
}
