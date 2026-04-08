"use client";

import { useParams } from "next/navigation";

import { ArmamentBatchesPageShell } from "@/components/armaments/batches-page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentBatchShowPage() {
  const params = useParams<{ batchId: string }>();

  return (
    <ArmamentBatchesPageShell
      title="Detalhe do lote"
      description="Visualize o contexto operacional do lote vinculado ao armamento."
      requiredPermission="view"
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Lote #{params.batchId}</CardTitle>
          <CardDescription>
            Esta rota já esta pronta para receber o detalhe operacional do lote.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Informações esperadas:</p>
          <p>número do lote, quantidade total e disponível;</p>
          <p>validade, percentual de uso e alertas de expiracao;</p>
          <p>movimentacoes, empréstimos e ocorrencias relacionadas.</p>
        </CardContent>
      </Card>
    </ArmamentBatchesPageShell>
  );
}
