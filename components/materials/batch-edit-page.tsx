"use client";

import { useParams } from "next/navigation";

import { MaterialBatchesPageShell } from "@/components/materials/batches-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialBatchEditPage() {
  const params = useParams<{ batchId: string }>();

  return (
    <MaterialBatchesPageShell
      title="Editar lote"
      description="Atualize os dados operacionais do lote vinculado ao material."
      requiredPermission="update"
      showIntegrationNotice
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Edicao do lote #{params.batchId}</CardTitle>
          <CardDescription>
            Esta tela fica reservada para o formulario de edicao quando o recurso estiver disponivel na API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Atualizacoes previstas:</p>
          <p>numero do lote;</p>
          <p>quantidade total;</p>
          <p>data de expiracao.</p>
        </CardContent>
      </Card>
    </MaterialBatchesPageShell>
  );
}
