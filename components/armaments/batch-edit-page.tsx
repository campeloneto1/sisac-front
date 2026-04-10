"use client";

import { useParams } from "next/navigation";

import { ArmamentBatchesPageShell } from "@/components/armaments/batches-page-shell";
import { ArmamentBatchForm } from "@/components/armaments/batch-form";
import { useArmamentBatch } from "@/hooks/use-armament-batches";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentBatchEditPage() {
  const params = useParams<{ id: string; batchId: string }>();
  const batchQuery = useArmamentBatch(params.batchId);

  return (
    <ArmamentBatchesPageShell
      title="Editar lote"
      description="Atualize os dados operacionais do lote vinculado ao armamento."
      requiredPermission="update"
    >
      {batchQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-full max-w-xs" />
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
        <ArmamentBatchForm
          armamentId={params.id}
          mode="edit"
          batch={batchQuery.data.data}
        />
      )}
    </ArmamentBatchesPageShell>
  );
}
