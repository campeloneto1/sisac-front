"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { MaterialBatchesPageShell } from "@/components/materials/batches-page-shell";
import { useMaterial } from "@/hooks/use-materials";
import { usePermissions } from "@/hooks/use-permissions";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialBatchesListPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("materials");
  const materialQuery = useMaterial(params.id);
  const batches = materialQuery.data?.data.batches ?? [];
  const totalQuantity = batches.reduce((acc, batch) => acc + (batch.quantity ?? 0), 0);
  const totalAvailable = batches.reduce((acc, batch) => acc + (batch.available_quantity ?? 0), 0);
  const expiringBatches = batches.filter((batch) => {
    if (!batch.expiration_date) {
      return false;
    }

    const expiration = new Date(batch.expiration_date);
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + 30);
    return expiration >= now && expiration <= limit;
  }).length;

  return (
    <MaterialBatchesPageShell
      title="Gestao de lotes"
      description="Acompanhe os lotes vinculados a este material e sua disponibilidade."
      requiredPermission="view"
      showIntegrationNotice
    >
      <div className="flex justify-end">
        {permissions.canCreate ? (
          <Button asChild>
            <Link href="./batches/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo lote
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Quantidade total</CardTitle>
            <CardDescription>Volume total cadastrado em lotes para este material.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">{totalQuantity}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Disponivel</CardTitle>
            <CardDescription>Quantidade ainda apta para emprestimo ou consumo.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">{totalAvailable}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Vencendo em 30 dias</CardTitle>
            <CardDescription>Lotes que exigem atencao por data de expiracao.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">{expiringBatches}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Lotes cadastrados</CardTitle>
          <CardDescription>Lista obtida a partir do payload atual de `Material.show`.</CardDescription>
        </CardHeader>
        <CardContent>
          {batches.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Lote</th>
                    <th className="px-4 py-3 font-medium">Quantidade</th>
                    <th className="px-4 py-3 font-medium">Disponivel</th>
                    <th className="px-4 py-3 font-medium">Em uso</th>
                    <th className="px-4 py-3 font-medium">Vencimento</th>
                    <th className="px-4 py-3 font-medium text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch.id} className="border-t border-slate-200/70">
                      <td className="px-4 py-4 text-slate-600">{batch.batch_number}</td>
                      <td className="px-4 py-4 text-slate-600">{batch.quantity}</td>
                      <td className="px-4 py-4 text-slate-600">{batch.available_quantity ?? "-"}</td>
                      <td className="px-4 py-4 text-slate-600">{batch.used_quantity ?? "-"}</td>
                      <td className="px-4 py-4 text-slate-600">{batch.expiration_date ?? "-"}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {permissions.canView ? (
                            <Button asChild size="sm" variant="outline">
                              <Link href={`./batches/${batch.id}`}>Ver</Link>
                            </Button>
                          ) : null}
                          {permissions.canUpdate ? (
                            <Button asChild size="sm" variant="outline">
                              <Link href={`./batches/${batch.id}/edit`}>Editar</Link>
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhum lote cadastrado para este material.</p>
          )}
        </CardContent>
      </Card>
    </MaterialBatchesPageShell>
  );
}
