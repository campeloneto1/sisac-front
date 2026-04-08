"use client";

import { useParams } from "next/navigation";

import { MaterialUnitsPageShell } from "@/components/materials/units-page-shell";
import { useMaterial } from "@/hooks/use-materials";
import { getMaterialUnitBadgeVariant, getMaterialUnitStatusLabel } from "@/types/material.type";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialUnitShowPage() {
  const params = useParams<{ id: string; unitId: string }>();
  const materialQuery = useMaterial(params.id);
  const unit = materialQuery.data?.data.units?.find((item) => String(item.id) === params.unitId);

  return (
    <MaterialUnitsPageShell
      title="Detalhe da unidade"
      description="Visualize o contexto da unidade fisica vinculada ao material."
      requiredPermission="view"
    >
      {!unit ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Unidade nao encontrada</CardTitle>
            <CardDescription>Esta unidade nao foi retornada pelo payload atual do material.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Unidade #{unit.id}</CardTitle>
            <CardDescription>Detalhe montado a partir do payload atual de `Material.show`.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Patrimonio 1</p>
              <p className="mt-1 text-sm text-slate-700">{unit.patrimony_number_1 ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Patrimonio 2</p>
              <p className="mt-1 text-sm text-slate-700">{unit.patrimony_number_2 ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
              <div className="mt-1">
                <Badge variant={getMaterialUnitBadgeVariant(unit.status_color)}>
                  {unit.status_label ?? getMaterialUnitStatusLabel(unit.status)}
                </Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Aquisicao</p>
              <p className="mt-1 text-sm text-slate-700">{unit.acquisition_date ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Vencimento</p>
              <p className="mt-1 text-sm text-slate-700">{unit.expiration_date ?? "-"}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </MaterialUnitsPageShell>
  );
}
