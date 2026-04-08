"use client";

import { MaterialBatchesPageShell } from "@/components/materials/batches-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialBatchCreatePage() {
  return (
    <MaterialBatchesPageShell
      title="Novo lote"
      description="Cadastre um lote vinculado ao material selecionado."
      requiredPermission="create"
      showIntegrationNotice
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Formulario aguardando endpoints</CardTitle>
          <CardDescription>
            Assim que o backend expuser o CRUD de `MaterialBatch`, esta tela pode receber o formulario completo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Campos previstos:</p>
          <p>numero do lote;</p>
          <p>quantidade total;</p>
          <p>data de expiracao.</p>
        </CardContent>
      </Card>
    </MaterialBatchesPageShell>
  );
}
