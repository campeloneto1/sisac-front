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

export function ArmamentOccurrenceEditPage() {
  const params = useParams<{ id: string }>();

  return (
    <ArmamentOccurrencesPageShell
      title="Editar ocorrencia"
      description="Atualize status, descrição e dados de apuracao quando a API do recurso estiver pronta."
      requiredPermission="update"
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Edição da ocorrencia #{params.id}</CardTitle>
          <CardDescription>
            Esta rota fica pronta para receber o formulario de edição.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Campos mais provaveis para edição:</p>
          <p>status, número do BO, descrição, reportante e data/hora do evento.</p>
          <p>
            Uma boa validacao no backend deve exigir `report_number` para
            extravio e furto/roubo.
          </p>
        </CardContent>
      </Card>
    </ArmamentOccurrencesPageShell>
  );
}
