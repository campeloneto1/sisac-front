"use client";

import { useParams } from "next/navigation";

import { MaterialBatchesPageShell } from "@/components/materials/batches-page-shell";
import { useMaterial } from "@/hooks/use-materials";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialBatchShowPage() {
  const params = useParams<{ id: string; batchId: string }>();
  const materialQuery = useMaterial(params.id);
  const batch = materialQuery.data?.data.batches?.find((item) => String(item.id) === params.batchId);

  return (
    <MaterialBatchesPageShell
      title="Detalhe do lote"
      description="Visualize o contexto operacional do lote vinculado ao material."
      requiredPermission="view"
    >
      {!batch ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Lote não encontrado</CardTitle>
            <CardDescription>Este lote não foi retornado pelo payload atual do material.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Lote #{batch.id}</CardTitle>
            <CardDescription>Detalhe montado a partir do payload atual de `Material.show`.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Número do lote</p>
              <p className="mt-1 text-sm text-slate-700">{batch.batch_number}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Quantidade total</p>
              <p className="mt-1 text-sm text-slate-700">{batch.quantity}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Disponível</p>
              <p className="mt-1 text-sm text-slate-700">{batch.available_quantity ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Em uso</p>
              <p className="mt-1 text-sm text-slate-700">{batch.used_quantity ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Vencimento</p>
              <p className="mt-1 text-sm text-slate-700">{batch.expiration_date ?? "-"}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </MaterialBatchesPageShell>
  );
}
