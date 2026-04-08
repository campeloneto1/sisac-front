"use client";

import { useParams } from "next/navigation";

import { MaterialOccurrencesPageShell } from "@/components/materials/occurrences-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialOccurrenceEditPage() {
  const params = useParams<{ id: string; occurrenceId: string }>();

  return (
    <MaterialOccurrencesPageShell
      title="Editar ocorrencia"
      description="Atualize status, descricao e dados de apuracao quando a API do recurso estiver pronta."
      requiredPermission="update"
      materialId={params.id}
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Edicao da ocorrencia #{params.occurrenceId}</CardTitle>
          <CardDescription>
            Esta rota fica pronta para receber o formulario de edicao.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Campos mais provaveis para edicao:</p>
          <p>status, numero do BO, descricao, reportante e data/hora do evento.</p>
          <p>
            Uma boa validacao no backend deve exigir `report_number` para
            extravio e furto/roubo.
          </p>
        </CardContent>
      </Card>
    </MaterialOccurrencesPageShell>
  );
}
