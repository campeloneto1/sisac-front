"use client";

import { useParams } from "next/navigation";

import { MaterialOccurrencesPageShell } from "@/components/materials/occurrences-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialOccurrenceShowPage() {
  const params = useParams<{ id: string; occurrenceId: string }>();

  return (
    <MaterialOccurrencesPageShell
      title="Detalhe da ocorrencia"
      description="Visualize o contexto completo do evento operacional vinculado ao material."
      requiredPermission="view"
      materialId={params.id}
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Ocorrencia #{params.occurrenceId}</CardTitle>
          <CardDescription>
            Esta rota já esta pronta para receber o detalhe da ocorrencia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Informações esperadas:</p>
          <p>tipo, status, severidade e exigencia de BO;</p>
          <p>material, unidade, lote ou item de empréstimo relacionados;</p>
          <p>descrição, data da ocorrencia, reportante e auditoria.</p>
        </CardContent>
      </Card>
    </MaterialOccurrencesPageShell>
  );
}
