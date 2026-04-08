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

export function ArmamentBatchEditPage() {
  const params = useParams<{ batchId: string }>();

  return (
    <ArmamentBatchesPageShell
      title="Editar lote"
      description="Atualize os dados operacionais do lote vinculado ao armamento."
      requiredPermission="update"
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Edição do lote #{params.batchId}</CardTitle>
          <CardDescription>
            Esta tela fica reservada para o formulario de edição quando o
            recurso estiver disponível na API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Atualizacoes previstas:</p>
          <p>número do lote;</p>
          <p>quantidade total;</p>
          <p>data de expiracao.</p>
        </CardContent>
      </Card>
    </ArmamentBatchesPageShell>
  );
}
