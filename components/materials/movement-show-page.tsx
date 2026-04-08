"use client";

import { useParams } from "next/navigation";

import { MaterialMovementsPageShell } from "@/components/materials/movements-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialMovementShowPage() {
  const params = useParams<{ movementId: string }>();

  return (
    <MaterialMovementsPageShell
      title="Detalhe da movimentacao"
      description="Visualize o contexto operacional do movimento vinculado ao material."
      requiredPermission="view"
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Movimentacao #{params.movementId}</CardTitle>
          <CardDescription>Esta rota ja esta pronta para receber o detalhe do movimento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Informacoes esperadas:</p>
          <p>tipo, quantidade, data/hora do evento e autorizacao;</p>
          <p>unidade ou lote relacionados;</p>
          <p>referencia de origem e observacoes operacionais.</p>
        </CardContent>
      </Card>
    </MaterialMovementsPageShell>
  );
}
