"use client";

import { useParams } from "next/navigation";

import { ArmamentOccurrencesPageShell } from "@/components/armament-occurrences/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentOccurrenceShowPage() {
  const params = useParams<{ id: string }>();

  return (
    <ArmamentOccurrencesPageShell
      title="Detalhe da ocorrencia"
      description="Visualize o contexto completo do evento operacional vinculado ao armamento."
      requiredPermission="view"
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Ocorrencia #{params.id}</CardTitle>
          <CardDescription>
            Esta rota ja esta pronta para receber o detalhe da ocorrencia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Informacoes esperadas:</p>
          <p>tipo, status, severidade e exigencia de BO;</p>
          <p>armamento, unidade ou lote relacionados;</p>
          <p>descricao, data da ocorrencia, reportante e auditoria.</p>
        </CardContent>
      </Card>
    </ArmamentOccurrencesPageShell>
  );
}
