"use client";

import { useParams } from "next/navigation";

import { ArmamentUnitsPageShell } from "@/components/armaments/units-page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentUnitShowPage() {
  const params = useParams<{ unitId: string }>();

  return (
    <ArmamentUnitsPageShell
      title="Detalhe da unidade"
      description="Visualize o contexto da unidade fisica vinculada ao armamento."
      requiredPermission="view"
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Unidade #{params.unitId}</CardTitle>
          <CardDescription>
            Esta rota já esta pronta para receber o detalhe operacional da
            unidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Informações esperadas:</p>
          <p>número de serie, status e datas importantes;</p>
          <p>movimentacoes, empréstimos e ocorrencias relacionadas;</p>
          <p>alertas de vencimento e indisponibilidade.</p>
        </CardContent>
      </Card>
    </ArmamentUnitsPageShell>
  );
}
